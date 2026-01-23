import { store } from '../app/Store';

export interface HeaderCallbacks {
  onUpgrade: () => void;
  onProfile: () => void;
}

export function renderHeader(_callbacks: HeaderCallbacks): string {
  const { credits } = store.getState();
  
  return `
    <header class="app-header">
      <div class="header-left">
        <span class="app-title">🎬 AI Video</span>
      </div>
      <div class="header-right">
        <button class="credits-badge" id="upgrade-btn">
          <span class="credits-icon">💳</span>
          <span class="credits-count">${credits}</span>
          <span class="credits-divider">|</span>
          <span class="credits-upgrade">Upgrade</span>
        </button>
        <button class="profile-btn" id="profile-btn">
          <span class="profile-icon">👤</span>
        </button>
      </div>
    </header>
  `;
}

export function initHeader(callbacks: HeaderCallbacks): void {
  document.getElementById('upgrade-btn')?.addEventListener('click', callbacks.onUpgrade);
  document.getElementById('profile-btn')?.addEventListener('click', callbacks.onProfile);
}
