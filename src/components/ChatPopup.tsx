import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const ChatPopup = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm MediBot, your AI healthcare assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: allMessages },
      });

      const aiResponse = error ? "Sorry, I encountered an error. Please try again." : (data?.response || "I'm not sure how to respond to that.");
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);

      // Save to DB
      await supabase.from("chats").insert({ user_message: input.trim(), ai_response: aiResponse });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Popup */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-card rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in-up">
          <div className="gradient-primary px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-xl">🤖</div>
            <div>
              <h3 className="text-primary-foreground font-semibold">MediBot AI</h3>
              <p className="text-primary-foreground/80 text-xs">Online • Ready to help</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-primary-foreground/80 hover:text-primary-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm animate-fade-in-up ${
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground ml-auto"
                  : "bg-muted text-foreground border border-border"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-1.5 px-4 py-3 bg-muted rounded-2xl max-w-[80px] border border-border">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary" style={{ animation: `typing 1.4s infinite ease-in-out ${i * 0.2}s` }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your health question..."
              className="flex-1 px-4 py-2.5 rounded-full border border-border bg-background text-foreground text-sm outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full gradient-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPopup;
