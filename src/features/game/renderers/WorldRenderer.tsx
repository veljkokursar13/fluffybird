import { Canvas, Rect, LinearGradient, useImage, Image as SkImage, RadialGradient } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import React, {useMemo, useEffect, useState, useCallback} from "react";
import type { Bird } from "../../../engine/types";
import { CONFIG } from "../../../engine/settings";
import { useTicker } from "../../../hooks/useTicker";
import { useGameStore } from "../../../store/gameStore";
import BirdRenderer from "./BirdRenderer";
 

function AnimatedClouds({
  width, height, groundHeight, elapsed,
}: { width: number; height: number; groundHeight: number; elapsed: number }) {
  const cloudLarge = useImage(require('@assets/images/cloudnew.png'));
  const cloudMedium = useImage(require('@assets/images/cloudmedium.png'));

  // choose which sprite each cloud uses so both assets appear
  const [clouds, setClouds] = useState(() => ([
    { x: Math.round(width * 0.10), y: Math.round(height * 0.14), scale: 0.18, speed: width * 0.012, kind: "large" as const },
    { x: Math.round(width * 0.55), y: Math.round(height * 0.10), scale: 0.14, speed: width * 0.015, kind: "medium" as const },
    { x: Math.round(width * 0.85), y: Math.round(height * 0.18), scale: 0.16, speed: width * 0.013, kind: "large" as const },
  ]));

  const lastRef = React.useRef<number>(elapsed);

  useEffect(() => {
    if (!cloudLarge && !cloudMedium) return;
    const dt = Math.max(0, elapsed - (lastRef.current ?? elapsed));
    lastRef.current = elapsed;
    if (!dt) return;

    setClouds(prev => {
      const moved = prev.map(c => ({ ...c, x: c.x - c.speed * dt }));

      // wrap and spacing using each cloud’s own sprite size
      const minGapPx = Math.round(width * 0.06);

      const getSize = (c: typeof prev[number]) => {
        const img = c.kind === "large" ? cloudLarge : cloudMedium;
        if (!img) return { w: 0, h: 0 };
        const w = Math.round(img.width() * c.scale);
        const h = Math.round(img.height() * c.scale);
        return { w, h };
      };

      // wrap off-screen
      for (let i = 0; i < moved.length; i++) {
        const c = moved[i];
        const { w } = getSize(c);
        if (w && c.x + w <= 0) {
          let farRight = 0;
          for (let j = 0; j < moved.length; j++) {
            if (j === i) continue;
            const cj = moved[j];
            const { w: wj } = getSize(cj);
            farRight = Math.max(farRight, cj.x + wj);
          }
          c.x = Math.max(farRight + minGapPx, width);
        }
      }

      // keep simple non-overlap order
      moved.sort((a, b) => a.x - b.x);
      for (let i = 1; i < moved.length; i++) {
        const p = moved[i - 1];
        const c = moved[i];
        const { w: pw } = getSize(p);
        if (c.x < p.x + pw + minGapPx) {
          c.x = p.x + pw + minGapPx;
        }
      }

      return [...moved];
    });
  }, [elapsed, cloudLarge, cloudMedium, width]);

  if (!cloudLarge && !cloudMedium) return null;

  return (
    <>
      {clouds.map((c, idx) => {
        const img = c.kind === "large" ? cloudLarge : cloudMedium;
        if (!img) return null;
        const w = Math.round(img.width() * c.scale);
        const h = Math.round(img.height() * c.scale);
        return <SkImage key={idx} image={img} x={c.x} y={c.y} width={w} height={h} />;
      })}
    </>
  );
}


