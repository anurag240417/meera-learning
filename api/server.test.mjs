import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration } from './server.mjs';
const valid = {fullName:'Asha Rao',email:'asha@example.com',programInterest:'focus',consent:true};
test('valid contract',()=>assert.equal(validateRegistration(valid),null));
test('explicit consent',()=>assert.match(validateRegistration({...valid,consent:false}),/Consent/));
test('email check',()=>assert.match(validateRegistration({...valid,email:'invalid'}),/email/));
test('program enum',()=>assert.match(validateRegistration({...valid,programInterest:'other'}),/program/));
