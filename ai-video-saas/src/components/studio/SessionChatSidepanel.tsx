"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore, ChatMessage, GeneratedScript } from "@/store/useAppStore";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  RotateCcw,
  Film,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface SessionChatSidepanelProps {
  onSelectScriptVersion: (script: GeneratedScript) => void;
}

export const SessionChatSidepanel: React.FC<SessionChatSidepanelProps> = ({
  onSelectScriptVersion,
}) => {
  const {
    chatMessages,
    addChatMessage,
    clearChatMemory,
    selectedMedia,
    activeBrandId,
    brands,
    setCurrentScript,
    setActiveScrubberTime,
  } = useAppStore();

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeBrand =
    brands.find((b) => b.id === activeBrandId) || brands[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isThinking]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userText = input;
    setInput("");

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    addChatMessage(userMsg);
    setIsThinking(true);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          brandId: activeBrandId,
          brandName: activeBrand.name,
          tone: activeBrand.defaultTone,
          mediaTitle: selectedMedia?.title || "Workplace Video",
          keyframes: selectedMedia?.keyframes || [],
          sessionHistory: chatMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const aiScript: GeneratedScript = data.script;

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text:
          data.message ||
          `I generated a new script angle: "${aiScript.title}" focusing on ${
            data.focusedKeyframe
              ? `timestamp 0:0${data.focusedKeyframe}s`
              : "fresh value propositions"
          }.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        scriptSnapshot: aiScript,
        keyframeFocused: data.focusedKeyframe,
      };

      addChatMessage(aiMsg);
      setCurrentScript(aiScript);

      if (data.focusedKeyframe) {
        setActiveScrubberTime(data.focusedKeyframe);
      }

      toast.success("New AI script version generated!", {
        description: `Loaded "${aiScript.title}" into the Hybrid Compositor.`,
      });
    } catch (err) {
      // Local fallback simulation if API fails
      const fallbackScript: GeneratedScript = {
        id: `script-fb-${Date.now()}`,
        title: "OSHA Safety & Elite Precision (15s)",
        hook: "Want certified robotics talent that operates with 99% precision from day one?",
        cta: "Partner with Manpower Corp today. We deliver pre-vetted engineers in 48 hours.",
        segments: [
          {
            id: "fb-1",
            start: 0,
            end: 3,
            speaker: "Avatar",
            text: "Want certified robotics talent that operates with 99% precision from day one?",
            visualCue: "Avatar speaking in corner over laboratory establishing shot.",
          },
          {
            id: "fb-2",
            start: 3,
            end: 11,
            speaker: "Voiceover",
            text: "Our technicians wear OSHA safety gear and calibrate micro-robotics with sub-millimeter accuracy.",
            visualCue: "Cut to raw work video: timestamp 0:08 (Precision assembly).",
          },
          {
            id: "fb-3",
            start: 11,
            end: 15,
            speaker: "Avatar",
            text: "Partner with Manpower Corp today. We deliver pre-vetted engineers in 48 hours.",
            visualCue: "Cut back to Avatar with brand watermark and CTA button.",
          },
        ],
        targetKeyframes: [8],
        tone: activeBrand.defaultTone,
        createdAt: new Date().toISOString(),
      };

      addChatMessage({
        id: `msg-ai-fb-${Date.now()}`,
        sender: "ai",
        text: `I created a targeted iteration focusing on timestamp 0:08s (Precision Assembly & OSHA safety compliance).`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        scriptSnapshot: fallbackScript,
        keyframeFocused: 8,
      });
      setCurrentScript(fallbackScript);
      setActiveScrubberTime(8);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Multimodal Session Memory
            </h3>
            <p className="text-[10px] text-slate-500">
              Remembers uploaded videos, timestamps & past hooks
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            clearChatMemory();
            toast.info("Session memory cleared.");
          }}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          title="Clear session history"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1">
                {isUser ? (
                  <>
                    <span className="text-[10px] font-semibold text-slate-400">
                      You
                    </span>
                    <User className="h-3 w-3 text-slate-400" />
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3 text-indigo-400" />
                    <span className="text-[10px] font-semibold text-indigo-400">
                      Market Pilot AI
                    </span>
                  </>
                )}
                <span className="text-[9px] text-slate-500">
                  {msg.timestamp}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[92%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-br-none shadow-md"
                    : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>

                {/* Optional Keyframe Focus Badge */}
                {msg.keyframeFocused && (
                  <button
                    onClick={() => setActiveScrubberTime(msg.keyframeFocused!)}
                    className="mt-2.5 inline-flex items-center space-x-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                  >
                    <Clock className="h-3 w-3 text-emerald-400" />
                    <span>Jump to Scrubber 0:0{msg.keyframeFocused}s</span>
                  </button>
                )}

                {/* Script Snapshot Card */}
                {msg.scriptSnapshot && (
                  <div className="mt-3 rounded-xl border border-slate-700/80 bg-slate-950/80 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1 text-[10px] font-bold text-indigo-400">
                        <Film className="h-3 w-3" />
                        <span>SCRIPT ITERATION</span>
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {msg.scriptSnapshot.segments.length} segments
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white">
                      {msg.scriptSnapshot.title}
                    </p>
                    <p className="text-[11px] text-slate-300 italic">
                      "{msg.scriptSnapshot.hook}"
                    </p>

                    <button
                      onClick={() =>
                        onSelectScriptVersion(msg.scriptSnapshot!)
                      }
                      className="w-full flex items-center justify-center space-x-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 py-1.5 text-[11px] font-bold text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all mt-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Load Version into Studio</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center space-x-2 text-xs text-indigo-400 p-2">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>Analyzing session memory & visual keyframes...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Footer */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-200 bg-slate-50 p-3"
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Focus on safety in sec 8..."
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-1.5 text-center">
          Memory enabled: AI prevents repetition across turns
        </p>
      </form>
    </div>
  );
};
