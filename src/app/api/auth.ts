import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5045',
//   withCredentials: true,
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Manejo de errores de red (sin respuesta del servidor)
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout:', error.message);
        return Promise.reject(new Error('La solicitud tardó demasiado. Intenta nuevamente.'));
      }

      if (!error.response) {
        console.error('Network error:', {
          message: error.message,
          code: error.code,
          config: {
            url: error.config?.url,
            method: error.config?.method
          }
        });

        return Promise.reject(new Error('Problema de conexión. Verifica tu red e intenta nuevamente.'));
      }

      // Manejo de errores HTTP
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('HTTP error:', error.response.status, error.response.data);
      }

      return Promise.reject(error);
    }
  );

export default api;