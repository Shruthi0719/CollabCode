// client/src/api/axios.js  ← CREATE this file
// Use this instead of importing axios directly

import axios from 'axios';

const api = axios.create({
  baseURL:         import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
  withCredentials: true,  // required for cross-origin session cookies
});

export default api;