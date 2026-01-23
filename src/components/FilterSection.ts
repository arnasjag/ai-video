import type { FilterSection } from '../app/types';
import { renderFilterCard } from './FilterCard';

export function renderFilterSection(section: FilterSection): string {
  const cards = section.filters.map(f => renderFilterCard(f)).join('');
  
  return `
    <section class="filter-section">
      <div class="section-header">
        <h2 class="section-title">${section.title}</h2>
        <button class="section-all-btn" data-section="${section.id}">
          All <span class="arrow">›</span>
        </button>
      </div>
      <div class="section-scroll">
        ${cards}
      </div>
    </section>
  `;
}
