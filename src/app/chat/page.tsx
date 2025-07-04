"use client";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Message {
  sender: "user" | "ai";
  content: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const userMessage = { sender: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      // Placeholder: Replace with actual API call
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "ai", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "ai", content: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-black items-center justify-center">
      <div className="w-full max-w-xl flex flex-col flex-1 border border-black rounded-lg shadow-lg bg-white overflow-hidden mt-8 mb-8" style={{ height: "70vh" }}>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-base">
          {messages.length === 0 && (
            <div className="text-center text-gray-400">Start the conversation...</div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-lg border ${msg.sender === "user" ? "bg-black text-white border-black" : "bg-white text-black border-black"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex border-t border-black">
          <input
            className="flex-1 px-4 py-3 font-mono bg-white text-black outline-none"
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 font-mono border-l border-black bg-black text-white hover:bg-white hover:text-black transition disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>
        {loading && (
          <div className="text-center py-2 text-gray-400 font-mono text-sm">AI is thinking...</div>
        )}
      </div>
    </div>
  );
} 