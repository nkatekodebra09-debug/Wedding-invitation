const form = document.querySelector('#rsvpForm');
const statusMessage = document.querySelector('#formStatus');
const shareButton = document.querySelector('#shareButton');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    attending: formData.get('attending') === 'true',
    message: formData.get('message')
  };

  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  statusMessage.textContent = '';

  try {
    await axios.post('/api/guests/rsvp', payload);
    form.reset();
    statusMessage.textContent = 'Thank you. Your RSVP has been received with love.';
  } catch (error) {
    statusMessage.textContent = 'We could not save your RSVP right now. Please call us instead.';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send RSVP <span aria-hidden="true">→</span>';
  }
});

shareButton.addEventListener('click', async () => {
  const shareData = {
    title: 'Tshepo & Sandisile | Welcoming Ceremony',
    text: 'Join us for Tshepo and Sandisile\'s welcoming ceremony on 20 December 2026.',
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      shareButton.innerHTML = '<span aria-hidden="true">✓</span> Link copied';
      window.setTimeout(() => { shareButton.innerHTML = '<span aria-hidden="true">↗</span> Share'; }, 2200);
    }
  } catch (error) {
    if (error.name !== 'AbortError') statusMessage.textContent = 'Copy this page link to share the invitation.';
  }
});
