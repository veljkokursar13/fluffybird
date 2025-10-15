import React, { useEffect, useRef, useState } from "react";
import { Canvas, Image as SkImage, useImage } from "@shopify/react-native-skia";

type Cloud = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;   // vertical pixels/sec
  depth: number;   // 0 = far, 1 = mid, 2 = near
  img: "large" | "medium";
  alpha: number;
};

type Props = {
  width: number;
  height: number;
  minY: number;         // clouds won’t go below this (px from top)
  maxY: number;         // won’t go above this
  maxClouds?: number;   // pool cap
  moving?: boolean;     // start movement after first tap
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const choice = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function CloudSystem({
  width,
  height,
  minY,
  maxY,
  maxClouds = 5,
  moving = false,
}: Props) {
  const imgLarge = useImage(require("@assets/images/cloudnew.png"));
  const imgMed   = useImage(require("@assets/images/cloudmedium.png"));

  // internal pool and a "version" to trigger re-render
  const poolRef = useRef<Cloud[]>([]);
  const movingRef = useRef(moving);
  const [v, setV] = useState(0);

  // Keep movingRef in sync with prop
  useEffect(() => {
    movingRef.current = moving;
  }, [moving]);

  // prewarm: a couple visible; rest off-screen to the right
  useEffect(() => {
    poolRef.current = [];
    const visibleCount = Math.min(2, Math.max(0, maxClouds - 1));
    for (let i = 0; i < visibleCount; i++) {
      const c = makeCloudVisible(width, height, minY, maxY, imgLarge, imgMed, poolRef.current);
      if (c) poolRef.current.push(c);
    }
    while (poolRef.current.length < maxClouds) {
      const c = makeCloudOffscreenRight(width, height, minY, maxY, imgLarge, imgMed, poolRef.current);
      if (!c) break;
      poolRef.current.push(c);
    }
    setV((x) => x + 1);
  }, [width, height, minY, maxY, maxClouds, imgLarge, imgMed]);

  // spawn timer
  // maintain population without gaps; spawn immediately when below cap

  // RAF ticker
  useEffect(() => {
    let mounted = true;
    let last = performance.now();

    const tick = (now: number) => {
      if (!mounted) return;
      const dt = Math.min(0.05, (now - last) / 1000); // clamp
      last = now;

      const pool = poolRef.current;

      if (movingRef.current) {
        // move right-to-left
        for (const c of pool) {
          c.x -= c.speed * dt;
        }
      }

      // recycle off-screen (left)
      for (let i = pool.length - 1; i >= 0; i--) {
        const c = pool[i];
        if (c.x + c.w < -16) {
          pool.splice(i, 1);
        }
      }

      // maintain population: keep spawning off-screen to the right under cap
      if (pool.length < maxClouds) {
        const c = makeCloudOffscreenRight(width, height, minY, maxY, imgLarge, imgMed, pool);
        if (c) pool.push(c);
      }

      // nudge version to re-render ~30fps max
      if (Math.random() < 0.5) setV((x) => x + 1);

      requestAnimationFrame(tick);
    };

    requestAnimationFrame((n) => {
      last = n;
      requestAnimationFrame(tick);
    });

    return () => {
      mounted = false;
    };
  }, [width, height, minY, maxY, maxClouds, imgLarge, imgMed]);

  if (!imgLarge || !imgMed) return null;

  return (
    <Canvas style={{ position: "absolute", left: 0, top: 0, width, height, zIndex: 6 }} pointerEvents="none">
      {poolRef.current.map((c) => {
        const img = c.img === "large" ? imgLarge : imgMed;
        return (
          <SkImage
            key={c.id + v * 999999} // cheap invalidation
            image={img}
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            opacity={c.alpha}
          />
        );
      })}
    </Canvas>
  );
}

export default CloudSystem;

// --- cloud factory ---------------------------------------------------

let _id = 1;

function makeCloudVisible(
  screenW: number,
  screenH: number,
  minY: number,
  maxY: number,
  imgLarge: ReturnType<typeof useImage> | null,
  imgMed: ReturnType<typeof useImage> | null,
  existing: Cloud[]
): Cloud | null {
  const imgType = Math.random() < 0.55 ? "large" : "medium";
  const base = imgType === "large" ? imgLarge : imgMed;
  const rawW = base?.width?.() || 512;
  const rawH = base?.height?.() || 256;

  // depth layer
  const depth = choice([0, 1, 2]);
  const scale = depth === 2 ? rand(0.26, 0.33) : depth === 1 ? rand(0.22, 0.28) : rand(0.18, 0.24);
  const w = Math.round(rawW * scale);
  const h = Math.round(rawH * scale);

  // vertical band with slight depth bias
  const bandBias = depth === 0 ? -0.08 * screenH : depth === 1 ? -0.2 * screenH : 0.4* screenH;
  const y = clamp(rand(minY, maxY) + bandBias, minY, maxY);
  const baseSpeed = screenW * 0.02; // horizontal px/sec
  const speed = depth === 2 ? rand(baseSpeed * 0.75, baseSpeed * 0.95)
                : depth === 1 ? rand(baseSpeed * 0.55, baseSpeed * 0.75)
                               : rand(baseSpeed * 0.35, baseSpeed * 0.55);
  const alpha = depth === 2 ? rand(0.95, 1.0) : depth === 1 ? rand(0.85, 0.95) : rand(0.70, 0.85);

  // try several x positions to avoid overlap
  for (let attempt = 0; attempt < 12; attempt++) {
    const x = Math.round(rand(0, Math.max(0, screenW - w)));
    const candidate: Cloud = { id: _id, x, y, w, h, speed, depth, img: imgType, alpha };
    if (!intersectsAny(candidate, existing, 12)) {
      _id++;
      return candidate;
    }
  }
  return null;
}

function makeCloudOffscreenRight(
  screenW: number,
  screenH: number,
  minY: number,
  maxY: number,
  imgLarge: ReturnType<typeof useImage> | null,
  imgMed: ReturnType<typeof useImage> | null,
  existing: Cloud[]
): Cloud | null {
  const imgType = Math.random() < 0.55 ? "large" : "medium";
  const base = imgType === "large" ? imgLarge : imgMed;
  const rawW = base?.width?.() || 512;
  const rawH = base?.height?.() || 256;
  const depth = choice([0, 1, 2]);
  const scale = depth === 2 ? rand(0.26, 0.33) : depth === 1 ? rand(0.22, 0.28) : rand(0.18, 0.24);
  const w = Math.round(rawW * scale);
  const h = Math.round(rawH * scale);
  const bandBias = depth === 0 ? -0.08 * screenH : depth === 1 ? -0.04 * screenH : 0;
  const y = clamp(rand(minY, maxY) + bandBias, minY, maxY);
  const baseSpeed = screenW * 0.04;
  const speed = depth === 2 ? rand(baseSpeed * 0.75, baseSpeed * 0.95)
                : depth === 1 ? rand(baseSpeed * 0.55, baseSpeed * 0.75)
                               : rand(baseSpeed * 0.35, baseSpeed * 0.55);
  const alpha = depth === 2 ? rand(0.95, 1.0) : depth === 1 ? rand(0.85, 0.95) : rand(0.70, 0.85);

  for (let attempt = 0; attempt < 12; attempt++) {
    const gap = rand(screenW * 0.06, screenW * 0.18);
    const x = Math.round(screenW + gap);
    const candidate: Cloud = { id: _id, x, y, w, h, speed, depth, img: imgType, alpha };
    if (!intersectsAny(candidate, existing, 12)) {
      _id++;
      return candidate;
    }
  }
  return null;
}

function intersectsAny(c: Cloud, clouds: Cloud[], padding: number): boolean {
  for (const o of clouds) {
    if (rectsOverlap(c.x - padding, c.y - padding, c.w + 2 * padding, c.h + 2 * padding, o.x, o.y, o.w, o.h)) {
      return true;
    }
  }
  return false;
}

function rectsOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
