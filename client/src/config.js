// Configuração da API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const SOCKET_URL = API_URL;

// Configurações gerais
export const config = {
  apiUrl: API_URL,
  socketUrl: SOCKET_URL,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
