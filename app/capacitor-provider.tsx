// app/capacitor-provider.tsx
"use client";

import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { App } from '@capacitor/app';
import { useRouter, usePathname } from 'next/navigation';
import { useCapacitor } from '@/hooks/useCapacitor';
import { Network } from '@capacitor/network';
import { Toast } from '@capacitor/toast';

interface CapacitorContextType {
  isNative: boolean;
  platform: 'ios' | 'android' | 'web';
  isOnline: boolean;
}

const CapacitorContext = createContext<CapacitorContextType>({
  isNative: false,
  platform: 'web',
  isOnline: true
});

export const useCapacitorContext = () => useContext(CapacitorContext);

export function CapacitorProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isNative, platform } = useCapacitor();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!isNative) return;

    // Setup assíncrono dos listeners
    const setupListeners = async () => {
      // Configurar botão voltar do Android
      const backButtonListener = await App.addListener('backButton', () => {
        // Rotas que devem sair do app ao pressionar voltar
        const exitRoutes = ['/dashboard', '/login', '/'];
        
        if (exitRoutes.includes(pathname)) {
          App.exitApp();
        } else {
          router.back();
        }
      });

      // Listener para estado do app (background/foreground)
      const stateChangeListener = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // App voltou ao foreground - revalidar dados se necessário
          console.log('App is now active');
        }
      });

      // Listener para deep links
      const urlOpenListener = await App.addListener('appUrlOpen', (data) => {
        const slug = data.url.split('.com.br').pop();
        if (slug) {
          router.push(slug);
        }
      });

      // Monitor de conexão
      const networkListener = await Network.addListener('networkStatusChange', status => {
        setIsOnline(status.connected);
        
        if (!status.connected) {
          Toast.show({
            text: 'Você está offline. Algumas funcionalidades podem não estar disponíveis.',
            duration: 'long',
            position: 'bottom'
          });
        }
      });

      // Verificar status inicial da rede
      const currentStatus = await Network.getStatus();
      setIsOnline(currentStatus.connected);

      // Retornar função de cleanup
      return () => {
        backButtonListener.remove();
        stateChangeListener.remove();
        urlOpenListener.remove();
        networkListener.remove();
      };
    };

    // Executar setup e guardar cleanup
    let cleanup: (() => void) | undefined;
    setupListeners().then(cleanupFn => {
      cleanup = cleanupFn;
    });

    // Cleanup no unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isNative, pathname, router]);

  return (
    <CapacitorContext.Provider value={{ isNative, platform, isOnline }}>
      {children}
    </CapacitorContext.Provider>
  );
}