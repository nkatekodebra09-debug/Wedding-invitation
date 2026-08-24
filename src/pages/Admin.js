import { loginAdmin, getAdminGuestList } from '../services/api.js';
import { StatsDashboard, attachDashboardControls } from '../components/StatsDashboard.js';

const TOKEN_KEY = 'weddingAdminToken';

function readToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

function writeToken(token) {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    /* storage unavailable — ignore */
  }
}

export function Admin() {
  const hasToken = Boolean(readToken());
  return `
    <main class="admin-page">
      <section class="page-intro">
        <p class="section-kicker">Private view</p>
        <h1>Event dashboard</h1>
        <p>Sign in to view RSVP and invitation activity.</p>
      </section>

      <form id="adminForm" class="admin-form" ${hasToken ? 'hidden' : ''}>
        <label for="username">Username
          <input id="username" name="username" autocomplete="username" required>
        </label>
        <label for="password">Password
          <input id="password" name="password" type="password" autocomplete="current-password" required>
        </label>
        <button class="submit-button" type="submit">Sign in <span aria-hidden="true">→</span></button>
        <p class="form-status" id="adminStatus" role="status"></p>
      </form>

      <section id="statsArea" aria-live="polite"></section>
    </main>
  `;
}

export function setupAdmin() {
  const form = document.querySelector('#adminForm');
  const statsArea = document.querySelector('#statsArea');

  async function renderDashboard(token) {
    try {
      const response = await getAdminGuestList(token);
      const payload = response.data;
      if (statsArea) {
        statsArea.innerHTML = StatsDashboard(payload);
        attachDashboardControls({
          payload,
          token,
          onRefresh: () => renderDashboard(token),
          onLogout: () => {
            writeToken(null);
            window.location.hash = '#home';
            window.location.reload();
          },
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        writeToken(null);
        if (form) form.hidden = false;
        const status = document.querySelector('#adminStatus');
        if (status) status.textContent = 'Session expired. Please sign in again.';
      } else if (statsArea) {
        statsArea.innerHTML = '<p class="form-status">Failed to load guest list. Please try again.</p>';
      }
    }
  }

  const existingToken = readToken();
  if (existingToken) {
    renderDashboard(existingToken);
  }

  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    const status = document.querySelector('#adminStatus');
    const values = new FormData(form);

    button.disabled = true;
    if (status) status.textContent = '';

    try {
      const { data } = await loginAdmin({
        username: values.get('username'),
        password: values.get('password'),
      });
      writeToken(data.token);
      form.hidden = true;
      await renderDashboard(data.token);
    } catch (error) {
      if (status) {
        status.textContent = error.response?.data?.error || 'Login failed. Please check your details.';
      }
    } finally {
      button.disabled = false;
    }
  });
}
