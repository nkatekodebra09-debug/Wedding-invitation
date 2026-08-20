export function StatsDashboard(stats) {
  return `<div class="stats-grid"><article class="stat-card"><span>All responses</span><strong>${stats.totalGuests ?? 0}</strong></article><article class="stat-card"><span>Attending</span><strong>${stats.attendingGuests ?? 0}</strong></article><article class="stat-card"><span>Invitation views</span><strong>${stats.totalViews ?? 0}</strong></article></div>`;
}
