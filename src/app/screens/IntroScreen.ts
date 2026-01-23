import type { ScreenCallbacks, BeforeInstallPromptEvent } from '../types';

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Capture install prompt event
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

export function render(): string {
  const isInstalled = isStandalone();
  
  return `
    <div class="screen">
      <div class="screen-content">
        <div class="screen-icon">🎬</div>
        <h1 class="title-large">Turn Picture into Fun AI Video</h1>
        <p class="body-text">Upload any photo and our AI transforms it into an amazing video</p>
      </div>
      <div class="screen-footer">
        ${isInstalled ? `
          <button class="button-primary" id="continue-btn">Continue</button>
        ` : `
          <button class="button-primary" id="install-btn">Install App</button>
          <button class="button-secondary" id="skip-btn">Continue without installing</button>
        `}
      </div>
    </div>
  `;
}

function showIOSInstallOverlay(onClose: () => void): void {
  const overlay = document.createElement('div');
  overlay.className = 'ios-install-overlay';
  overlay.innerHTML = `
    <div class="ios-install-card">
      <div class="ios-install-title">Install this App</div>
      <div class="ios-install-steps">
        <div class="ios-install-step">
          <span class="ios-install-step-icon">⎙</span>
          <span>Tap the Share button below</span>
        </div>
        <div class="ios-install-step">
          <span class="ios-install-step-icon">➕</span>
          <span>Tap "Add to Home Screen"</span>
        </div>
      </div>
      <button class="button-primary" id="ios-got-it">Got it</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  overlay.querySelector('#ios-got-it')?.addEventListener('click', () => {
    overlay.remove();
    onClose();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      onClose();
    }
  });
}

export function init(callbacks: ScreenCallbacks): void {
  const installBtn = document.getElementById('install-btn');
  const skipBtn = document.getElementById('skip-btn');
  const continueBtn = document.getElementById('continue-btn');

  installBtn?.addEventListener('click', async () => {
    if (isIOS()) {
      showIOSInstallOverlay(() => {
        callbacks.onNavigate('upload');
      });
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      callbacks.onNavigate('upload');
    } else {
      // No install prompt available, just continue
      callbacks.onNavigate('upload');
    }
  });

  skipBtn?.addEventListener('click', () => {
    callbacks.onNavigate('upload');
  });

  continueBtn?.addEventListener('click', () => {
    callbacks.onNavigate('upload');
  });
}
