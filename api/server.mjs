import http from 'node:http';
import { randomUUID } from 'node:crypto';

const MAX_BODY_BYTES = 4096;
const WINDOW_MS = 60_000;
const requestTimes = new Map();
const programs = new Set(['foundations', 'focus', 'career']);
const allowedOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);

export function validateRegistration(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'Expected a JSON object.';
  if (typeof data.fullName !== 'string' || data.fullName.trim().length < 2 || data.fullName.trim().length > 80) return 'Enter a name between 2 and 80 characters.';
  if (typeof data.email !== 'string' || data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Enter a valid email address.';
  if (!programs.has(data.programInterest)) return 'Choose a valid program.';
  if (data.consent !== true) return 'Consent is required.';
  return null;
}
function send(res, code, data, origin) {
  res.writeHead(code, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff', ...(allowedOrigins.has(origin) ? {'Access-Control-Allow-Origin':origin,'Vary':'Origin'} : {})});
  res.end(JSON.stringify(data));
}
export function handler(req, res) {
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS' && req.url === '/api/register' && allowedOrigins.has(origin)) {
    res.writeHead(204, {'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'});res.end();return;
  }
  if (req.method === 'GET' && req.url === '/api/health') return send(res,200,{ok:true,service:'registration'},origin);
  if (req.url !== '/api/register' || req.method !== 'POST') return send(res,404,{ok:false,message:'Route not found.'},origin);
  if (origin && !allowedOrigins.has(origin)) return send(res,403,{ok:false,message:'Origin not permitted.'},origin);
  const ip = req.socket.remoteAddress ?? 'unknown';const now = Date.now();
  const recent = (requestTimes.get(ip) ?? []).filter(ts=>now-ts<WINDOW_MS);
  if (recent.length>=15) return send(res,429,{ok:false,message:'Too many requests. Try again shortly.'},origin);
  recent.push(now);requestTimes.set(ip,recent);
  let body='';let tooLarge=false;
  req.on('data',chunk=>{ body+=chunk; if(Buffer.byteLength(body)>MAX_BODY_BYTES){tooLarge=true;req.pause();send(res,413,{ok:false,message:'Request is too large.'},origin);req.destroy();}});
  req.on('end',()=>{if(tooLarge)return;let data;try{data=JSON.parse(body);}catch{return send(res,400,{ok:false,message:'Invalid JSON.'},origin);}
    const error=validateRegistration(data);if(error)return send(res,400,{ok:false,message:error},origin);
    // No names, email addresses or consents are saved to disk or logged.
    return send(res,201,{ok:true,message:'Your request has been received.',reference:randomUUID()},origin);
  });
}
if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  const port=Number(process.env.PORT || 8787);
  http.createServer(handler).listen(port,'127.0.0.1',()=>process.stdout.write(`Registration API listening at http://127.0.0.1:${port}\n`));
}
