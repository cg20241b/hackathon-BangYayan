varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vPosition = worldPosition.xyz;
    vViewPosition = cameraPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}