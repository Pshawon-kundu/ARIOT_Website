'use client';

import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { BackSide, type Group, type Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three';

/**
 * HeroScene — premium precision-robotics visualization for the ARIoT hero.
 *
 * A stylized autonomous floor platform rendered with believable materials
 * (brushed-aluminium chassis, matte-white dome, dark embedded electronics,
 * LiDAR turret, navy sensor ring). Brand accents are restrained: a subtle
 * orange sensor pulse + scanning arc, a deep-navy structural ring — the
 * physical robot stays realistic, never fully orange/blue.
 *
 * Motion (all slow + reduced-motion aware):
 *   - slow turntable rotation (3–8°/s feel, continuous slow spin)
 *   - small LiDAR arm articulation
 *   - orange sensor pulse on the LiDAR ring
 *   - periodic scanning arc every ~5s
 *   - desktop-only pointer parallax (≤ ~2°, disabled on touch)
 *
 * Performance (AGENTS.md §8): DPR [1,1.75], ≤ 3 dynamic lights, useFrame
 * paused off-screen by the parent IntersectionObserver gate, no post-proc.
 */
export default function HeroScene() {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.7, 5], fov: 42, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      {/* Warm key light from upper-left */}
      <directionalLight position={[3, 4, 2]} intensity={0.9} color="#f1f4f8" castShadow={false} />
      {/* ARIOT orange accent fill — restrained signal light */}
      <pointLight position={[-2, 1, 2]} intensity={4} color="#f57323" distance={9} decay={2} />

      {/* Pale studio dome so the robot reads on a white page (no env map fetch) */}
      <mesh scale={100}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#eef2f7" side={BackSide} />
      </mesh>

      <ScrollDolly />
      <Float
        speed={reduced ? 0 : 1}
        rotationIntensity={reduced ? 0 : 0.12}
        floatIntensity={reduced ? 0 : 0.25}
      >
        <RobotPlatform reduced={reduced} coarse={coarse} />
      </Float>
    </Canvas>
  );
}

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

function RobotPlatform({ reduced, coarse }: { reduced: boolean; coarse: boolean }) {
  const group = useRef<Group>(null);
  const lidar = useRef<Mesh>(null);
  const arm = useRef<Group>(null);
  const scan = useRef<Mesh>(null);
  const led2 = useRef<Mesh>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;

    if (!reduced) {
      // Slow turntable — continuous, calm rotation.
      g.rotation.y += delta * 0.18;
    }

    // Desktop-only pointer parallax (≤ ~2°). Disabled on touch / reduced.
    if (!coarse && !reduced) {
      const targetX = pointer.y * 0.03;
      const targetY = g.rotation.y + pointer.x * 0.03;
      g.rotation.x += (targetX - g.rotation.x) * 0.05;
      // Blend the turntable spin with the pointer offset.
      g.rotation.y += (targetY - g.rotation.y) * 0.05;
    }

    // LiDAR orange sensor pulse.
    if (lidar.current) {
      const m = lidar.current.material as MeshStandardMaterial;
      m.emissiveIntensity = reduced ? 0.5 : 0.35 + Math.sin(t * 2) * 0.25;
    }

    // Secondary blinking indicator on the electronics panel (offset phase).
    if (led2.current) {
      const m = led2.current.material as MeshStandardMaterial;
      const blink = reduced ? 0.5 : 0.25 + Math.max(0, Math.sin(t * 3.2)) * 0.75;
      m.emissiveIntensity = blink;
    }

    // Small arm articulation.
    if (arm.current && !reduced) {
      arm.current.rotation.z = Math.sin(t * 0.8) * 0.18;
    }

    // Periodic scanning arc — expands + fades every ~5s.
    if (scan.current) {
      const mat = scan.current.material as MeshBasicMaterial;
      const phase = reduced ? 0 : (t % 5) / 5;
      const s = 1 + phase * 1.6;
      scan.current.scale.set(s, s, s);
      mat.opacity = reduced ? 0 : Math.sin(phase * Math.PI) * 0.5;
    }
  });

  return (
    <group ref={group}>
      {/* Chassis — flat brushed-aluminium disc */}
      <mesh position={[0, -0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.15, 1.25, 0.26, 48]} />
        <meshStandardMaterial color="#c7d0da" metalness={0.55} roughness={0.35} />
      </mesh>
      {/* Dark underside */}
      <mesh position={[0, -0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.12, 48]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Matte-white body dome */}
      <mesh position={[0, -0.12, 0]}>
        <sphereGeometry args={[0.84, 40, 40, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#eef1f4" metalness={0.06} roughness={0.78} />
      </mesh>

      {/* Navy sensor ring at the dome base */}
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.54, 0.045, 14, 56]} />
        <meshStandardMaterial color="#093879" metalness={0.25} roughness={0.12} />
      </mesh>

      {/* LiDAR turret — dark cylinder + orange emissive ring */}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.15, 0.16, 0.2, 24]} />
        <meshStandardMaterial color="#1b2433" metalness={0.3} roughness={0.45} />
      </mesh>
      <mesh ref={lidar} position={[0, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.155, 0.018, 10, 32]} />
        <meshStandardMaterial
          color="#f57323"
          emissive="#f57323"
          emissiveIntensity={0.5}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* Small articulating sensing arm */}
      <group ref={arm} position={[0.62, 0.1, 0]}>
        <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.42, 16]} />
          <meshStandardMaterial color="#c7d0da" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0.4, 0, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial
            color="#f57323"
            emissive="#f57323"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Embedded electronics detail — dark panel with orange status LEDs */}
      <mesh position={[0, 0.0, 0.82]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.34, 0.18, 0.03]} />
        <meshStandardMaterial color="#0f1622" metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh ref={led2} position={[0.1, 0.01, 0.84]} rotation={[0.1, 0, 0]}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshStandardMaterial
          color="#f57323"
          emissive="#f57323"
          emissiveIntensity={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Scanning arc — orange, expands + fades periodically */}
      <mesh ref={scan} position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.96, 48]} />
        <meshBasicMaterial color="#f57323" transparent opacity={0} />
      </mesh>

      {/* Soft contact shadow */}
      <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.7, 48]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.1}
          roughness={0.85}
          opacity={0.4}
          transparent
        />
      </mesh>
    </group>
  );
}
