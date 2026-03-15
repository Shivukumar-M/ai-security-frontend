import apiClient from './config.js';

export const getDashboardMetrics = async () => {
  const response = await apiClient.get('/dashboard/metrics');
  return response.data;
};
