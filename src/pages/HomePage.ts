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

function renderSkeletonSection(): string {
  const cards = Array.from({ length: 3 }, () =>
    '<div class="skeleton skeleton-card"></div>'
  ).join('');
  return `
    <div class="skeleton-section">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton-row">${cards}</div>
    </div>
  `;
}

export function render(): string {
  // Render skeleton first, replace with real content on init
  const skeletons = Array.from({ length: 3 }, () => renderSkeletonSection()).join('');
  
  return `
    <div class="page page-home" id="home-page">
      ${renderHeader({ onUpgrade: () => {}, onProfile: () => {} })}
      ${renderChipFilters(defaultChips, 'all')}
      <main class="home-content" id="home-content">
        ${skeletons}
      </main>
      ${renderBottomNav('home')}
    </div>
  `;
}

export function init(): void {
  const page = document.getElementById('home-page');
  const header = document.querySelector('.app-header');
  const statusBar = document.querySelector('.status-bar-bg');
  
  // Replace skeletons with real content
  requestAnimationFrame(() => {
    const content = document.getElementById('home-content');
    if (content) {
      content.innerHTML = filterSections.map(s => renderFilterSection(s)).join('');
      initFilterCards((filterId) => router.navigate({ page: 'filter', filterId }));
    }
  });

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
  initBottomNav();
}
