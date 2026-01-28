import type { OnboardingStep, OnboardingCallbacks } from '../app/types';
import { router } from '../app/Router';
import { store } from '../app/Store';
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