function AnimatedBird({
  width: _width,
  height: _height,
  groundHeight: _groundHeight,
  birdImg,
  bird,
  wingUpImg,
  wingCenterUpperImg,
  wingCenterLowerImg,
  wingBottomImg,
  flapTick,
}: {
  width: number;
  height: number;
  groundHeight: number;
  birdImg: ReturnType<typeof useImage> | null;
  bird: Bird;
  wingUpImg: ReturnType<typeof useImage> | null;
  wingCenterUpperImg: ReturnType<typeof useImage> | null;
  wingCenterLowerImg: ReturnType<typeof useImage> | null;
  wingBottomImg: ReturnType<typeof useImage> | null;
  flapTick: number;
}) {
  if (!birdImg) return null;

  const [currentWing, setCurrentWing] = useState<
    "centerUpper" | "up" | "centerLower" | "bottom"
  >("centerUpper");

  useEffect(() => {
    // On each tap, play a quick sequence through all frames, then return to center
    const sequence: Array<"up" | "centerUpper" | "centerLower" | "bottom"> = [
      "up",
      "centerUpper",
      "centerLower",
      "bottom",
    ];
    const timeouts: number[] = [];
    const frameMs = 50;
    sequence.forEach((frame, idx) => {
      const id = setTimeout(() => setCurrentWing(frame), idx * frameMs) as unknown as number;
      timeouts.push(id);
    });
    // Return to center after the last frame
    const resetId = setTimeout(() => setCurrentWing("centerUpper"), sequence.length * frameMs) as unknown as number;
    timeouts.push(resetId);
    return () => {
      timeouts.forEach((id) => clearTimeout(id));
    };
  }, [flapTick]);

  // Size sprite as a square using physics diameter so bottom aligns with floor clamp
  const diameter = Math.max(1, Math.round(bird.r * 2));
  const drawW = diameter;
  const drawH = diameter;

  // Wing sizing: 50% of bird diameter, preserve image aspect
  const chosenWingImg = (
    currentWing === "up"
      ? wingUpImg
      : currentWing === "centerUpper"
      ? wingCenterUpperImg
      : currentWing === "centerLower"
      ? wingCenterLowerImg
      : wingBottomImg
  );

  const wingWidth = Math.round(diameter * 0.5);
  let wingHeight = wingWidth;
  if (chosenWingImg && chosenWingImg.width() > 0) {
    wingHeight = Math.round(
      chosenWingImg.height() * (wingWidth / chosenWingImg.width())
    );
  }

  // Position the wing slightly left-of-center on the bird
  const wingX = bird.pos.x - wingWidth * 0.55;
  const wingY = bird.pos.y - wingHeight * 0.1;

  return (
    <>
      <SkImage
        image={birdImg}
        x={bird.pos.x - drawW / 2}
        y={bird.pos.y - drawH / 2}
        width={drawW}
        height={drawH}
      />
      {chosenWingImg && (
        <SkImage
          image={chosenWingImg}
          x={wingX}
          y={wingY}
          width={wingWidth}
          height={wingHeight}
        />
      )}
    </>
  );
}

function AnimatedSky({ width, height, groundHeight, sunImg, elapsed }: { width: number; height: number; groundHeight: number; sunImg: ReturnType<typeof useImage>; elapsed: number }) {

  const start = { x: 0, y: 0 } as const;
  const end = { x: 0, y: height + height * 0.02 * Math.sin((2 * Math.PI * elapsed) / 30) } as const;
  const sunRadius = height * (0.18 + 0.05 * Math.sin((2 * Math.PI * elapsed) / 10));
  const sunCenter = {
    x: width * 0.5,
    y: height - groundHeight - height * 0.05
  } as const;
  const skyShift = 0.02 * Math.sin((2 * Math.PI * elapsed) / 30);

  return (
    <>
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={start}
          end={end}
          colors={["#3a1c71", "#ff5f6d", "#ffc371", "#fffacd"]}
          positions={[0, Math.min(0.48, 0.33 + skyShift * 0.3), Math.min(0.8, 0.66 + skyShift * 0.6), 1]}
        />
      </Rect>
      <Rect x={0} y={0} width={width} height={height} blendMode="plus">
        <RadialGradient
          c={sunCenter}
          r={height * 0.28}
          colors={["rgba(255,205,92,0.18)", "rgba(255,205,92,0.015)"]}
          positions={[0, 1]}
        />
      </Rect>
      <Rect x={0} y={0} width={width} height={height} blendMode="plus">
        <RadialGradient
          c={sunCenter}
          r={sunRadius}
          colors={["rgba(255,205,92,0.45)", "rgba(255,205,92,0.05)"]}
          positions={[0, 1]}
        />
      </Rect>
      {sunImg && (() => {
        const sunW = width * 0.6;
        const sunH = Math.round(sunImg.height() * (sunW / sunImg.width()));
        return (
          <SkImage
            image={sunImg}
            x={sunCenter.x - sunW / 2}
            y={sunCenter.y - sunH / 2}
            width={sunW}
            height={sunH}
          />
        );
      })()}
    </>
  );
}

