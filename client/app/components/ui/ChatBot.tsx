"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Minimize2 } from "lucide-react";
import api from "@/services/api/axios";

interface Message {
  text: string;
  isUser: boolean;
  time: Date;
  suggestions?: string[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "سلام! به چت‌بات مکمل‌شاپ خوش آمدید. چطور می‌توانم به شما کمک کنم؟\n\n💪 سوالات متداول:\n• راهنمایی محصولات\n• قیمت مکمل‌ها\n• نحوه مصرف\n• تخفیف‌ها و کدها",
      isUser: false,
      time: new Date(),
      suggestions: [
        "راهنمایی محصولات",
        "قیمت مکمل‌ها",
        "نحوه مصرف",
        "تخفیف‌ها",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("chat_session_id");
    if (stored) {
      setSessionId(stored);
    } else {
      const newId = `session_${Date.now()}`;
      setSessionId(newId);
      localStorage.setItem("chat_session_id", newId);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      isUser: true,
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await api.post("/chat/send", {
        message: input,
        sessionId,
      });

      const botMessage: Message = {
        text: response.data.data.response,
        isUser: false,
        time: new Date(),
        suggestions: response.data.data.suggestions || [],
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        text: "متاسفانه در حال حاضر قادر به پاسخگویی نیستم. لطفاً بعداً تلاش کنید یا با پشتیبانی تماس بگیرید.\n\n📞 شماره پشتیبانی: ۰۲۱۱۲۳۴۵۶۷۸۹",
        isUser: false,
        time: new Date(),
        suggestions: ["تماس با پشتیبانی", "محصولات محبوب", "سوال دیگر"],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
      >
        <MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${isMinimized ? "w-72 h-14" : "w-80 sm:w-96 h-[550px]"}`}
    >
      {/* هدر */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <h3 className="font-bold text-sm">پشتیبانی آنلاین</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* پیام‌ها */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[430px]">
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${msg.isUser ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"}`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                    <span className="text-[10px] opacity-70 mt-1 block">
                      {msg.time.toLocaleTimeString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                {/* پیشنهادات */}
                {!msg.isUser &&
                  msg.suggestions &&
                  msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 mr-2">
                      {msg.suggestions.map((suggestion, idx2) => (
                        <button
                          key={idx2}
                          onClick={() => {
                            setInput(suggestion);
                            setTimeout(() => handleSend(), 100);
                          }}
                          className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full hover:bg-blue-500 hover:text-white transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ورودی */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="پیام خود را بنویسید..."
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            />
            <button
              onClick={handleSend}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
