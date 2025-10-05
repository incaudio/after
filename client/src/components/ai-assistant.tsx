import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AIAssistant({ onCommand }: { onCommand: (cmd: string) => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { role: "assistant", content: data.reply }]);
      if (data.action) onCommand(data.action);
    } catch (e) {
      setMessages((msgs) => [...msgs, { role: "assistant", content: "Sorry, something went wrong." }]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-full bg-white/90 rounded-xl shadow-lg p-4 z-50">
      <div className="h-48 overflow-y-auto mb-2 text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left text-blue-700"}>
            <span className="block mb-1">{msg.content}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask AI to control the app..."
          disabled={loading}
        />
        <Button onClick={send} disabled={loading || !input.trim()}>Send</Button>
      </div>
    </div>
  );
}
