#version 300 es
precision highp float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform float uTime;
uniform vec2 uOffset;            // Pre-calculated vertical movement
uniform vec2 uResolutionAspect;  // Pre-calculated (width/height, 1.0)
uniform vec2 uResolution;        // Render target size in pixels
uniform float uMovementSpeed;     // Player movement speed multiplier
uniform float uStarAppearDistance;
uniform float uStarLeaveDistance;
uniform float uStarTravelDistance;
uniform float uStarTransformDistance;

// Palette: Deep Space Dark, Electric Cyan, Hot Pink, Pure Glowing White, Gold/Violet
const vec3 spaceDark = vec3(0.02f, 0.01f, 0.05f);
const vec3 hotPink   = vec3(0.95f, 0.00f, 0.55f);
const vec3 neonCyan  = vec3(0.00f, 0.70f, 0.85f);
float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898f, 78.233f))) * 43758.5453123f);
}

vec3 renderStarLayer(vec2 uv, vec2 movement, float scale, float threshold, float glowSharpness) {
    vec2 st = uv * scale + movement;
    vec2 tileIndex = floor(st);
    vec2 tilePos = fract(st) - 0.5f;
    float n = random(tileIndex);
    vec3 color = vec3(0.0f);

    if(n > threshold) {
        float distSq = dot(tilePos, tilePos);
        float twinkle = sin(uTime * 3.5f + n * 62.8318f) * 0.5f + 0.5f;

        // Core star point (using squared distance for performance)
        float core = smoothstep(0.0036f, 0.0f, distSq);

        // Exponential glow falloff
        float glow = exp(-sqrt(distSq) * glowSharpness) * (0.3f + twinkle * 0.7f);

        float starIntensity = core * 2.0f + glow * 0.7f;
        float edgeMask = smoothstep(0.5f, 0.1f, max(abs(tilePos.x), abs(tilePos.y)));

        color = vec3(starIntensity * edgeMask);
    }

    return color;
}

// Soft, distinct background energy sparks (previews the main star without looking like interactive pickups)
vec3 renderPulsarPreviews(vec2 starUV, vec2 vScroll, float distanceTraveled) {
    // Lower threshold so they show up earlier during testing
    float distanceThreshold = 2.0f;
    if (distanceTraveled < distanceThreshold) {
        return vec3(0.0f);
    }

    // Grid scale for distribution
    vec2 st = starUV * 2.0f + vScroll * 0.35f;
    vec2 tileIndex = floor(st);
    vec2 tilePos   = fract(st) - 0.5f;

    float n = random(tileIndex + 42.17f);
    vec3 result = vec3(0.0f);

    // Spawn chance (25% of grid cells)
    if (n > 0.75f) {
        vec2 starOffset = vec2(random(tileIndex + 3.1f) - 0.5f, random(tileIndex + 4.2f) - 0.5f) * 0.4f;
        vec2 localUV = tilePos - starOffset;

        float distSq = dot(localUV, localUV);
        float dist = sqrt(distSq);
        float localTime = uTime * 2.5f + n * 31.4f;

        // Small, crisp core point (so it reads as a star, not a blob)
        float core = smoothstep(0.001f, 0.0f, distSq);

        // Soft aura glow surrounding the star
        float pulse = 0.5f + 0.5f * sin(localTime * 3.0f);
        float softGlow = exp(-dist * 22.0f) * (0.4f + pulse * 0.3f);

        vec3 colCore = vec3(1.0f, 1.0f, 1.0f);
        vec3 colGlow = mix(neonCyan, hotPink, pulse);

        // Blended background energy
        vec3 miniStarCol = colCore * core * 1.5f + colGlow * softGlow * 0.7f;

        float fadeIn = smoothstep(distanceThreshold, distanceThreshold + 5.0f, distanceTraveled);
        result = miniStarCol * fadeIn;
    }

    return result;
}

