import * as PIXI from 'pixi.js';
import { GameContext } from './core/GameContext';

class NebulaRunner {
  private readonly app: PIXI.Application;
  private readonly context: GameContext;
  constructor() {
    this.app = new PIXI.Application();
    this.context = new GameContext(this.app);
    this.init();
  }

  private async init() {
    await this.app.init({
      background: '#000015',
      width: 800,
      height: 600,
      antialias: true
    });
    document.body.appendChild(this.app.canvas);

    this.context.init();
  }
}

new NebulaRunner();