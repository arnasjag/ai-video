import type { OnboardingCallbacks } from '../../app/types';
import { getFilterById } from '../../data/mockFilters';
import { haptic } from '../../utils/haptic';

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

function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints > 0 && window.innerWidth < 768);
}

export function render(filterId?: string): string {
  const filter = filterId ? getFilterById(filterId) : null;
  const title = filter?.introTitle || 'Turn Picture into Fun AI Video';
  const subtitle = filter?.introSubtitle || 'Upload any photo and our AI transforms it into an amazing video';
  const icon = filter?.icon || '🎬';

  return `
    <div class="onboarding-screen">
      <div class="onboarding-content">
        <div class="onboarding-icon">${icon}</div>
        <h1 class="onboarding-title">${title}</h1>
        <p class="onboarding-subtitle">${subtitle}</p>
      </div>
      <div class="onboarding-footer">
        <button class="onboarding-cta" id="start-btn">Get Started</button>
      </div>
    </div>
  `;
}

export function init(callbacks: OnboardingCallbacks): void {
  console.log('[IntroScreen] init() called');

  const mobile = isMobileDevice();
  const standalone = isStandalone();
  console.log('[IntroScreen] mobile:', mobile, 'standalone:', standalone);

  // Delay AddToHomeScreen prompt to prevent blocking button interaction
  if (!standalone && mobile && window.AddToHomeScreen) {
    setTimeout(() => {
      console.log('[IntroScreen] Showing add-to-homescreen prompt (delayed)');
      window.AddToHomeScreenInstance = window.AddToHomeScreen({
        appName: 'AI Video',
        appIconUrl: '/apple-touch-icon.png',
        assetUrl: 'https://cdn.jsdelivr.net/gh/philfung/add-to-homescreen@3.5/dist/assets/img/',
        maxModalDisplayCount: 1
      });
      window.AddToHomeScreenInstance.show('en');
    }, 500);
  }

  const startBtn = document.getElementById('start-btn');
  console.log('[IntroScreen] Button found:', !!startBtn);

  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Haptic feedback
      haptic('light');
      
      console.log('[IntroScreen] Button clicked, navigating to upload');
      if (window.AddToHomeScreenInstance) {
        window.AddToHomeScreenInstance.hide();
      }
      callbacks.onNavigate('upload');
    });
  } else {
    console.error('[IntroScreen] ERROR: start-btn not found in DOM!');
  }
}
