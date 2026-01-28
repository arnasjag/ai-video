export type Route =
  | { page: 'onboarding'; step: 'intro' | 'upload' | 'payment' | 'success' }
  | { page: 'home' }
  | { page: 'filter'; filterId: string }
  | { page: 'create' }
  | { page: 'feed' };

type RouteChangeListener = (route: Route, isBack: boolean) => void;

class Router {
  private listeners: Set<RouteChangeListener> = new Set();
  private currentRoute: Route = { page: 'home' };
  private isBackNavigation: boolean = false;
  

  constructor() {
    
    window.addEventListener('popstate', () => {
      // popstate fires on back/forward - check if we went back
      
      this.isBackNavigation = true;  // popstate typically means back
      this.handleRouteChange();
    });
    
    // Handle initial route
    this.handleRouteChange();
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

  private handleRouteChange(): void {
    const newRoute = this.parseHash();
    const isBack = this.isBackNavigation;
    
    // Set transition class based on direction
    document.documentElement.classList.remove('nav-forward', 'nav-back');
    document.documentElement.classList.add(isBack ? 'nav-back' : 'nav-forward');
    
    // Use View Transitions API only for back navigation (slide)
    // Forward navigation should be instant/fade
    if (document.startViewTransition && isBack) {
      document.startViewTransition(() => {
        this.currentRoute = newRoute;
        this.notifyListeners(isBack);
      });
    } else {
      this.currentRoute = newRoute;
      this.notifyListeners(isBack);
    }
    
    // Reset back navigation flag
    this.isBackNavigation = false;
  }

  private notifyListeners(isBack: boolean): void {
    this.listeners.forEach(l => l(this.currentRoute, isBack));
  }

  getRoute(): Route {
    return this.currentRoute;
  }

  subscribe(listener: RouteChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  navigate(route: Route): void {
    this.isBackNavigation = false;
    let hash = '#/';
    if (route.page === 'onboarding') {
      hash = `#/onboarding/${route.step}`;
    } else if (route.page === 'filter') {
      hash = `#/filter/${route.filterId}`;
    } else {
      hash = `#/${route.page}`;
    }
    window.location.hash = hash;
    this.handleRouteChange();
  }

  back(): void {
    this.isBackNavigation = true;
    window.history.back();
  }
}

export const router = new Router();
