export type Screen = 'intro' | 'upload' | 'payment' | 'success';

export interface AppState {
  currentScreen: Screen;
  uploadedImage: string | null;
}

export interface ScreenCallbacks {
  onNavigate: (screen: Screen) => void;
  onSetImage: (imageData: string) => void;
  getImage: () => string | null;
}

// PWA Install prompt event (Chrome/Android)
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
