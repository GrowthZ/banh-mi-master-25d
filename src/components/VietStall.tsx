import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/** Tạo texture chữ từ canvas 2D (dùng font hệ thống, không cần tải font). */
function useTextTexture(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  width: number,
  height: number,
): THREE.CanvasTexture {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) draw(ctx, width, height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [width, height]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

function Signboard() {
  const tex = useTextTexture(
    (ctx, w, h) => {
      ctx.fillStyle = '#c8102e';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 10;
      ctx.strokeRect(14, 14, w - 28, h - 28);
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 112px ${FONT}`;
      ctx.fillText('BÁNH MÌ HÀ NỘI', w / 2, h / 2 - 18);
      ctx.font = `700 40px ${FONT}`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('★ Pate · Trứng · Chả lụa · Heo quay ★', w / 2, h / 2 + 62);
    },
    1280,
    260,
  );
  return (
    <mesh position={[0, 1.42, -2.05]}>
      <planeGeometry args={[5.4, 1.1]} />
      <meshStandardMaterial map={tex} roughness={0.6} />
    </mesh>
  );
}

function GlassLettering() {
  const tex = useTextTexture(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#dc2626';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `italic 900 84px ${FONT}`;
      ctx.fillText('Bánh Mì Ngon', w / 2, h / 2 - 30);
      ctx.font = `700 44px ${FONT}`;
      ctx.fillStyle = '#1d4ed8';
      ctx.fillText('Nóng giòn — Đậm đà — 15.000đ', w / 2, h / 2 + 50);
    },
    1024,
    256,
  );
  return (
    <mesh position={[0, 0.48, -1.54]}>
      <planeGeometry args={[3.4, 0.85]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

function Baguette({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <mesh position={position} rotation={[0, rotation, Math.PI / 2]} castShadow>
      <capsuleGeometry args={[0.13, 0.75, 6, 12]} />
      <meshStandardMaterial color="#d99a3c" roughness={0.55} />
    </mesh>
  );
}

/** Xe bánh mì kính khung nhôm — biểu tượng vỉa hè Việt Nam. */
function BanhMiCart() {
  const frame = <meshStandardMaterial color="#d4d4d8" metalness={0.85} roughness={0.25} />;
  const posts: [number, number][] = [
    [-2.6, -1.55],
    [2.6, -1.55],
    [-2.6, -2.5],
    [2.6, -2.5],
  ];
  return (
    <group>
      {/* Thân tủ dưới sơn xanh ngọc */}
      <RoundedBox args={[5.4, 0.6, 1.05]} radius={0.04} position={[0, -0.38, -2.02]} castShadow receiveShadow>
        <meshStandardMaterial color="#0f766e" roughness={0.6} />
      </RoundedBox>
      {/* Mặt kính */}
      <mesh position={[0, 0.48, -1.55]}>
        <planeGeometry args={[5.2, 1.1]} />
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.18} roughness={0.05} metalness={0} />
      </mesh>
      <mesh position={[0, 1.04, -2.02]}>
        <boxGeometry args={[5.3, 0.04, 1.0]} />
        {frame}
      </mesh>
      {posts.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.48, z]}>
          <boxGeometry args={[0.06, 1.12, 0.06]} />
          {frame}
        </mesh>
      ))}
      {/* Kệ trong tủ: bánh mì xếp chồng */}
      <mesh position={[0, -0.06, -2.02]}>
        <boxGeometry args={[5.1, 0.03, 0.9]} />
        {frame}
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <Baguette key={`b${i}`} position={[-2.0 + i * 0.55, 0.08, -2.15]} rotation={0.15 * (i % 2 ? 1 : -1)} />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <Baguette key={`t${i}`} position={[-1.7 + i * 0.6, 0.3, -2.25]} rotation={0.1 * (i % 2 ? -1 : 1)} />
      ))}
      {/* Chả lụa gói lá chuối treo */}
      {[-2.1, -1.65].map((x) => (
        <group key={x} position={[x, 0.68, -1.95]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.17, 0.17, 0.42, 16]} />
            <meshStandardMaterial color="#3f7d20" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.3, 4]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
      ))}
      {/* Tảng heo quay */}
      <group position={[1.85, 0.66, -1.95]}>
        <RoundedBox args={[0.75, 0.32, 0.4]} radius={0.05} castShadow>
          <meshStandardMaterial color="#e8b48a" roughness={0.7} />
        </RoundedBox>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.74, 0.06, 0.39]} />
          <meshStandardMaterial color="#b4471a" roughness={0.3} />
        </mesh>
      </group>
      <GlassLettering />
      <Signboard />
      {/* Mái che sọc */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`aw${i}`} position={[-2.4 + i * 0.6, 2.06, -1.75]} rotation={[0.55, 0, 0]}>
          <boxGeometry args={[0.6, 0.02, 0.8]} />
          <meshStandardMaterial color={i % 2 ? '#fefce8' : '#dc2626'} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Lantern({ position, phase }: { position: [number, number, number]; phase: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.3 + phase) * 0.08;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.5, 4]} />
        <meshStandardMaterial color="#422006" />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.05, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh scale={[1, 0.82, 1]}>
        <sphereGeometry args={[0.22, 24, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.05, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.33, 0]}>
        <coneGeometry args={[0.05, 0.25, 8]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      <pointLight color="#ff6b4a" intensity={0.6} distance={2.5} />
    </group>
  );
}

function NonLa({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0.25, 0.4, -0.15]}>
      <mesh castShadow>
        <coneGeometry args={[0.6, 0.38, 32, 1, true]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {[0.1, 0.2, 0.3, 0.4, 0.5].map((r) => (
        <mesh key={r} position={[0, 0.19 - (r / 0.6) * 0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.006, 4, 32]} />
          <meshStandardMaterial color="#c8a46a" />
        </mesh>
      ))}
    </group>
  );
}

function BananaLeaf({ position, rotation, scale = 1 }: { position: [number, number, number]; rotation: number; scale?: number }) {
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, rotation]} scale={scale}>
      <mesh receiveShadow scale={[1.3, 0.45, 1]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#3f9b2e" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[2.5, 0.025]} />
        <meshBasicMaterial color="#a3d977" />
      </mesh>
    </group>
  );
}

/** Tường gạch men hoa văn kiểu Sài Gòn xưa phía sau. */
function TiledWall() {
  const tex = useTextTexture(
    (ctx, w) => {
      const n = 8;
      const s = w / n;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const x = i * s;
          const y = j * s;
          ctx.fillStyle = (i + j) % 2 ? '#fdf6e3' : '#f8ebc8';
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = '#7fb8a8';
          ctx.beginPath();
          ctx.moveTo(x + s / 2, y + s * 0.15);
          ctx.lineTo(x + s * 0.85, y + s / 2);
          ctx.lineTo(x + s / 2, y + s * 0.85);
          ctx.lineTo(x + s * 0.15, y + s / 2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#d9826f';
          ctx.beginPath();
          ctx.arc(x + s / 2, y + s / 2, s * 0.12, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    512,
    512,
  );
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 1.5);
  return (
    <mesh position={[0, 1.2, -3.2]}>
      <planeGeometry args={[26, 4.5]} />
      <meshStandardMaterial map={tex} roughness={0.4} />
    </mesh>
  );
}

export default function VietStall() {
  return (
    <group>
      <TiledWall />
      <BanhMiCart />
      <Lantern position={[-2.3, 1.55, -1.2]} phase={0} />
      <Lantern position={[2.3, 1.55, -1.2]} phase={1.7} />
      {/* Quầy gỗ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.68, 0]} receiveShadow>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#b7793f" roughness={0.85} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.675, -1.4 + i * 0.9]}>
          <planeGeometry args={[16, 0.03]} />
          <meshBasicMaterial color="#8b5a2b" transparent opacity={0.35} />
        </mesh>
      ))}
      {/* Lá chuối lót rổ rau & hũ đồ chua */}
      <BananaLeaf position={[3.35, -0.67, -0.55]} rotation={0.4} scale={0.75} />
      <BananaLeaf position={[-3.35, -0.67, -0.55]} rotation={-0.3} scale={0.6} />
      {/* Hũ đồ chua */}
      <mesh position={[-3.35, -0.25, -0.6]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.82, 24]} />
        <meshStandardMaterial color="#fdba74" transparent opacity={0.8} roughness={0.1} />
      </mesh>
      <mesh position={[-3.35, 0.2, -0.6]}>
        <cylinderGeometry args={[0.41, 0.41, 0.1, 24]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {/* Rổ rau thơm */}
      <mesh position={[3.35, -0.45, -0.55]} castShadow>
        <cylinderGeometry args={[0.55, 0.42, 0.42, 24]} />
        <meshStandardMaterial color="#a16207" roughness={0.9} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[3.35 + Math.cos(i) * 0.28, -0.2, -0.55 + Math.sin(i) * 0.28]} castShadow>
          <icosahedronGeometry args={[0.17, 0]} />
          <meshStandardMaterial color={i % 2 ? '#15803d' : '#22c55e'} flatShading />
        </mesh>
      ))}
      {/* Chai tương ớt & nước tương */}
      <mesh position={[-2.55, -0.38, 0.55]} castShadow>
        <cylinderGeometry args={[0.11, 0.13, 0.6, 16]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} />
      </mesh>
      <mesh position={[-2.55, -0.02, 0.55]}>
        <coneGeometry args={[0.07, 0.14, 12]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
      <mesh position={[-2.25, -0.4, 0.75]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.55, 16]} />
        <meshStandardMaterial color="#451a03" roughness={0.2} />
      </mesh>
      <NonLa position={[2.75, -0.48, 0.75]} />
    </group>
  );
}
