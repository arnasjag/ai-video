import type { OnboardingStep, OnboardingCallbacks } from '../app/types';
import { router } from '../app/Router';
import { store } from '../app/Store';
import * as IntroScreen from './screens/IntroScreen';
import * as UploadScreen from './screens/UploadScreen';
import * as PaymentScreen from './screens/PaymentScreen';

export class OnboardingFlow {
  private container: HTMLElement;
  private currentStep: OnboardingStep = 'intro';
  private uploadedImage: string | null = null;
  private filterId: string | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.filterId = sessionStorage.getItem('currentFilterId');
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
      case 'payment':
        html = PaymentScreen.render(this.uploadedImage, false);
        break;
      case 'success':
        html = PaymentScreen.render(this.uploadedImage, true);
        break;
    }

    this.container.innerHTML = html;
    this.initCurrentScreen(callbacks);
  }

  private initCurrentScreen(callbacks: OnboardingCallbacks): void {
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
    }
  }
}
