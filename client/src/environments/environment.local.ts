import { API_IP, API_PORT } from './api-url';
import { Environment } from './types';

export const environment: Environment = {
  production: false,
  apiUrl: `http://${API_IP}:${API_PORT}/api/`,
  envPrefix: '[LCL] ',
};
