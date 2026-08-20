import { Navbar, setupShareButton } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { Home } from './pages/Home.js';
import { RSVP } from './pages/RSVP.js';
import { Admin, setupAdmin } from './pages/Admin.js';
import { logInvitationView } from './services/api.js';

const app = document.querySelector('#app');

function render() {
  const route = window.location.hash.slice(1).split('?')[0] || 'home';
  const page = route === 'rsvp' ? RSVP() : route === 'admin' ? Admin() : Home();
  app.innerHTML = `${Navbar()}${page}${Footer()}`;
  setupShareButton();
  if (route === 'rsvp') import('./components/RSVPForm.js').then(({ setupRSVPForm }) => setupRSVPForm());
  if (route === 'admin') setupAdmin();
  if (route === 'home') logInvitationView().catch(() => {});
  if (route === 'home') {
    const audio = document.querySelector('#weddingAudio');
    if (audio) {
      audio.play().catch(() => {
        const startMusic = () => audio.play().catch(() => {});
        document.addEventListener('click', startMusic, { once: true });
        document.addEventListener('keydown', startMusic, { once: true });
      });
    }
  }
}

window.addEventListener('hashchange', render);
render();
