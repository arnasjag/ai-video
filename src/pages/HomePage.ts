import { router } from '../app/Router';
import { renderHeader, initHeader } from '../components/Header';
import { renderBottomNav, initBottomNav } from '../components/BottomNav';
import { renderChipFilters, initChipFilters, defaultChips } from '../components/ChipFilter';
import { renderFilterSection } from '../components/FilterSection';
import { initFilterCards } from '../components/FilterCard';
import { filterSections } from '../data/mockFilters';
import { showPaymentModal } from '../components/PaymentModal';
import { store } from '../app/Store';

export function render(): string {
  const sections = filterSections.map(s => renderFilterSection(s)).join('');
  
  return `
    <div class="page page-home">
      ${renderHeader({ onUpgrade: () => {}, onProfile: () => {} })}
      ${renderChipFilters(defaultChips, 'all')}
      <main class="home-content">
        ${sections}
      </main>
      ${renderBottomNav('home')}
    </div>
  `;
}

export function init(): void {
  initHeader({
    onUpgrade: () => {
      showPaymentModal({
        amount: '$9.99',
        onComplete: () => {
          store.addCredits(15);
          // Re-render to update credits
          const container = document.getElementById('app');
          if (container) {
            container.innerHTML = render();
            init();
          }
        },
        onCancel: () => {}
      });
    },
    onProfile: () => {
      // TODO: Profile page
    }
  });

  initChipFilters((chipId) => {
    // TODO: Filter content by category
    console.log('Selected chip:', chipId);
  });

  initFilterCards((filterId) => {
    router.navigate({ page: 'filter', filterId });
  });

  initBottomNav();
}
