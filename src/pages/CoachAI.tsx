import React, { useState, useEffect, useRef } from "react";
import { BrainCircuit, Send, User, Loader2, ArrowRight, ImagePlus, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import { useSearchContext } from "../context/SearchContext";
import { chatWithCoach, ChatMessage, ChatPart } from "../services/geminiService";
import { useTranslation } from "react-i18next";
import FloatingDecorations from "../components/FloatingDecorations";

export default function CoachAI() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateSearchState } = useSearchContext();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "model",
    parts: [{ text: t("coach.greeting") }]
  }]);
  const [input, setInput] = useState("");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // If language changes, translate the first greeting message if it's still unmodified
  useEffect(() => {
    setMessages(prev => {
       const newMsgs = [...prev];
       if (newMsgs.length > 0 && newMsgs[0].role === 'model') {
           // Replace first message with translated greeting
           newMsgs[0] = { role: "model", parts: [{ text: t("coach.greeting") }] };
       }
       return newMsgs;
    });
  }, [t]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Hanya boleh upload gambar!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // Extract base64 and mime type
      const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        setSelectedImageMime(match[1]);
        setSelectedImageBase64(match[2]);
      }
    };
    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    setSelectedImageBase64(null);
    setSelectedImageMime(null);
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImageBase64) || isLoading) return;

    const userParts: ChatPart[] = [];
    if (selectedImageBase64 && selectedImageMime) {
      userParts.push({
        inlineData: {
          data: selectedImageBase64,
          mimeType: selectedImageMime
        }
      });
    }
    if (input.trim()) {
      userParts.push({ text: input.trim() });
    }

    setInput("");
    removeImage();
    
    // Add user message
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", parts: userParts }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Fetch AI response
      const reply = await chatWithCoach(newMessages);
      setMessages([
        ...newMessages,
        { role: "model", parts: [{ text: reply }] }
      ]);
    } catch (e) {
      setMessages([
        ...newMessages,
        { role: "model", parts: [{ text: t("coach.error") }] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 pb-6 sm:p-4 sm:pb-8 md:p-6 md:pb-10 overflow-hidden max-w-5xl mx-auto w-full h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] relative">
      <FloatingDecorations />
      <div className="w-full h-full max-w-3xl flex flex-col relative bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-slate-100 rounded-[24px] sm:rounded-[32px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sm:dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden flex-1 transition-colors z-10">
        
        {/* Header */}
        <div className="bg-indigo-600 dark:bg-indigo-800 p-4 border-b-2 border-slate-900 dark:border-slate-100 flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full border-2 border-slate-900 dark:border-slate-600 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-colors">
            <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-wider">{t("coach.title")}</h1>
            <p className="text-indigo-200 dark:text-indigo-300 text-sm font-medium leading-none">{t("coach.subtitle")}</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 bg-[#F8F9FA] dark:bg-zinc-950 transition-colors">
          {messages.map((msg, idx) => {
            let processedText = msg.parts.find(p => p.text)?.text || "";
            let actionType = null;
            let actionQuery = null;

            // Check for SEARCH_LAPANGAN
            const lapanganMatch = processedText.match(/\[SEARCH_LAPANGAN:\s*(.*?)\]/);
            if (lapanganMatch) {
              actionType = "LAPANGAN";
              actionQuery = lapanganMatch[1].trim();
              processedText = processedText.replace(lapanganMatch[0], "").trim();
            }

            return (
              <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full border-2 border-slate-900 dark:border-slate-100 flex items-center justify-center shrink-0 mt-1 ${msg.role === "user" ? "bg-amber-300 dark:bg-amber-400" : "bg-indigo-600 dark:bg-indigo-500"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-slate-900" /> : <BrainCircuit className="w-4 h-4 text-white" />}
                </div>
                
                {/* Message Bubble */}
                <div className="flex flex-col gap-2 relative">
                  <div className={`px-5 py-3 rounded-[20px] border-2 border-slate-900 dark:border-slate-100 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-colors ${msg.role === "user" ? "bg-amber-300 dark:bg-amber-400 rounded-tr-none" : "bg-white dark:bg-zinc-900 rounded-tl-none"}`}>
                      <div className={`prose prose-sm md:prose-base max-w-none font-medium ${msg.role === "user" ? "prose-slate text-slate-900" : "prose-slate dark:prose-invert text-slate-900 dark:text-slate-100"}`}>
                          {msg.role === "model" ? (
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {processedText}
                              </ReactMarkdown>
                          ) : (
                              <>
                                {msg.parts.map((p, i) => (
                                    <React.Fragment key={i}>
                                        {p.inlineData && (
                                            <img src={`data:${p.inlineData.mimeType};base64,${p.inlineData.data}`} alt="User upload" className="max-w-full rounded-xl mb-2 border-2 border-slate-900 border-opacity-20 object-cover max-h-48" />
                                        )}
                                        {p.text && <p className="whitespace-pre-wrap m-0">{p.text}</p>}
                                    </React.Fragment>
                                ))}
                              </>
                          )}
                      </div>
                  </div>

                  {actionType && actionQuery && (
                    <button
                      onClick={() => {
                        updateSearchState({ vibeText: actionQuery as string, recommendedSport: null });
                        navigate("/radar?tab=venue");
                      }}
                      className="mt-1 bg-amber-400 dark:bg-amber-500 hover:bg-amber-300 dark:hover:bg-amber-400 text-slate-900 px-4 py-3 rounded-2xl border-2 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255, 255, 255,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all text-sm font-bold flex items-center gap-2 self-start"
                    >
                      {t("coach.btn_radar")}{actionQuery}
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-8 h-8 rounded-full border-2 border-slate-900 dark:border-slate-100 bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shrink-0 mt-1">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <div className="px-5 py-3 rounded-[20px] rounded-tl-none border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2 transition-colors">
                 <Loader2 className="w-4 h-4 text-slate-900 dark:text-slate-100 animate-spin" />
                 <span className="text-slate-600 dark:text-slate-300 text-sm font-bold">{t("coach.thinking")}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-t-2 border-slate-900 dark:border-slate-100 flex flex-col gap-2 shrink-0 transition-colors">
          {selectedImageBase64 && (
            <div className="relative self-start inline-block ml-14">
              <img src={`data:${selectedImageMime};base64,${selectedImageBase64}`} alt="Preview" className="h-24 sm:h-28 rounded-xl border-2 border-slate-900 dark:border-slate-100 object-cover shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" />
              <button 
                onClick={removeImage} 
                className="absolute -top-3 -right-3 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-slate-100 rounded-full p-1.5 border-2 border-slate-900 dark:border-slate-100 hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                <X className="w-4 h-4 font-black" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 sm:gap-3 w-full">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-[44px] sm:w-14 sm:h-[52px] bg-slate-100 dark:bg-zinc-800 flex-shrink-0 rounded-[16px] sm:rounded-[20px] border-2 border-slate-900 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            >
              <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <textarea
              className="flex-1 bg-[#F8F9FA] dark:bg-zinc-950 rounded-[16px] sm:rounded-[20px] border-2 border-slate-900 dark:border-slate-600 px-3 sm:px-4 py-2 sm:py-3 font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none max-h-[120px] min-h-[44px] sm:min-h-[52px] text-sm sm:text-base object-contain transition-colors"
              placeholder={t("coach.chat_placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !selectedImageBase64)}
              className="w-12 h-[44px] sm:w-14 sm:h-[52px] bg-indigo-600 dark:bg-indigo-500 flex-shrink-0 rounded-[16px] sm:rounded-[20px] border-2 border-slate-900 dark:border-slate-100 flex items-center justify-center text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
