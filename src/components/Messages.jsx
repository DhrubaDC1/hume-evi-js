import { useVoice } from "@humeai/voice-react";

export default function Messages() {
  const { messages } = useVoice();
  const row = { display: "flex", alignItems: "baseline" };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {messages
        .filter(
          (m) => m.type === "user_message" || m.type === "assistant_message"
        )
        .map((m, i) => (
          <div key={`${m.type}-${i}`} style={row}>
            <strong>{m.type === "user_message" ? "You" : "Assistant"}:</strong>
            <span style={{ marginLeft: 6 }}>{m.message.content}</span>
          </div>
        ))}
    </section>
  );
}
