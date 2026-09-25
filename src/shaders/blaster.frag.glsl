#version 300 es
precision highp float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform vec2 uSize;       // Dimensions in pixels
uniform float uTime;      // Elapsed time in seconds
uniform float uBeamWidth; // Scalable beam thickness (e.g. 0.0025)
uniform float uBeamLength;// Scalable beam length (e.g. 0.15)

// Improved Hash (Dave Hoskins)
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// Value Noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// 3-octave FBM
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    v += noise(p) * a; p = p * 2.02 + vec2(17.1, 9.2); a *= 0.5;
    v += noise(p) * a; p = p * 2.03 + vec2(11.7, 21.3); a *= 0.5;
    v += noise(p) * a;
    return v;
}

float segmentDistance(vec2 p, float halfLen) {
    float dy = max(abs(p.y) - halfLen, 0.0);
    return length(vec2(p.x, dy));
}

void main(void) {
    vec2 fragCoord = vTextureCoord * uSize;
    vec2 p = (fragCoord - 0.5 * uSize) / uSize.y;
    float t = uTime;

    float beamHalfLength = uBeamLength;
    float baseBeamWidth = uBeamWidth;

    // Beam Taper
    float taper = smoothstep(beamHalfLength + 0.05, 0.0, abs(p.y));
    float beamWidth = baseBeamWidth * (0.2 + 0.8 * taper);

    // Turbulence
    float flow = fbm(vec2(p.y * 5.0 - t * 1.8, t * 0.35));
    float detail = fbm(vec2(p.x * 65.0 + 3.7, p.y * 24.0 - t * 7.0));
    float fineDetail = noise(vec2(p.x * 180.0, p.y * 55.0 - t * 13.0));

    // Warp beam center
    float centerWarp = (flow - 0.5) * 0.018 + (detail - 0.5) * 0.006;
    float x = p.x - centerWarp;

    float dist = segmentDistance(vec2(x, p.y), beamHalfLength);
    float edgeNoise = (detail - 0.5) * 0.0017 + (fineDetail - 0.5) * 0.0007;
    float disturbedDist = dist + edgeNoise;

    // Intensity
    float flickerNoise = fbm(vec2(p.y * 18.0 - t * 5.5, t * 1.4));
    float flicker = 0.78 + flickerNoise * 0.42;
    float pulse = 0.9 + 0.1 * sin(p.y * 75.0 - t * 11.0) + 0.05 * sin(p.y * 135.0 + t * 17.0);
    float energy = flicker * pulse;

    // Layers
    float core = 1.0 - smoothstep(0.0, beamWidth * 0.50, dist);
    float inner = 1.0 - smoothstep(0.0, beamWidth * (1.7 + detail * 0.7), disturbedDist);
    float body = 1.0 - smoothstep(0.0, beamWidth * 3.5, disturbedDist);

    // Optical Lens Bloom
    float opticalFlare = 0.0001 / (dist * dist + 0.00005) * energy;

    // Glows
    float glow = exp(-dist * 105.0) * (0.65 + 0.45 * detail);
    float ambient = exp(-dist * 28.0) * 0.28;

    float endDist = length(vec2(x, abs(p.y) - beamHalfLength));
    float endGlow = exp(-max(endDist, 0.0) * 135.0);

    // Shockwave
    float shock = 0.5 + 0.5 * sin(p.y * 95.0 - t * 22.0 + detail * 4.0);
    float shockMask = exp(-dist * 65.0) * shock;

    // Chromatic Aberration
    float aberration = (detail - 0.5) * 0.0022;
    float distR = segmentDistance(vec2(x + aberration, p.y), beamHalfLength);
    float distB = segmentDistance(vec2(x - aberration, p.y), beamHalfLength);
    float coreR = 1.0 - smoothstep(0.0, beamWidth * 0.65, distR);
    float coreB = 1.0 - smoothstep(0.0, beamWidth * 0.65, distB);

    // Colors
    vec3 cWhite = vec3(1.00, 0.80, 0.38);
    vec3 cAmber = vec3(1.00, 0.40, 0.015);
    vec3 cRed   = vec3(0.85, 0.06, 0.005);
    vec3 cPurple = vec3(0.20, 0.02, 0.30);

    vec3 col = vec3(0.0);
    col.r += coreR * 2.8;
    col.g += core   * 3.6;
    col.b += coreB * 1.7;

    col += cWhite * inner * 1.8 * energy;
    col += cAmber * body * 2.0 * energy;
    col += cWhite * opticalFlare;
    col += cRed * glow * 2.4;
    col += mix(cRed, cPurple, clamp(dist * 15.0, 0.0, 1.0)) * ambient;
    col += cAmber * shockMask * 0.45;
    col += cWhite * endGlow * 0.55;

    // HDR Compression
    col = 1.0 - exp(-col);

    finalColor = vec4(col, 1.0);
}
