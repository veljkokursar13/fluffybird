import { Canvas, Rect, LinearGradient, useImage, Image as SkImage, RadialGradient } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import {useMemo, useEffect, useState} from "react";

function AnimatedSky({ width, height, groundHeight, sunImg }: { width: number; height: number; groundHeight: number; sunImg: ReturnType<typeof useImage> }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    let raf: number;
    let startTs: number | null = null;
    const loop = (now: number) => {
      if (startTs === null) startTs = now;
      const seconds = (now - startTs) / 1000;
      setElapsed(seconds);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

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

export default function SkiaRenderer() {
  const { width, height } = useWindowDimensions();
  const groundImg = useImage(require('@assets/images/ground.png'));
  const sunImg = useImage(require('@assets/images/sun.png'));
  const cityBackgroundImg = useImage(require('@assets/images/citybgbackround.png'));
  const cityForegroundImg = useImage(require('@assets/images/citybg.png'));
  const pipeImg = useImage(require('@assets/images/pipefull.png'));
  const bushImg = useImage(require('@assets/images/bushes.png'));

  const groundHeight = useMemo(() => {
    if (!groundImg) return 0;
    return Math.round(groundImg.height() * (width / groundImg.width()));
  }, [groundImg, width]);

  const cityBackgroundHeight = useMemo(() => {
    if (!cityBackgroundImg) return 0;
    return Math.round(cityBackgroundImg.height() * (width / cityBackgroundImg.width()));
  }, [cityBackgroundImg, width]);

  const cityForegroundHeight = useMemo(() => {
    if (!cityForegroundImg) return 0;
    return Math.round(cityForegroundImg.height() * (width / cityForegroundImg.width()));
  }, [cityForegroundImg, width]);

  const pipeHeight = useMemo(() => {
    if (!pipeImg) return 0;
    return Math.round(pipeImg.height() * (width / pipeImg.width()) * 0.1); // Make pipe 10% of original size
  }, [pipeImg, width]);

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

  useEffect(() => {
    let raf: number;
    let lastTs: number | null = null;
    const loop = (ts: number) => {
      if (lastTs === null) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      setBushOffset(prev => {
        let next = prev - bushSpeed * dt;
        const tileSpan = bushImgWidth - bushOverlap;
        if (next <= -tileSpan) next += tileSpan;
        return next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [bushSpeed, bushImgWidth]);

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

  useEffect(() => {
    if (!cityBackgroundImg) return;
    let raf: number;
    let lastTs: number | null = null;
    const loop = (ts: number) => {
      if (lastTs === null) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      setCityBgOffset(prev => {
        let next = prev - cityBgSpeed * dt;
        if (next <= -width) next += width;
        return next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cityBackgroundImg, cityBgSpeed, width]);

  useEffect(() => {
    if (!cityForegroundImg) return;
    let raf: number;
    let lastTs: number | null = null;
    const loop = (ts: number) => {
      if (lastTs === null) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      setCityFgOffset(prev => {
        let next = prev - cityFgSpeed * dt;
        if (next <= -width) next += width;
        return next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cityForegroundImg, cityFgSpeed, width]);



  
  if(!groundImg) return null;

  return (
    <Canvas style={{ width, height }}>
      <AnimatedSky width={width} height={height} groundHeight={groundHeight} sunImg={sunImg} />
      
      {/* Subtle atmospheric haze above the city */}
      <Rect x={0} y={height - groundHeight - Math.min(160, height * 0.2)} width={width} height={Math.min(160, height * 0.2)} blendMode="srcOver">
        <LinearGradient
          start={{ x: 0, y: height - groundHeight - Math.min(160, height * 0.2) }}
          end={{ x: 0, y: height - groundHeight }}
          colors={["rgba(255,140,105,0.08)", "rgba(255,140,105,0)"]}
          positions={[0, 1]}
        />
      </Rect>

      {cityBackgroundImg && (
        <>
          <SkImage 
            image={cityBackgroundImg} 
            x={cityBgOffset} 
            y={height - cityBackgroundHeight - groundHeight } 
            width={width} 
            height={cityBackgroundHeight} 
          />
          <SkImage 
            image={cityBackgroundImg} 
            x={cityBgOffset + width} 
            y={height - cityBackgroundHeight - groundHeight } 
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
            y={height - cityForegroundHeight - groundHeight} 
            width={width} 
            height={cityForegroundHeight} 
          />
          <SkImage 
            image={cityForegroundImg} 
            x={cityFgOffset + width} 
            y={height - cityForegroundHeight - groundHeight} 
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
            y={height - groundHeight - bushHeight} 
            width={bushImgWidth} 
            height={bushHeight}
          />
          <SkImage 
            image={bushImg} 
            x={bushOffset + bushImgWidth - bushOverlap} 
            y={height - groundHeight - bushHeight} 
            width={bushImgWidth} 
            height={bushHeight}
          />
        </>
      )}
        <SkImage 
         image={pipeImg} 
         x={width * 0.2} 
         y={height - pipeHeight - groundHeight + 25} 
         width={width * 0.1} 
         height={pipeHeight} 
       />
       <SkImage 
        image={groundImg} 
        x={0} 
        y={height - groundHeight} 
        width={width} 
        height={groundHeight} 
      />

      {/* Ground shadow strip at the bottom */}
      <Rect x={0} y={height - Math.min(24, groundHeight * 0.35)} width={width} height={Math.min(24, groundHeight * 0.35)}>
        <LinearGradient
          start={{ x: 0, y: height - Math.min(24, groundHeight * 0.35) }}
          end={{ x: 0, y: height }}
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.18)"]}
          positions={[0, 1]}
        />
      </Rect>

      {/* ...Pipes, Bird, HUD next */}
    </Canvas>
  );
}