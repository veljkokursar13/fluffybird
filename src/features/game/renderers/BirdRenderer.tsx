//bird renderer
import { Canvas, Image as SkiaImage, useImage } from   "@shopify/react-native-skia";
import { Bird, } from "../../../engine/entities/bird";
import { ViewStyle } from "react-native";
import { useEffect, useState } from "react";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const birdSrc = require("@assets/images/birdmain.png");
const wingsSrcDown = require("@assets/images/wingbottom.png");
const wingsSrcUp = require("@assets/images/wingup.png");
const wingsSrcCenter = require("@assets/images/wingcenterupper.png");

type WingKey = "up" | "down" | "center" | "centerupper";

// Centralized per-sprite layout; using the same positions/pivots for all
const WING_SPRITES: Record<WingKey, { src: any; leftMul: number; topMul: number; pivotXMul: number; pivotYMul: number }> = {
  up: { src: wingsSrcUp, leftMul: 0.06, topMul: 0.40, pivotXMul: 0.3, pivotYMul: 0.5 },
  down: { src: wingsSrcDown, leftMul: 0.06, topMul: 0.40, pivotXMul: 0.3, pivotYMul: 0.5 },
  center: { src: wingsSrcCenter, leftMul: 0.06, topMul: 0.40, pivotXMul: 0.3, pivotYMul: 0.5 },
  centerupper: { src: wingsSrcCenter, leftMul: 0.06, topMul: 0.40, pivotXMul: 0.3, pivotYMul: 0.5 },
};

export default function BirdRenderer({ bird, flapTick }: { bird: Bird; flapTick: number }) {
  const birdImage = useImage(birdSrc);
  // Body tilt based on vertical velocity for a more natural feel
  const tilt = useSharedValue(0);

  // Map velocity to angle in radians: fast up => tilt up; falling => tilt down
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const map = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
    outMin + ((clamp(v, inMin, inMax) - inMin) * (outMax - outMin)) / (inMax - inMin);

  // Smoothly follow velocity changes
  useEffect(() => {
    const angle = map(bird.vel.y, -480, 480, -Math.PI / 6, Math.PI / 12); // -30deg to +15deg
    tilt.value = withTiming(angle, { duration: 120, easing: Easing.inOut(Easing.cubic) });
  }, [bird.vel.y, tilt]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bird.size / 2 },
      { translateY: bird.size / 2 },
      { rotate: `${tilt.value}rad` },
      { translateX: -bird.size / 2 },
      { translateY: -bird.size / 2 },
    ],
  }));

  // Simple wings: render inside the bird container so they inherit the body tilt.
  const [wing, setWing] = useState<WingKey>("center");
  const wingCfg = WING_SPRITES[wing];
  const wingImage = useImage(wingCfg.src);
  const wingSize = Math.round(bird.size * 0.5);
  const wingLeft = Math.round(bird.size * wingCfg.leftMul);
  const wingTop = Math.round(bird.size * wingCfg.topMul);
  // Simple wing frame loop on tap: down -> center -> up -> center
  useEffect(() => {
    setWing("down");
    const t1 = setTimeout(() => setWing("center"), 80);
    const t2 = setTimeout(() => setWing("up"), 160);
    const t3 = setTimeout(() => setWing("center"), 260);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [flapTick]);

  return (
    <Animated.View style={[{ 
      position: "absolute", 
      left: bird.pos.x, 
      top: bird.pos.y, 
      width: bird.size, 
      height: bird.size,
      zIndex: 15,
      pointerEvents: "none",
    } as ViewStyle, animatedStyle]}>
      <Canvas style={{ width: bird.size, height: bird.size } as ViewStyle}>
        <SkiaImage image={birdImage} x={0} y={0} width={bird.size} height={bird.size} fit="contain" />
      </Canvas>
      {wingImage && (
        <Animated.View style={[{
          position: "absolute",
          left: wingLeft,
          top: wingTop,
          width: wingSize,
          height: wingSize,
        } as ViewStyle]}>
          <Canvas style={{ width: wingSize, height: wingSize } as ViewStyle}>
            <SkiaImage image={wingImage} x={0} y={0} width={wingSize} height={wingSize} fit="contain" />
          </Canvas>
        </Animated.View>
      )}
    </Animated.View>
  );
}


