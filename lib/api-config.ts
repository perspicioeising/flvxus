// lib/api-config.ts
import { Capacitor } from '@capacitor/core';

export const getApiUrl = (path: string): string => {
  // Se estiver no ambiente nativo, usar URL absoluta
  if (Capacitor.isNativePlatform()) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://flvxus.com.br';
    return `${baseUrl}${path}`;
  }
  
  // Se estiver na web, usar caminho relativo
  return path;
};

export const fetchWithCapacitor = async (
  path: string, 
  options?: RequestInit
): Promise<Response> => {
  const url = getApiUrl(path);
  
  // Adicionar headers padrão para requisições nativas
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
};

// Hook para usar em componentes
import { useCapacitor } from '@/hooks/useCapacitor';

export const useApi = () => {
  const { isNative } = useCapacitor();
  
  const api = {
    get: (path: string) => fetchWithCapacitor(path, { method: 'GET' }),
    post: (path: string, body: any) => 
      fetchWithCapacitor(path, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    put: (path: string, body: any) => 
      fetchWithCapacitor(path, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    delete: (path: string) => fetchWithCapacitor(path, { method: 'DELETE' }),
  };
  
  return { api, isNative };
};