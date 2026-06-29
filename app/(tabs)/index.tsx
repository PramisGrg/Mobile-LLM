import { useState, useCallback } from "react";
import { StyleSheet, View, Text } from "react-native";
import {
  Camera,
  Frame,
  useCameraDevices,
  useCameraPermission,
  useFrameOutput,
} from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";
import {
  Detection,
  useObjectDetection,
  SSDLITE_320_MOBILENET_V3_LARGE,
} from "react-native-executorch";

export default function TabOneScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === "back");

  const model = useObjectDetection({ model: SSDLITE_320_MOBILENET_V3_LARGE });
  const [detections, setDetections] = useState<Detection[]>([]);

  const detRof = model.runOnFrame;

  const updateDetections = useCallback((results: Detection[]) => {
    setDetections(results);
  }, []);

  const frameOutput = useFrameOutput({
    pixelFormat: "rgb",
    dropFramesWhileBusy: true,
    onFrame: useCallback(
      (frame: Frame) => {
        "worklet";
        try {
          if (!detRof) return;
          const result = detRof(frame, false);
          if (result) {
            scheduleOnRN(updateDetections, result);
          }
        } finally {
          frame.dispose();
        }
      },
      [detRof, updateDetections],
    ),
  });

  if (!hasPermission) {
    requestPermission();
    return null;
  }
  if (!device) return null;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        outputs={[frameOutput]}
        isActive
        orientationSource="device"
      />
      {detections.map((det, i) => (
        <Text key={i} style={styles.label}>
          {det.label} {(det.score * 100).toFixed(1)}%
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    color: "white",
    fontSize: 16,
  },
});
