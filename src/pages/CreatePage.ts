import { router } from '../app/Router';
import { renderBottomNav, initBottomNav } from '../components/BottomNav';

export function render(): string {
  return `
    <div class="page page-create">
      <header class="simple-header">
        <button class="back-btn" id="back-btn">←</button>
        <h1>Create</h1>
        <div class="header-spacer"></div>
      </header>
      <main class="page-content centered">
        <div class="placeholder">
          <span class="placeholder-icon">🎨</span>
          <p class="placeholder-text">Create something amazing</p>
          <p class="placeholder-subtext">Choose a filter from the home screen to get started</p>
          <button class="button-primary" id="browse-btn">Browse Filters</button>
        </div>
      </main>
      ${renderBottomNav('create')}
    </div>
  `;
}

export function init(): void {
  initBottomNav();
  document.getElementById('back-btn')?.addEventListener('click', () => router.back());
  document.getElementById('browse-btn')?.addEventListener('click', () => router.navigate({ page: 'home' }));
}
