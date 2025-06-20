// hooks/useCapacitor.ts
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useCapacitor = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const nativePlatform = Capacitor.isNativePlatform();
    setIsNative(nativePlatform);
    setPlatform(Capacitor.getPlatform() as 'ios' | 'android' | 'web');

    if (nativePlatform) {
      // Configurar StatusBar
      StatusBar.setStyle({ style: Style.Light });
      StatusBar.setBackgroundColor({ color: '#10b981' });

      // Setup dos listeners de forma assíncrona
      const setupListeners = async () => {
        // Listeners do teclado
        const showListener = await Keyboard.addListener('keyboardWillShow', info => {
          setKeyboardHeight(info.keyboardHeight);
        });

        const hideListener = await Keyboard.addListener('keyboardWillHide', () => {
          setKeyboardHeight(0);
        });

        // Cleanup function
        return () => {
          showListener.remove();
          hideListener.remove();
        };
      };

      // Executar setup e guardar cleanup function
      let cleanup: (() => void) | undefined;
      setupListeners().then(cleanupFn => {
        cleanup = cleanupFn;
      });

      // Retornar cleanup
      return () => {
        if (cleanup) {
          cleanup();
        }
      };
    }
  }, []);

  // Função para vibração háptica
  const hapticFeedback = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (isNative) {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      };
      
      await Haptics.impact({ style: impactStyle[style] });
    }
  };

  // Função para minimizar app
  const minimizeApp = async () => {
    if (isNative && platform === 'android') {
      await App.minimizeApp();
    }
  };

  // Função para sair do app
  const exitApp = () => {
    if (isNative) {
      App.exitApp();
    }
  };

  return {
    isNative,
    platform,
    keyboardHeight,
    hapticFeedback,
    minimizeApp,
    exitApp
  };
};