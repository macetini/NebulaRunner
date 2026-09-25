import * as PIXI from 'pixi.js';
import { GameContext } from './core/game/GameContext';
import { BalanceLoader } from './data/BalanceLoader';
import './style.css';
import { LoadingScreen } from './ui/LoadingScreen';

class NebulaRunner {

  constructor() {
    const app: PIXI.Application = new PIXI.Application();
    const loadingScreen: LoadingScreen = new LoadingScreen();
    void this.init(app, loadingScreen);
  }

  private async init(app: PIXI.Application, loadingScreen: LoadingScreen): Promise<void> {
    try {
      loadingScreen.setMessage('LOADING');
      loadingScreen.setProgress(20);

      // Run WebGL renderer initialization and data loading concurrently
      const [, balanceData] = await Promise.all([
        app.init({
          background: '#000015',
          width: 450,
          height: 800,
        }),
        new BalanceLoader().loadAll(),
      ]);

      document.body.appendChild(app.canvas);

      loadingScreen.setMessage('GET READY');
      loadingScreen.setProgress(80);

      // Instantiate GameContext once app renderer is fully ready
      const context = new GameContext(app);
      context.init({ balance: balanceData });

      loadingScreen.setProgress(100);

      // Micro-delay for a smooth transition out of loading screen
      await new Promise((resolve) => setTimeout(resolve, 150));

      loadingScreen.hide();
    } catch (error) {
      console.error('Failed to start Nebula Runner:', error);
      loadingScreen.showError();
    }
  }
}

new NebulaRunner();
