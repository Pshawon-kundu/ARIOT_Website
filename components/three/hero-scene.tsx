'use client';

import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { BackSide, type Group } from 'three';

/**
 * HeroScene — geometric placeholder scene for the ARIOT hero.
 *
 * Renders an abstract autonomous robot stand-in (stacked geometric shapes
 * with cyan accent lights) until a real GLB/GLTF model is commissioned
 * (step 1.13 / AI asset pipeline). This satisfies step 1.9.2's requirement
 * for "autonomous robot model (or geometric placeholder)".
 *
 * Performance constraints (AGENTS.md §8):
 *   - DPR: [1, 1.75]
 *   - ≤ 3 dynamic lights
 *   - useFrame paused when off-screen (via R3FWrapper IntersectionObserver)
 *   - No post-processing in this pass
 */
export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.5, 5], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.25} />
      {/* Key light — warm white from upper-left */}
      <directionalLight position={[3, 4, 2]} intensity={0.8} color="#e4e8ee" castShadow={false} />
      {/* ARIOT orange accent fill — restrained signal light */}
      <pointLight position={[-2, 1, 2]} intensity={4} color="#ff751f" distance={8} decay={2} />

      {/* Procedural environment — no CDN dependency, avoids fetch errors for HDR files */}
      {/* Metalness reduced on scene materials since no env map is available for reflections.
          Light-theme palette: pale steel dome so the robot reads on a white page. */}
      <mesh scale={100}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#eef2f7" side={BackSide} />
      </mesh>

      <ScrollDolly />
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
        <RobotPlaceholder />
      </Float>
    </Canvas>
  );
}

/**
 * ScrollDolly — moves the camera forward by a small amount during the first
 * 20% of page scroll (AGENTS.md §8.2, step 1.9.2).
 */
function ScrollDolly() {
  const { camera } = useThree();
  const startZ = useRef(camera.position.z);

  useEffect(() => {
    const handleScroll = () => {
      const scrollFraction = Math.min(window.scrollY / (window.innerHeight * 0.2), 1);
      camera.position.z = startZ.current - scrollFraction * 0.8;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [camera]);

  return null;
}

/**
 * RobotPlaceholder — stacked geometric shapes standing in for the ARIOT
 * autonomous floor-cleaning robot. Replaced with the real GLTF once the
 * asset pipeline produces a Draco-compressed model (step 1.13).
 *
 * Shape rationale: disc body on top of a low chassis, sensor ring on top,
 * subtle orange emissive highlight (ARIOT accent) on the sensor ring.
 */
function RobotPlaceholder() {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Chassis — flat disc */}
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.1, 1.2, 0.28, 40]} />
        <meshStandardMaterial color="#1e293b" metalness={0.15} roughness={0.45} />
      </mesh>

      {/* Body dome */}
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.82, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#334155" metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Sensor ring — navy base, orange emissive ARIOT accent */}
      <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.045, 12, 48]} />
        <meshStandardMaterial
          color="#00357a"
          emissive="#ff751f"
          emissiveIntensity={0.5}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>

      {/* LiDAR turret */}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.18, 20]} />
        <meshStandardMaterial color="#475569" metalness={0.15} roughness={0.4} />
      </mesh>

      {/* Ground shadow plane — soft neutral disc */}
      <mesh position={[0, -0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 40]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.1}
          roughness={0.85}
          opacity={0.45}
          transparent
        />
      </mesh>
    </group>
  );
}