// 1. Initial central circular pulsating star with rays and rings
vec3 renderFirstCenterStar(vec2 starUV, float time) {
    float dist = length(starUV);
    float coreRadius = 0.08f + 0.02f * sin(time * 1.5f);
    float core = smoothstep(coreRadius, 0.0f, dist);

    float angle = atan(starUV.y, starUV.x);
    float rays = 0.5f + 0.5f * sin(angle * 6.0f + time);
    float starShape = smoothstep(0.3f * (0.8f + 0.2f * rays), 0.0f, dist);

    float ringWave = sin(dist * 20.0f - time * 3.0f);
    float ringMask = smoothstep(0.45f, 0.0f, dist) * smoothstep(0.05f, 0.15f, dist);
    float rings = max(0.0f, ringWave) * ringMask;

    vec3 colCore = vec3(1.0f, 1.0f, 1.0f);
    vec3 colRays = hotPink;
    vec3 colRings = neonCyan;

    vec3 col = colCore * core + colRays * starShape * 0.7f + colRings * rings * 0.7f;

    col += hotPink * (0.02f / (dist + 0.01f)) * (0.5f + 0.5f * sin(time));
    return col;
}

// 2. Second geometric/crystal star with flare rays and box core
vec3 renderSecondCenterStar(vec2 starUV, float time) {
    float dist = length(starUV);

    float rotAngle = time * 0.5f;
    float c = cos(rotAngle), s = sin(rotAngle);
    mat2 rot = mat2(c, -s, s, c);
    vec2 rUV = rot * starUV;

    float flare = 0.015f / (abs(rUV.x * rUV.y) + 0.002f);
    flare *= smoothstep(0.5f, 0.0f, dist);

    float boxDist = max(abs(rUV.x), abs(rUV.y));
    float boxCore = smoothstep(0.15f + 0.04f * cos(time * 2.0f), 0.0f, boxDist);

    float energyWave = sin(dist * 30.0f + time * 5.0f);
    float energyMask = smoothstep(0.3f, 0.0f, dist);
    float energyRings = max(0.0f, energyWave) * energyMask;

    vec3 colCore = vec3(1.0f, 0.9f, 0.4f);
    vec3 colFlare = vec3(0.6f, 0.1f, 0.9f);
    vec3 colRings = vec3(1.0f, 0.4f, 0.1f);

    vec3 col = colCore * boxCore * 2.0f + colFlare * flare * 0.8f + colRings * energyRings * 0.6f;

    col += vec3(0.6f, 0.1f, 0.9f) * (0.03f / (dist + 0.01f));
    return col;
}

void main() {
    // 1. Center normalized UVs first, then correct horizontal distance for aspect ratio.
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 centerUV = uv - vec2(0.5f);
    centerUV.x *= uResolutionAspect.x;

    // 2. Parallax background starfield layers
    vec2 starUV = vec2(uv.x * uResolutionAspect.x, uv.y);
    vec2 speedOffset = uOffset;

    vec3 stars =    renderStarLayer(starUV, speedOffset * 0.35f, 33.0f, 0.93f, 24.0f); // Far, dense
    stars +=        renderStarLayer(starUV, speedOffset * 0.65f, 20.0f, 0.95f, 18.0f); // Mid-ground
    stars +=        renderStarLayer(starUV, speedOffset,         16.0f, 0.97f, 12.0f); // Foreground, Large

    // Crisp proto-star previews scattered in the background before full arrival
    //vec3 miniPulsars = renderPulsarPreviews(starUV, speedOffset, uOffset.y);

    // 3. Star enters from above, transforms at center, then exits downward.
    float time = uTime * 2.0f;
    float starTransformEnd = uStarLeaveDistance + uStarTransformDistance;
    float starArrival = smoothstep(
        uStarAppearDistance,
        uStarAppearDistance + uStarTravelDistance,
        uOffset.y
    );
    float starTransform = smoothstep(
        uStarLeaveDistance,
        starTransformEnd,
        uOffset.y
    );
    float starDeparture = smoothstep(
        starTransformEnd,
        starTransformEnd + uStarTravelDistance,
        uOffset.y
    );
    float starVisible = step(uStarAppearDistance, uOffset.y)
        * (1.0f - step(starTransformEnd + uStarTravelDistance, uOffset.y));

    vec2 star1UV = centerUV;
    star1UV.y -= (1.0f - starArrival);
    vec2 star2UV = centerUV;
    star2UV.y += starDeparture * 1.2f;

    vec3 star1 = renderFirstCenterStar(star1UV, time) * (1.0f - starTransform);
    vec3 star2 = renderSecondCenterStar(star2UV, time) * starTransform;
    vec3 fullStar = (star1 + star2) * starVisible;

    // 4. Final blending
    finalColor = vec4(spaceDark + stars/* + miniPulsars*/ + fullStar, 1.0f);
}
