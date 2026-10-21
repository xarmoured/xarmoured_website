(() => {
  'use strict';
  const menu = document.getElementById('menu-toggle');
  const nav = document.getElementById('mainnav');
  menu?.addEventListener('click', () => {
    const opening = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(opening));
    nav.classList.toggle('open', opening);
  });
  const form = document.getElementById('lead-form');
  if (!form) return;
  const feedback = document.getElementById('form-status');
  const siteKey = window.XARMOURED_TURNSTILE_SITE_KEY || '';
  if (siteKey) {
    const turnstile = document.createElement('div');
    turnstile.className = 'cf-turnstile';
    turnstile.dataset.sitekey = siteKey;
    document.getElementById('turnstile-container').append(turnstile);
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.append(script);
  } else {
    feedback.textContent = 'Assessment form is not configured yet. Site owner: add a Turnstile site key.';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!siteKey) {feedback.textContent = 'Enquiries are not enabled until verification is configured.';return;}
    const data = Object.fromEntries(new FormData(form).entries());
    if (!data['cf-turnstile-response']) {feedback.textContent = 'Complete the human-verification challenge.';return;}
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    feedback.textContent = 'Submitting securely…';
    try {
      const res = await fetch('/api/lead', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Unable to submit right now.');
      feedback.textContent = 'Enquiry received. Please check your email for any follow-up.';
      form.reset();
    } catch (e) {
      feedback.textContent = e.message || 'Something went wrong; please try again.';
    } finally {button.disabled=false;window.turnstile?.reset();}
  });
})();
