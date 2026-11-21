import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { INGREDIENT_MAP } from '../data/menuOrders';
import type { IngredientId } from '../types/game';

export interface BanhMiSceneProps {
  hasBread: boolean;
  isToasting: boolean;
  toastLevel: number;
  addedIngredients: IngredientId[];
  /** 'success' | 'error' flash after delivery, null otherwise */
  resultFlash: 'success' | 'error' | null;
}

const RAW = new THREE.Color('#f3d9a4');
const GOLDEN = new THREE.Color('#d98a2b');
const BURNT = new THREE.Color('#3b2412');

function breadColor(level: number, target: THREE.Color): THREE.Color {
  if (level < 70) return target.copy(RAW).lerp(GOLDEN, level / 70);
  return target.copy(GOLDEN).lerp(BURNT, Math.min(1, (level - 70) / 30));
}

/** Độ dày (chiều cao) mỗi lớp nguyên liệu trong diorama. */
const LAYER_HEIGHT: Record<IngredientId, number> = {
  banh_mi_shell: 0,
  butter: 0.03,
  soy_sauce: 0.02,
  special_sauce: 0.02,
  pate: 0.06,
  fried_egg: 0.06,
  cha_lua: 0.08,
  roast_pork: 0.12,
  cucumber: 0.07,
  pickles: 0.07,
  cilantro: 0.08,
  chili: 0.05,
};

function IngredientMesh({ id }: { id: IngredientId }) {
  const color = INGREDIENT_MAP[id].accentColor;
  switch (id) {
    case 'butter':
    case 'soy_sauce':
    case 'special_sauce':
      return (
        <mesh castShadow scale={[1.55, 1, 0.38]}>
          <cylinderGeometry args={[1, 1, LAYER_HEIGHT[id], 24]} />
          <meshStandardMaterial color={color} roughness={0.25} transparent opacity={id === 'butter' ? 1 : 0.85} />
        </mesh>
      );
    case 'pate':
      return (
        <RoundedBox args={[2.9, LAYER_HEIGHT.pate, 0.62]} radius={0.025} castShadow>
          <meshStandardMaterial color="#8a5a2b" roughness={0.8} />
        </RoundedBox>
      );
    case 'fried_egg':
      return (
        <group>
          <mesh castShadow scale={[1.4, 1, 0.34]}>
            <cylinderGeometry args={[1, 1, 0.04, 24]} />
            <meshStandardMaterial color="#fffaf0" roughness={0.5} />
          </mesh>
          {[-0.6, 0.6].map((x) => (
            <mesh key={x} position={[x, 0.04, 0]} scale={[1, 0.5, 1]} castShadow>
              <sphereGeometry args={[0.17, 16, 12]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.3} />
            </mesh>
          ))}
        </group>
      );
    case 'cha_lua':
      return (
        <group>
          {[-1.05, -0.35, 0.35, 1.05].map((x, i) => (
            <mesh key={x} position={[x, 0, 0]} rotation={[0.05 * (i % 2 ? 1 : -1), 0, 0]} castShadow>
              <cylinderGeometry args={[0.34, 0.34, 0.06, 24]} />
              <meshStandardMaterial color="#f4c2c2" roughness={0.6} />
            </mesh>
          ))}
        </group>
      );
    case 'roast_pork':
      return (
        <group>
          {[-1.1, -0.55, 0, 0.55, 1.1].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <RoundedBox args={[0.42, 0.09, 0.42]} radius={0.02} castShadow>
                <meshStandardMaterial color="#e8b48a" roughness={0.7} />
              </RoundedBox>
              <mesh position={[0, 0.055, 0]} castShadow>
                <boxGeometry args={[0.42, 0.03, 0.42]} />
                <meshStandardMaterial color="#b4471a" roughness={0.35} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case 'cucumber':
      return (
        <group>
          {[-1.05, -0.35, 0.35, 1.05].map((x, i) => (
            <mesh
              key={x}
              position={[x, 0, i % 2 ? 0.06 : -0.06]}
              rotation={[0, 0.12 * (i % 2 ? 1 : -1), Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.1, 0.1, 0.68, 16]} />
              <meshStandardMaterial color="#4ade80" roughness={0.4} />
            </mesh>
          ))}
        </group>
      );
    case 'pickles':
      return (
        <group>
          {Array.from({ length: 12 }, (_, i) => (
            <mesh
              key={i}
              position={[-1.3 + i * 0.235, 0, (i % 3) * 0.12 - 0.12]}
              rotation={[0, (i % 4) * 0.5, Math.PI / 2]}
              castShadow
            >
              <boxGeometry args={[0.05, 0.5, 0.05]} />
              <meshStandardMaterial color={i % 2 ? '#fb923c' : '#fff7ed'} roughness={0.5} />
            </mesh>
          ))}
        </group>
      );
    case 'cilantro':
      return (
        <group>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[-1.2 + i * 0.3, 0.03, (i % 2) * 0.18 - 0.09]} castShadow>
              <icosahedronGeometry args={[0.12, 0]} />
              <meshStandardMaterial color={i % 2 ? '#16a34a' : '#22c55e'} roughness={0.7} flatShading />
            </mesh>
          ))}
        </group>
      );
    case 'chili':
      return (
        <group>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[-1 + i * 0.4, 0.02, (i % 2) * 0.14 - 0.07]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[0.07, 0.03, 8, 16]} />
              <meshStandardMaterial color="#dc2626" roughness={0.3} />
            </mesh>
          ))}
        </group>
      );
    default:
      return null;
  }
}

