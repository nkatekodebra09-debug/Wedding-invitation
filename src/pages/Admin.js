import { loginAdmin, getAdminStats } from '../services/api.js';
import { StatsDashboard } from '../components/StatsDashboard.js';

export function Admin() {
  return `<main class="admin-page"><section class="page-intro"><p class="section-kicker">Private view</p><h1>Event dashboard</h1><p>Sign in to view RSVP and invitation activity.</p></section><form id="adminForm" class="admin-form"><label for="username">Username<input id="username" name="username" required></label><label for="password">Password<input id="password" name="password" type="password" required></label><button class="submit-button" type="submit">Sign in <span aria-hidden="true">→</span></button><p class="form-status" id="adminStatus" role="status"></p></form><section id="statsArea" aria-live="polite"></section></main>`;
}

export function setupAdmin() {

  const form = document.querySelector('#adminForm');

  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = form.querySelector('button');

    const status = document.querySelector('#adminStatus');

    const values = new FormData(form);

    button.disabled = true;
    
    status.textContent = '';

    try {
      const { data } = await loginAdmin({ username: values.get('username'), password: values.get('password') });
      const statsResponse = await getAdminStats(data.token);
      document.querySelector('#statsArea').innerHTML = StatsDashboard(statsResponse.data);
      form.hidden = true;
    } 
    
    catch (error) {
      status.textContent = error.response?.data?.error || 'Login failed. Please check your details.';
    } 
    
    finally {
      button.disabled = false;
    }
  });
}
