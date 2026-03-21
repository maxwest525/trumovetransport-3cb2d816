import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";

function LamboBody() {
  const bodyShape = useMemo(() => {
    const s = new THREE.Shape();
    // Ultra-low, wide supercar profile
    s.moveTo(-2.4, 0);
    s.lineTo(2.4, 0);
    // Front splitter
    s.lineTo(2.6, 0.12);
    s.lineTo(2.5, 0.28);
    // Hood – very low and flat
    s.lineTo(1.8, 0.32);
    // Windshield – steep rake
    s.lineTo(1.1, 0.82);
    // Roof – short and low
    s.lineTo(0.3, 0.88);
    // Rear window – fast drop
    s.lineTo(-0.5, 0.6);
    // Rear deck / engine cover
    s.lineTo(-1.6, 0.55);
    // Rear diffuser
    s.lineTo(-2.2, 0.4);
    s.lineTo(-2.5, 0.18);
    s.lineTo(-2.4, 0);
    return s;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: 1.7,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 4,
  }), []);

  return (
    <group position={[0, 0.28, 0]}>
      {/* Main body */}
      <mesh castShadow position={[0, 0, -0.85]}>
        <extrudeGeometry args={[bodyShape, extrudeSettings]} />
        <meshPhysicalMaterial
          color="#f5c518"
          metalness={0.85}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Wheels */}
      {[
        [-1.6, -0.08, -1.5],
        [-1.6, -0.08, 0.0],
        [1.6, -0.08, -1.5],
        [1.6, -0.08, 0.0],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.18, 28]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.25} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.19, 12]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* Window glass */}
      <mesh position={[0.35, 0.68, -0.85]}>
        <boxGeometry args={[1.1, 0.28, 1.45]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0.3}
          roughness={0}
          transmission={0.5}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Rear spoiler hint */}
      <mesh position={[-1.8, 0.58, -0.85]} castShadow>
        <boxGeometry args={[0.08, 0.04, 1.5]} />
        <meshPhysicalMaterial color="#111" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function VehicleModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.25}>
      <group ref={groupRef} scale={0.9}>
        <LamboBody />
      </group>
    </Float>
  );
}

interface Vehicle3DViewerProps {
  className?: string;
}

export default function Vehicle3DViewer({ className = "" }: Vehicle3DViewerProps) {
  return (
    <div className={`w-full h-[220px] rounded-xl overflow-hidden bg-gradient-to-b from-muted/30 to-background border border-border/40 ${className}`}>
      <Canvas
        camera={{ position: [5, 2.5, 5], fov: 32 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow shadow-mapSize={1024} />
        <directionalLight position={[-3, 4, -3]} intensity={0.3} color="#6ee7b7" />
        <spotLight position={[0, 10, 0]} intensity={0.6} angle={0.5} penumbra={1} />

        <Suspense fallback={null}>
          <VehicleModel />
          <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={10} blur={2} far={4} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
