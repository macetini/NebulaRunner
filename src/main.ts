import * as PIXI from 'pixi.js';
import { ASSET_MANIFEST, initAssets } from './assets';

class NebulaRunner {
  private app: PIXI.Application;
  private starfield!: PIXI.TilingSprite;
  private player!: PIXI.Sprite;
  private keys: Record<string, boolean> = {};

  constructor() {
    this.app = new PIXI.Application();
    this.init();
  }

  private async init() {
    // 1. Initialize Pixi v8
    await this.app.init({
      background: '#000022',
      resizeTo: window,
      antialias: true
    });
    document.body.appendChild(this.app.canvas);

    // 2. Load Assets
    await initAssets();

    // 3. Setup Scene
    this.createBackground();
    this.createPlayer();
    this.setupInput();

    // 4. Game Loop
    this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
  }

  private createBackground() {
    const texture = PIXI.Assets.get(ASSET_MANIFEST.background);
    this.starfield = new PIXI.TilingSprite({
      texture,
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    this.app.stage.addChild(this.starfield);
  }

  private createPlayer() {
    const texture = PIXI.Assets.get(ASSET_MANIFEST.ship);
    this.player = new PIXI.Sprite(texture);
    this.player.anchor.set(0.5);
    this.player.x = 100;
    this.player.y = this.app.screen.height / 2;
    this.app.stage.addChild(this.player);
  }

  private setupInput() {
    window.addEventListener('keydown', (e) => this.keys[e.code] = true);
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);
  }

  private update(delta: number) {
    // Parallax scroll
    this.starfield.tilePosition.x -= 2 * delta;

    // Player Movement
    const speed = 5 * delta;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) this.player.y -= speed;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) this.player.y += speed;

    // Simple screen bounds
    if (this.player.y < 50) this.player.y = 50;
    if (this.player.y > this.app.screen.height - 50) this.player.y = this.app.screen.height - 50;
  }
}

new NebulaRunner();