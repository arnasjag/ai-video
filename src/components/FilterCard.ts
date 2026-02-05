import type { FilterConfig } from '../app/types';

function formatLikes(likes: number): string {
  if (likes >= 1000) {
    return `${Math.floor(likes / 1000)}K`;
  }
  return String(likes);
}

export function renderFilterCard(filter: FilterConfig): string {
  return `
    <div class="filter-card" data-filter-id="${filter.id}">
      <div class="filter-card-image-wrap">
        <img 
          src="${filter.previewImage}" 
          alt="${filter.name}" 
          class="filter-card-image"
          loading="lazy"
          decoding="async"
        />
        ${filter.isPremium ? '<span class="filter-badge premium">👑</span>' : ''}
        ${filter.isNew ? '<span class="filter-badge new">New</span>' : ''}
        <button class="filter-bookmark">🔖</button>
      </div>
      <div class="filter-card-info">
        <span class="filter-card-name">${filter.creatorName}</span>
        <span class="filter-card-likes">♡ ${formatLikes(filter.likes)}</span>
      </div>
    </div>
  `;
}

export function initFilterCards(onClick: (filterId: string) => void): void {
  document.querySelectorAll('.filter-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Ignore if clicking bookmark
      if ((e.target as HTMLElement).closest('.filter-bookmark')) return;
      const filterId = card.getAttribute('data-filter-id');
      if (filterId) onClick(filterId);
    });
  });
}
