import { App } from './app/App';
import { store } from './app/Store';
import './style.css';

console.log('[main.ts] Script loaded');

// Check for reset parameter - ALWAYS reset onboarding for testing
function checkResetParam(): void {
  const params = new URLSearchParams(window.location.search);
  if (params.has('reset')) {
    console.log('[main.ts] Reset param detected, clearing store...');
    store.reset();
    // Remove param from URL without reload
    const url = new URL(window.location.href);
    url.searchParams.delete('reset');
    window.history.replaceState({}, '', url.toString());
  }
}

// Clear caches when accessing via Tailscale (development mode)
async function clearCachesIfDev(): Promise<void> {
  const isTailscale = window.location.hostname.includes('tail');
  
  if (isTailscale) {
    console.log('[Dev] Tailscale detected, clearing caches...');
    
    // Clear all caches
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('[Dev] Cleared all caches');
      } catch (e) {
        console.warn('[Dev] Failed to clear caches:', e);
      }
    }
    
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
        if (registrations.length > 0) {
          console.log('[Dev] Unregistered service workers');
        }
      } catch (e) {
        console.warn('[Dev] Failed to unregister service workers:', e);
      }
    }
  }
}

// Request persistent storage to prevent data eviction
async function requestPersistentStorage(): Promise<void> {
  if (navigator.storage?.persist) {
    const isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      const granted = await navigator.storage.persist();
      console.log(`Persistent storage: ${granted ? 'granted' : 'denied'}`);
    }
  }
}

// Initialize app
async function initApp(): Promise<void> {
  // Check reset param first
  checkResetParam();
  
  // Clear caches if in dev mode
  await clearCachesIfDev();
  
  const container = document.querySelector<HTMLElement>('#app');
  console.log('[main.ts] #app container:', container);

  if (container) {
    console.log('[main.ts] Creating App instance');
    new App(container);

    // Request persistent storage after app loads (only in production)
    const isTailscale = window.location.hostname.includes('tail');
    if (!isTailscale) {
      requestPersistentStorage();
    }
  } else {
    console.error('[main.ts] ERROR: #app container not found!');
  }
}

// Expose reset for console testing
(window as any).resetOnboarding = () => {
  store.reset();
  window.location.reload();
};

// Start the app
initApp();
