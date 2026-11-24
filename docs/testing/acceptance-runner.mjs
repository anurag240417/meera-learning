// Acceptance checks for the Meera Verma landing page in real Chrome and Firefox.
// Not part of the app build. To run: install puppeteer-core in a separate folder, start
// `npm run dev`, `npm run api` and `npm run build && npm run preview`, then:
//   node acceptance-runner.mjs <chrome|firefox> <screenshotDir>
// Browser paths below are the Windows defaults; adjust for your machine.
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const [browserName, shotDir] = process.argv.slice(2);
const DEV = 'http://127.0.0.1:5173/'; // dev server, talks to the local API (CORS allows this origin)
const PROD = 'http://127.0.0.1:4173/'; // vite preview of the production build, no API configured
const exe = {
  chrome: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  firefox: 'C:/Program Files/Mozilla Firefox/firefox.exe',
}[browserName];

fs.mkdirSync(shotDir, { recursive: true });
const results = {};
const consoleIssues = [];
const expectedLogs = [];
let phase = '';
const record = (id, pass, actual, evidence = '') => {
  results[id] = { pass, actual, evidence };
  console.log(`${id} ${pass ? 'PASS' : 'FAIL'} ${actual}${evidence ? ` [${evidence}]` : ''}`);
};
const shot = async (page, name, fullPage = true) => {
  const file = `${browserName}_${name}.png`;
  await page.screenshot({ path: path.join(shotDir, file), fullPage });
  return file;
};
const pause = (ms) => new Promise((r) => { setTimeout(r, ms); });

const browser = await puppeteer.launch({
  browser: browserName,
  executablePath: exe,
  headless: true,
  protocolTimeout: 30000,
  ...(browserName === 'firefox' ? { extraPrefsFirefox: { 'ui.prefersReducedMotion': 1 } } : {}),
});

async function newPage(url, width, height = 900) {
  const page = await browser.newPage();
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warn' || type === 'warning') {
      const text = `${url} ${type}: ${msg.text()}`;
      if (phase === 'expected-400' && /status of 400/.test(msg.text())) expectedLogs.push(text);
      else consoleIssues.push(text);
    }
  });
  page.on('pageerror', (err) => consoleIssues.push(`${url} pageerror: ${err.message}`));
  await page.evaluateOnNewDocument(() => {
    // Test hook: window.__fetchMode = 'tamper' | 'fail' alters only /api/register POSTs.
    const realFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
      const isRegister = String(input).includes('/api/register') && init.method === 'POST';
      if (isRegister && window.__fetchMode === 'fail') return Promise.reject(new TypeError('Failed to fetch (simulated)'));
      if (isRegister && window.__fetchMode === 'tamper') {
        const body = { ...JSON.parse(init.body), programInterest: 'unknown' };
        return realFetch(input, { ...init, body: JSON.stringify(body) });
      }
      return realFetch(input, init);
    };
  });
  await page.setViewport({ width, height });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await pause(400);
  return page;
}

const overflow = (page) => page.evaluate(() => {
  const de = document.documentElement;
  const offenders = [...document.querySelectorAll('body *')]
    .filter((e) => e.getBoundingClientRect().right > de.clientWidth + 0.5)
    .map((e) => e.tagName.toLowerCase());
  return { scrollW: de.scrollWidth, clientW: de.clientWidth, offenders };
});

