import { VoiceProvider } from "@humeai/voice-react";
import StartCall from "./components/StartCall.jsx";
import Messages from "./components/Messages.jsx";
import VoiceMetrics from "./components/VoiceMetrics.jsx";

export default function App() {
  return (
    <main
      style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}
    >
      <h1>🎙️ Hume EVI — Frontend-only (JS)</h1>
      <p style={{ color: "#666", marginTop: -6 }}>
        Demo-only — API key is in the browser. Use a backend + access tokens for
        production.
      </p>
      <VoiceProvider>
        <StartCall />
        <VoiceMetrics />
        <Messages />
      </VoiceProvider>
    </main>
  );
}
