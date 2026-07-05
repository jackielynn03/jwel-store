import axios from 'axios';

// Pull the API URL from your Vite .env file.
// If it doesn't exist, it defaults to localhost for local dev safety.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Derive the BASE_URL to use for images (Removes the trailing "/api")
export const BASE_URL = API_URL.replace(/\/api$/, '');

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${API_URL}/auth/refresh`, // Updated to use dynamic URL
          {}, 
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest);
        
      } catch (refreshError) {
        console.error('Refresh token expired or invalid', refreshError);
        localStorage.removeItem('accessToken');
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;