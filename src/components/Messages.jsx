import { useVoice } from "@humeai/voice-react";

export default function Messages() {
  const { messages } = useVoice();

  const container = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 10,
  };

  return (
    <section style={container}>
      {messages
        .filter(
          (m) => m.type === "user_message" || m.type === "assistant_message"
        )
        .map((m, i) => (
          <MessageItem key={`${m.type}-${i}`} m={m} />
        ))}
    </section>
  );
}

function MessageItem({ m }) {
  const role = m.type === "user_message" ? "You" : "Assistant";
  const content = m?.message?.content || "";
  const scores = m?.models?.prosody?.scores || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <strong>{role}:</strong>
        <span style={{ marginLeft: 6 }}>{content}</span>
      </div>
      {scores && <TopEmotionsRow scores={scores} />}
    </div>
  );
}

function TopEmotionsRow({ scores }) {
  const top3 = getTopN(scores, 3);
  if (top3.length === 0) return null;

  const row = {
    display: "flex",
    justifyContent: "space-between", // evenly distribute 3 items
    alignItems: "center",
    gap: 8,
    background: "#fafafa",
    borderRadius: 8,
    padding: "6px 10px",
    border: "1px solid #e5e5e5",
    fontSize: 12,
    overflowX: "auto",
  };

  return (
    <div style={row}>
      {top3.map(({ name, value }) => (
        <EmotionBar key={name} name={name} value={value} />
      ))}
    </div>
  );
}

function EmotionBar({ name, value }) {
  const pct = clamp01(value) * 100;
  const color = colorFor(name);

  const col = {
    width: "33%", // each takes exactly one-third of row
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  };

  const barOuter = {
    width: "100%",
    height: 8,
    background: "#eee",
    borderRadius: 4,
    overflow: "hidden",
  };

  const barInner = {
    width: `${pct}%`,
    height: "100%",
    background: color,
    borderRadius: 4,
    transition: "width 0.2s linear",
  };

  return (
    <div style={col}>
      <span style={{ fontSize: 11 }}>{name}</span>
      <div style={barOuter}>
        <div style={barInner} />
      </div>
      <span style={{ fontSize: 10 }}>{Math.round(pct)}%</span>
    </div>
  );
}

/* -------- Utilities (SonarQube-friendly) -------- */
function getTopN(scores, n) {
  const entries = Object.entries(scores || {});
  entries.sort((a, b) => b[1] - a[1]);
  return entries.slice(0, n).map(([name, value]) => ({ name, value }));
}

function clamp01(x) {
  if (typeof x !== "number") return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function colorFor(name) {
  const key = String(name || "").toLowerCase();
  // Friendly defaults with sensible fallbacks (no duplicate literals)
  const palette = {
    joy: "#f6c945",
    happy: "#f6c945",
    excitement: "#f6c945",
    calm: "#7aa7ff",
    relaxed: "#7aa7ff",
    serenity: "#7aa7ff",
    anger: "#ff7a7a",
    annoyance: "#ff7a7a",
    frustration: "#ff7a7a",
    sadness: "#8aa0ff",
    sorrow: "#8aa0ff",
    fear: "#9e7cff",
    disgust: "#88cc99",
    surprise: "#ffb86c",
    confusion: "#b0b0b0",
  };
  return palette[key] || "#7aa7ff"; // default cool blue
}
