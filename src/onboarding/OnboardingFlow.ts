import type { OnboardingStep, OnboardingCallbacks } from '../app/types';
import { router } from '../app/Router';
import { store } from '../app/Store';
import { videoService } from '../services';
import * as IntroScreen from './screens/IntroScreen';
import * as UploadScreen from './screens/UploadScreen';
import * as FakeProcessingScreen from './screens/FakeProcessingScreen';
import * as PreviewScreen from './screens/PreviewScreen';
import * as PaymentScreen from './screens/PaymentScreen';
import * as ProcessingScreen from './screens/ProcessingScreen';
import * as ResultScreen from './screens/ResultScreen';

export class OnboardingFlow {
  private container: HTMLElement;
  private currentStep: OnboardingStep = 'intro';
  private uploadedImage: string | null = null;
  private generatedVideo: string | null = null;
  private videoId: string | null = null;
  private filterId: string | null = null;
  private backendAvailable: boolean = true;

  constructor(container: HTMLElement) {
    this.container = container;
    this.filterId = sessionStorage.getItem('currentFilterId');
    this.checkBackend();
  }

  private async checkBackend(): Promise<void> {
    this.backendAvailable = await videoService.checkHealth();
    if (!this.backendAvailable && this.currentStep === 'intro') {
      this.showBackendWarning();
    }
  }

  private showBackendWarning(): void {
    const existing = this.container.querySelector('.backend-warning');
    if (existing) return;
    const warning = document.createElement('div');
    warning.className = 'backend-warning';
    warning.style.cssText = 'background:#ff9800;color:#000;padding:8px 16px;text-align:center;font-size:13px;position:fixed;top:0;left:0;right:0;z-index:100';
    warning.textContent = '⚠ Video generation temporarily unavailable';
    this.container.prepend(warning);

    // Disable CTA button
    const cta = this.container.querySelector('.onboarding-cta') as HTMLButtonElement | null;
    if (cta) {
      cta.disabled = true;
      cta.style.opacity = '0.5';
    }
  }

  setStep(step: OnboardingStep): void {
    this.currentStep = step;
    this.render();
  }

  private getCallbacks(): OnboardingCallbacks {
    return {
      onNavigate: (step: OnboardingStep) => {
        router.navigate({ page: 'onboarding', step });
      },
      onSetImage: (imageData: string) => {
        this.uploadedImage = imageData;
        this.render();
      },
      getImage: () => this.uploadedImage,
      onSetVideo: (videoUrl: string, videoId: string) => {
        this.generatedVideo = videoUrl;
        this.videoId = videoId;
      },
      getVideo: () => this.generatedVideo,
      getVideoId: () => this.videoId,
      onComplete: () => {
        store.completeOnboarding();
        if (this.filterId) {
          store.unlockFilter(this.filterId);
        }
        sessionStorage.removeItem('currentFilterId');
        router.navigate({ page: 'home' });
      }
    };
  }

  render(): void {
    let html = '';
    const callbacks = this.getCallbacks();

    switch (this.currentStep) {
      case 'intro':
        html = IntroScreen.render(this.filterId || undefined);
        break;
      case 'upload':
        html = UploadScreen.render(this.uploadedImage);
        break;
      case 'fakeProcessing':
        html = FakeProcessingScreen.render();
        break;
      case 'preview':
        html = PreviewScreen.render(this.uploadedImage);
        break;
      case 'payment':
        html = PaymentScreen.render();
        break;
      case 'processing':
        html = ProcessingScreen.render();
        break;
      case 'result':
        html = ResultScreen.render(this.generatedVideo);
        break;
    }

    this.container.innerHTML = html;
    this.initCurrentScreen(callbacks);

    // Show warning if backend is down
    if (!this.backendAvailable && this.currentStep === 'intro') {
      this.showBackendWarning();
    }
  }

  private initCurrentScreen(callbacks: OnboardingCallbacks): void {
    switch (this.currentStep) {
      case 'intro':
        IntroScreen.init(callbacks);
        break;
      case 'upload':
        UploadScreen.init(callbacks);
        break;
      case 'fakeProcessing':
        FakeProcessingScreen.init(callbacks);
        break;
      case 'preview':
        PreviewScreen.init(callbacks);
        break;
      case 'payment':
        PaymentScreen.init(callbacks);
        break;
      case 'processing':
        ProcessingScreen.init(callbacks);
        break;
      case 'result':
        ResultScreen.init(callbacks, this.generatedVideo);
        break;
    }
  }
}
