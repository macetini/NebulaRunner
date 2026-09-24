import * as PIXI from 'pixi.js';
import { GameContext } from './core/game/GameContext';
import { LoadingScreen } from './ui/LoadingScreen';
import './style.css';

class NebulaRunner {
  private readonly app: PIXI.Application;
  private readonly context: GameContext;
  private readonly loadingScreen: LoadingScreen;

  constructor() {
    this.app = new PIXI.Application();
    this.context = new GameContext(this.app);
    this.loadingScreen = new LoadingScreen();
    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.loadingScreen.setMessage('RENDERING');
      this.loadingScreen.setProgress(20);

      await this.app.init({
        background: '#000015',
        width: 450,
        height: 800,
        antialias: true
      });
      document.body.appendChild(this.app.canvas);

      this.loadingScreen.setMessage('INITIALIZING');
      this.loadingScreen.setProgress(75);
      this.context.init();

      this.loadingScreen.setMessage('LOADING');

      this.loadingScreen.setProgress(100);
      this.loadingScreen.hide();
    } catch (error) {
      console.error('Failed to start Nebula Runner', error);
      this.loadingScreen.showError();
    }
  }
}

new NebulaRunner();
