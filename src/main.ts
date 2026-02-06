import * as PIXI from 'pixi.js';

class NebulaRunner {
  
  private app: PIXI.Application;
  
  private starfield!: PIXI.TilingSprite;
  
  private player!: PIXI.Sprite;

  private keys: Record<string, boolean> = {};

  // Bullet Management
  private bulletTexture!: PIXI.Texture;
  private bulletPool: PIXI.Sprite[] = [];
  private activeBullets: PIXI.Sprite[] = [];

  constructor() {
    this.app = new PIXI.Application();
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

    this.createTextures();
    this.createBackground();
    this.createPlayer();
    this.setupInput();

    this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
  }

  private createTextures() {
    // Generate Bullet Texture Programmatically
    const g = new PIXI.Graphics()
      .rect(0, 0, 12, 3)
      .fill(0xFFEE00);
    this.bulletTexture = this.app.renderer.generateTexture(g);
  }

  private createBackground() {
    // Create a 256x256 star pattern procedurally
    const g = new PIXI.Graphics();
    g.rect(0, 0, 256, 256).fill(0x000015);
    // Draw 20 random stars
    for (let i = 0; i < 20; i++) {
      g.circle(Math.random() * 256, Math.random() * 256, Math.random() * 1.5).fill(0xFFFFFF);
    }

    const texture = this.app.renderer.generateTexture(g);
    this.starfield = new PIXI.TilingSprite({
      texture,
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    this.app.stage.addChild(this.starfield);
  }

  private createPlayer() {
    // Draw a sleek ship shape
    const g = new PIXI.Graphics()
      .poly([25, 0, -15, -15, -5, 0, -15, 15])
      .fill(0x00FFFF)
      .stroke({ width: 2, color: 0xFFFFFF });

    const texture = this.app.renderer.generateTexture(g);
    this.player = new PIXI.Sprite(texture);
    this.player.anchor.set(0.5);
    this.player.x = 100;
    this.player.y = this.app.screen.height / 2;
    this.app.stage.addChild(this.player);
  }

  private setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') this.fire();
    });
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);
  }

  private fire() {
    // Object Pooling Logic: Reuse a sprite from the pool if available
    let bullet = this.bulletPool.find(b => !b.visible);

    if (!bullet) {
      bullet = new PIXI.Sprite(this.bulletTexture);
      bullet.anchor.set(0.5);
      this.bulletPool.push(bullet);
      this.app.stage.addChild(bullet);
    }

    bullet.x = this.player.x + 20;
    bullet.y = this.player.y;
    bullet.visible = true;
    this.activeBullets.push(bullet);
  }

  private update(delta: number) {
    // Scroll Stars
    this.starfield.tilePosition.x -= 2 * delta;

    // Player movement
    const speed = 6 * delta;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) {
      if (this.player.y - this.player.height / 2 >= 5) {
        this.player.y -= speed;
      }
    } else if (this.keys['ArrowDown'] || this.keys['KeyS']) {
      if (this.player.y + this.player.height / 2 <= this.app.screen.height - 5) {
        this.player.y += speed;
      }
    }

    // Update Bullets
    for (let i = this.activeBullets.length - 1; i >= 0; i--) {
      const b = this.activeBullets[i];
      b.x += 12 * delta;

      // Recycling logic
      if (b.x > this.app.screen.width + 20) {
        b.visible = false; // "Return" to pool
        this.activeBullets.splice(i, 1);
      }
    }
  }
}

new NebulaRunner();