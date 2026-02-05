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
        <div class="intro-examples" style="display:flex;gap:12px;margin-top:24px;justify-content:center">
          <div style="text-align:center">
            <div style="font-size:48px">📷</div>
            <div style="font-size:12px;opacity:0.6">Your Photo</div>
          </div>
          <div style="font-size:32px;align-self:center">→</div>
          <div style="text-align:center">
            <div style="font-size:48px">🎥</div>
            <div style="font-size:12px;opacity:0.6">AI Video</div>
          </div>
        </div>
        <p style="opacity:0.5;font-size:13px;margin-top:16px">⏱ Takes about 1 minute</p>
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

  const startBtn = document.getElementById('start-btn');
  console.log('[IntroScreen] Button found:', !!startBtn);

  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Haptic feedback
      haptic('light');
      
      console.log('[IntroScreen] Button clicked, navigating to upload');
      callbacks.onNavigate('upload');
    });
  } else {
    console.error('[IntroScreen] ERROR: start-btn not found in DOM!');
  }
}
