import type { Screen, AppState, ScreenCallbacks } from './types';
import * as IntroScreen from './screens/IntroScreen';
import * as UploadScreen from './screens/UploadScreen';
import * as PaymentScreen from './screens/PaymentScreen';

export class App {
  private container: HTMLElement;
  private state: AppState = {
    currentScreen: 'intro',
    uploadedImage: null
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private getCallbacks(): ScreenCallbacks {
    return {
      onNavigate: (screen: Screen) => this.navigateTo(screen),
      onSetImage: (imageData: string) => this.setImage(imageData),
      getImage: () => this.state.uploadedImage
    };
  }

  private navigateTo(screen: Screen): void {
    this.state.currentScreen = screen;
    this.render();
  }

  private setImage(imageData: string): void {
    this.state.uploadedImage = imageData;
    this.render();
  }

  private render(): void {
    const { currentScreen, uploadedImage } = this.state;
    let html = '';

    switch (currentScreen) {
      case 'intro':
        html = IntroScreen.render();
        break;
      case 'upload':
        html = UploadScreen.render(uploadedImage);
        break;
      case 'payment':
        html = PaymentScreen.render(uploadedImage, false);
        break;
      case 'success':
        html = PaymentScreen.render(uploadedImage, true);
        break;
    }

    this.container.innerHTML = html;
    this.initScreen();
  }

  private initScreen(): void {
    const callbacks = this.getCallbacks();
    
    switch (this.state.currentScreen) {
      case 'intro':
        IntroScreen.init(callbacks);
        break;
      case 'upload':
        UploadScreen.init(callbacks);
        break;
      case 'payment':
        PaymentScreen.init(callbacks);
        break;
      case 'success':
        // No init needed for success state
        break;
    }
  }
}
