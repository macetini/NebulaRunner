#version 300 es
precision highp float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform float uTime;
uniform vec2 uResolution; // Sprite dimensions (width, height)
uniform vec3 uCoreColor;  // Hot White / Cyan Core
uniform vec3 uAuraColor;  // Hot Pink / Neon Violet Aura

float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    // 1. Safe normalized UV coordinates across sprite bounds
    vec2 uv = vTextureCoord;

    // Center horizontal position around 0.0 (-0.5 to +0.5)
    float x = uv.x - 0.5;

    // Continuous upward scrolling motion along beam axis
    float scrollTime = uTime * 10.0;

    // Multi-octave electric turbulence arc distortion
    float n1 = noise(vec2(uv.y * 15.0 - scrollTime, uTime * 2.5)) * 0.08;
    float n2 = noise(vec2(uv.y * 35.0 + scrollTime * 1.2, uTime * 4.0)) * 0.04;
    float distortedX = abs(x + n1 - n2);

    // 2. Core Beam (Intense central core)
    float coreWidth = 0.04;
    float core = smoothstep(coreWidth, 0.0, distortedX);

    // 3. Inner Pulsing Energy Tube
    float tubePulse = 0.85 + 0.15 * sin(uTime * 15.0 + uv.y * 20.0);
    float tube = exp(-distortedX * 18.0) * tubePulse;

    // 4. Outer Plasma Aura / Gas Dissipation
    float aura = exp(-distortedX * 6.0) * 0.5;

    // Edge fading (soft top and bottom terminations)
    float edgeFade = smoothstep(0.0, 0.03, uv.y) * smoothstep(1.0, 0.95, uv.y);

    // 5. Color Composition
    vec3 col = (uCoreColor * core * 2.0) + (uAuraColor * (tube + aura));
    float alpha = clamp(core * 1.5 + tube + aura, 0.0, 1.0) * edgeFade;

    // Proper WebGL Premultiplied Alpha Output
    finalColor = vec4(col * alpha, alpha);
}
