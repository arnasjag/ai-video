import { renderBottomNav, initBottomNav } from '../components/BottomNav';

export function render(): string {
  return `
    <div class="page page-feed">
      <header class="simple-header">
        <h1>Feed</h1>
      </header>
      <main class="page-content centered">
        <div class="placeholder">
          <span class="placeholder-icon">📋</span>
          <p class="placeholder-text">Your feed is empty</p>
          <p class="placeholder-subtext">Follow creators to see their content here</p>
        </div>
      </main>
      ${renderBottomNav('feed')}
    </div>
  `;
}

export function init(): void {
  initBottomNav();
}
