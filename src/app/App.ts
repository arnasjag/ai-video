import { router, type Route } from './Router';
import { store } from './Store';
import { OnboardingFlow } from '../onboarding/OnboardingFlow';
import * as HomePage from '../pages/HomePage';
import * as FeedPage from '../pages/FeedPage';
import * as CreatePage from '../pages/CreatePage';
import * as FilterDetailPage from '../pages/FilterDetailPage';

export class App {
  private container: HTMLElement;
  private onboardingFlow: OnboardingFlow | null = null;
  private currentPage: string | null = null;
  private scrollPositions: Map<string, number> = new Map();

  constructor(container: HTMLElement) {
    console.log('[App] constructor called, container:', container);
    this.container = container;

    // Subscribe to route changes
    router.subscribe((route, isBack) => {
      console.log('[App] route change received:', route, 'isBack:', isBack);
      this.handleRoute(route, isBack);
    });

    // Check if first time user
    const state = store.getState();
    console.log('[App] store state:', state);

    if (!state.hasCompletedOnboarding) {
      console.log('[App] First time user, navigating to onboarding');
      router.navigate({ page: 'onboarding', step: 'intro' });
    } else {
      console.log('[App] User has completed onboarding, handling current route');
      // Handle current route
      this.handleRoute(router.getRoute(), false);
    }
  }

  private getRouteKey(route: Route): string {
    if (route.page === 'filter') return `filter-${route.filterId}`;
    if (route.page === 'onboarding') return `onboarding-${route.step}`;
    return route.page;
  }

  private saveScrollPosition(): void {
    if (this.currentPage) {
      const scrollable = document.querySelector('.page, .page-home') as HTMLElement;
      if (scrollable) {
        this.scrollPositions.set(this.currentPage, scrollable.scrollTop);
      }
    }
  }

  private restoreScrollPosition(pageKey: string): void {
    const savedPosition = this.scrollPositions.get(pageKey);
    if (savedPosition !== undefined) {
      requestAnimationFrame(() => {
        const scrollable = document.querySelector('.page, .page-home') as HTMLElement;
        if (scrollable) {
          scrollable.scrollTop = savedPosition;
        }
      });
    }
  }

  private handleRoute(route: Route, isBack: boolean): void {
    console.log('[App] handleRoute:', route.page);
    const routeKey = this.getRouteKey(route);

    // Save current scroll position before navigating
    this.saveScrollPosition();

    switch (route.page) {
      case 'onboarding':
        console.log('[App] rendering onboarding, step:', route.step);
        this.renderOnboarding(route.step);
        break;
      case 'home':
        this.renderPage(HomePage, routeKey, isBack);
        break;
      case 'feed':
        this.renderPage(FeedPage, routeKey, isBack);
        break;
      case 'create':
        this.renderPage(CreatePage, routeKey, isBack);
        break;
      case 'filter':
        this.renderFilterPage(route.filterId, routeKey, isBack);
        break;
      default:
        this.renderPage(HomePage, routeKey, isBack);
    }

    this.currentPage = routeKey;
  }

  private renderOnboarding(step: 'intro' | 'upload' | 'payment' | 'success'): void {
    console.log('[App] renderOnboarding:', step);
    if (!this.onboardingFlow) {
      console.log('[App] Creating new OnboardingFlow');
      this.onboardingFlow = new OnboardingFlow(this.container);
    }
    console.log('[App] Calling setStep:', step);
    this.onboardingFlow.setStep(step);
  }

  private renderPage(page: { render: () => string; init: () => void }, routeKey: string, isBack: boolean): void {
    this.onboardingFlow = null;
    this.container.innerHTML = page.render();
    page.init();

    // Only restore scroll position when going back
    if (isBack) {
      this.restoreScrollPosition(routeKey);
    }
  }

  private renderFilterPage(filterId: string, routeKey: string, isBack: boolean): void {
    this.onboardingFlow = null;
    this.container.innerHTML = FilterDetailPage.render(filterId);
    FilterDetailPage.init(filterId);

    if (isBack) {
      this.restoreScrollPosition(routeKey);
    }
  }
}
