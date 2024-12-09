uniform vec3 baseColor;
uniform vec3 lightPosition;
uniform float ambientIntensity;
uniform vec3 viewPosition;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

void main() {
    // Ambient
    vec3 ambient = baseColor * ambientIntensity;
    
    // Diffuse
    vec3 lightDir = normalize(lightPosition - vPosition);
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 diffuse = diff * baseColor;
    
    // Specular (Metallic)
    vec3 viewDir = normalize(vViewPosition - vPosition);
    vec3 reflectDir = reflect(-lightDir, vNormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
    vec3 specular = baseColor * spec; // Colored specular for metal
    
    vec3 result = ambient + diffuse + specular;
    gl_FragColor = vec4(result, 1.0);
} 