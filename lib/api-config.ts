// lib/api-config.ts
import { Capacitor } from '@capacitor/core';

// URL hospedada (HTTPS) usada pelo app nativo empacotado pelo Capacitor
// (ADR 0007/0009). Configurável por NEXT_PUBLIC_SITE_URL; fallback no domínio.
const HOSTED_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://flvxus.com.br';

export const getApiUrl = (path: string): string => {
  // Se estiver no ambiente nativo, usar URL absoluta
  if (Capacitor.isNativePlatform()) {
    return `${HOSTED_SITE_URL}${path}`;
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