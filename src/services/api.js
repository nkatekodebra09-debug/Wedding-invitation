const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });
export const submitRSVP = (guest) => api.post('/guests/rsvp', guest);
export const getInvitee = (token) => api.get('/guests/invitee/' + encodeURIComponent(token));
export const getInviteeSession = () => api.get('/guests/invitee');
export const logInvitationView = () => api.post('/views/view', { page: window.location.pathname });
export const loginAdmin = (credentials) => api.post('/admin/login', credentials);
export const getAdminStats = (token) => api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
export const getAdminRsvps = (token) => api.get('/admin/rsvps', { headers: { Authorization: `Bearer ${token}` } });
export const getAdminGuestList = (token) => api.get('/admin/guest-list', { headers: { Authorization: `Bearer ${token}` } });
