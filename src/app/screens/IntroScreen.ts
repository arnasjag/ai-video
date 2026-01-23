import type { ScreenCallbacks, BeforeInstallPromptEvent } from '../types';

let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
});

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (navigator as any).standalone === true;
}

function canShare(): boolean {
  return typeof navigator.share === 'function';
}

export function render(): string {
  const installed = isStandalone();
  const showInstall = !installed && (isIOS() || deferredPrompt);
  
  return `
    <div class="screen">
      <div class="screen-content">
        <div class="screen-icon">🎬</div>
        <h1 class="title-large">Turn Picture into Fun AI Video</h1>
        <p class="body-text">Upload any photo and our AI transforms it into an amazing video</p>
      </div>
      <div class="screen-footer">
        ${showInstall && isIOS() ? `
          <button class="button-primary" id="install-btn">Add to Home Screen</button>
          <button class="button-secondary" id="skip-btn">Continue in browser</button>
        ` : `
          <button class="button-primary" id="start-btn">Get Started</button>
        `}
      </div>
    </div>
  `;
}

export function init(callbacks: ScreenCallbacks): void {
  const startBtn = document.getElementById('start-btn');
  const installBtn = document.getElementById('install-btn');
  const skipBtn = document.getElementById('skip-btn');

  startBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
    callbacks.onNavigate('upload');
  });

  installBtn?.addEventListener('click', async () => {
    if (canShare()) {
      try {
        // Opens iOS share sheet - user can tap Add to Home Screen
        await navigator.share({
          title: 'AI Video',
          text: 'Turn pictures into fun AI videos',
          url: window.location.href
        });
      } catch (e) {
        // User cancelled or share failed - that's ok
      }
    }
    // Continue regardless
    callbacks.onNavigate('upload');
  });

  skipBtn?.addEventListener('click', () => {
    callbacks.onNavigate('upload');
  });
}
