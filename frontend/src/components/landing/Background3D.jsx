import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Background3D — the cinematic centerpiece of the SarkariSetu landing page.
 *
 * Concept: "Setu" means bridge. On load, a field of scattered particles
 * (representing citizens) drifts and resolves into two arcing spans that
 * meet at a shared keystone (representing the bridge to government
 * schemes) — a single orchestrated moment, not decoration. After it
 * resolves, the whole structure drifts slowly, and particles nearest the
 * bridge occasionally pulse along connecting lines to suggest an
 * always-on flow of information.
 */

const PARTICLE_COUNT = 900;
const BRIDGE_SPAN = 11; // half-width of the bridge arc
const BRIDGE_HEIGHT = 3.2;

function makeBridgeTarget(i, count) {
  // Two symmetric arcs (left span + right span) converging at a keystone.
  const side = i % 2 === 0 ? -1 : 1;
  const t = (Math.floor(i / 2) / (count / 2)) * 1; // 0..1 along the span
  const x = side * (BRIDGE_SPAN * (1 - t));
  const y = Math.sin(t * Math.PI * 0.5) * BRIDGE_HEIGHT - 1.2;
  const z = (Math.random() - 0.5) * 1.4;
  return [x, y, z];
}

function ParticleField({ scrollProgress }) {
  const pointsRef = useRef();
  const linesRef = useRef();
  const startTime = useRef(performance.now());

  const { startPositions, targetPositions, sizes } = useMemo(() => {
    const start = new Float32Array(PARTICLE_COUNT * 3);
    const target = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Scattered starting cloud, wider than the bridge itself
      start[i * 3] = (Math.random() - 0.5) * 30;
      start[i * 3 + 1] = (Math.random() - 0.5) * 18;
      start[i * 3 + 2] = (Math.random() - 0.5) * 14 - 4;

      const [tx, ty, tz] = makeBridgeTarget(i, PARTICLE_COUNT);
      target[i * 3] = tx;
      target[i * 3 + 1] = ty;
      target[i * 3 + 2] = tz;

      sizes[i] = Math.random() * 1.6 + 0.6;
    }
    return { startPositions: start, targetPositions: target, sizes };
  }, []);

  const positions = useMemo(
    () => new Float32Array(startPositions),
    [startPositions]
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, sizes]);

  // A handful of connecting lines across the keystone to suggest data flow
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pts = [];
    for (let i = 0; i < 14; i++) {
      const t = i / 14;
      const y = Math.sin(t * Math.PI * 0.5) * BRIDGE_HEIGHT - 1.2;
      pts.push(-BRIDGE_SPAN * (1 - t), y, 0);
      pts.push(BRIDGE_SPAN * (1 - t), y, 0);
    }
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(pts), 3)
    );
    return geo;
  }, []);

  useFrame((state) => {
    const elapsed = (performance.now() - startTime.current) / 1000;
    // Ease-out convergence over the first ~3.2s
    const convergence = Math.min(1, elapsed / 3.2);
    const eased = 1 - Math.pow(1 - convergence, 3);

    const posAttr = pointsRef.current.geometry.attributes.position;
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const sx = startPositions[ix];
      const sy = startPositions[ix + 1];
      const sz = startPositions[ix + 2];
      const tx = targetPositions[ix];
      const ty = targetPositions[ix + 1];
      const tz = targetPositions[ix + 2];

      // Gentle ambient drift once converged
      const drift = eased * 0.15;
      const wobbleX = Math.sin(t * 0.3 + i) * drift;
      const wobbleY = Math.cos(t * 0.25 + i * 1.3) * drift;

      posAttr.array[ix] = sx + (tx - sx) * eased + wobbleX;
      posAttr.array[ix + 1] = sy + (ty - sy) * eased + wobbleY;
      posAttr.array[ix + 2] = sz + (tz - sz) * eased;
    }
    posAttr.needsUpdate = true;

    // Slow overall parallax based on scroll + gentle auto-rotation
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.02 + scrollProgress.current * 0.3;
      pointsRef.current.position.y = -scrollProgress.current * 2.2;
    }
    if (linesRef.current) {
      linesRef.current.material.opacity =
        eased * (0.12 + Math.sin(t * 0.8) * 0.04);
      linesRef.current.rotation.y = t * 0.02 + scrollProgress.current * 0.3;
      linesRef.current.position.y = -scrollProgress.current * 2.2;
    }
  });

  return (
    <group>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={0.09}
          color="#F0A83C"
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color="#1FAA75"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

function CameraRig({ scrollProgress }) {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Subtle cinematic drift, never fully static
    state.camera.position.x = Math.sin(t * 0.08) * 0.6;
    state.camera.position.y = 0.4 + Math.sin(t * 0.06) * 0.3 - scrollProgress.current * 1.5;
    state.camera.lookAt(0, -0.6, 0);
  });
  return null;
}

export default function Background3D() {
  const scrollProgress = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      scrollProgress.current = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0.4, 9], fov: 55 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#050A18"]} />
        <fog attach="fog" args={["#050A18", 8, 22]} />
        {!reducedMotion && (
          <>
            <ParticleField scrollProgress={scrollProgress} />
            <CameraRig scrollProgress={scrollProgress} />
          </>
        )}
        {reducedMotion && <ParticleField scrollProgress={scrollProgress} />}
      </Canvas>
      {/* Vignette + grid-fade so foreground text stays legible */}
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050A18_85%)] pointer-events-none" />
    </div>
  );
}