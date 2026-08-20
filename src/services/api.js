const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });
export const submitRSVP = (guest) => api.post('/guests/rsvp', guest);
export const logInvitationView = () => api.post('/views/view', { page: window.location.pathname });
export const loginAdmin = (credentials) => api.post('/admin/login', credentials);
export const getAdminStats = (token) => api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
