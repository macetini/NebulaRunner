import * as PIXI from 'pixi.js';
import { GameContext } from './core/game/GameContext';
import { BalanceLoader } from './data/BalanceLoader';
import { LoadingScreen } from './ui/LoadingScreen';
import './style.css';

class NebulaRunner {
  private readonly app: PIXI.Application;
  private readonly loadingScreen: LoadingScreen;

  constructor() {
    this.app = new PIXI.Application();
    this.loadingScreen = new LoadingScreen();
    void this.init();
  }

  private async init(): Promise<void> {
    try {
      this.loadingScreen.setMessage('INITIALIZING');
      this.loadingScreen.setProgress(20);

      const balanceLoader = new BalanceLoader();

      // Run WebGL renderer initialization and data loading concurrently
      const [, balanceData] = await Promise.all([
        this.app.init({
          background: '#000015',
          width: 450,
          height: 800,
          antialias: true,
          autoDensity: false,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
        }),
        balanceLoader.loadAll(),
      ]);

      document.body.appendChild(this.app.canvas);

      this.loadingScreen.setMessage('BOOTSTRAPPING SYSTEMS...');
      this.loadingScreen.setProgress(80);

      // Instantiate GameContext once app renderer is fully ready
      const context = new GameContext(this.app);
      context.init({ balance: balanceData });

      this.loadingScreen.setProgress(100);

      // Micro-delay for a smooth transition out of loading screen
      await new Promise((resolve) => setTimeout(resolve, 150));

      this.loadingScreen.hide();
    } catch (error) {
      console.error('Failed to start Nebula Runner:', error);
      this.loadingScreen.showError();
    }
  }
}

new NebulaRunner();
