import axios from 'axios';

//const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5158';
//const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.0.0.29:5158';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.ananthaadirayaramath.org';

const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

// Interceptor: attach token to every request automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('appToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