// (Removed pipe rendering from this file)

export default function SkiaRenderer({ bird }: { bird: Bird }) {
  const { width, height } = useWindowDimensions();
  const flapTick = useGameStore((s) => s.flapTick);
  const groundImg = useImage(require('@assets/images/ground.png'));
  const sunImg = useImage(require('@assets/images/sun.png'));
  const cityBackgroundImg = useImage(require('@assets/images/citybgbackround.png'));
  const cityForegroundImg = useImage(require('@assets/images/citybg.png'));
  // (pipe images moved out of this renderer)
  const bushImg = useImage(require('@assets/images/bushes.png'));
  const birdImg = useImage(require('@assets/images/birdmain.png'));
  const birdWingUpImg = useImage(require('@assets/images/wingup.png'));
  const birdWingCenterUpperImg = useImage(require('@assets/images/wingcenterupper.png'));
  const birdWingCenterLowerImg = useImage(require('@assets/images/wingcenterlower.png'));
  const birdWingBottomImg = useImage(require('@assets/images/wingbottom.png'));
  const cloudLargeImg = useImage(require('@assets/images/cloudnew.png'));
  const cloudMediumImg = useImage(require('@assets/images/cloudmedium.png'));
  
 


  const groundTop = CONFIG.screen.floorY;
  const groundThickness = Math.max(0, height - groundTop);
  const groundHeight = useMemo(() => {
    if (!groundImg) return groundThickness;
    return Math.round(groundImg.height() * (width / groundImg.width()));
  }, [groundImg, width]);
  // Ground top is defined by config; use it consistently as the anchor for layers
  const groundY = groundTop;

  // Central sky time driven by centralized ticker
  const [skyElapsed, setSkyElapsed] = useState(0);

  const cityBackgroundHeight = useMemo(() => {
    if (!cityBackgroundImg) return 0;
    return Math.round(cityBackgroundImg.height() * (width / cityBackgroundImg.width()));
  }, [cityBackgroundImg, width]);

  const cityForegroundHeight = useMemo(() => {
    if (!cityForegroundImg) return 0;
    return Math.round(cityForegroundImg.height() * (width / cityForegroundImg.width()));
  }, [cityForegroundImg, width]);

  // (pipes removed)
  const bushHeight = useMemo(() => {
    if (!bushImg) return 0;
    return Math.round(bushImg.height() * (width / bushImg.width()));
  }, [bushImg, width]);

  const bushImgWidth = useMemo(() => {
    return width;
  }, [width]);

  // Depth-based speeds: speed = base * (1 / (1 + z))
  const baseSpeed = useMemo(() => {
    return width * 0.03; // choose base so z=1 (bushes) => ~width * 0.015
  }, [width]);

  const speedForDepth = (z: number) => baseSpeed * (1 / (1 + z));

  const bushSpeed = useMemo(() => {
    return speedForDepth(1); // bushes (near)
  }, [baseSpeed]);

  const bushOverlap = useMemo(() => {
    return Math.round(width * 0.05); // increased overlap between tiles
  }, [width]);

  const [bushOffset, setBushOffset] = useState(0);

  const tickBushes = useCallback((dt: number) => {
    setBushOffset(prev => {
      let next = prev - bushSpeed * dt;
      const tileSpan = bushImgWidth - bushOverlap;
      if (next <= -tileSpan) next += tileSpan;
      return next;
    });
  }, [bushSpeed, bushImgWidth, bushOverlap]);

  // City background parallax (farthest)
  const cityBgSpeed = useMemo(() => {
    return speedForDepth(3);
  }, [baseSpeed]);

  // Foreground parallax (mid depth)
  const cityFgSpeed = useMemo(() => {
    return speedForDepth(2);
  }, [baseSpeed]);

  const [cityBgOffset, setCityBgOffset] = useState(0);
  const [cityFgOffset, setCityFgOffset] = useState(0);

  const tickCityBg = useCallback((dt: number) => {
    if (!cityBackgroundImg) return;
    setCityBgOffset(prev => {
      let next = prev - cityBgSpeed * dt;
      if (next <= -width) next += width;
      return next;
    });
  }, [cityBackgroundImg, cityBgSpeed, width]);

  const tickCityFg = useCallback((dt: number) => {
    if (!cityForegroundImg) return;
    setCityFgOffset(prev => {
      let next = prev - cityFgSpeed * dt;
      if (next <= -width) next += width;
      return next;
    });
  }, [cityForegroundImg, cityFgSpeed, width]);

  useTicker((dt) => {
    tickBushes(dt);
    tickCityBg(dt);
    tickCityFg(dt);
    setSkyElapsed((e) => e + dt);
  });

  
  if(!groundImg) return null;

  return (
    <Canvas style={{ width, height }} pointerEvents="none">
      <AnimatedSky width={width} height={height} groundHeight={groundThickness} sunImg={sunImg} elapsed={skyElapsed} />
      {/* Clouds: render above sun sky gradients */}
      <AnimatedClouds width={width} height={height} groundHeight={groundThickness} elapsed={skyElapsed} />
      
      {/* Subtle atmospheric haze above the city */}
      <Rect x={0} y={groundTop - Math.min(160, height * 0.2)} width={width} height={Math.min(160, height * 0.2)} blendMode="srcOver">
        <LinearGradient
          start={{ x: 0, y: groundTop - Math.min(160, height * 0.2) }}
          end={{ x: 0, y: groundTop }}
          colors={["rgba(255,140,105,0.08)", "rgba(255,140,105,0)"]}
          positions={[0, 1]}
        />
      </Rect>

      {cityBackgroundImg && (
        <>
          <SkImage 
            image={cityBackgroundImg} 
            x={cityBgOffset} 
            y={groundTop - cityBackgroundHeight }
            width={width} 
            height={cityBackgroundHeight} 
          />
          <SkImage 
            image={cityBackgroundImg} 
            x={cityBgOffset + width} 
            y={groundTop - cityBackgroundHeight } 
            width={width} 
            height={cityBackgroundHeight} 
          />
        </>
      )}
      {cityForegroundImg && (
        <>
          <SkImage 
            image={cityForegroundImg} 
            x={cityFgOffset} 
            y={groundTop - cityForegroundHeight}
            width={width} 
            height={cityForegroundHeight} 
          />
          <SkImage 
            image={cityForegroundImg} 
            x={cityFgOffset + width} 
            y={groundTop - cityForegroundHeight}
            width={width} 
            height={cityForegroundHeight} 
          />
        </>
      )}
      {bushImg && (
        <>
          <SkImage 
            image={bushImg} 
            x={bushOffset} 
            y={groundTop - bushHeight} 
            width={bushImgWidth} 
            height={bushHeight}
          />
          <SkImage 
            image={bushImg} 
            x={bushOffset + bushImgWidth - bushOverlap} 
            y={groundTop - bushHeight} 
            width={bushImgWidth} 
            height={bushHeight}
          />
        </>
      )}
      
      <SkImage 
        image={groundImg} 
        x={0} 
        y={groundTop} 
        width={width} 
        height={groundHeight} 
      />

      {/* Ground shadow strip at the bottom */}
      <Rect x={0} y={height - Math.min(24, groundThickness * 0.35)} width={width} height={Math.min(24, groundThickness * 0.35)}>
        <LinearGradient
          start={{ x: 0, y: height - Math.min(24, groundThickness * 0.35) }}
          end={{ x: 0, y: height }}
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.18)"]}
          positions={[0, 1]}
        />
      </Rect>
      
      {/* Bird */}
      <BirdRenderer bird={bird} />
      {/* ...Pipes, Bird, HUD next */}
    </Canvas>
  );
}