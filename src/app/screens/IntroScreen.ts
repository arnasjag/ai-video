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

export function render(): string {
  const installed = isStandalone();
  const showIOSHint = isIOS() && !installed;
  
  return `
    <div class="screen">
      <div class="screen-content">
        <div class="screen-icon">🎬</div>
        <h1 class="title-large">Turn Picture into Fun AI Video</h1>
        <p class="body-text">Upload any photo and our AI transforms it into an amazing video</p>
      </div>
      <div class="screen-footer">
        <button class="button-primary" id="start-btn">Get Started</button>
        ${showIOSHint ? `
          <p class="ios-hint">Tip: Tap <span class="share-icon">⎙</span> then "Add to Home Screen" for the best experience</p>
        ` : ''}
      </div>
    </div>
  `;
}

export function init(callbacks: ScreenCallbacks): void {
  const startBtn = document.getElementById('start-btn');

  startBtn?.addEventListener('click', async () => {
    // On Android/Chrome, prompt install then continue
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
    callbacks.onNavigate('upload');
  });
}
