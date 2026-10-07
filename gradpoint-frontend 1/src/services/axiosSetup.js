import axios from 'axios';

// The Login / SubjectList / SubjectForm components call the global axios with
// '/api/...' paths. Point those at the backend and attach the JWT.
axios.defaults.baseURL = process.env.REACT_APP_API_ORIGIN || 'http://localhost:8080';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
