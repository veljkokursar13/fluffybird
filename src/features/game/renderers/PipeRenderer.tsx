// Pipe rendering logic goes here
import { Canvas, Image as SkiaImage, useImage } from "@shopify/react-native-skia";
import { CONFIG } from "@src/engine/config/settings";
import type { Pipes } from "@src/engine/entities/pipes";
const pipeImage = require("@assets/images/pipebodynew.png");
const capImage = require("@assets/images/pipecapnew.png");

// Placeholder implementation

type PipeRendererProps = {
  pipes: Pipes[];
};

export function PipeRenderer({ pipes }: PipeRendererProps) {
  const cap = useImage(capImage);
  const body = useImage(pipeImage);

  const capHeight = CONFIG.pipe.capHeight;
  const groundY = CONFIG.screen.floorY;

  if (!pipes || pipes.length === 0) return null;

  return (
    <>
      {pipes.map((pipe, idx) => {
        const baseWidth = pipe.width ?? CONFIG.pipe.width;
        const scale = 0.5; // make pipe narrower
        const width = Math.max(1, Math.round(baseWidth * scale));
        const bodyHeight = pipe.height ?? CONFIG.pipe.height;

        // Cap tweaks per pipe
        const adjustedCapH = Math.max(1, Math.round(capHeight * 0.8));
        const adjustedCapW = Math.max(1, Math.round(width * 1.2));
        const seamOverlap = 1; // overlap body with cap by 1px to avoid gaps

        // Align canvas bottom to ground, and cap on top of body
        const left = Math.round(pipe.pos.x + (baseWidth - width) / 2);
        const top = Math.round(groundY - (bodyHeight + adjustedCapH));
        const canvasH = bodyHeight + adjustedCapH;

        return (
          <Canvas
            key={idx}
            style={{
              position: "absolute",
              left,
              top,
              width,
              height: canvasH,
              zIndex: 9,
              pointerEvents: "none",
            }}
          >
            {body && (
              <SkiaImage
                image={body}
                x={0}
                y={adjustedCapH - seamOverlap}
                width={width}
                height={bodyHeight + seamOverlap}
                fit="fill"
              />
            )}
            {cap && (
              <SkiaImage
                image={cap}
                x={-Math.round((adjustedCapW - width) / 2)}
                y={0}
                width={adjustedCapW}
                height={adjustedCapH}
                fit="fill"
              />
            )}
          </Canvas>
        );
      })}
    </>
  );
}