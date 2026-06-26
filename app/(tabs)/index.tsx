import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { models, useLLM } from "react-native-executorch";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();
  const llm = useLLM({ model: models.llm.lfm2_5_350m() });
  const [prompt, setPrompt] = useState("Say hello in one short sentence.");

  const handleGenerate = async () => {
    if (!llm.isReady || llm.isGenerating) return;

    await llm.generate([{ role: "user", content: prompt }]);
  };

  return (
    <Pressable
      style={[styles.container, { paddingTop: insets.top }]}
      onPress={() => Keyboard.dismiss()}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>ExecuTorch LLM</Text>
        <Text style={styles.subtitle}>
          The first run downloads the tokenizer and model files.
        </Text>

        {!llm.isReady ? (
          <View style={styles.card}>
            <ActivityIndicator size="small" />
            <Text style={styles.status}>Preparing model</Text>
            {llm.error ? (
              <Text style={styles.error}>{llm.error.message}</Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.status}>Model ready</Text>
            <TextInput
              multiline
              onChangeText={setPrompt}
              placeholder="Ask the model something..."
              style={styles.input}
              value={prompt}
            />
            <Pressable
              disabled={llm.isGenerating}
              onPress={handleGenerate}
              style={[styles.button, llm.isGenerating && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>
                {llm.isGenerating ? "Generating..." : "Generate"}
              </Text>
            </Pressable>
            <Text style={styles.responseLabel}>Response</Text>
            <Text style={styles.responseText}>
              {llm.response || "No response yet."}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#4b5563",
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    backgroundColor: "#f9fafb",
  },
  status: {
    fontSize: 18,
    fontWeight: "600",
  },
  progress: {
    color: "#4b5563",
  },
  error: {
    color: "#b91c1c",
  },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  responseText: {
    color: "#111827",
    lineHeight: 22,
  },
});
