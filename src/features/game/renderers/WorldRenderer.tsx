import React, { useEffect, useMemo } from "react";
import { View, useWindowDimensions, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { backgroundGradient } from "@/src/styles/styles";
import { CONFIG } from "@/src/engine/config/settings";
import Animated, { Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Canvas, Image as SkiaImage, useImage, Rect, RadialGradient as SkiaRadialGradient, vec } from "@shopify/react-native-skia";
import CloudSystem from "./CloudsRenderer";

const groundSrc = require("@assets/images/groundnew.png");
const sunSrc = require("@assets/images/sun.png");
const bushesSrc = require("@assets/images/bushes.png");
const citybgSrc = require("@assets/images/citybg.png");


// ---- Helpers -------------------------------------------------
const groundTop = CONFIG.screen.floorY;
const groundH = CONFIG.screen.height - groundTop;
function aspectH(img: ReturnType<typeof useImage> | null, w: number) {
  if (!img) return 0;
  return Math.round(img.height() * (w / img.width()));
}

// ---- Sun Glow (radial gradient) ----------------------------
function SunGlow({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const glowW = Math.round(w * 1.6);
  const glowH = Math.round(h * 1.6);
  const glowX = Math.round(x + (w - glowW) / 2);
  const glowY = Math.round(y + (h - glowH) / 2);
  const cx = glowW / 2;
  const cy = glowH / 2;
  const baseStyle: ViewStyle = {
    position: "absolute",
    left: glowX,
    top: glowY,
    width: glowW,
    height: glowH,
    zIndex: Z_INDEX.SUN_GLOW
  };

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.06, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cx },
      { translateY: cy },
      { scale: pulse.value },
      { translateX: -cx },
      { translateY: -cy },
    ],
  }));

  return (
    <Animated.View
      style={[{ position: "absolute", left: glowX, top: glowY, width: glowW, height: glowH } as ViewStyle, animatedStyle]}
      pointerEvents="none"
    >
      <Canvas style={{ width: glowW, height: glowH } as ViewStyle}>
        <Rect x={0} y={0} width={glowW} height={glowH}>
          <SkiaRadialGradient
            c={vec(cx, cy)}
            r={Math.max(glowW, glowH) / 2}
            colors={["rgba(255, 245, 200, 0.55)", "rgba(255, 245, 200, 0)"]}
            positions={[0.4, 1]}
          />
        </Rect>
      </Canvas>
    </Animated.View>
  );
}



// ---- Bushes -------------------------------------------------
function Bushes({ width }: { width: number }) {
  const bushes = useImage(bushesSrc);
  const h = aspectH(bushes, width);
  const y = groundTop - h;
  if (!bushes) return null;
  return (
    <Canvas style={{ 
      position: "absolute", 
      left: 0, 
      top: y, 
      width, 
      height: h,
      zIndex: Z_INDEX.BUSHES 
    } as ViewStyle}>
      <SkiaImage image={bushes} x={0} y={0} width={width} height={h} fit="contain" />
    </Canvas>
  );
}
// ---- City Background -------------------------------------------------
function CityBackground({ width }: { width: number }) {
  const city = useImage(citybgSrc);
  const h = aspectH(city, width);
  const y = groundTop - h;
  if (!city) return null;
  return (
    <Canvas style={{ 
      position: "absolute", 
      left: 0, 
      top: y, 
      width, 
      height: h,
      zIndex: Z_INDEX.CITY 
    } as ViewStyle}>
      <SkiaImage image={city} x={0} y={0} width={width} height={h} fit="contain" />
    </Canvas>
  );
}
// ---- Z-Index Constants -----------------------------------------
const Z_INDEX = {
  SKY: 0,
  SUN_GLOW: 1,
  SUN: 2,
  CLOUDS: 3,
  CITY: 4,
  BUSHES: 5,
  GROUND: 6,
  // Reserved higher z-indexes for game elements:
  // PIPES: 10
  // BIRD: 15
  // UI_ELEMENTS: 20
  // OVERLAYS: 30
};

// ---- Sky -------------------------------------------------
type SkyProps = {
  width: number;
  height: number;
  position?: "absolute" | "relative";
  top?: number;
  left?: number;
};

function Sky({ width, height, position = "absolute", top = 0, left = 0 }: SkyProps) {
  return (
    <LinearGradient
      style={{ 
        position, 
        top, 
        left, 
        width, 
        height,
        zIndex: Z_INDEX.SKY 
      }}
      colors={[
        backgroundGradient.bgGradientTop,
        backgroundGradient.bgGradientUpperMid,
        backgroundGradient.bgGradientLowerMid,
        backgroundGradient.bgGradientBottom,
      ]}
    />
  );
}

// ---- Sun -------------------------------------------------

type SunProps = {
  width: number;
  height: number;
  position?: "absolute" | "relative";
  top?: number;
  left?: number;
};

function AnimatedSun({ width, height, position = "absolute", top = 0, left = 0 }: SunProps) {
  const containerBaseStyle = useMemo(
    () => ({ 
      position, 
      top, 
      left, 
      width, 
      height,
      zIndex: Z_INDEX.SUN 
    }),
    [position, top, left, width, height]
  );
  const sunImage = useImage(sunSrc);

  // Floating animation using a sinusoidal translateY
  const t = useSharedValue(0);
  const amplitude = Math.max(3, Math.round(height * 0.03));
  const translateY = useDerivedValue(() => Math.sin(t.value * Math.PI * 2) * amplitude, [amplitude]);

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 10000, easing: Easing.linear }), -1);
  }, [t]);
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Removed pulsing; keep only subtle float

  return (
    <Animated.View style={[containerBaseStyle, containerAnimatedStyle]} pointerEvents="none">
      <Canvas style={{ width, height, position: "absolute", top: 0, left: 0 }}>
        {sunImage && (
          <SkiaImage image={sunImage} x={0} y={0} width={width} height={height} fit="contain" />
        )}
      </Canvas>
    </Animated.View>
  );
}

// ---- Ground ----------------------------------------------

function Ground({ width }: { width: number }) {
  const img = useImage(groundSrc);
  if (!img) return null;
  return (
    <Canvas style={{ 
      position: "relative", 
      left: 0, 
      top: groundTop, 
      width, 
      height: groundH, 
      zIndex: Z_INDEX.GROUND 
    } as ViewStyle}>
      <SkiaImage image={img} x={0} y={0} width={width} height={groundH} fit="cover" />
    </Canvas>
  );
}

// ---- WorldRenderer ---------------------------------------

export const WorldRenderer = React.memo(({ moving = false }: { moving?: boolean }) => {
  const { width, height } = useWindowDimensions();
  const sunW = Math.round(width * 0.6);
  const sunH = sunW;
  const sunX = Math.round((width - sunW) / 2);
  const sunY = Math.round(groundTop - sunH * 0.55);

  return (
    <View style={{ position: "absolute", left: 0, top: 0, width, height }} pointerEvents="none">
      <Sky width={width} height={height} />
      {/* radial glow behind the sun */}
      <SunGlow x={sunX} y={sunY} w={sunW} h={sunH} />
      <AnimatedSun width={sunW} height={sunH} left={sunX} top={sunY} />
      <View style={{ position: 'absolute', zIndex: Z_INDEX.CLOUDS }}>
        <CloudSystem
          width={width}
          height={height}
          minY={Math.round(height * 0.06)}
          maxY={Math.round(height * 0.28)}
          maxClouds={7}
          moving={moving}
        />
      </View>
      <CityBackground width={width} />
      <Bushes width={width} />
      <Ground width={width} />
    </View>
  );
});
