import { router } from '../app/Router';
import { renderHeader, initHeader } from '../components/Header';
import { renderBottomNav, initBottomNav } from '../components/BottomNav';
import { renderChipFilters, initChipFilters, defaultChips } from '../components/ChipFilter';
import { renderFilterSection } from '../components/FilterSection';
import { initFilterCards } from '../components/FilterCard';
import { filterSections } from '../data/mockFilters';
import { showPaymentModal } from '../components/PaymentModal';
import { store } from '../app/Store';
import { initPullToRefresh } from '../components/PullToRefresh';

export function render(): string {
  const sections = filterSections.map(s => renderFilterSection(s)).join('');
  
  return `
    <div class="page page-home" id="home-page">
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
  const page = document.getElementById('home-page');
  const header = document.querySelector('.app-header');
  const statusBar = document.querySelector('.status-bar-bg');
  
  if (page) {
    // Scroll effect for header
    page.addEventListener('scroll', () => {
      const scrolled = page.scrollTop > 10;
      header?.classList.toggle('scrolled', scrolled);
      statusBar?.classList.toggle('scrolled', scrolled);
    }, { passive: true });
    
    // Pull to refresh
    initPullToRefresh({
      container: page,
      onRefresh: async () => {
        await new Promise(r => setTimeout(r, 1000));
        console.log('Refreshed');
      }
    });
  }

  initHeader({
    onUpgrade: () => {
      showPaymentModal({
        amount: '$9.99',
        onComplete: () => {
          store.addCredits(15);
          const container = document.getElementById('app');
          if (container) {
            container.innerHTML = render();
            init();
          }
        },
        onCancel: () => {}
      });
    },
    onProfile: () => {}
  });

  initChipFilters((chipId) => console.log('Chip:', chipId));
  initFilterCards((filterId) => router.navigate({ page: 'filter', filterId }));
  initBottomNav();
}
