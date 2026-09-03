import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { Home } from './pages/Home.js';
import { RSVP } from './pages/RSVP.js';
import { Admin, setupAdmin } from './pages/Admin.js';
import { logInvitationView } from './services/api.js';

const app = document.querySelector('#app');
const WELCOME_KEY = 'weddingWelcomeSeen';

// Audio element lives on document.body, OUTSIDE #app, so it survives every
// hash-route change. Without this, the song restarts from zero whenever the
// guest navigates from #home to #rsvp because the previous <audio> element
// (and its playback state) gets destroyed with innerHTML rewrites.
function ensureAudioElement() {
  let audio = document.querySelector('#weddingAudio');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'weddingAudio';
    audio.loop = true;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    audio.volume = 0.6;

    const source = document.createElement('source');
    source.src = '/assets/weddingSong.mp3';
    source.type = 'audio/mpeg';
    audio.appendChild(source);

    document.body.appendChild(audio);
  }
  return audio;
}

function routeMarkup(route, page) {
  return `${Navbar()}${page}${Footer()}`;
}

function splashMarkup() {
  return `
    <div
      class="welcome-splash"
      id="welcomeSplash"
      role="button"
      tabindex="0"
      aria-label="Open invitation"
    >
      <div class="welcome-splash-art" aria-hidden="true">
        <div class="sun-disc"></div>
        <div class="arch arch-one"></div>
        <div class="arch arch-two"></div>
        <div class="leaf leaf-one"></div>
        <div class="leaf leaf-two"></div>
        <div class="leaf leaf-three"></div>
      </div>
      <div class="welcome-splash-copy">
        <p class="section-kicker">Tshepo &amp; Sandisile</p>
        <h1 id="welcomeTitle">Welcome</h1>
        <p class="welcome-splash-sub">A day of family, love &amp; new beginnings.<br>Sunday, 20 December 2026.</p>
        <p class="welcome-splash-cta">Tap anywhere to open your invitation</p>
        <span class="welcome-splash-arrow" aria-hidden="true">↓</span>
      </div>
    </div>
  `;
}

function hasSeenWelcome() {
  try {
    return window.localStorage.getItem(WELCOME_KEY) === '1';
  } catch (error) {
    return false;
  }
}

function markWelcomeSeen() {
  try {
    window.localStorage.setItem(WELCOME_KEY, '1');
  } catch (error) {
    /* storage unavailable — ignore */
  }
}

function tryPlay(audio) {
  if (!audio || audio.muted) return;
  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => { /* gesture required — splash handles it */ });
  }
}

function setupWelcomeSplash() {
  const splash = document.querySelector('#welcomeSplash');
  const audio = ensureAudioElement();
  if (!splash) return;

  let dismissed = false;

  function dismiss(event) {
    if (dismissed) return;
    dismissed = true;
    if (event) event.preventDefault();

    tryPlay(audio);
    markWelcomeSeen();
    splash.classList.add('welcome-splash--leaving');
    window.setTimeout(() => {
      splash.remove();
    }, 350);
  }

  splash.addEventListener('click', dismiss);
  splash.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') dismiss(event);
  });
  splash.focus();
}

function renderRoute() {
  const route = window.location.hash.slice(1).split('?')[0] || 'home';
  const page = route === 'rsvp' ? RSVP() : route === 'admin' ? Admin() : Home();
  app.innerHTML = routeMarkup(route, page);

  // Keep the audio element alive across every navigation by ensuring it
  // exists on document.body. This is the line that prevents the song from
  // restarting when the guest clicks the RSVP link.
  ensureAudioElement();

  if (route === 'rsvp') {
    import('./components/RSVPForm.js').then(({ setupRSVPForm }) => setupRSVPForm());
  }
  if (window.location.search) window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
  if (route === 'admin') {
    setupAdmin();
  } else {
    // Try to resume playback in case the browser paused it after navigation.
    const audio = document.querySelector('#weddingAudio');
    if (audio && audio.paused && !audio.muted) tryPlay(audio);
  }
  if (route === 'home') logInvitationView().catch(() => {});
}

function render() {
  // Audio element is created exactly once, outside the routed DOM, and lives
  // on document.body for the lifetime of the page.
  ensureAudioElement();

  if (hasSeenWelcome()) {
    const existingSplash = document.querySelector('#welcomeSplash');
    if (existingSplash) existingSplash.remove();
    renderRoute();
  } else {
    app.innerHTML = splashMarkup() + routeMarkup('home', Home());
    setupWelcomeSplash();
    // logInvitationView().catch(() => {});
  }
}

window.addEventListener('hashchange', render);
render();
