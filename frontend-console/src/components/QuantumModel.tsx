import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function makeOrbit(radius: number, tilt: [number, number, number], color: number, opacity: number) {
  const geometry = new THREE.TorusGeometry(radius, 0.008, 6, 180);
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
  const orbit = new THREE.Mesh(geometry, material);
  orbit.scale.set(1, 0.47, 1);
  orbit.rotation.set(...tilt);
  return orbit;
}

function buildModel(scene: THREE.Scene) {
  const rig = new THREE.Group();
  scene.add(rig);

  const lime = new THREE.MeshStandardMaterial({ color: 0xc9f849, emissive: 0x688d12, emissiveIntensity: 0.45, roughness: 0.3, metalness: 0.42 });
  const softLime = new THREE.MeshStandardMaterial({ color: 0x9fbf48, emissive: 0x294012, emissiveIntensity: 0.35, roughness: 0.42, metalness: 0.5 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x222722, metalness: 0.86, roughness: 0.26 });
  const faceMaterial = new THREE.MeshStandardMaterial({ color: 0x111510, metalness: 0.45, roughness: 0.38, emissive: 0x0b1308, emissiveIntensity: 0.28 });
  const wireMaterial = new THREE.MeshBasicMaterial({ color: 0xbaf23d, transparent: true, opacity: 0.3, wireframe: true });

  // The central payment-security module: a faceted glass-like core wrapped in a machined shell.
  const core = new THREE.Mesh(new RoundedBoxGeometry(1.12, 1.12, 0.5, 5, 0.12), darkMetal);
  core.rotation.set(-0.1, 0.12, -0.04);
  rig.add(core);

  const face = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.86, 0.055, 4, 0.09), faceMaterial);
  face.position.set(0, 0, 0.279);
  face.rotation.copy(core.rotation);
  rig.add(face);

  const faceFrame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.82, 0.82, 0.05)), new THREE.LineBasicMaterial({ color: 0x7e9d39, transparent: true, opacity: 0.52 }));
  faceFrame.position.set(0, 0, 0.316);
  faceFrame.rotation.copy(core.rotation);
  rig.add(faceFrame);

  const innerCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), new THREE.MeshStandardMaterial({ color: 0x96c836, emissive: 0x668d1a, emissiveIntensity: 0.6, metalness: 0.7, roughness: 0.23, wireframe: true }));
  innerCore.position.set(0, 0.035, 0.42);
  rig.add(innerCore);

  const nucleus = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 2), new THREE.MeshPhysicalMaterial({ color: 0xd8ff79, emissive: 0x607d1f, emissiveIntensity: 0.65, metalness: 0.2, roughness: 0.19, transmission: 0.12, thickness: 0.4 }));
  nucleus.position.set(0, 0.035, 0.42);
  rig.add(nucleus);

  const frontLine = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.018, 0.012), lime);
  frontLine.position.set(0, -0.29, 0.342);
  rig.add(frontLine);
  const signalLine = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.012, 0.012), softLime);
  signalLine.position.set(-0.13, -0.34, 0.342);
  rig.add(signalLine);

  const aperture = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.018, 10, 48), lime);
  aperture.position.set(0, 0, 0.483);
  aperture.scale.set(1, 1, 0.28);
  rig.add(aperture);

  const shellCorners = new THREE.Group();
  for (const [x, y] of [[-0.61, -0.61], [0.61, -0.61], [0.61, 0.61], [-0.61, 0.61]]) {
    const corner = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.045), softLime);
    corner.position.set(x, y, 0.27);
    corner.rotation.z = Math.atan2(y, x) + Math.PI / 2;
    shellCorners.add(corner);
  }
  rig.add(shellCorners);

  // Three orbital paths represent keys, transactions and model review.
  const orbitGroup = new THREE.Group();
  orbitGroup.add(makeOrbit(1.24, [0.7, 0.1, -0.32], 0xd4ff55, 0.57));
  orbitGroup.add(makeOrbit(1.55, [1.05, -0.46, 0.68], 0xc0e855, 0.34));
  orbitGroup.add(makeOrbit(1.86, [0.32, 0.94, 0.18], 0x788d49, 0.27));
  rig.add(orbitGroup);

  const nodePositions = [
    new THREE.Vector3(1.25, 0.31, 0.15),
    new THREE.Vector3(-1.22, -0.44, 0.06),
    new THREE.Vector3(0.06, 1.2, -0.22),
    new THREE.Vector3(-0.18, -1.52, 0.15),
    new THREE.Vector3(1.62, -0.75, -0.04),
    new THREE.Vector3(-1.52, 0.94, -0.17),
  ];
  const nodeMaterial = new THREE.MeshStandardMaterial({ color: 0xd6ff5d, emissive: 0x91bd25, emissiveIntensity: 1.3, metalness: 0.1, roughness: 0.25 });
  const nodes: THREE.Mesh[] = [];
  for (const [index, position] of nodePositions.entries()) {
    const node = new THREE.Mesh(new THREE.SphereGeometry(index % 2 === 0 ? 0.045 : 0.031, 18, 14), nodeMaterial);
    node.position.copy(position);
    nodes.push(node);
    rig.add(node);
  }

  const connections = [
    [nodePositions[0], nodePositions[2], new THREE.Vector3(0.6, 1.03, 0.18)],
    [nodePositions[2], nodePositions[5], new THREE.Vector3(-0.85, 0.48, -0.02)],
    [nodePositions[5], nodePositions[1], new THREE.Vector3(-1.5, 0.05, 0.11)],
    [nodePositions[1], nodePositions[3], new THREE.Vector3(-0.58, -1.07, 0.21)],
    [nodePositions[3], nodePositions[4], new THREE.Vector3(0.82, -1.12, -0.16)],
    [nodePositions[4], nodePositions[0], new THREE.Vector3(1.47, -0.02, 0.09)],
  ];
  for (const [from, to, bend] of connections) {
    const curve = new THREE.QuadraticBezierCurve3(from, bend, to);
    const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.006, 5, false), new THREE.MeshBasicMaterial({ color: 0x9fbe4d, transparent: true, opacity: 0.34 }));
    rig.add(line);
  }

  // An outer wireframe polyhedron adds a quiet quantum-lattice silhouette.
  const lattice = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), wireMaterial);
  lattice.rotation.set(0.12, 0.24, -0.1);
  rig.add(lattice);

  // A few machined pins make the object read as a payment security instrument.
  for (const [x, y, z, rotation] of [[-0.28, 0.73, 0.06, 0.1], [0.28, 0.73, 0.06, -0.1], [-0.28, -0.73, 0.06, -0.1], [0.28, -0.73, 0.06, 0.1]]) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.19, 10), darkMetal);
    pin.position.set(x, y, z);
    pin.rotation.z = rotation;
    rig.add(pin);
  }

  const ground = new THREE.Mesh(new THREE.CircleGeometry(2.1, 64), new THREE.MeshBasicMaterial({ color: 0x0b1008, transparent: true, opacity: 0.45 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.25;
  ground.position.z = -0.55;
  rig.add(ground);

  return { rig, orbitGroup, innerCore, nucleus, nodes, shellCorners };
}

export function QuantumModel() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      setAvailable(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    camera.position.set(0, 0.25, 6.6);
    scene.add(new THREE.HemisphereLight(0xd8e8c2, 0x121610, 2.1));

    const keyLight = new THREE.DirectionalLight(0xe8f4d1, 3.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const limeLight = new THREE.PointLight(0xb7f634, 20, 9, 2);
    limeLight.position.set(-2, 0.2, 2.4);
    scene.add(limeLight);
    const backLight = new THREE.PointLight(0x92aa58, 11, 7, 2);
    backLight.position.set(1.5, -2, -2);
    scene.add(backLight);

    const { rig, orbitGroup, innerCore, nucleus, nodes, shellCorners } = buildModel(scene);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute('aria-label', 'Interactive three-dimensional quantum payment security model');
    renderer.domElement.setAttribute('role', 'img');
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.68;
    controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotateSpeed = 0.38;
    controls.minPolarAngle = Math.PI * 0.28;
    controls.maxPolarAngle = Math.PI * 0.72;
    controls.target.set(0, 0, 0);

    let frame = 0;
    const clock = new THREE.Clock();
    const resizeObserver = new ResizeObserver(() => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight, false);
    });
    resizeObserver.observe(host);

    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      controls.update();
      rig.position.y = Math.sin(elapsed * 0.7) * 0.035;
      orbitGroup.rotation.y = elapsed * 0.045;
      innerCore.rotation.x = elapsed * 0.17;
      innerCore.rotation.y = elapsed * 0.2;
      nucleus.rotation.y = -elapsed * 0.24;
      const pulse = 1 + Math.sin(elapsed * 1.4) * 0.045;
      nucleus.scale.setScalar(pulse);
      nodes.forEach((node, index) => {
        node.scale.setScalar(0.9 + ((Math.sin(elapsed * 1.15 + index * 0.9) + 1) / 2) * 0.22);
      });
      shellCorners.rotation.z = Math.sin(elapsed * 0.28) * 0.018;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className={`quantum-model${available ? '' : ' quantum-model--fallback'}`} ref={hostRef}>
      {!available && <div className="model-fallback"><div className="fallback-aperture">Q</div><span>WEBGL UNAVAILABLE</span></div>}
      <div className="model-crosshair model-crosshair--one" aria-hidden="true" />
      <div className="model-crosshair model-crosshair--two" aria-hidden="true" />
    </div>
  );
}
