import * as PIXI from 'pixi.js';

// We define our asset links here
export const ASSET_MANIFEST = {
    background: 'https://pixijs.com/assets/p2.jpeg',
    ship: 'https://pixijs.com/assets/bunny.png',
    bullet: 'https://pixijs.com/assets/rt_light.png'
};

export async function initAssets() {
    // This loads everything in the manifest at once
    await PIXI.Assets.load(Object.values(ASSET_MANIFEST));
}