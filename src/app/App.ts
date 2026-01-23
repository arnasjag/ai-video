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

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Subscribe to route changes
    router.subscribe((route) => this.handleRoute(route));
    
    // Check if first time user
    const state = store.getState();
    if (!state.hasCompletedOnboarding) {
      router.navigate({ page: 'onboarding', step: 'intro' });
    } else {
      // Handle current route or go home
      this.handleRoute(router.getRoute());
    }
  }

  private handleRoute(route: Route): void {
    switch (route.page) {
      case 'onboarding':
        this.renderOnboarding(route.step);
        break;
      case 'home':
        this.renderPage(HomePage);
        break;
      case 'feed':
        this.renderPage(FeedPage);
        break;
      case 'create':
        this.renderPage(CreatePage);
        break;
      case 'filter':
        this.renderFilterPage(route.filterId);
        break;
      default:
        this.renderPage(HomePage);
    }
  }

  private renderOnboarding(step: 'intro' | 'upload' | 'payment' | 'success'): void {
    if (!this.onboardingFlow) {
      this.onboardingFlow = new OnboardingFlow(this.container);
    }
    this.onboardingFlow.setStep(step);
  }

  private renderPage(page: { render: () => string; init: () => void }): void {
    this.onboardingFlow = null;
    this.container.innerHTML = page.render();
    page.init();
  }

  private renderFilterPage(filterId: string): void {
    this.onboardingFlow = null;
    this.container.innerHTML = FilterDetailPage.render(filterId);
    FilterDetailPage.init(filterId);
  }
}
