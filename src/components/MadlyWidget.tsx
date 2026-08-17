import React, { useEffect, useRef, useState } from "react";
import "./Madly.css";
import { GROQ_API_KEY, GROQ_API_URL, MODELS } from "./config";
import { getSystemPrompt } from "./systemPrompt";

type Role = "user" | "assistant" | "system";

interface ChatMessage {
  role: Role;
  content: string | unknown;
}

interface DisplayMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  imageDataUrl?: string | null;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `msg-${idCounter}`;
}

export default function MadlyWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: nextId(),
      role: "ai",
      text: "أنا مادلي مساعدك الذكي خلال المختبر.\n\nI'm Madly, your AI assistant during the lab.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceLang, setVoiceLang] = useState("ar-JO");
  const [recognizing, setRecognizing] = useState(false);
  const [micSupported, setMicSupported] = useState(true);

  const historyRef = useRef<ChatMessage[]>([]);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping, open]);

  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = voiceLang;

    recognition.onstart = () => setRecognizing(true);
    recognition.onend = () => setRecognizing(false);
    recognition.onerror = () => setRecognizing(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = voiceLang;
    }
  }, [voiceLang]);

  function toggleVoiceLang() {
    setVoiceLang((prev) => (prev.startsWith("ar") ? "en-US" : "ar-JO"));
  }

  function toggleMic() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (recognizing) {
      recognition.stop();
      return;
    }
    recognition.lang = voiceLang;
    try {
      recognition.start();
    } catch {
      // already started
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة / Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeImagePreview() {
    setSelectedImageDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function sendMessage() {
    const text = inputValue.trim();
    const imageDataUrl = selectedImageDataUrl;
    if (!text && !imageDataUrl) return;

    const userLang = text.match(/[\u0600-\u06FF]/) ? "ar" : "en";

    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text, imageDataUrl },
    ]);

    let apiUserContent: unknown;
    if (imageDataUrl) {
      apiUserContent = [
        { type: "text", text: text || (userLang === "ar" ? "صف هذه الصورة" : "Describe this image") },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ];
    } else {
      apiUserContent = text;
    }

    historyRef.current.push({
      role: "user",
      content: text || (userLang === "ar" ? "[صورة مرفقة]" : "[attached image]"),
    });

    setInputValue("");
    setSelectedImageDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsSending(true);
    setIsTyping(true);

    try {
      const priorHistory = historyRef.current.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const apiMessages = [
        { role: "system", content: getSystemPrompt(userLang as "ar" | "en") },
        ...priorHistory,
        { role: "user", content: apiUserContent },
      ];

      const model = imageDataUrl ? MODELS.vision : MODELS.text;

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as any)?.error?.message || `Error ${response.status}`);
      }

      const data = await response.json();
      const replyText: string = (data as any)?.choices?.[0]?.message?.content || "";

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "ai",
          text: replyText || (userLang === "ar" ? "عذراً، لم أحصل على رد." : "Sorry, I didn't get a response."),
        },
      ]);
      historyRef.current.push({ role: "assistant", content: replyText });
    } catch (err) {
      setIsTyping(false);
      const message = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [...prev, { id: nextId(), role: "ai", text: `خطأ: ${message}` }]);
      console.error("Error:", err);
    } finally {
      setIsSending(false);
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open Madly assistant"
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(90deg, #ff4fa3, #9b4ff0)",
          color: "#fff",
          fontSize: 24,
          boxShadow: "0 10px 28px rgba(255,79,163,0.4)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform .15s ease",
        }}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 84,
            right: 16,
            width: "420px",
            height: "520px",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            zIndex: 9998,
          }}
        >
          <div className="madly-root" style={{ width: "100%", height: "100%", padding: 0 }}>
            <div className="madly-chat-window madly-glass" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
              <div className="madly-chat-header">
                <div className="madly-chat-title">
                  <div className="madly-bot-avatar">🤖</div>
                  <span>Madly</span>
                </div>
                <div className="madly-status">
                  <span className="madly-pulse-dot" /> Online
                </div>
              </div>

              <div className="madly-chat-body" ref={chatBodyRef} style={{ flex: 1, maxHeight: "none" }}>
                {messages.map((m) => (
                  <div className={`madly-msg ${m.role === "user" ? "user" : "ai"}`} key={m.id}>
                    <div className="madly-msg-avatar">{m.role === "user" ? "🧑" : "🤖"}</div>
                    <div className="madly-bubble">
                      {m.text}
                      {m.imageDataUrl && <img src={m.imageDataUrl} alt="attached" />}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="madly-msg ai">
                    <div className="madly-msg-avatar">🤖</div>
                    <div className="madly-bubble madly-typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </div>

              <div className="madly-chat-input-area">
                <div className={`madly-img-preview-row ${selectedImageDataUrl ? "show" : ""}`}>
                  {selectedImageDataUrl && <img src={selectedImageDataUrl} alt="preview" />}
                  <button className="madly-img-preview-remove" onClick={removeImagePreview} title="إزالة / Remove">
                    ✕
                  </button>
                </div>

                <div className="madly-input-row">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <button
                    className="madly-icon-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="إرفاق صورة / Attach image"
                  >
                    📎
                  </button>
                  <input
                    type="text"
                    placeholder="اسأل أي شيء / Ask anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                  />
                  <button
                    className="madly-icon-btn madly-lang-toggle-btn"
                    onClick={toggleVoiceLang}
                    title="لغة الإدخال الصوتي / Voice input language"
                  >
                    {voiceLang.startsWith("ar") ? "AR" : "EN"}
                  </button>
                  <button
                    className={`madly-icon-btn madly-mic-btn ${recognizing ? "active recording" : ""}`}
                    onClick={toggleMic}
                    disabled={!micSupported}
                    title="إدخال صوتي / Voice input"
                  >
                    🎤
                  </button>
                  <button className="madly-send-btn" onClick={sendMessage} disabled={isSending} title="إرسال / Send">
                    ➤
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}