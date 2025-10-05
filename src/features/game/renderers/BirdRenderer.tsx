import React, { useEffect, useState } from "react";
import { Image as SkImage, useImage } from "@shopify/react-native-skia";
import type { Bird } from "../../../engine/types";
import { useGameStore } from "../../../store/gameStore";

type BirdRendererProps = {
  bird: Bird;
};

export default function BirdRenderer({ bird }: BirdRendererProps) {
  const flapTick = useGameStore((s) => s.flapTick);
  const birdImg = useImage(require("@assets/images/birdmain.png"));
  const wingUpImg = useImage(require("@assets/images/wingup.png"));
  const wingCenterUpperImg = useImage(require("@assets/images/wingcenterupper.png"));
  const wingCenterLowerImg = useImage(require("@assets/images/wingcenterlower.png"));
  const wingBottomImg = useImage(require("@assets/images/wingbottom.png"));

  if (!birdImg) return null;

  const [currentWing, setCurrentWing] = useState<
    "centerUpper" | "up" | "centerLower" | "bottom"
  >("centerUpper");

  useEffect(() => {
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
    const resetId = setTimeout(() => setCurrentWing("centerUpper"), sequence.length * frameMs) as unknown as number;
    timeouts.push(resetId);
    return () => {
      timeouts.forEach((id) => clearTimeout(id));
    };
  }, [flapTick]);

  const diameter = Math.max(1, Math.round(bird.r * 2));
  const drawW = diameter;
  const drawH = diameter;

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
    wingHeight = Math.round(chosenWingImg.height() * (wingWidth / chosenWingImg.width()));
  }

  const wingX = bird.pos.x - wingWidth * 0.55;
  const wingY = bird.pos.y - wingHeight * 0.1;

  return (
    <>
      <SkImage image={birdImg} x={bird.pos.x - drawW / 2} y={bird.pos.y - drawH / 2} width={drawW} height={drawH} />
      {chosenWingImg && (
        <SkImage image={chosenWingImg} x={wingX} y={wingY} width={wingWidth} height={wingHeight} />
      )}
    </>
  );
}
