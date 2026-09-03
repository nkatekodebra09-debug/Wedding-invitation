function escape(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadge(guest) {
  if (!guest.invited) {
    return '<span class="status-badge status-walkin">Walk-in</span>';
  }
  if (!guest.rsvpSubmitted) {
    return '<span class="status-badge status-pending">Awaiting</span>';
  }
  if (guest.attending) {
    const count = guest.attendeeCount && guest.attendeeCount > 1
      ? ` · ${escape(guest.attendeeCount)} people`
      : '';
    return `<span class="status-badge status-attending">Attending${count}</span>`;
  }
  return '<span class="status-badge status-declined">Declined</span>';
}

function renderRow(guest) {
  return `
    <tr>
      <td>${escape(guest.name)}</td>
      <td>${escape(guest.email)}</td>
      <td>${guest.invited ? 'Invited' : 'Walk-in'}</td>
      <td>${statusBadge(guest)}</td>
      <td>${formatDate(guest.submittedAt)}</td>
      <td class="message-cell">${escape(guest.message) || '<em>—</em>'}</td>
    </tr>
  `;
}

function renderAttendingRow(guest) {
  const totalPeople = Number(guest.attendeeCount) || 1;
  const extraGuests = Math.max(0, totalPeople - 1);
  const guestLabel = extraGuests === 1 ? 'guest' : 'guests';
  return `<tr><td>${escape(guest.name)}</td><td>${extraGuests ? `Bringing ${extraGuests} ${guestLabel}` : 'Coming alone'}</td></tr>`;
}

function renderDeclinedRow(guest) {
  return `<li>${escape(guest.name)}</li>`;
}

export function StatsDashboard(payload) {
  const { stats = {}, invitees = [], walkIns = [] } = payload || {};
  const rows = [...invitees, ...walkIns];
  const attending = rows.filter((guest) => guest.rsvpSubmitted && guest.attending);
  const declined = rows.filter((guest) => guest.rsvpSubmitted && guest.attending === false);

  return `
    <div class="stats-grid">
      <article class="stat-card">
        <span>Invited</span>
        <strong>${escape(stats.totalInvited ?? 0)}</strong>
      </article>
      <article class="stat-card">
        <span>Responded</span>
        <strong>${escape(stats.totalResponded ?? 0)}</strong>
      </article>
      <article class="stat-card">
        <span>Attending</span>
        <strong>${escape(stats.totalAttending ?? 0)}</strong>
      </article>
      <article class="stat-card">
        <span>Declined</span>
        <strong>${escape(stats.totalDeclined ?? 0)}</strong>
      </article>
      <article class="stat-card">
        <span>Total guests coming</span>
        <strong>${escape(stats.totalAttendees ?? 0)}</strong>
      </article>
      <article class="stat-card">
        <span>Walk-ins</span>
        <strong>${escape(stats.walkIns ?? 0)}</strong>
      </article>
    </div>

    <div class="rsvp-summary-sections">
      <section class="rsvp-summary rsvp-summary-attending" aria-labelledby="attending-title">
        <div class="rsvp-summary-heading">
          <div>
            <p class="section-kicker">Confirmed responses</p>
            <h2 id="attending-title">Attending</h2>
          </div>
          <strong class="rsvp-summary-count">${escape(stats.totalAttendees ?? 0)} <span>people</span></strong>
        </div>
        <table class="rsvp-summary-table">
          <thead><tr><th scope="col">Name</th><th scope="col">Guests Coming With</th></tr></thead>
          <tbody>${attending.length ? attending.map(renderAttendingRow).join('') : '<tr><td colspan="2" class="admin-empty">No attending responses yet.</td></tr>'}</tbody>
        </table>
      </section>

      <section class="rsvp-summary rsvp-summary-declined" aria-labelledby="declined-title">
        <div class="rsvp-summary-heading">
          <div>
            <p class="section-kicker">Responses received</p>
            <h2 id="declined-title">Declined</h2>
          </div>
          <strong class="rsvp-summary-count">${escape(stats.totalDeclined ?? 0)} <span>people</span></strong>
        </div>
        <ul class="rsvp-declined-list">${declined.length ? declined.map(renderDeclinedRow).join('') : '<li class="admin-empty">No declined responses yet.</li>'}</ul>
      </section>
    </div>

    <section class="admin-table-section">
      <div class="admin-table-controls">
        <input
          type="search"
          id="guestSearch"
          class="admin-search"
          placeholder="Search by name or email"
          aria-label="Search guest list"
        />
        <select id="guestFilter" class="admin-filter" aria-label="Filter by status">
          <option value="all">All</option>
          <option value="attending">Attending</option>
          <option value="declined">Declined</option>
          <option value="pending">Awaiting</option>
          <option value="walkin">Walk-ins</option>
        </select>
        <button type="button" id="adminRefresh" class="submit-button submit-button-secondary">Refresh</button>
        <button type="button" id="adminLogout" class="submit-button submit-button-secondary">Sign out</button>
      </div>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">List</th>
              <th scope="col">Status</th>
              <th scope="col">Submitted</th>
              <th scope="col">Message</th>
            </tr>
          </thead>
          <tbody id="guestTableBody">
            ${rows.length ? rows.map(renderRow).join('') : '<tr><td colspan="6" class="admin-empty">No guests yet.</td></tr>'}
          </tbody>
        </table>
      </div>
      <p class="admin-row-count" id="guestCount">${rows.length} ${rows.length === 1 ? 'guest' : 'guests'} shown</p>
    </section>
  `;
}

export function attachDashboardControls({ payload, token, onRefresh, onLogout }) {
  const search = document.querySelector('#guestSearch');
  const filter = document.querySelector('#guestFilter');
  const body = document.querySelector('#guestTableBody');
  const count = document.querySelector('#guestCount');
  const refresh = document.querySelector('#adminRefresh');
  const logout = document.querySelector('#adminLogout');
  const allRows = [...payload.invitees, ...payload.walkIns];

  function applyFilter() {
    if (!body || !count) return;
    const query = (search?.value || '').trim().toLowerCase();
    const filterValue = filter?.value || 'all';

    const filtered = allRows.filter((g) => {
      if (query && !(`${g.name} ${g.email}`.toLowerCase().includes(query))) {
        return false;
      }
      if (filterValue === 'attending' && !(g.invited && g.rsvpSubmitted && g.attending)) return false;
      if (filterValue === 'declined' && !(g.invited && g.rsvpSubmitted && !g.attending)) return false;
      if (filterValue === 'pending' && !(g.invited && !g.rsvpSubmitted)) return false;
      if (filterValue === 'walkin' && g.invited) return false;
      return true;
    });

    body.innerHTML = filtered.length
      ? filtered.map(renderRow).join('')
      : '<tr><td colspan="6" class="admin-empty">No guests match your filter.</td></tr>';
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'guest' : 'guests'} shown`;
  }

  search?.addEventListener('input', applyFilter);
  filter?.addEventListener('change', applyFilter);
  refresh?.addEventListener('click', onRefresh);
  logout?.addEventListener('click', onLogout);
}
