import {
  Blur,
  Canvas,
  Circle,
  Group,
  RadialGradient,
  vec,
} from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const CX = width / 2;
const CY = height / 2;

export default function AuroraOrb() {
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true,
    );
    rotation.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 8000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  // Core orb breathes between r=90 and r=120
  const coreR = useDerivedValue(() => 90 + progress.value * 30);

  // Outer glow breathes opposite phase
  const glowR = useDerivedValue(() => 160 - progress.value * 20);

  // Satellite orb 1 orbits at radius 80
  const sat1X = useDerivedValue(() => CX + Math.cos(rotation.value) * 80);
  const sat1Y = useDerivedValue(() => CY + Math.sin(rotation.value) * 80);

  // Satellite orb 2 orbits opposite
  const sat2X = useDerivedValue(
    () => CX + Math.cos(rotation.value + Math.PI) * 60,
  );
  const sat2Y = useDerivedValue(
    () => CY + Math.sin(rotation.value + Math.PI) * 60,
  );

  // Opacity of satellites pulses
  const satOpacity = useDerivedValue(() => 0.4 + progress.value * 0.4);

  const coreCenter = useDerivedValue(() => vec(CX, CY));
  const sat1Center = useDerivedValue(() => vec(sat1X.value, sat1Y.value));
  const sat2Center = useDerivedValue(() => vec(sat2X.value, sat2Y.value));

  return (
    <View style={styles.container}>
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Outer ambient glow */}
        <Group>
          <Circle cx={CX} cy={CY} r={glowR}>
            <RadialGradient
              c={coreCenter}
              r={glowR}
              colors={["#7c3aed40", "#4f46e510", "#00000000"]}
            />
            <Blur blur={30} />
          </Circle>
        </Group>

        {/* Satellite 2 — teal */}
        <Group opacity={satOpacity}>
          <Circle cx={sat2X} cy={sat2Y} r={28}>
            <RadialGradient
              c={sat2Center}
              r={28}
              colors={["#2dd4bf", "#0d948880"]}
            />
            <Blur blur={10} />
          </Circle>
        </Group>

        {/* Satellite 1 — indigo */}
        <Group opacity={satOpacity}>
          <Circle cx={sat1X} cy={sat1Y} r={36}>
            <RadialGradient
              c={sat1Center}
              r={36}
              colors={["#818cf8", "#4f46e580"]}
            />
            <Blur blur={12} />
          </Circle>
        </Group>

        {/* Core orb */}
        <Circle cx={CX} cy={CY} r={coreR}>
          <RadialGradient
            c={coreCenter}
            r={coreR}
            colors={["#ffffff", "#a78bfa", "#6d28d9"]}
          />
        </Circle>

        {/* Core inner highlight */}
        <Circle cx={CX - 24} cy={CY - 24} r={28} opacity={0.35}>
          <RadialGradient
            c={vec(CX - 24, CY - 24)}
            r={28}
            colors={["#ffffff", "#ffffff00"]}
          />
        </Circle>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a14",
  },
});
