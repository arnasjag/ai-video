import { router } from '../app/Router';
import { getFilterById } from '../data/mockFilters';

export function render(filterId: string): string {
  const filter = getFilterById(filterId);
  
  if (!filter) {
    return `
      <div class="page page-filter">
        <header class="simple-header">
          <button class="back-btn" id="back-btn">←</button>
          <h1>Not Found</h1>
          <div class="header-spacer"></div>
        </header>
        <main class="page-content centered">
          <p>Filter not found</p>
        </main>
      </div>
    `;
  }

  return `
    <div class="page page-filter">
      <div class="filter-hero">
        <img src="${filter.previewImage}" alt="${filter.name}" class="filter-hero-image" loading="lazy" decoding="async" />
        <button class="back-btn floating" id="back-btn">←</button>
      </div>
      <div class="filter-detail-content">
        <div class="filter-detail-header">
          <div class="filter-detail-info">
            <h1 class="filter-detail-title">${filter.name}</h1>
            <p class="filter-detail-creator">by ${filter.creatorName}</p>
          </div>
          <div class="filter-detail-stats">
            <span class="filter-detail-likes">♡ ${filter.likes.toLocaleString()}</span>
          </div>
        </div>
        <p class="filter-detail-desc">${filter.introSubtitle}</p>
        <div class="filter-detail-actions">
          <button class="button-primary" id="try-btn">
            Try Now - $${filter.price.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  `;
}

export function init(filterId: string): void {
  document.getElementById('back-btn')?.addEventListener('click', () => router.back());
  document.getElementById('try-btn')?.addEventListener('click', () => {
    router.navigate({ page: 'onboarding', step: 'intro' });
    // Store current filter for onboarding
    sessionStorage.setItem('currentFilterId', filterId);
  });
}
