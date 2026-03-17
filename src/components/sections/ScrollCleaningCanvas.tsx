import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

function KitchenScene({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.SpotLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  const textureDirty = useTexture(`${import.meta.env.BASE_URL}images/kitchen-dirty.png`);
  const textureTransition = useTexture(`${import.meta.env.BASE_URL}images/kitchen-transition.png`);
  const textureClean = useTexture(`${import.meta.env.BASE_URL}images/kitchen-clean.png`);

  const { viewport } = useThree();

  const planeWidth = viewport.width * 1.2;
  const planeHeight = viewport.height * 1.2;

  const materialDirty = useMemo(() => new THREE.MeshStandardMaterial({
    map: textureDirty,
    transparent: true,
    opacity: 1,
    toneMapped: false,
  }), [textureDirty]);

  const materialTransition = useMemo(() => new THREE.MeshStandardMaterial({
    map: textureTransition,
    transparent: true,
    opacity: 0,
    toneMapped: false,
  }), [textureTransition]);

  const materialClean = useMemo(() => new THREE.MeshStandardMaterial({
    map: textureClean,
    transparent: true,
    opacity: 0,
    toneMapped: false,
  }), [textureClean]);

  useFrame(() => {
    const p = progress;

    if (p < 0.3) {
      materialDirty.opacity = 1;
      materialTransition.opacity = 0;
      materialClean.opacity = 0;
    } else if (p < 0.5) {
      const t = (p - 0.3) / 0.2;
      materialDirty.opacity = 1 - t;
      materialTransition.opacity = t;
      materialClean.opacity = 0;
    } else if (p < 0.7) {
      materialDirty.opacity = 0;
      materialTransition.opacity = 1;
      materialClean.opacity = 0;
    } else {
      const t = (p - 0.7) / 0.3;
      materialDirty.opacity = 0;
      materialTransition.opacity = 1 - t;
      materialClean.opacity = t;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(p * Math.PI * 0.5) * 0.08;
      groupRef.current.rotation.x = Math.cos(p * Math.PI * 0.3) * 0.03;
      groupRef.current.position.z = -0.5 + p * 0.8;
    }

    if (lightRef.current) {
      const warmColor = new THREE.Color(0xffaa66);
      const coolColor = new THREE.Color(0x88ffcc);
      lightRef.current.color.copy(warmColor.lerp(coolColor, p));
      lightRef.current.intensity = 2 + p * 3;
      lightRef.current.position.x = Math.sin(p * Math.PI) * 3;
      lightRef.current.position.y = 2 + p * 1;
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = 0.3 + p * 0.7;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight ref={ambientRef} intensity={0.3} />
      <spotLight
        ref={lightRef}
        position={[2, 3, 4]}
        angle={0.6}
        penumbra={0.8}
        intensity={2}
        castShadow
      />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#4ade80" />

      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <primitive object={materialDirty} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <primitive object={materialTransition} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <primitive object={materialClean} attach="material" />
      </mesh>

      <mesh position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[planeWidth * 2, planeHeight * 2]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

function ParticleField({ progress }: { progress: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;

      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.opacity = progress * 0.4;
      material.size = 0.02 + progress * 0.03;

      const brandColor = new THREE.Color(0x1E6BB8);
      const whiteColor = new THREE.Color(0xffffff);
      material.color.copy(brandColor.lerp(whiteColor, progress * 0.5));
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CameraController({ progress }: { progress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.x = Math.sin(progress * Math.PI * 0.4) * 0.3;
    camera.position.y = Math.cos(progress * Math.PI * 0.3) * 0.15;
    camera.position.z = 5 - progress * 0.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function ScrollCleaningCanvas({ progress }: { progress: number }) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 6, 12]} />
      <KitchenScene progress={progress} />
      <ParticleField progress={progress} />
      <CameraController progress={progress} />
    </Canvas>
  );
}
