import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

const ThreeScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const AMBIENT_INTENSITY = 0.656; // Adjust based on your student ID

  // Shared vertex shader for letters
  const letterVertexShader = `
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
  `;

  // Plastic-like fragment shader for letter T
  const alphabetFragmentShader = `
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
        
        // Specular (Plastic-like)
        vec3 viewDir = normalize(vViewPosition - vPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
        vec3 specular = vec3(0.5) * spec;
        
        vec3 result = ambient + diffuse + specular;
        gl_FragColor = vec4(result, 1.0);
    }
  `;

  // Metallic fragment shader for number 9
  const digitFragmentShader = `
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
        vec3 specular = baseColor * spec;
        
        vec3 result = ambient + diffuse + specular;
        gl_FragColor = vec4(result, 1.0);
    }
  `;

  // Cube shaders
  const cubeVertexShader = `
    varying vec3 vNormal;
    
    void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const cubeFragmentShader = `
    uniform vec3 color;
    uniform float time;
    varying vec3 vNormal;

    void main() {
        float intensity = 0.8 + 0.2 * sin(time * 2.0);
        vec3 glowColor = color * intensity;
        gl_FragColor = vec4(glowColor, 1.0);
    }
  `;

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create cube (light source)
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const cubeMaterial = new THREE.ShaderMaterial({
      vertexShader: cubeVertexShader,
      fragmentShader: cubeFragmentShader,
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        time: { value: 0.0 }
      }
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add(cube);

    camera.position.z = 5;

    // Declare materials at higher scope
    let alphabetMaterial: THREE.ShaderMaterial;
    let digitMaterial: THREE.ShaderMaterial;

    // Load font and create text meshes
    const loader = new FontLoader();
    loader.load(
      '/fonts/helvetiker_regular.typeface.json',
      (font) => {
        // Create 'T' with plastic-like shader
        const alphabetGeometry = new TextGeometry('T', {
          font,
          size: 1,
          height: 0.2,
        });
        
        alphabetMaterial = new THREE.ShaderMaterial({
          vertexShader: letterVertexShader,
          fragmentShader: alphabetFragmentShader,
          uniforms: {
            baseColor: { value: new THREE.Color(0x00FFFF) },
            lightPosition: { value: new THREE.Vector3(0, 0, 0) },
            ambientIntensity: { value: AMBIENT_INTENSITY },
            viewPosition: { value: camera.position }
          }
        });
        const alphabetMesh = new THREE.Mesh(alphabetGeometry, alphabetMaterial);
        alphabetMesh.position.set(-2, 0, 0);
        scene.add(alphabetMesh);

        // Create '9' with metallic shader
        const digitGeometry = new TextGeometry('9', {
          font,
          size: 1,
          height: 0.2,
        });

        digitMaterial = new THREE.ShaderMaterial({
          vertexShader: letterVertexShader,
          fragmentShader: digitFragmentShader,
          uniforms: {
            baseColor: { value: new THREE.Color(0xfdfbd4) },
            lightPosition: { value: new THREE.Vector3(0, 0, 0) },
            ambientIntensity: { value: AMBIENT_INTENSITY },
            viewPosition: { value: camera.position }
          }
        });
        const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
        digitMesh.position.set(2, 0, 0);
        scene.add(digitMesh);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = performance.now() * 0.001;
      cubeMaterial.uniforms.time.value = time;

      // Update light position uniforms
      if (alphabetMaterial && digitMaterial) {
        const lightPos = cube.position.clone();
        alphabetMaterial.uniforms.lightPosition.value.copy(lightPos);
        digitMaterial.uniforms.lightPosition.value.copy(lightPos);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Controls
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          cube.position.y += 0.1;
          break;
        case 's':
          cube.position.y -= 0.1;
          break;
        case 'a':
          camera.position.x -= 0.1;
          break;
        case 'd':
          camera.position.x += 0.1;
          break;
      }
    };  

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default ThreeScene; 