/** Một lớp nhân rơi từ trên xuống rồi nảy nhẹ. */
function FallingLayer({ id, targetY }: { id: IngredientId; targetY: number }) {
  const ref = useRef<THREE.Group>(null);
  const vel = useRef(0);
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    // Lò xo tắt dần hướng về targetY
    const k = 180;
    const damping = 14;
    const force = (targetY - g.position.y) * k - vel.current * damping;
    vel.current += force * dt;
    g.position.y += vel.current * dt;
    const s = THREE.MathUtils.lerp(g.scale.x, 1, 1 - Math.exp(-dt * 12));
    g.scale.setScalar(s);
  });
  return (
    <group ref={ref} position={[0, targetY + 1.6, 0]} scale={0.6}>
      <IngredientMesh id={id} />
    </group>
  );
}

function Bread({ toastLevel, isToasting }: { toastLevel: number; isToasting: boolean }) {
  const bottomMat = useRef<THREE.MeshStandardMaterial>(null);
  const topMat = useRef<THREE.MeshStandardMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Color(), []);
  const levelRef = useRef(toastLevel);
  levelRef.current = toastLevel;

  useFrame((state, delta) => {
    const c = breadColor(levelRef.current, tmp);
    bottomMat.current?.color.lerp(c, 1 - Math.exp(-delta * 8));
    topMat.current?.color.lerp(c, 1 - Math.exp(-delta * 8));
    if (group.current) {
      group.current.position.y = isToasting ? Math.sin(state.clock.elapsedTime * 18) * 0.008 : 0;
    }
  });

  return (
    <group ref={group}>
      {/* Nửa dưới ổ bánh */}
      <mesh castShadow receiveShadow scale={[1.75, 0.42, 0.5]}>
        <sphereGeometry args={[1, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial ref={bottomMat} color={RAW} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* Ruột bánh */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} scale={[1.7, 0.46, 1]} receiveShadow>
        <circleGeometry args={[1, 40]} />
        <meshStandardMaterial color="#fff1d0" roughness={0.9} />
      </mesh>
      {/* Nửa trên mở ra phía sau */}
      <group position={[0, 0.02, -0.5]} rotation={[-1.75, 0, 0]}>
        <mesh castShadow position={[0, 0, 0.5]} scale={[1.75, 0.5, 0.5]}>
          <sphereGeometry args={[1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial ref={topMat} color={RAW} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function Grill({ active }: { active: boolean }) {
  const light = useRef<THREE.PointLight>(null);
  const coals = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const target = active ? 2.4 + Math.sin(t * 9) * 0.4 : 0;
    if (light.current) light.current.intensity = THREE.MathUtils.lerp(light.current.intensity, target, 0.15);
    if (coals.current) {
      coals.current.emissiveIntensity = THREE.MathUtils.lerp(
        coals.current.emissiveIntensity,
        active ? 1.6 + Math.sin(t * 7) * 0.3 : 0.15,
        0.12,
      );
    }
  });
  return (
    <group position={[0, -0.32, 0]}>
      <RoundedBox args={[4.2, 0.3, 1.6]} radius={0.06} position={[0, -0.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3f3f46" metalness={0.6} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[3.9, 0.03, 1.35]} />
        <meshStandardMaterial ref={coals} color="#451a03" emissive="#f97316" emissiveIntensity={0.15} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-1.8 + i * 0.45, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.45, 8]} />
          <meshStandardMaterial color="#a1a1aa" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      <pointLight ref={light} position={[0, 0.3, 0.2]} color="#fb923c" intensity={0} distance={4} />
    </group>
  );
}

function Counter() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.68, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#b7793f" roughness={0.85} />
      </mesh>
      {/* Vân gỗ */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.675, -3.5 + i * 1]}>
          <planeGeometry args={[14, 0.03]} />
          <meshBasicMaterial color="#8b5a2b" transparent opacity={0.35} />
        </mesh>
      ))}
      {/* Hũ đồ chua & rổ rau trang trí */}
      <mesh position={[-3.3, -0.25, -0.8]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.85, 24]} />
        <meshStandardMaterial color="#fdba74" transparent opacity={0.75} roughness={0.1} />
      </mesh>
      <mesh position={[-3.3, 0.22, -0.8]}>
        <cylinderGeometry args={[0.43, 0.43, 0.1, 24]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[3.3, -0.45, -0.7]} castShadow>
        <cylinderGeometry args={[0.6, 0.45, 0.45, 24]} />
        <meshStandardMaterial color="#a16207" roughness={0.9} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[3.3 + Math.cos(i) * 0.3, -0.18, -0.7 + Math.sin(i) * 0.3]} castShadow>
          <icosahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color={i % 2 ? '#15803d' : '#22c55e'} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Sandwich({
  hasBread,
  isToasting,
  toastLevel,
  addedIngredients,
  resultFlash,
}: BanhMiSceneProps) {
  const root = useRef<THREE.Group>(null);

  const layers = useMemo(() => {
    const sorted = [...addedIngredients].sort(
      (a, b) => INGREDIENT_MAP[a].layerOrder - INGREDIENT_MAP[b].layerOrder,
    );
    let y = 0.02;
    return sorted.map((id) => {
      const h = LAYER_HEIGHT[id];
      const entry = { id, y: y + h / 2 };
      y += h;
      return entry;
    });
  }, [addedIngredients]);

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // Lắc nhẹ khi giao sai, nhún khi giao đúng
    const shake = resultFlash === 'error' ? Math.sin(t * 40) * 0.05 : 0;
    const hop = resultFlash === 'success' ? Math.abs(Math.sin(t * 8)) * 0.12 : 0;
    g.position.x = THREE.MathUtils.lerp(g.position.x, shake, 1 - Math.exp(-delta * 20));
    g.position.y = THREE.MathUtils.lerp(g.position.y, hop, 1 - Math.exp(-delta * 20));
    g.rotation.y = Math.sin(t * 0.4) * 0.06;
  });

  if (!hasBread) return null;

  return (
    <group ref={root}>
      <Bread toastLevel={toastLevel} isToasting={isToasting} />
      {layers.map((l) => (
        <FallingLayer key={l.id} id={l.id} targetY={l.y} />
      ))}
    </group>
  );
}

export default function BanhMiScene(props: BanhMiSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 3.6, 5.2], fov: 38 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => camera.lookAt(0, -0.25, 0)}
    >
      <color attach="background" args={['#fde7c4']} />
      <fog attach="fog" args={['#fde7c4', 9, 16]} />
      <hemisphereLight args={['#fff7e6', '#7c4a1e', 0.9]} />
      <directionalLight
        position={[3, 6, 4]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0005}
      />
      <Counter />
      <Grill active={props.isToasting && props.hasBread} />
      <Sandwich {...props} />
      <ContactShadows position={[0, -0.67, 0]} opacity={0.35} scale={12} blur={2.5} far={3} />
    </Canvas>
  );
}
