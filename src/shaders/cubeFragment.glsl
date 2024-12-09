uniform vec3 color;
uniform float time;
varying vec3 vNormal;

void main() {
    // Create pulsing light effect
    float intensity = 0.8 + 0.2 * sin(time * 2.0);
    vec3 glowColor = color * intensity;
    gl_FragColor = vec4(glowColor, 1.0);
} 