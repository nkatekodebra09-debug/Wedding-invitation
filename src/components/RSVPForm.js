import { submitRSVP, getInvitee } from '../services/api.js';

const SUCCESS_MESSAGE = `We are delighted to celebrate this special day with you! Kindly arrive on time to share in all the beautiful moments. Please dress elegantly in shades of purple to honor the theme  and you are warmly welcome to wear traditional attire of your choice. Children are invited, and we trust parents will help ensure their comfort throughout the festivities. Your love and presence are the greatest gifts we could ask for, but if you wish to bless us further, wedding gifts will be graciously appreciated. We look forward to creating cherished memories together on this joyous occasion.`;

const renderSuccess = () => `<section class="rsvp-success" role="status" aria-live="polite">
  <p class="section-kicker">RSVP received</p>
  <h1>You are warmly welcomed</h1>
  <p>${SUCCESS_MESSAGE}</p>
</section>`;

export function RSVPForm() {
  return `<form id="rsvpForm" class="rsvp-form"><label for="name">Your name<input id="name" name="name" type="text" placeholder="e.g. Nandi Mokoena" required></label><label for="email">Email address<input id="email" name="email" type="email" placeholder="you@example.com" required></label><fieldset><legend>Will you be attending?</legend><label class="choice"><input type="radio" name="attending" value="true" required> <span>Joyfully attending</span></label><label class="choice"><input type="radio" name="attending" value="false"> <span>Regretfully unable</span></label></fieldset><label for="attendeeCount">How many people attending? <span class="optional">(including yourself)</span><input id="attendeeCount" name="attendeeCount" type="number" min="1" max="6" value="1" required></label><label for="message">A note for the couple <span class="optional">(optional)</span><textarea id="message" name="message" rows="3" placeholder="Leave a little love..."></textarea></label><button class="submit-button" type="submit">Send RSVP <span aria-hidden="true">→</span></button><p class("form-status" id="formStatus" role="status" aria-live("polite"></p></form>`;
}

export function setupRSVPForm({ token } = {}) {
  const form = document.querySelector('#rsvpForm');
  if (!form) return;

  const button = form.querySelector('button[type="submit"]');
  const status = document.querySelector('#formStatus');

  const inviteeRequest = token ? getInvitee(token) : Promise.resolve(null);
  inviteeRequest
    .then((response) => {
      const data = response?.data;
      if (!data) return;
      if (data && data.alreadySubmitted) {
        form.hidden = true;
        const wrapper = form.parentElement;
        if (wrapper) wrapper.insertAdjacentHTML('beforeend', `<section class="rsvp-success" role="status" aria-live="polite"><p class="section-kicker">Already received</p><h1>This invitation has already been used</h1><p>Thank you for responding. Each invitation is for one household and can only be used once.</p></section>`);
        return;
      }
      const nameInput = form.querySelector('#name');
      const emailInput = form.querySelector('#email');
      if (data.name && nameInput) nameInput.value = data.name;
      if (data.email && emailInput) emailInput.value = data.email;
    })
    .catch((error) => {
      const message = error.response?.status === 404 ? 'This invitation link is not valid.' : 'We could not load your invitation. Please try again later.';
      if (status) status.textContent = message;
      button.disabled = true;
    });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button.disabled) return;
    const values = new FormData(form);
    button.disabled = true;
    const originalButtonHTML = button.innerHTML;
    button.textContent = 'Sending...';
    try {
      await submitRSVP({
        ...(token ? { token } : {}),
        name: values.get('name'),
        email: values.get('email'),
        attending: values.get('attending') === 'true',
        attendeeCount: Number(values.get('attendeeCount')),
        message: values.get('message'),
      });
      const wrapper = form.parentElement;
      form.remove();
      if (wrapper) wrapper.insertAdjacentHTML('beforeend', renderSuccess());
    } catch (error) {
      const message = error.response?.data?.error || 'We could not save your RSVP right now. Please call us instead.';
      if (status) status.textContent = message;
      button.disabled = false;
      button.innerHTML = originalButtonHTML;
    }
  });
}
