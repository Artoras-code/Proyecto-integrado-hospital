import axios from 'axios';

const apiClient = axios.create({
  // Esta es la URL de tu backend de Django
  baseURL: 'http://localhost:8000',
});

// Esto se ejecuta ANTES de cada petición.
apiClient.interceptors.request.use(
  (config) => {
    // 1. Obtenemos el token de localStorage
    const token = localStorage.getItem('accessToken');
    
    // 2. Si el token existe, lo añadimos a la cabecera (header)
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;