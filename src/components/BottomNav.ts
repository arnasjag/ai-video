import { router } from '../app/Router';

export type TabId = 'home' | 'create' | 'feed';

export function renderBottomNav(activeTab: TabId): string {
  return `
    <nav class="bottom-nav">
      <button class="nav-item ${activeTab === 'home' ? 'active' : ''}" data-tab="home">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </button>
      <button class="nav-item nav-item-create" data-tab="create">
        <span class="nav-icon-create">➕</span>
      </button>
      <button class="nav-item ${activeTab === 'feed' ? 'active' : ''}" data-tab="feed">
        <span class="nav-icon">📋</span>
        <span class="nav-label">Feed</span>
      </button>
    </nav>
  `;
}

export function initBottomNav(): void {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.getAttribute('data-tab') as TabId;
      if (tab === 'home') {
        router.navigate({ page: 'home' });
      } else if (tab === 'create') {
        router.navigate({ page: 'create' });
      } else if (tab === 'feed') {
        router.navigate({ page: 'feed' });
      }
    });
  });
}
