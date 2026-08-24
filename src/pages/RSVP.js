import { RSVPForm } from '../components/RSVPForm.js';

export function RSVP() {
  return `<main class="page-shell">

  <section class="page-intro">

  <p class="section-kicker">Your presence matters</p>
  <h1>Will you join us?</h1><p>Kindly let us know if you will be celebrating this special day with us.</p>

  <div class="contact">
  <span>RSVP by phone</span>
  <a href="tel:0735231371">073 523 1371</a>
  <a href="tel:078 228 4773">078 228 4773</a>
  <a href="tel:08386879974773">083 868 7997</a>
  </div>

  </section>${RSVPForm()}</main>`;
}
