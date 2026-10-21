// Vercel Node.js function. Uses Cloudflare Turnstile + Resend; fail-closed until configured.
// Sensitive environment variables are read only on the server.
'use strict';
const ALLOWED_SERVICES = new Set([
  'Web Application Penetration Testing', 'API Security Testing',
  'Android Application Security Testing', 'Security Retesting', 'Not sure / discovery'
]);
const LIMITS = {name:100,email:180,company:160,service:80,message:3000};
function valid(x, key, min=1) {return typeof x==='string' && x.trim().length>=min && x.trim().length<=LIMITS[key];}
function escapeHTML(s) {return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if (req.method !== 'POST') {res.setHeader('Allow','POST');return res.status(405).json({message:'Method not allowed'});}
  const {TURNSTILE_SECRET_KEY,TURNSTILE_ALLOWED_HOSTNAMES,RESEND_API_KEY,CONTACT_TO_EMAIL,CONTACT_FROM_EMAIL} = process.env;
  if (![TURNSTILE_SECRET_KEY,TURNSTILE_ALLOWED_HOSTNAMES,RESEND_API_KEY,CONTACT_TO_EMAIL,CONTACT_FROM_EMAIL].every(Boolean)) {
    return res.status(503).json({message:'Contact form is not configured. Please try later.'});
  }
  const b=req.body||{};
  if (Number(req.headers['content-length']||0)>12000) return res.status(413).json({message:'Request too large'});
  if (b.website) return res.status(200).json({ok:true}); // honeypot
  if (!valid(b.name,'name',2)||!valid(b.email,'email',5)||!valid(b.company,'company',2)||
      !valid(b.service,'service')||!ALLOWED_SERVICES.has(b.service)||!valid(b.message,'message',20)||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)||
      typeof b['cf-turnstile-response'] !== 'string' || b['cf-turnstile-response'].length < 5 || b['cf-turnstile-response'].length > 2048)
    return res.status(400).json({message:'Check the required fields and try again.'});
  const ip=String(req.headers['x-forwarded-for']||'').split(',')[0].trim();
  let verify;
  try {
    const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:AbortSignal.timeout(10000),
      body:new URLSearchParams({secret:TURNSTILE_SECRET_KEY,response:b['cf-turnstile-response'],remoteip:ip})
    });
    verify=await response.json();
  } catch {return res.status(503).json({message:'Verification unavailable. Try again.'});}
  const hosts=new Set(TURNSTILE_ALLOWED_HOSTNAMES.split(',').map(x=>x.trim()).filter(Boolean));
  if (!verify?.success || !hosts.has(verify.hostname)) return res.status(400).json({message:'Verification failed. Please try again.'});
  const lines=['Name: '+b.name,'Work email: '+b.email,'Company: '+b.company,'Service: '+b.service,'Project overview:','',b.message];
  const html=lines.map(x=>escapeHTML(x)).join('<br>');
  try {
    const response=await fetch('https://api.resend.com/emails',{
      method:'POST',headers:{Authorization:'Bearer '+RESEND_API_KEY,'Content-Type':'application/json'},signal:AbortSignal.timeout(10000),
      body:JSON.stringify({from:CONTACT_FROM_EMAIL,to:[CONTACT_TO_EMAIL],subject:'Xarmoured assessment enquiry — '+b.service,html,reply_to:b.email})
    });
    if(!response.ok) throw new Error('Email delivery service rejected the request');
  } catch {
    return res.status(502).json({message:'We could not deliver this request. Please try again later.'});
  }
  return res.status(200).json({ok:true});
};
