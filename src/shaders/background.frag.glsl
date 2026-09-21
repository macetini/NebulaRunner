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
    stars += renderStarLayer(uv, uOffset * 0.65, 20.0, 0.95, 18.0); // Mid-ground
    stars += renderStarLayer(uv, uOffset, 16.0, 0.97, 12.0); // Foreground, Large

    finalColor = vec4(spaceDark + stars, 1.0);
}
