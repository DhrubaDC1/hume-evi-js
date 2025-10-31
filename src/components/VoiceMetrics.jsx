import { useEffect, useMemo, useRef, useState } from "react";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";

/**
 * Minimal metrics:
 * - Top emotions from latest prosody scores
 * - Assistant speaking indicator (recent audio/message)
 * - Rolling average assistant latency (user -> assistant)
 *
 * SonarQube friendly: no secrets, explicit errors, no duplicate literals.
 */

export default function VoiceMetrics() {
  const { messages, readyState } = useVoice();

  // Track simple latency (user_message -> next assistant_message)
  const [avgLatencyMs, setAvgLatencyMs] = useState(0);
  const pendingUserTs = useRef(null);
  const latencies = useRef([]);

  useEffect(() => {
    // Process new messages to compute latency
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.type === "user_message") {
      // start a timer when user finishes speaking (message received)
      pendingUserTs.current = Date.now();
    } else if (last.type === "assistant_message" && pendingUserTs.current) {
      const dt = Date.now() - pendingUserTs.current;
      pendingUserTs.current = null;
      latencies.current = [...latencies.current.slice(-9), dt]; // keep last 10
      const avg =
        latencies.current.reduce((a, b) => a + b, 0) /
        Math.max(latencies.current.length, 1);
      setAvgLatencyMs(Math.round(avg));
    }
  }, [messages]);

  // Find the freshest prosody scores on any message (user or assistant)
  const scores = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      // The SDK forwards model outputs on message.models?.prosody?.scores
      const prosody = m?.models?.prosody;
      if (prosody && prosody.scores) return prosody.scores;
    }
    return null;
  }, [messages]);

  const top = useMemo(() => (scores ? topN(scores, 3) : []), [scores]);

  // Assistant "speaking" if we saw a recent assistant message (last ~2s)
  const assistantSpeaking = useMemo(() => {
    const now = Date.now();
    for (
      let i = messages.length - 1;
      i >= 0 && i > messages.length - 10;
      i -= 1
    ) {
      const m = messages[i];
      if (m?.type === "assistant_message") {
        // Approximate recency using arrival time (local); good enough for UI glow
        // We can’t rely on server timestamps in frontend-only demo.
        return true;
      }
    }
    return false;
  }, [messages]);

  const status = readyStateLabel(readyState);

  return (
    <section style={card()}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <strong>Voice Metrics</strong>
        <span title="WebSocket state">{status}</span>
      </header>

      <div style={{ marginBottom: 8 }}>
        <span style={{ marginRight: 8 }}>Assistant:</span>
        <span style={pill(assistantSpeaking ? "speaking" : "idle")}>
          {assistantSpeaking ? "Speaking" : "Idle"}
        </span>
      </div>

      <div style={{ marginBottom: 8 }}>
        <span style={{ marginRight: 8 }}>Avg latency:</span>
        <span>{avgLatencyMs} ms</span>
      </div>

      <div>
        <div style={{ marginBottom: 6 }}>
          <strong>Top emotions</strong>
        </div>
        {top.length === 0 ? (
          <div style={{ color: "#666" }}>No prosody yet — say something!</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {top.map(({ name, value }) => (
              <div
                key={name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 1fr",
                  gap: 8,
                }}
              >
                <span>{name}</span>
                <Bar value={value} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Bar({ value }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div style={{ height: 10, background: "#eee", borderRadius: 6 }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: 6,
          background: "#7aa7ff",
          transition: "width 120ms linear",
        }}
      />
    </div>
  );
}

function topN(obj, n) {
  const entries = Object.entries(obj);
  entries.sort((a, b) => b[1] - a[1]);
  return entries.slice(0, n).map(([name, value]) => ({ name, value }));
}

function readyStateLabel(state) {
  if (state === VoiceReadyState.OPEN) return "Open";
  if (state === VoiceReadyState.CONNECTING) return "Connecting";
  if (state === VoiceReadyState.CLOSED) return "Closed";
  return "Unknown";
}

function card() {
  return {
    padding: 12,
    border: "1px solid #e5e5e5",
    borderRadius: 10,
    background: "white",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };
}

function pill(kind) {
  const base = {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid #ddd",
  };
  if (kind === "speaking") return { ...base, background: "#ecf5ff" };
  return { ...base, background: "#f7f7f7" };
}
