// Screen types for onboarding - NEW FLOW
export type OnboardingStep = 
  | 'intro' 
  | 'upload' 
  | 'fakeProcessing'  // Fake loading animation (no API call)
  | 'preview'         // Blurred image teaser
  | 'payment' 
  | 'processing'      // Real API call to fal.ai
  | 'result';

export interface OnboardingState {
  currentStep: OnboardingStep;
  uploadedImage: string | null;
  filterId: string;
  generatedVideo: string | null;
  videoId: string | null;
}

export interface OnboardingCallbacks {
  onNavigate: (step: OnboardingStep) => void;
  onSetImage: (imageData: string) => void;
  getImage: () => string | null;
  onComplete: () => void;
  onSetVideo?: (videoUrl: string, videoId: string) => void;
  getVideo?: () => string | null;
}

// Video generation
export type VideoModel = 'ltx-2' | 'veo3' | 'wan-25' | 'kling';

export interface VideoGenerationOptions {
  model?: VideoModel;
  prompt?: string;
  duration?: number;
  resolution?: string;
  signal?: AbortSignal;
}

export interface VideoResult {
  videoUrl: string;
  videoId: string;
  model: string;
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
  aiEnabled?: boolean;
  price: number;
  introTitle: string;
  introSubtitle: string;
  // Video generation settings
  videoPrompt?: string;
  videoModel?: VideoModel;
  videoDuration?: number;
  videoResolution?: string;
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
