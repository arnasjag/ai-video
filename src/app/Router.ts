export type Route =
  | { page: 'onboarding'; step: 'intro' | 'upload' | 'payment' | 'success' }
  | { page: 'home' }
  | { page: 'filter'; filterId: string }
  | { page: 'create' }
  | { page: 'feed' };

type RouteChangeListener = (route: Route) => void;

class Router {
  private listeners: Set<RouteChangeListener> = new Set();
  private currentRoute: Route = { page: 'home' };

  constructor() {
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.handleHashChange();
  }

  private parseHash(): Route {
    const hash = window.location.hash.slice(1) || '/home';
    const parts = hash.split('/').filter(Boolean);

    if (parts[0] === 'onboarding') {
      const step = parts[1] as 'intro' | 'upload' | 'payment' | 'success';
      return { page: 'onboarding', step: step || 'intro' };
    }
    if (parts[0] === 'filter' && parts[1]) {
      return { page: 'filter', filterId: parts[1] };
    }
    if (parts[0] === 'create') {
      return { page: 'create' };
    }
    if (parts[0] === 'feed') {
      return { page: 'feed' };
    }
    return { page: 'home' };
  }

  private handleHashChange(): void {
    this.currentRoute = this.parseHash();
    this.listeners.forEach(l => l(this.currentRoute));
  }

  getRoute(): Route {
    return this.currentRoute;
  }

  subscribe(listener: RouteChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  navigate(route: Route): void {
    let hash = '#/';
    if (route.page === 'onboarding') {
      hash = `#/onboarding/${route.step}`;
    } else if (route.page === 'filter') {
      hash = `#/filter/${route.filterId}`;
    } else {
      hash = `#/${route.page}`;
    }
    window.location.hash = hash;
  }

  back(): void {
    window.history.back();
  }
}

export const router = new Router();
