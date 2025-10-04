import { Group, Image as SkImage, useImage } from "@shopify/react-native-skia";

type PipeSpriteProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: "top" | "bottom";
  capThickness?: number;
  capOverhang?: number;
  bodySrc?: number; // require('@assets/...') result
  capSrc?: number;  // require('@assets/...') result
};

export default function PipeSprite({
  x,
  y,
  width,
  height,
  orientation,
  capThickness = 48,
  capOverhang = 12,
  bodySrc,
  capSrc,
}: PipeSpriteProps) {
  const bodyImg = useImage(bodySrc ?? require("@assets/images/pipebody.png"));
  const capImg = useImage(capSrc ?? require("@assets/images/pipecap.png"));
  if (!bodyImg || !capImg) return null;

  // Body rect
  const bodyX = x;
  const bodyY = orientation === "bottom" ? y - height : y;
  const bodyW = width;
  const bodyH = height;

  // Cap rect (fixed thickness, optional horizontal overhang)
  const capW = width + capOverhang * 2;
  const capH = capThickness;
  const capX = x - capOverhang;
  // Place the cap at the top edge of the pipe body
  // bottom: cap aligns with the body's top (at bodyY)
  // top: cap aligns with the body's bottom (at y + height)
  const capY = orientation === "bottom" ? bodyY : y + height;

  return (
    <Group>
      <SkImage image={bodyImg} x={bodyX} y={bodyY} width={bodyW} height={bodyH} />
      <SkImage image={capImg} x={capX} y={capY} width={capW} height={capH} />
    </Group>
  );
}