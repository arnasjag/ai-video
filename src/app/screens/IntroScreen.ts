import type { ScreenCallbacks } from '../types';

declare global {
  interface Window {
    AddToHomeScreen: (options: {
      appName: string;
      appIconUrl: string;
      assetUrl: string;
      maxModalDisplayCount?: number;
    }) => {
      show: (lang?: string) => void;
      hide: () => void;
    };
    AddToHomeScreenInstance: ReturnType<typeof window.AddToHomeScreen>;
  }
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (navigator as any).standalone === true;
}

export function render(): string {
  return `
    <div class="screen">
      <div class="screen-content">
        <div class="screen-icon">🎬</div>
        <h1 class="title-large">Turn Picture into Fun AI Video</h1>
        <p class="body-text">Upload any photo and our AI transforms it into an amazing video</p>
      </div>
      <div class="screen-footer">
        <button class="button-primary" id="start-btn">Get Started</button>
      </div>
    </div>
  `;
}

export function init(callbacks: ScreenCallbacks): void {
  const startBtn = document.getElementById('start-btn');

  // Show add-to-homescreen prompt if not already installed
  if (!isStandalone() && window.AddToHomeScreen) {
    window.AddToHomeScreenInstance = window.AddToHomeScreen({
      appName: 'AI Video',
      appIconUrl: '/apple-touch-icon.png',
      assetUrl: 'https://cdn.jsdelivr.net/gh/philfung/add-to-homescreen@3.5/dist/assets/img/',
      maxModalDisplayCount: 1
    });
    window.AddToHomeScreenInstance.show('en');
  }

  startBtn?.addEventListener('click', () => {
    // Hide the prompt if it's still showing
    if (window.AddToHomeScreenInstance) {
      window.AddToHomeScreenInstance.hide();
    }
    callbacks.onNavigate('upload');
  });
}
