import { InvitationCard } from '../components/InvitationCard.js';

export function Home() {
  return `<main id="top">${InvitationCard()}

  <section class="welcome-band" aria-label="Invitation greeting">
  
  <p class="section-kicker">Save the date</p>
  <h2>A day of family, love<br><em>&amp; new beginnings.</em></h2>
  
  <p>Come celebrate with us as we welcome the bride into her new family.</p>
  
  </section><section class="details-section" id="details" aria-labelledby="details-title">
  
  <div class="section-heading">
  <p class="section-kicker">The celebration details</p>
  <h2 id="details-title">Meet us there</h2>
  
  </div><div class="details-grid">
  
  <article class="detail-item">
  
  <div class="detail-icon">◷</div>
  
  <p class="detail-label">When</p>

  <h3>Sunday, 20 December 2026</h3>
  <p>Welcoming ceremony<br>at 10:00 in the morning</p>
  
  </article><article class="detail-item">
  
  <div class="detail-icon">⌖</div>
  
  <p class="detail-label">Where</p>
  <h3>Ka-Dzumeri
  / 0833, Giyani<br>Limpopo</h3><p>House next to Dzumeri<br>AOG</p>
  <a href="https://www.google.com/maps/place/DZUMERI+AOG/@-23.4255476,30.5458159,11z/data=!4m10!1m2!2m1!1sDzumeri+assemblies+of+god!3m6!1s0x1ec46f5b413ab2cd:0x16ea77515c8000ef!8m2!3d-23.5745959!4d30.7016306!15sChlEenVtZXJpIGFzc2VtYmxpZXMgb2YgZ29kIgOIAQGSARBjaHJpc3RpYW5fY2h1cmNo4AEA!16s%2Fg%2F11gfgqy52l?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer">Open in maps ↗</a></article><article class="detail-item"><div class="detail-icon">♡</div><p class="detail-label">Dress theme</p><h3>All shades of purple</h3><p>Wear your favourite light<br>shade/ the traditional attire of your choice and celebrate in colour.</p></article></div>
  
  </section>
  </main>`

}
