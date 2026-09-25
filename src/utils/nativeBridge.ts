/**
 * Reberwet Junior Secondary School Portal
 * Native Android Bridge & Mobile Integration Layer
 */

interface AndroidBridgeInterface {
  showToast(message: string): void;
  shareText(title: string, text: string): void;
  vibrate(durationMs: number): void;
  isAndroidApp(): boolean;
  getAppVersion(): string;
  savePdfToDownloads?(base64Data: string, fileName: string): boolean;
  downloadPdf?(base64Data: string, fileName: string): void;
}

declare global {
  interface Window {
    AndroidBridge?: AndroidBridgeInterface;
  }
}

export const NativeBridge = {
  /**
   * Check if the portal is currently executing inside the standalone Android application
   */
  isNativeAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    if (window.AndroidBridge && typeof window.AndroidBridge.isAndroidApp === 'function') {
      try {
        return window.AndroidBridge.isAndroidApp();
      } catch {
        return true;
      }
    }
    return navigator.userAgent.includes('ReberwetAndroidApp') || navigator.userAgent.includes('wv');
  },

  /**
   * Retrieve the native Android app version string
   */
  getAppVersion(): string {
    if (typeof window !== 'undefined' && window.AndroidBridge?.getAppVersion) {
      try {
        return window.AndroidBridge.getAppVersion();
      } catch {
        return '2.6.0-native';
      }
    }
    return '2.6.0';
  },

  /**
   * Show native Android Toast or fallback to web
   */
  showToast(message: string) {
    if (typeof window !== 'undefined' && window.AndroidBridge?.showToast) {
      try {
        window.AndroidBridge.showToast(message);
        return;
      } catch (e) {
        console.warn('Native Android toast fallback:', e);
      }
    }
  },

  /**
   * Trigger native haptic feedback (vibration) for key teacher actions like saving marks
   */
  vibrate(durationMs: number = 25) {
    if (typeof window !== 'undefined') {
      if (window.AndroidBridge?.vibrate) {
        try {
          window.AndroidBridge.vibrate(durationMs);
          return;
        } catch {
          // fallback
        }
      }
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(durationMs);
        } catch {
          // ignore
        }
      }
    }
  },

  /**
   * Open Android System Share sheet for parent SMS, learner report card links, or school circulars
   */
  async shareContent(title: string, text: string, url?: string): Promise<boolean> {
    if (typeof window !== 'undefined' && window.AndroidBridge?.shareText) {
      try {
        const fullShare = url ? `${text}\n\n${url}` : text;
        window.AndroidBridge.shareText(title, fullShare);
        return true;
      } catch (e) {
        console.warn('Native share failed:', e);
      }
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.warn('Web share failed:', err);
        }
      }
    }

    return false;
  },
};
