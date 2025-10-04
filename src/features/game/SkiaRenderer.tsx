import { Canvas, Rect, LinearGradient, useImage, Image as SkImage, RadialGradient } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import {useMemo, useEffect, useState, useCallback} from "react";
import type { Bird } from "../../engine/types";
import { CONFIG } from "../../engine/settings";
import { useTicker } from "../../hooks/useTicker";

function AnimatedBird({ width: _width, height: _height, groundHeight: _groundHeight, birdImg, bird }: { width: number; height: number; groundHeight: number; birdImg: ReturnType<typeof useImage>; bird: Bird }) {
  if (!birdImg) return null;

  // Size sprite as a square using physics diameter so bottom aligns with floor clamp
  const diameter = Math.max(1, Math.round(bird.r * 2));
  const drawW = diameter;
  const drawH = diameter;

  return (
    <SkImage
      image={birdImg}
      x={bird.pos.x - drawW / 2}
      y={bird.pos.y - drawH / 2}
      width={drawW}
      height={drawH}
    />
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

// Presentational pipe renderer: draws body + cap images only
// Other files will control spawning, position, and sizing
function pipeCreator(args: {
  x: number;                 // left coordinate of the pipe
  bottomY: number;           // y coordinate where the pipe touches the ground
  bodyHeight: number;        // vertical stretch height of the pipe body
  pipeWidth: number;         // rendered width of the pipe
  bodyImg: ReturnType<typeof useImage>;
  capImg: ReturnType<typeof useImage>;
}) {
  const { x, bottomY, bodyHeight, pipeWidth, bodyImg, capImg } = args;
  if (!bodyImg || !capImg) return null;

  // Scale cap to requested width, preserve its aspect ratio
  const capScale = pipeWidth / capImg.width();
  const capHeight = Math.round(capImg.height() * capScale);

  // Body is stretched vertically to bodyHeight while keeping requested width
  const bodyX = x;
  const bodyY = bottomY - bodyHeight; // body grows upward from the ground

  const capX = x;
  const capY = bodyY - capHeight; // cap sits on top of the body

  return (
    <>
      <SkImage
        image={bodyImg}
        x={bodyX}
        y={bodyY}
        width={pipeWidth}
        height={bodyHeight}
      />
      <SkImage
        image={capImg}
        x={capX}
        y={capY}
        width={pipeWidth}
        height={capHeight}
      />
    </>
  );
}

export default function SkiaRenderer({ bird }: { bird: Bird }) {
  const { width, height } = useWindowDimensions();
  const groundImg = useImage(require('@assets/images/ground.png'));
  const sunImg = useImage(require('@assets/images/sun.png'));
  const cityBackgroundImg = useImage(require('@assets/images/citybgbackround.png'));
  const cityForegroundImg = useImage(require('@assets/images/citybg.png'));
  const pipeBodyImg = useImage(require('@assets/images/pipebody.png'));
  const pipeCapImg = useImage(require('@assets/images/pipecap.png'));
  const bushImg = useImage(require('@assets/images/bushes.png'));
  const birdImg = useImage(require('@assets/images/birdmain.png'));


  const groundTop = CONFIG.screen.floorY;
  const groundThickness = Math.max(0, height - groundTop);
  const groundHeight = useMemo(() => {
    if (!groundImg) return groundThickness;
    return Math.round(groundImg.height() * (width / groundImg.width()));
  }, [groundImg, width]);

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

  // Example dimensions for static demo rendering; size control lives elsewhere
  const demoPipeWidth = useMemo(() => CONFIG.pipe.width, []);
  const demoPipeBodyHeight = useMemo(() => CONFIG.pipe.height, []);

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
      {/* Static example: render a single pipe using pipeCreator; movement/size are controlled elsewhere */}
      {pipeBodyImg && pipeCapImg && pipeCreator({
        x: Math.round(width * 0.2),
        bottomY: groundTop,
        bodyHeight: demoPipeBodyHeight,
        pipeWidth: demoPipeWidth,
        bodyImg: pipeBodyImg,
        capImg: pipeCapImg,
      })}
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
      {birdImg && (
        <AnimatedBird width={width} height={height} groundHeight={groundHeight} birdImg={birdImg} bird={bird} />
      )}
      {/* ...Pipes, Bird, HUD next */}
    </Canvas>
  );
}