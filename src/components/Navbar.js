export function Navbar() {
  return `<header class="topbar"><a class="wordmark" href="#home" aria-label="Home">T <span>&amp;</span> S</a><nav aria-label="Main navigation"><a href="#home">Invitation</a><a href="#rsvp">RSVP</a></nav><button class="share-button" id="shareButton" type="button"><span aria-hidden="true">↗</span> Share</button></header>`;
}

export function setupShareButton() {
  const button = document.querySelector('#shareButton');
  if (!button) return;
  button.addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Tshepo & Sandisile | Welcoming Ceremony', text: "Join Tshepo and Sandisile's welcoming ceremony on 20 December 2026.", url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); button.textContent = 'Link copied'; window.setTimeout(() => { button.textContent = '↗ Share'; }, 2200); }
    } catch (error) { if (error.name !== 'AbortError') button.textContent = 'Share unavailable'; }
  });
}
