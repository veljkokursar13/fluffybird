//bird renderer
import { Canvas, Image as SkiaImage, useImage } from "@shopify/react-native-skia";
import { Bird } from "../../../engine/entities/bird";
import { ViewStyle } from "react-native";
import { useEffect, useMemo, useState, memo } from "react";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const birdSrc = require("@assets/images/birdmain.png");
const wingsSrcDown = require("@assets/images/wingbottom.png");
const wingsSrcUp = require("@assets/images/wingup.png");
const wingsSrcCenter = require("@assets/images/wingcenterupper.png");

type WingKey = "up" | "down" | "center" | "centerupper";

// Centralized per-sprite layout
const WING_SPRITES: Record<WingKey, { leftMul: number; topMul: number }> = {
  up: { leftMul: 0.06, topMul: 0.40 },
  down: { leftMul: 0.06, topMul: 0.40 },
  center: { leftMul: 0.06, topMul: 0.40 },
  centerupper: { leftMul: 0.06, topMul: 0.40 },
};

type BirdRendererProps = {
  bird: Bird;
  jumpTick: number;
};

const BirdRenderer = memo(({ bird, jumpTick }: BirdRendererProps) => {
  const birdImage = useImage(birdSrc);
  const wingUpImage = useImage(wingsSrcUp);
  const wingDownImage = useImage(wingsSrcDown);
  const wingCenterImage = useImage(wingsSrcCenter);

  const tilt = useSharedValue(0);
  const [wing, setWing] = useState<WingKey>("center");

  // Trigger wing flap animation on each jump
  useEffect(() => {
    if (jumpTick === 0) return;
    setWing("down");
    const t1 = setTimeout(() => setWing("center"), 80);
    const t2 = setTimeout(() => setWing("up"), 160);
    const t3 = setTimeout(() => setWing("center"), 260);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [jumpTick]);

  // Body tilt based on velocity with easing
  useEffect(() => {
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const map = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
      outMin + ((clamp(v, inMin, inMax) - inMin) * (outMax - outMin)) / (inMax - inMin);
    const angle = map(bird.vel.y, -480, 480, -Math.PI / 6, Math.PI / 20);
    tilt.value = withTiming(angle, { duration: 120, easing: Easing.inOut(Easing.cubic) });
  }, [bird.vel.y]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bird.size / 2 },
      { translateY: bird.size / 2 },
      { rotate: `${tilt.value}rad` },
      { translateX: -bird.size / 2 },
      { translateY: -bird.size / 2 },
    ],
  }));

  // Memoize wing image selection and geometry
  const wingImage = useMemo(() => {
    if (wing === "up") return wingUpImage;
    if (wing === "down") return wingDownImage;
    return wingCenterImage;
  }, [wing, wingUpImage, wingDownImage, wingCenterImage]);

  const { wingLeft, wingTop, wingSize } = useMemo(() => {
    const layout = WING_SPRITES[wing];
    const size = Math.round(bird.size * 0.45);
    return {
      wingLeft: Math.round(bird.size * layout.leftMul),
      wingTop: Math.round(bird.size * layout.topMul),
      wingSize: size,
    };
  }, [wing, bird.size]);

  const containerStyle = useMemo(() => ({
    position: "absolute" as const,
    left: bird.pos.x,
    top: bird.pos.y,
    width: bird.size,
    height: bird.size,
    zIndex: 15,
    pointerEvents: "none" as const,
  }), [bird.pos.x, bird.pos.y, bird.size]);

  return (
    <Animated.View style={[containerStyle as ViewStyle, animatedStyle]}>
      <Canvas style={{ width: bird.size, height: bird.size } as ViewStyle}>
        {birdImage && (
          <SkiaImage image={birdImage} x={0} y={0} width={bird.size} height={bird.size} fit="contain" />
        )}
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
});

export default BirdRenderer;
