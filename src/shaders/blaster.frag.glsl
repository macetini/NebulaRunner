#version 300 es
precision mediump float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform vec2 uSize;
uniform float uTime;

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

void main(void) {
    vec2 p = vTextureCoord - 0.5;
    float aspect = uSize.x / max(uSize.y, 0.0001); // guard div-by-zero

    // Keep the fast-growing, high-frequency phase terms in highp so sin()
    // doesn't lose precision (and start jittering) after minutes of runtime.
    highp float t = uTime;

    // 1. X-Wiggle
    float pinch = smoothstep(0.5, 0.2, abs(p.y));
    float wiggle = sin(p.y * 15.0 - t * 40.0) * 0.12 * pinch;
    p.x += wiggle;

    // 2. Capsule distance field (unchanged — this math is correct)
    float halfLength = max(0.5 - (0.5 * aspect), 0.0);
    float dy = max(abs(p.y) - halfLength, 0.0);
    float dist = length(vec2(p.x, dy / aspect));

    // 3. Traveling energy nodes
    highp float nodePhase = p.y * 25.0 - t * 50.0;
    float nodes = smoothstep(0.3, 0.9, sin(nodePhase));

    // Optional: per-pulse random intensity so nodes don't feel metronomic
    float cycle = floor(nodePhase / 6.28318);
    float jitter = hash(cycle) * 0.6 + 0.7; // ~0.7–1.3x per pulse
    nodes *= jitter;

    // 4. Thickness variation
    float coreRadius = 0.05 + (nodes * 0.15);
    float glowRadius = 0.25 + (nodes * 0.2);

    // Antialiasing width from actual screen-space derivatives instead of a
    // fixed UV constant — keeps edges clean at any render size, including 5px.
    float aa = max(fwidth(dist), 1e-4);
    float core = 1.0 - smoothstep(coreRadius - aa, coreRadius + aa, dist);
    float glow = 1.0 - smoothstep(glowRadius - aa * 2.0, glowRadius + aa * 2.0, dist);

    // 5. Green Color Palette
    // Core shifts from a pale lime green in the gaps to pure blinding white at the nodes
    vec3 coreColor = mix(vec3(0.4, 1.0, 0.4), vec3(1.0, 1.0, 1.0), nodes);
    // Outer glow is a pure, intense neon green
    vec3 glowColor = vec3(0.0, 0.9, 0.1);

    vec3 col = mix(glowColor * glow, coreColor, core);
    float alpha = clamp(glow + core, 0.0, 1.0);

    finalColor = vec4(col, alpha);
}
