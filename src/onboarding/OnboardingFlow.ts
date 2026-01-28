import type { OnboardingStep, OnboardingCallbacks } from '../app/types';
import { router } from '../app/Router';
import { store } from '../app/Store';
import * as IntroScreen from './screens/IntroScreen';
import * as UploadScreen from './screens/UploadScreen';
import * as PaymentScreen from './screens/PaymentScreen';
import * as GeneratingScreen from './screens/GeneratingScreen';
import * as ResultScreen from './screens/ResultScreen';

export class OnboardingFlow {
  private container: HTMLElement;
  private currentStep: OnboardingStep = 'intro';
  private uploadedImage: string | null = null;
  private generatedVideo: string | null = null;
  private videoId: string | null = null;
  private filterId: string | null = null;

  constructor(container: HTMLElement) {
    console.log('[OnboardingFlow] constructor called, container:', container);
    this.container = container;
    this.filterId = sessionStorage.getItem('currentFilterId');
  }

  setStep(step: OnboardingStep): void {
    console.log('[OnboardingFlow] setStep:', step);
    this.currentStep = step;
    this.render();
  }

  private getCallbacks(): OnboardingCallbacks {
    return {
      onNavigate: (step: OnboardingStep) => {
        console.log('[OnboardingFlow] onNavigate called with step:', step);
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
    console.log('[OnboardingFlow] render() called, currentStep:', this.currentStep);
    let html = '';
    const callbacks = this.getCallbacks();

    switch (this.currentStep) {
      case 'intro':
        html = IntroScreen.render(this.filterId || undefined);
        break;
      case 'upload':
        html = UploadScreen.render(this.uploadedImage);
        break;
      case 'payment':
        html = PaymentScreen.render(this.uploadedImage, false);
        break;
      case 'success':
        html = PaymentScreen.render(this.uploadedImage, true);
        break;
      case 'generating':
        html = GeneratingScreen.render();
        break;
      case 'result':
        html = ResultScreen.render(this.generatedVideo);
        break;
    }

    console.log('[OnboardingFlow] Setting innerHTML, length:', html.length);
    this.container.innerHTML = html;
    console.log('[OnboardingFlow] innerHTML set, calling initCurrentScreen');
    this.initCurrentScreen(callbacks);
  }

  private initCurrentScreen(callbacks: OnboardingCallbacks): void {
    console.log('[OnboardingFlow] initCurrentScreen:', this.currentStep);
    switch (this.currentStep) {
      case 'intro':
        IntroScreen.init(callbacks);
        break;
      case 'upload':
        UploadScreen.init(callbacks);
        break;
      case 'payment':
      case 'success':
        PaymentScreen.init(callbacks);
        break;
      case 'generating':
        GeneratingScreen.init(callbacks);
        break;
      case 'result':
        ResultScreen.init(callbacks, this.generatedVideo);
        break;
    }
  }
}
