//bird renderer
import { Canvas, Image as SkiaImage, useImage } from   "@shopify/react-native-skia";
import { Bird, } from "../../../engine/entities/bird";
import { ViewStyle } from "react-native";
import { useEffect, useState } from "react";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

const birdSrc = require("@assets/images/birdmain.png");
const wingsSrcDown = require("@assets/images/wingbottom.png");
const wingsSrcUp = require("@assets/images/wingup.png");
const wingsSrcCenter = require("@assets/images/wingcenterupper.png");

type WingKey = "up" | "down" | "center" | "centerupper";

// Centralized per-sprite layout; using the same positions/pivots for all
const WING_SPRITES: Record<WingKey, { src: any; leftMul: number; topMul: number; pivotXMul: number; pivotYMul: number }> = {
  up: { src: wingsSrcUp, leftMul: 0.12, topMul: 0.32, pivotXMul: 0.3, pivotYMul: 0.5 },
  down: { src: wingsSrcDown, leftMul: 0.12, topMul: 0.32, pivotXMul: 0.3, pivotYMul: 0.5 },
  center: { src: wingsSrcCenter, leftMul: 0.12, topMul: 0.32, pivotXMul: 0.3, pivotYMul: 0.5 },
  centerupper: { src: wingsSrcCenter, leftMul: 0.12, topMul: 0.32, pivotXMul: 0.3, pivotYMul: 0.5 }, // use center-upper sprite
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
  const pivotX = Math.round(wingSize * wingCfg.pivotXMul);
  const pivotY = Math.round(wingSize * wingCfg.pivotYMul);

  const wingRot = useSharedValue(0);
  useEffect(() => {
    // On flap: animate wing states: down -> center -> centerupper -> up, then back to center (rest)
    setWing("down");
    wingRot.value = withSequence(
      withTiming(0.35, { duration: 90, easing: Easing.out(Easing.cubic) }),   // down-ish
      withTiming(0.1, { duration: 80, easing: Easing.inOut(Easing.cubic) }),  // center
      withTiming(-0.2, { duration: 80, easing: Easing.inOut(Easing.cubic) }), // centerupper
      withTiming(-0.5, { duration: 90, easing: Easing.in(Easing.cubic) }),    // up
      withTiming(0, { duration: 150, easing: Easing.inOut(Easing.cubic) })    // settle to neutral
    );
    const t1 = setTimeout(() => setWing("center"), 100);
    const t2 = setTimeout(() => setWing("centerupper"), 180);
    const t3 = setTimeout(() => setWing("up"), 260);
    const t4 = setTimeout(() => setWing("center"), 420); // return to normal

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, [flapTick, wingRot]);

  const wingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pivotX },
      { translateY: pivotY },
      { rotate: `${wingRot.value}rad` },
      { translateX: -pivotX },
      { translateY: -pivotY },
    ],
  }));

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
        } as ViewStyle, wingStyle]}>
          <Canvas style={{ width: wingSize, height: wingSize } as ViewStyle}>
            <SkiaImage image={wingImage} x={0} y={0} width={wingSize} height={wingSize} fit="contain" />
          </Canvas>
        </Animated.View>
      )}
    </Animated.View>
  );
}