try {
  // ---- Layout (production build) ----
  const layout = [
    ['01', 320], ['02', 390], ['03', 768], ['04', 1200], ['05', 1440],
  ];
  for (const [id, width] of layout) {
    const page = await newPage(PROD, width);
    // Scroll through so lazy images load before the full-page capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => { setTimeout(r, 60); });
      }
      window.scrollTo(0, 0);
    });
    await pause(300);
    const o = await overflow(page);
    const cols = await page.evaluate(() => {
      const list = document.querySelector('#programs ul');
      return getComputedStyle(list).gridTemplateColumns.split(' ').length;
    });
    const file = await shot(page, `${String(width)}px`);
    const ok = o.scrollW <= o.clientW && o.offenders.length === 0;
    record(id, ok, `scrollWidth ${o.scrollW} / clientWidth ${o.clientW}; ${o.offenders.length} overflowing elements; program grid ${cols} column(s)`, file);
    await page.close();
  }

  // ---- 06 Keyboard focus order (1440, production build) ----
  {
    const page = await newPage(PROD, 1440);
    const order = [];
    for (let i = 0; i < 14; i += 1) {
      await page.keyboard.press('Tab');
      order.push(await page.evaluate(() => {
        const el = document.activeElement;
        const label = (el.getAttribute('aria-label') || el.textContent.trim() || el.querySelector('img')?.alt || el.name || el.id || '').trim().replace(/\s+/g, ' ');
        const outline = getComputedStyle(el).outlineStyle;
        return `${el.tagName.toLowerCase()}:${label.slice(0, 32)}${outline === 'none' ? ' (NO OUTLINE)' : ''}`;
      }));
      if (i === 1) await shot(page, 'keyboard-focus', false);
    }
    const expectedStart = ['Skip to main content', 'Meera Verma', 'Programs', 'Why us', 'FAQs', 'Reserve a call', 'Reserve a free call'];
    const okOrder = expectedStart.every((t, idx) => order[idx]?.includes(t));
    const noOutline = order.filter((o) => o.includes('NO OUTLINE'));
    // Skip link actually moves focus to <main>
    await page.goto(PROD, { waitUntil: 'load', timeout: 60000 });
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await pause(200);
    const afterSkip = await page.evaluate(() => document.activeElement.id);
    record('06', okOrder && noOutline.length === 0 && afterSkip === 'main', `Focus order: ${order.join(' → ')}. Elements without visible outline: ${noOutline.length}. Skip link moves focus to #${afterSkip}.`, `${browserName}_keyboard-focus.png`);
    await page.close();
  }

  // ---- 07 Mobile menu at 390 ----
  {
    const page = await newPage(PROD, 390, 844);
    const btn = 'button[aria-controls="site-navigation"]';
    const navVisible = () => page.evaluate(() => getComputedStyle(document.getElementById('site-navigation')).display !== 'none');
    const before = await page.$eval(btn, (b) => b.getAttribute('aria-expanded'));
    const hiddenBefore = !(await navVisible());
    await page.focus(btn);
    await page.keyboard.press('Enter');
    await pause(150);
    const openState = await page.$eval(btn, (b) => b.getAttribute('aria-expanded'));
    const visibleOpen = await navVisible();
    const file = await shot(page, 'mobile-menu-open', false);
    // Escape closes and returns focus
    await page.keyboard.press('Escape');
    await pause(100);
    const escState = await page.$eval(btn, (b) => b.getAttribute('aria-expanded'));
    const escFocus = await page.evaluate(() => document.activeElement.getAttribute('aria-controls'));
    // Re-open with Space, Tab to FAQs, activate with Enter
    await page.keyboard.press(' ');
    await pause(100);
    let label = '';
    for (let i = 0; i < 6 && label !== 'FAQs'; i += 1) {
      await page.keyboard.press('Tab');
      label = await page.evaluate(() => document.activeElement.textContent.trim());
    }
    await page.keyboard.press('Enter');
    await pause(900);
    const afterState = await page.$eval(btn, (b) => b.getAttribute('aria-expanded'));
    const hash = await page.evaluate(() => window.location.hash);
    const ok = before === 'false' && hiddenBefore && openState === 'true' && visibleOpen
      && escState === 'false' && escFocus === 'site-navigation'
      && label === 'FAQs' && afterState === 'false' && hash === '#faq' && !(await navVisible());
    record('07', ok, `aria-expanded ${before} → ${openState} (Enter) → ${escState} (Escape, focus back on button: ${escFocus === 'site-navigation'}); reopened with Space, tabbed to "${label}", Enter → URL ${hash}, menu aria-expanded ${afterState}, nav hidden.`, file);
    await page.close();
  }

  // ---- Form (dev server + local API) ----
  {
    const page = await newPage(DEV, 1440);
    const submit = 'form button[type="submit"]';
    const errorsText = () => page.$$eval('form p[id$="-error"]', (els) => els.map((e) => e.textContent));
    const requests = [];
    page.on('request', (r) => { if (r.url().includes('/api/register') && r.method() === 'POST') requests.push(r.url()); });

    // 08 empty
    await page.click(submit);
    await pause(200);
    const emptyErrors = await errorsText();
    const focused = await page.evaluate(() => document.activeElement.id);
    const invalidCount = await page.$$eval('[aria-invalid="true"]', (els) => els.length);
    await page.$eval('#register', (el) => el.scrollIntoView());
    const f08 = await shot(page, 'form-empty', false);
    record('08', emptyErrors.length === 4 && requests.length === 0 && focused === 'register-fullName', `${emptyErrors.length} errors shown (${emptyErrors.join(' | ')}); ${invalidCount} fields aria-invalid; focus moved to #${focused}; requests sent: ${requests.length}.`, f08);

    // 09 malformed email
    await page.type('#register-fullName', 'Test Learner');
    await page.type('#register-email', 'test-learner@example');
    await page.select('#register-programInterest', 'focus');
    await page.click('#register-consent');
    await page.click(submit);
    await pause(200);
    const emailErr = await errorsText();
    const f09 = await shot(page, 'form-bad-email', false);
    record('09', emailErr.length === 1 && /valid email/i.test(emailErr[0]) && requests.length === 0, `Email "test-learner@example" rejected: "${emailErr.join(' | ')}"; requests sent: ${requests.length}.`, f09);

    // 10 no consent
    await page.focus('#register-email');
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('#register-email', 'test.learner@example.com');
    await page.click('#register-consent'); // uncheck
    await page.click(submit);
    await pause(200);
    const consentErr = await errorsText();
    const f10 = await shot(page, 'form-no-consent', false);
    record('10', consentErr.length === 1 && /agree/i.test(consentErr[0]) && requests.length === 0, `Consent unchecked: "${consentErr.join(' | ')}"; requests sent: ${requests.length}.`, f10);

    // 11 valid request → 201
    await page.click('#register-consent');
    const respPromise = page.waitForResponse((r) => r.url().includes('/api/register') && r.request().method() === 'POST');
    await page.click(submit);
    const resp = await respPromise;
    await page.waitForSelector('[role="status"]');
    const statusText = await page.$eval('[role="status"]', (el) => el.textContent);
    const cleared = await page.$eval('#register-fullName', (el) => el.value === '');
    const f11 = await shot(page, 'form-success', false);
    record('11', resp.status() === 201 && /received/i.test(statusText), `POST ${resp.url()} → ${resp.status()}; role=status: "${statusText}"; fields reset: ${cleared}.`, f11);

    // 12 invalid request → 400 (harness alters the body in transit so the real API rejects it)
    await page.type('#register-fullName', 'Test Learner');
    await page.type('#register-email', 'test.learner@example.com');
    await page.select('#register-programInterest', 'career');
    await page.click('#register-consent');
    phase = 'expected-400';
    await page.evaluate(() => { window.__fetchMode = 'tamper'; });
    const badPromise = page.waitForResponse((r) => r.url().includes('/api/register') && r.request().method() === 'POST');
    await page.click(submit);
    const bad = await badPromise;
    await page.waitForSelector('[role="alert"]');
    const alertText = await page.$eval('[role="alert"]', (el) => el.textContent);
    const kept = await page.$eval('#register-email', (el) => el.value);
    const f12 = await shot(page, 'form-api-400', false);
    phase = '';
    await page.evaluate(() => { window.__fetchMode = ''; });
    // Direct contract check as well
    console.log('  12: direct contract check from Node');
    const directResp = await fetch('http://127.0.0.1:8787/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: 'A', email: 'x', programInterest: 'focus', consent: true }),
    });
    const direct = `${directResp.status} ${(await directResp.json()).message}`;
    record('12', bad.status() === 400 && /program/i.test(alertText) && kept === 'test.learner@example.com', `Request body altered by the test's fetch wrapper (programInterest "unknown") → ${bad.status()}; role=alert: "${alertText}"; form data kept: ${kept !== ''}. Direct POST with short name/bad email → ${direct}.`, f12);

    // Extra: network failure keeps data
    await page.evaluate(() => { window.__fetchMode = 'fail'; });
    await page.click(submit);
    console.log('  X1: waiting for network-failure alert');
    await page.waitForFunction(() => /could not reach/i.test(document.querySelector('[role="alert"]')?.textContent || ''), { polling: 200, timeout: 10000 });
    const keptName = await page.$eval('#register-fullName', (el) => el.value);
    await page.evaluate(() => { window.__fetchMode = ''; });
    record('X1', keptName === 'Test Learner', `Network failure: alert shown, name field still "${keptName}".`);

    // Extra: View program preselects
    await page.goto(DEV, { waitUntil: 'load', timeout: 60000 });
    await page.click('#programs li:nth-child(3) a');
    await pause(900);
    const preselected = await page.$eval('#register-programInterest', (el) => el.value);
    record('X2', preselected === 'career', `"View program" on Career Starter → select value "${preselected}", URL ${await page.evaluate(() => window.location.hash)}.`);
    await page.close();
  }

  // ---- Production build: no API configured ----
  {
    const page = await newPage(PROD, 390, 844);
    let sent = 0;
    page.on('request', (r) => { if (r.url().includes('/api/register')) sent += 1; });
    await page.type('#register-fullName', 'Test Learner');
    await page.type('#register-email', 'test.learner@example.com');
    await page.select('#register-programInterest', 'foundations');
    await page.click('#register-consent');
    await page.click('form button[type="submit"]');
    await page.waitForSelector('[role="alert"]');
    const msg = await page.$eval('[role="alert"]', (el) => el.textContent);
    const file = await shot(page, 'prod-no-api', false);
    record('X3', sent === 0 && /not connected/i.test(msg), `Static build without VITE_API_BASE_URL: no request sent (${sent}); message "${msg}".`, file);
    await page.close();
  }
} finally {
  await browser.close();
}

const expectedNote = expectedLogs.length ? ` Only browser log: ${expectedLogs.length}x network "400 (Bad Request)" from test 12's deliberately altered request.` : '';
record(browserName === 'chrome' ? '14' : '15', consoleIssues.length === 0, consoleIssues.length === 0 ? `No console errors, warnings or page errors from the app across all checks above (dev server and production preview).${expectedNote}` : consoleIssues.join(' || '));
fs.writeFileSync(path.join(shotDir, `${browserName}_results.json`), JSON.stringify(results, null, 2));
