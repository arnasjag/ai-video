import type { OnboardingCallbacks } from '../../app/types';
import { getFilterById } from '../../data/mockFilters';

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

export function render(filterId?: string): string {
  const filter = filterId ? getFilterById(filterId) : null;
  const title = filter?.introTitle || 'Turn Picture into Fun AI Video';
  const subtitle = filter?.introSubtitle || 'Upload any photo and our AI transforms it into an amazing video';
  const icon = filter?.icon || '🎬';

  return `
    <div class="screen">
      <div class="screen-content">
        <div class="screen-icon">${icon}</div>
        <h1 class="title-large">${title}</h1>
        <p class="body-text">${subtitle}</p>
      </div>
      <div class="screen-footer">
        <button class="button-primary" id="start-btn">Get Started</button>
      </div>
    </div>
  `;
}

export function init(callbacks: OnboardingCallbacks): void {
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

  document.getElementById('start-btn')?.addEventListener('click', () => {
    if (window.AddToHomeScreenInstance) {
      window.AddToHomeScreenInstance.hide();
    }
    callbacks.onNavigate('upload');
  });
}
