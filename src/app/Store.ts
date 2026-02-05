import type { GeneratedVideo } from './types';

const STORAGE_KEY = 'ai-video-app-store';

export interface StoreState {
  credits: number;
  hasCompletedOnboarding: boolean;
  unlockedFilters: string[];
  generatedVideos: GeneratedVideo[];
}

const defaultState: StoreState = {
  credits: 0,
  hasCompletedOnboarding: false,
  unlockedFilters: [],
  generatedVideos: []
};

class Store {
  private state: StoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.load();
  }

  private load(): StoreState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load store:', e);
    }
    return { ...defaultState };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save store:', e);
    }
  }

  getState(): StoreState {
    return this.state;
  }

  getGeneratedVideos(): GeneratedVideo[] {
    return this.state.generatedVideos;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  // Actions
  completeOnboarding(): void {
    this.state.hasCompletedOnboarding = true;
    this.save();
    this.notify();
  }

  addCredits(amount: number): void {
    this.state.credits += amount;
    this.save();
    this.notify();
  }

  useCredit(): boolean {
    if (this.state.credits > 0) {
      this.state.credits -= 1;
      this.save();
      this.notify();
      return true;
    }
    return false;
  }

  unlockFilter(filterId: string): void {
    if (!this.state.unlockedFilters.includes(filterId)) {
      this.state.unlockedFilters.push(filterId);
      this.save();
      this.notify();
    }
  }

  isFilterUnlocked(filterId: string): boolean {
    return this.state.unlockedFilters.includes(filterId);
  }

  addGeneratedVideo(video: GeneratedVideo): void {
    this.state.generatedVideos.push(video);
    this.save();
    this.notify();
  }

  // For testing
  reset(): void {
    this.state = { ...defaultState };
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }
}

export const store = new Store();
