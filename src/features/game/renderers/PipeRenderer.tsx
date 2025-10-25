// Pipe rendering logic goes here
import React from "react";
import { Canvas, Image as SkiaImage, useImage, Rect, Group } from "@shopify/react-native-skia";
import { CONFIG } from "@src/engine/config/settings";
import type { PipePair } from "@src/engine/entities/pipes";

const pipeImage = require("@assets/images/pipebody.png");
const capImage = require("@assets/images/pipecapnewnew.png");
 
// Placeholder implementation 

type PipeRendererProps = {
  pipes: PipePair[];
};

export function PipeRenderer({ pipes }: PipeRendererProps) {
  const cap = useImage(capImage);
  const body = useImage(pipeImage);

  // Guard against invalid config values and clamp to sane ranges
  const rawCapH = Number(CONFIG.pipe.pipeCapHeight);
  const rawCapW = Number(CONFIG.pipe.pipeCapWidth);
  const defaultCapH = Math.round(Math.max(1, (CONFIG.pipe.width ?? 50) * 0.2));
  const defaultCapW = Math.max(1, CONFIG.pipe.width ?? 80);
  const pipeCapHeight = Number.isFinite(rawCapH) && rawCapH > 0 ? rawCapH : defaultCapH;
  const pipeCapWidth = Number.isFinite(rawCapW) && rawCapW > 0 ? rawCapW : defaultCapW;
  const groundY = CONFIG.screen.floorY;

  if (!pipes || pipes.length === 0) return null;

  const renderPipe = (pipe: { pos: { x: number; y: number }; width: number; height: number }, isTop: boolean, pairIdx: number, key: string) => {
    const width = Math.max(1, Math.round(pipe.width));
    const bodyHeight = pipe.height;

    // Clamp cap sizes relative to body width
    // Clamp relative to body to avoid visual popping on different assets
    const capWClamped = Math.round(Math.max(width, Math.min(width * 1.25, pipeCapWidth)));
    const capHClamped = Math.round(Math.max(width * 0.3, Math.min(width * 0.9, pipeCapHeight)));

    // Final sizes used for rendering
    const adjustedCapW = capWClamped;
    const adjustedCapH = capHClamped;
    const seamOverlap = 2; // slightly larger overlap to avoid seam gaps during scaling

    // Compute canvas width large enough to hold widest of body/cap, and center elements inside
    const canvasW = Math.max(width, adjustedCapW);
    const bodyX = Math.round((canvasW - width) / 2);
    const capX = Math.round((canvasW - adjustedCapW) / 2);

    // Position canvas
    const canvasLeft = pipe.pos.x - Math.round((canvasW - width) / 2);
    const canvasH = bodyHeight + adjustedCapH;
    const canvasTop = isTop ? pipe.pos.y : pipe.pos.y - adjustedCapH;

    return (
      <Canvas
        key={key}
        style={{
          position: "absolute",
          left: canvasLeft,
          top: canvasTop,
          width: canvasW,
          height: canvasH,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {/* Pipe body - use image or fallback rect */}
        {body ? (
          <SkiaImage
            image={body}
            x={bodyX}
            y={isTop ? 0 : adjustedCapH - seamOverlap}
            width={width}
            height={bodyHeight + seamOverlap}
            fit="fill"
          />
        ) : (
          <Rect
            x={bodyX}
            y={isTop ? 0 : adjustedCapH - seamOverlap}
            width={width}
            height={bodyHeight + seamOverlap}
            color="#3fa34d"
          />
        )}
        {/* Cap rendering with rotation for top pipes */}
        <Group
          transform={isTop ? [{ translateX: capX + adjustedCapW / 2 }, { translateY: (isTop ? bodyHeight : 0) + adjustedCapH / 2 }, { rotate: Math.PI }, { translateX: -(capX + adjustedCapW / 2) }, { translateY: -((isTop ? bodyHeight : 0) + adjustedCapH / 2) }] : []}
        >
          {cap ? (
            <SkiaImage
              image={cap}
              x={capX}
              y={isTop ? bodyHeight : 0}
              width={adjustedCapW}
              height={adjustedCapH}
              fit="fill"
            />
          ) : (
            <Rect
              x={capX}
              y={isTop ? bodyHeight : 0}
              width={adjustedCapW}
              height={adjustedCapH}
              color="#2e7d32"
            />
          )}
        </Group>
      </Canvas>
    );
  };

  return (
    <>
      {pipes.map((pair, pairIdx) => (
        <React.Fragment key={pair.id ?? pairIdx}>
          {renderPipe(pair.bottom, false, pairIdx, `bottom-${pair.id ?? pairIdx}`)}
          {renderPipe(pair.top, true, pairIdx, `top-${pair.id ?? pairIdx}`)}
        </React.Fragment>
      ))}
    </>
  );
}