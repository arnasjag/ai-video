import { App } from './app/App';
import './style.css';

const container = document.querySelector<HTMLElement>('#app');
if (container) {
  new App(container);
}
