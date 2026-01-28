// Screen types for onboarding
export type OnboardingStep = 'intro' | 'upload' | 'payment' | 'success';

export interface OnboardingState {
  currentStep: OnboardingStep;
  uploadedImage: string | null;
  filterId: string;
}

export interface OnboardingCallbacks {
  onNavigate: (step: OnboardingStep) => void;
  onSetImage: (imageData: string) => void;
  getImage: () => string | null;
  onComplete: () => void;
  onSetVideo?: (videoUrl: string) => void;
  getVideo?: () => string | null;
}

// Filter configuration
export type FilterCategory = 'trending' | 'new' | 'pandora' | 'viral' | 'winter' | 'popular';

export interface FilterConfig {
  id: string;
  name: string;
  icon: string;
  category: FilterCategory;
  previewImage: string;
  creatorName: string;
  likes: number;
  isNew?: boolean;
  isPremium?: boolean;
  aiEnabled?: boolean;  // If true, uses LTX-Video for real AI generation
  price: number;
  introTitle: string;
  introSubtitle: string;
}

export interface FilterSection {
  id: string;
  title: string;
  filters: FilterConfig[];
}

// PWA Install prompt event (Chrome/Android)
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
