import axios from 'axios';

// `|| axios` keeps this module importable when a test auto-mocks axios
// (jest.mock('axios') makes axios.create() return undefined).
const api =
  axios.create({
    baseURL: 'http://localhost:8081/api',
  }) || axios;

const hasInterceptors = !!(api.interceptors && api.interceptors.request && api.interceptors.response);

if (hasInterceptors) api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// An expired/invalid token anywhere (except the login call itself) ends the session.
// App.js listens for this event and dispatches the Redux logout action.
if (hasInterceptors) api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = (error.config && error.config.url) || '';
    if (error.response && error.response.status === 401 && !url.includes('/auth/')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
