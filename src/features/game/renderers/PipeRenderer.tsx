// Pipe rendering logic goes here
import React, { useState, useEffect, useRef } from "react";
import { Canvas, Image as SkiaImage, useImage, Rect, Group } from "@shopify/react-native-skia";
import { CONFIG } from "@src/engine/config/settings";
import type { PipePair } from "@src/engine/entities/pipes";
import { useGameStore } from "@src/store/gameStore";

const pipeImage = require("@assets/images/pipebody.png");
const capImage = require("@assets/images/pipecapnewnew.png");

type PipeRendererProps = {
  pipes: PipePair[];
};

export const PipeRenderer = React.memo(({ pipes: initialPipes }: PipeRendererProps) => {
  const cap = useImage(capImage);
  const body = useImage(pipeImage);
  const [pipes, setPipes] = useState(initialPipes);
  const rafRef = useRef<number | undefined>(undefined);
  
  // Use RAF to update pipes smoothly without causing parent re-renders
  useEffect(() => {
    const updatePipes = () => {
      const currentPipes = useGameStore.getState().pipes;
      const gameState = useGameStore.getState().gameState;
      setPipes(gameState === 'playing' ? currentPipes : []);
      rafRef.current = requestAnimationFrame(updatePipes);
    };
    
    rafRef.current = requestAnimationFrame(updatePipes);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Guard against invalid config values and clamp to sane ranges
  const rawCapH = Number(CONFIG.pipe.pipeCapHeight);
  const rawCapW = Number(CONFIG.pipe.pipeCapWidth);
  const defaultCapH = Math.round(Math.max(1, (CONFIG.pipe.width ?? 50) * 0.2));
  const defaultCapW = Math.max(1, CONFIG.pipe.width ?? 80);
  const pipeCapHeight = Number.isFinite(rawCapH) && rawCapH > 0 ? rawCapH : defaultCapH;
  const pipeCapWidth = Number.isFinite(rawCapW) && rawCapW > 0 ? rawCapW : defaultCapW;

  if (!pipes || pipes.length === 0) return null;

  // Calculate dimensions once
  const seamOverlap = 2;

  return (
    <Canvas
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: CONFIG.screen.width,
        height: CONFIG.screen.height,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {pipes.map((pair) => {
        const width = Math.max(1, Math.round(pair.bottom.width));
        const capWClamped = Math.round(Math.max(width, Math.min(width * 1.25, pipeCapWidth)));
        const capHClamped = Math.round(Math.max(width * 0.3, Math.min(width * 0.9, pipeCapHeight)));

        return (
          <React.Fragment key={pair.id}>
            {/* Bottom pipe body */}
            {body ? (
              <SkiaImage
                image={body}
                x={pair.bottom.pos.x}
                y={pair.bottom.pos.y}
                width={width}
                height={pair.bottom.height}
                fit="fill"
              />
            ) : (
              <Rect
                x={pair.bottom.pos.x}
                y={pair.bottom.pos.y}
                width={width}
                height={pair.bottom.height}
                color="#3fa34d"
              />
            )}
            
            {/* Bottom pipe cap */}
            {cap ? (
              <SkiaImage
                image={cap}
                x={pair.bottom.pos.x + (width - capWClamped) / 2}
                y={pair.bottom.pos.y - capHClamped + seamOverlap}
                width={capWClamped}
                height={capHClamped}
                fit="fill"
              />
            ) : (
              <Rect
                x={pair.bottom.pos.x + (width - capWClamped) / 2}
                y={pair.bottom.pos.y - capHClamped + seamOverlap}
                width={capWClamped}
                height={capHClamped}
                color="#2e7d32"
              />
            )}

            {/* Top pipe body */}
            {body ? (
              <SkiaImage
                image={body}
                x={pair.top.pos.x}
                y={pair.top.pos.y}
                width={width}
                height={pair.top.height}
                fit="fill"
              />
            ) : (
              <Rect
                x={pair.top.pos.x}
                y={pair.top.pos.y}
                width={width}
                height={pair.top.height}
                color="#3fa34d"
              />
            )}

            {/* Top pipe cap (rotated) */}
            <Group
              transform={[
                { translateX: pair.top.pos.x + width / 2 },
                { translateY: pair.top.height + capHClamped / 2 },
                { rotate: Math.PI },
                { translateX: -(pair.top.pos.x + width / 2) },
                { translateY: -(pair.top.height + capHClamped / 2) }
              ]}
            >
              {cap ? (
                <SkiaImage
                  image={cap}
                  x={pair.top.pos.x + (width - capWClamped) / 2}
                  y={pair.top.height + seamOverlap}
                  width={capWClamped}
                  height={capHClamped}
                  fit="fill"
                />
              ) : (
                <Rect
                  x={pair.top.pos.x + (width - capWClamped) / 2}
                  y={pair.top.height + seamOverlap}
                  width={capWClamped}
                  height={capHClamped}
                  color="#2e7d32"
                />
              )}
            </Group>
          </React.Fragment>
        );
      })}
    </Canvas>
  );
});