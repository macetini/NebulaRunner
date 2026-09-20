import * as PIXI from 'pixi.js';
import type { GameConfig } from '../core/GameConfig';

const FILTER_VERTEX = `
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition() {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord() {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main() {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;

const FILTER_FRAGMENT = `
precision highp float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform float uTime;
uniform vec2 uOffset;            // Pre-calculated vertical movement
uniform vec2 uResolutionAspect;  // Pre-calculated (width/height, 1.0)

float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec3 renderStarLayer(vec2 uv, vec2 movement, float scale, float threshold, float glowSharpness) {
    vec2 st = uv * scale + movement;
    vec2 tileIndex = floor(st);
    vec2 tilePos = fract(st) - 0.5;
    float n = random(tileIndex);
    vec3 color = vec3(0.0);

    if (n > threshold) {
        float distSq = dot(tilePos, tilePos);
        float twinkle = sin(uTime * 3.5 + n * 62.8318) * 0.5 + 0.5;

        // Core star point (using squared distance for performance)
        float core = smoothstep(0.0036, 0.0, distSq);

        // Exponential glow falloff
        float glow = exp(-sqrt(distSq) * glowSharpness) * (0.3 + twinkle * 0.7);

        float starIntensity = core * 2.0 + glow * 0.7;
        float edgeMask = smoothstep(0.5, 0.1, max(abs(tilePos.x), abs(tilePos.y)));

        color = vec3(starIntensity * edgeMask);
    }

    return color;
}

void main() {
    vec2 uv = vTextureCoord * uResolutionAspect;

    vec3 spaceDark = vec3(0.02, 0.01, 0.05);

    // 3 Layers of depth-parallax stars
    vec3 stars = renderStarLayer(uv, uOffset * 0.35, 33.0, 0.93, 24.0); // Far, dense
    stars +=     renderStarLayer(uv, uOffset * 0.65, 20.0, 0.95, 18.0); // Mid-ground
    stars +=     renderStarLayer(uv, uOffset,        16.0, 0.97, 12.0); // Foreground, large

    finalColor = vec4(spaceDark + stars, 1.0);
}
`;

export class BackgroundView extends PIXI.Container {
    private readonly shaderFilter: PIXI.Filter;
    private readonly shaderSprite: PIXI.Sprite;
    private readonly backgroundSpeed: number;

    private nebulaTime = 0;

    constructor(app: PIXI.Application, config: GameConfig) {
        super();
        this.backgroundSpeed = config.backgroundSpeed;

        this.shaderFilter = new PIXI.Filter({
            glProgram: new PIXI.GlProgram({
                vertex: FILTER_VERTEX,
                fragment: FILTER_FRAGMENT,
            }),
            resources: {
                shaderUniforms: {
                    uTime: { value: 0, type: 'f32' },
                    uOffset: { value: [0, 0], type: 'vec2<f32>' },
                    uResolutionAspect: { value: [app.screen.width / app.screen.height, 1.0], type: 'vec2<f32>' },
                },
            },
        });

        this.shaderSprite = new PIXI.Sprite({
            texture: PIXI.Texture.WHITE,
            width: app.screen.width,
            height: app.screen.height,
        });

        this.shaderSprite.filters = [this.shaderFilter];
        this.addChild(this.shaderSprite);
    }

    public resize(width: number, height: number): void {
        this.shaderSprite.width = width;
        this.shaderSprite.height = height;

        const safeWidth = width || 1;
        const safeHeight = height || 1;

        const uniforms = this.shaderFilter.resources.shaderUniforms.uniforms;
        uniforms.uResolutionAspect = [safeWidth / safeHeight, 1.0];
    }

    public moveDown(delta: number): void {
        // Wrap nebulaTime at 1000 to maintain mediump float precision over long play sessions
        this.nebulaTime = (this.nebulaTime + (delta / 60) * (this.backgroundSpeed / 3)) % 1000;

        const width = this.shaderSprite.width || 1;
        const height = this.shaderSprite.height || 1;

        const aspectRatio = height / width;
        const portraitSpeedMultiplier = Math.max(1.0, Math.min(aspectRatio * 1.8, 3.0));

        const baseVerticalSpeed = this.nebulaTime * 0.45 * portraitSpeedMultiplier;

        const uniforms = this.shaderFilter.resources.shaderUniforms.uniforms;
        uniforms.uTime = this.nebulaTime;
        uniforms.uOffset = [0, baseVerticalSpeed];
    }
}
