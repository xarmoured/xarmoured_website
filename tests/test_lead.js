const assert=require('node:assert/strict');
const handler=require('../website/api/lead');
let sent=[];
function res(){return {code:200,head:{},setHeader(k,v){this.head[k]=v;},status(n){this.code=n;return this;},json(body){this.body=body;return this;}};}
async function call(body={},method='POST'){const r=res(); await handler({method,body,headers:{'content-length':'500','x-forwarded-for':'192.0.2.1'}},r);return r;}
async function run(){
  delete process.env.TURNSTILE_SECRET_KEY;
  assert.equal((await call()).code,503);
  Object.assign(process.env,{TURNSTILE_SECRET_KEY:'secret',TURNSTILE_ALLOWED_HOSTNAMES:'xarmoured.tech',RESEND_API_KEY:'test',CONTACT_TO_EMAIL:'owner@example.com',CONTACT_FROM_EMAIL:'contact@example.com'});
  const b={name:'Example Buyer',email:'buyer@example.com',company:'Example Co',service:'API Security Testing',message:'A multi-role API needing an authorized assessment.','cf-turnstile-response':'test-site-token'};
  assert.equal((await call({...b,email:'not-an-email'})).code,400);
  let called=0;
  global.fetch=async (url,opts)=>{
    called++;
    if(url.includes('siteverify'))return {ok:true,json:async()=>({success:true,hostname:'evil.example'})};
    throw new Error('Email must never be called for invalid host');
  };
  assert.equal((await call(b)).code,400);assert.equal(called,1);
  global.fetch=async (url,opts)=>{
    if(url.includes('siteverify'))return {ok:true,json:async()=>({success:true,hostname:'xarmoured.tech'})};
    sent.push(JSON.parse(opts.body));return {ok:true,json:async()=>({id:'fake'})};
  };
  assert.equal((await call(b)).code,200);assert.equal(sent.length,1);assert.equal(sent[0].reply_to,b.email);
  assert.equal((await call({...b,website:'spam'})).code,200);assert.equal(sent.length,1);
  assert.equal((await call({},'GET')).code,405);
  console.log('PASS: closed-by-default, input validation, token host check, email dispatch, honeypot, methods');
}
run().catch(e=>{console.error(e);process.exitCode=1});
