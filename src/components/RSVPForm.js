import { submitRSVP } from '../services/api.js';

export function RSVPForm() {
  return `<form id="rsvpForm" class="rsvp-form"><label for="name">Your name<input id="name" name="name" type="text" placeholder="e.g. Nandi Mokoena" required></label><label for="email">Email address<input id="email" name="email" type="email" placeholder="you@example.com" required></label><fieldset><legend>Will you be attending?</legend><label class="choice"><input type="radio" name="attending" value="true" required> <span>Joyfully attending</span></label><label class="choice"><input type="radio" name="attending" value="false"> <span>Regretfully unable</span></label></fieldset><label for="message">A note for the couple <span class="optional">(optional)</span><textarea id="message" name="message" rows="3" placeholder="Leave a little love..."></textarea></label><button class="submit-button" type="submit">Send RSVP <span aria-hidden="true">→</span></button><p class="form-status" id="formStatus" role="status" aria-live="polite"></p></form>`;
}

export function setupRSVPForm() {
  const form = document.querySelector('#rsvpForm');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const status = document.querySelector('#formStatus');
    const values = new FormData(form);
    button.disabled = true;
    button.textContent = 'Sending...';
    try {
      await submitRSVP({ name: values.get('name'), email: values.get('email'), attending: values.get('attending') === 'true', message: values.get('message') });
      form.reset();
      status.textContent = 'Thank you. Your RSVP has been received with love.';
    } catch (error) { status.textContent = 'We could not save your RSVP right now. Please call us instead.'; }
    finally { button.disabled = false; button.innerHTML = 'Send RSVP <span aria-hidden="true">→</span>'; }
  });
}
