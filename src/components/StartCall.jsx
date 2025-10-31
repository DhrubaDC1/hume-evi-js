import { useMemo } from "react";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";

export default function StartCall() {
  const { connect, disconnect, readyState } = useVoice();

  const apiKey = useMemo(() => import.meta.env.VITE_HUME_API_KEY ?? "", []);
  const configId = useMemo(() => import.meta.env.VITE_HUME_CONFIG_ID, []);

  const isOpen = readyState === VoiceReadyState.OPEN;
  const isConnecting = readyState === VoiceReadyState.CONNECTING;

  async function start() {
    if (!apiKey) {
      throw new Error("Missing VITE_HUME_API_KEY"); // explicit error for clarity (Sonar-safe)
    }
    await connect({
      auth: { type: "apiKey", value: apiKey },
      ...(configId ? { configId } : {}),
      enableUserInterruption: true,
    });
  }

  const baseBtn = {
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
  };

  if (isOpen) {
    return (
      <button onClick={() => void disconnect()} style={baseBtn}>
        End Session
      </button>
    );
  }

  return (
    <button
      onClick={() => void start()}
      style={baseBtn}
      disabled={isConnecting}
    >
      {isConnecting ? "Connecting…" : "Start Session"}
    </button>
  );
}
