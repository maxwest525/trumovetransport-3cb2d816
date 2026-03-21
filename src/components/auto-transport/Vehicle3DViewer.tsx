import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";

// --- Vehicle body shapes by type ---

function SedanBody() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // Bottom
    s.moveTo(-2.2, 0);
    s.lineTo(2.2, 0);
    // Front bumper
    s.lineTo(2.4, 0.3);
    s.lineTo(2.3, 0.55);
    // Hood
    s.lineTo(1.6, 0.6);
    // Windshield
    s.lineTo(1.0, 1.15);
    // Roof
    s.lineTo(-0.4, 1.2);
    // Rear window
    s.lineTo(-1.2, 0.7);
    // Trunk
    s.lineTo(-2.0, 0.6);
    // Rear bumper
    s.lineTo(-2.3, 0.4);
    s.lineTo(-2.2, 0);
    return s;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 1, depth: 1.6, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3,
  }), []);

  return (
    <group position={[0, 0.35, 0]}>
      <mesh castShadow position={[0, 0, -0.8]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshPhysicalMaterial color="#1a1a2e" metalness={0.9} roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {/* Wheels */}
      {[[-1.5, -0.1, -1.5], [-1.5, -0.1, 0.0], [1.5, -0.1, -1.5], [1.5, -0.1, 0.0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.2, 24]} />
          <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Window glass */}
      <mesh position={[0.3, 0.85, -0.8]} scale={[1, 1, 1]}>
        <boxGeometry args={[1.2, 0.4, 1.45]} />
        <meshPhysicalMaterial color="#87CEEB" metalness={0.1} roughness={0} transmission={0.6} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function SUVBody() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.2, 0);
    s.lineTo(2.2, 0);
    s.lineTo(2.4, 0.4);
    s.lineTo(2.3, 0.75);
    s.lineTo(1.6, 0.8);
    s.lineTo(1.1, 1.45);
    s.lineTo(-0.8, 1.5);
    s.lineTo(-1.4, 0.9);
    s.lineTo(-2.1, 0.85);
    s.lineTo(-2.3, 0.5);
    s.lineTo(-2.2, 0);
    return s;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 1, depth: 1.8, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3,
  }), []);

  return (
    <group position={[0, 0.42, 0]}>
      <mesh castShadow position={[0, 0, -0.9]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshPhysicalMaterial color="#0d1b2a" metalness={0.85} roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {[[-1.5, -0.15, -1.65], [-1.5, -0.15, 0.0], [1.5, -0.15, -1.65], [1.5, -0.15, 0.0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.22, 24]} />
          <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0.15, 1.05, -0.9]} scale={[1, 1, 1]}>
        <boxGeometry args={[1.5, 0.5, 1.55]} />
        <meshPhysicalMaterial color="#87CEEB" metalness={0.1} roughness={0} transmission={0.6} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function TruckBody() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.5, 0);
    s.lineTo(2.5, 0);
    s.lineTo(2.6, 0.4);
    // Cab front
    s.lineTo(2.5, 0.8);
    s.lineTo(1.8, 0.85);
    s.lineTo(1.3, 1.5);
    s.lineTo(0.3, 1.55);
    // Cab rear / bed transition
    s.lineTo(0.2, 0.7);
    // Truck bed
    s.lineTo(-2.2, 0.7);
    s.lineTo(-2.4, 0.5);
    s.lineTo(-2.5, 0);
    return s;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 1, depth: 1.8, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3,
  }), []);

  return (
    <group position={[0, 0.45, 0]}>
      <mesh castShadow position={[0, 0, -0.9]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshPhysicalMaterial color="#1b2838" metalness={0.85} roughness={0.2} clearcoat={0.8} clearcoatRoughness={0.1} />
      </mesh>
      {[[-1.8, -0.15, -1.65], [-1.8, -0.15, 0.0], [1.6, -0.15, -1.65], [1.6, -0.15, 0.0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.24, 24]} />
          <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0.85, 1.05, -0.9]}>
        <boxGeometry args={[0.8, 0.5, 1.55]} />
        <meshPhysicalMaterial color="#87CEEB" metalness={0.1} roughness={0} transmission={0.6} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function CoupeBody() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.0, 0);
    s.lineTo(2.0, 0);
    s.lineTo(2.2, 0.25);
    s.lineTo(2.1, 0.45);
    s.lineTo(1.5, 0.5);
    // Aggressive windshield
    s.lineTo(0.8, 1.0);
    // Low roof
    s.lineTo(-0.2, 1.05);
    // Fast rear
    s.lineTo(-1.4, 0.5);
    s.lineTo(-1.9, 0.45);
    s.lineTo(-2.1, 0.3);
    s.lineTo(-2.0, 0);
    return s;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 1, depth: 1.5, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3,
  }), []);

  return (
    <group position={[0, 0.32, 0]}>
      <mesh castShadow position={[0, 0, -0.75]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshPhysicalMaterial color="#2d1b4e" metalness={0.9} roughness={0.12} clearcoat={1} clearcoatRoughness={0.03} />
      </mesh>
      {[[-1.3, -0.1, -1.35], [-1.3, -0.1, 0.0], [1.3, -0.1, -1.35], [1.3, -0.1, 0.0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 24]} />
          <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0.3, 0.7, -0.75]}>
        <boxGeometry args={[0.9, 0.35, 1.3]} />
        <meshPhysicalMaterial color="#87CEEB" metalness={0.1} roughness={0} transmission={0.6} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function VanBody() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.3, 0);
    s.lineTo(2.3, 0);
    s.lineTo(2.4, 0.4);
    s.lineTo(2.3, 0.8);
    s.lineTo(1.6, 0.85);
    s.lineTo(1.2, 1.5);
    s.lineTo(-1.8, 1.5);
    s.lineTo(-2.1, 1.0);
    s.lineTo(-2.3, 0.5);
    s.lineTo(-2.3, 0);
    return s;
  }, []);

  const extrudeSettings = useMemo(() => ({
    steps: 1, depth: 1.9, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3,
  }), []);

  return (
    <group position={[0, 0.42, 0]}>
      <mesh castShadow position={[0, 0, -0.95]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshPhysicalMaterial color="#1a2332" metalness={0.85} roughness={0.2} clearcoat={0.8} clearcoatRoughness={0.1} />
      </mesh>
      {[[-1.5, -0.15, -1.7], [-1.5, -0.15, 0.0], [1.5, -0.15, -1.7], [1.5, -0.15, 0.0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.22, 24]} />
          <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[-0.2, 1.1, -0.95]}>
        <boxGeometry args={[2.2, 0.5, 1.65]} />
        <meshPhysicalMaterial color="#87CEEB" metalness={0.1} roughness={0} transmission={0.6} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function VehicleModel({ vehicleType }: { vehicleType: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  const VehicleComponent = useMemo(() => {
    switch (vehicleType) {
      case "SUV": return SUVBody;
      case "Truck": return TruckBody;
      case "Coupe": return CoupeBody;
      case "Van": return VanBody;
      default: return SedanBody;
    }
  }, [vehicleType]);

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} scale={0.85}>
        <VehicleComponent />
      </group>
    </Float>
  );
}

interface Vehicle3DViewerProps {
  vehicleType: string;
  className?: string;
}

export default function Vehicle3DViewer({ vehicleType, className = "" }: Vehicle3DViewerProps) {
  return (
    <div className={`w-full h-[200px] rounded-xl overflow-hidden bg-gradient-to-b from-muted/30 to-background border border-border/40 ${className}`}>
      <Canvas
        camera={{ position: [5, 3, 5], fov: 35 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={1024} />
        <directionalLight position={[-3, 4, -3]} intensity={0.4} color="#6ee7b7" />
        <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.5} penumbra={1} />
        
        <Suspense fallback={null}>
          <VehicleModel vehicleType={vehicleType} />
          <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={10} blur={2} far={4} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
