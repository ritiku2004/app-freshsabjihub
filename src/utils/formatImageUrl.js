import { API_BASE_URL } from '../config/env';

export const formatImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  let formattedUrl = url;
  
  // Convert relative paths to absolute backend paths
  if (formattedUrl.startsWith('/')) {
    const serverBaseUrl = API_BASE_URL.replace('/api/v1', '');
    formattedUrl = `${serverBaseUrl}${formattedUrl}`;
  }

  // Upgrade http to https for external URLs, but leave local IPs alone
  if (formattedUrl.startsWith('http://') && 
      !formattedUrl.includes('localhost') && 
      !formattedUrl.match(/10\.\d+\.\d+\.\d+/) && 
      !formattedUrl.match(/192\.168\.\d+\.\d+/)) {
    formattedUrl = formattedUrl.replace('http://', 'https://');
  }

  return formattedUrl;
};
