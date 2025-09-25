'use client';
import { useChat } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// Component imports
import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import ChatMessageContent from '@/components/chat/chat-message-content';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import WelcomeModal from '@/components/welcome-modal';
import { Info } from 'lucide-react';
import HelperBoost from './HelperBoost';

// ClientOnly component for client-side rendering
//@ts-ignore
const ClientOnly = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

// Define Avatar component props interface
interface AvatarProps {
  hasActiveTool: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isTalking: boolean;
}

// Avatar disabled
const Avatar = dynamic<AvatarProps>(
  () =>
    Promise.resolve(({ hasActiveTool }: AvatarProps) => {
      return (
        <div
          className={`flex items-center justify-center rounded-full transition-all duration-300 ${hasActiveTool ? 'h-20 w-20' : 'h-28 w-28'}`}
        />
      );
    }),
  { ssr: false }
);

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: [0.05, 0.6, 0.1, 1] as const,
  },
};

const Chat = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    setInput,
    reload,
    addToolResult,
    append,
  } = useChat({
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
        setIsTalking(true);
        if (videoRef.current) {
          videoRef.current.play().catch((error) => {
            console.error('Failed to play video:', error);
          });
        }
      }
    },
    onFinish: () => {
      setLoadingSubmit(false);
      setIsTalking(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    onError: (error) => {
      setLoadingSubmit(false);
      setIsTalking(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      console.error('Chat error:', error.message, error.cause);
      toast.error(`Error: ${error.message}`);
    },
    onToolCall: (tool) => {
      const toolName = tool.toolCall.toolName;
      console.log('Tool call:', toolName);
    },
  });

  const { currentAIMessage, latestUserMessage, hasActiveTool } = useMemo(() => {
    const latestAIMessageIndex = messages.findLastIndex(
      (m) => m.role === 'assistant'
    );
    const latestUserMessageIndex = messages.findLastIndex(
      (m) => m.role === 'user'
    );

    const result = {
      currentAIMessage:
        latestAIMessageIndex !== -1 ? messages[latestAIMessageIndex] : null,
      latestUserMessage:
        latestUserMessageIndex !== -1 ? messages[latestUserMessageIndex] : null,
      hasActiveTool: false,
    };

    if (result.currentAIMessage) {
      result.hasActiveTool =
        result.currentAIMessage.parts?.some(
          (part) =>
            part.type === 'tool-invocation' &&
            part.toolInvocation?.state === 'result'
        ) || false;
    }

    if (latestAIMessageIndex < latestUserMessageIndex) {
      result.currentAIMessage = null;
    }

    return result;
  }, [messages]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' &&
      m.parts?.some(
        (part) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation?.state !== 'result'
      )
  );

  //@ts-ignore
  const submitQuery = (query) => {
    if (!query.trim() || isToolInProgress) return;

    const normalized = query.toLowerCase();

    const handleLocal = async () => {
      try {
        console.log('[chat] submitting query:', query);
        const res = await fetch('/db.json');
        const db = await res.json();
        console.log('[chat] loaded db.json');

        // Classify via NVIDIA (multi-card with natural text)
        let items: { natural: string; card: string }[] = [];
        try {
          const cls = await fetch('/api/classify-multi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });
          const cj = await cls.json();
          console.log('[chat] classify-multi result:', cj);
          if (cj && Array.isArray(cj.items)) items = cj.items;
        } catch {}

        // Build payloads from db.json for selected cards
        const payloads: any[] = [];
        for (const it of items) {
          if (it.card === 'me') payloads.push({ type: 'me', personal: db.personal || {}, natural: it.natural });
          if (it.card === 'projects') payloads.push({ type: 'projects', projects: db.projects || [], natural: it.natural });
          if (it.card === 'skills') payloads.push({ type: 'skills', skills: db.skills || [], natural: it.natural });
          if (it.card === 'experience') payloads.push({ type: 'experience', experience: db.experience || [], natural: it.natural });
          if (it.card === 'contact') payloads.push({ type: 'contact', contact: db.contact || {}, natural: it.natural });
          if (it.card === 'resume') payloads.push({ type: 'resume', resume: db?.personal?.resume || '', natural: it.natural });
          if (it.card === 'education') payloads.push({ type: 'education', education: db.education || [], natural: it.natural });
          if (it.card === 'achievements') payloads.push({ type: 'achievements', achievements: db.achievements || [], natural: it.natural });
        }

        // Fallback: if classifier returns none, infer via heuristics (no API)
        if (payloads.length === 0) {
          const ql = normalized;
          const inferred: string[] = [];
          if (ql.includes('project') || ql.includes('work') || ql.includes('portfolio')) inferred.push('projects');
          if (ql.includes('skill') || ql.includes('proof')) inferred.push('skills');
          if (ql.includes('contact') || ql.includes('reach') || ql.includes('email')) inferred.push('contact');
          if (ql.includes('experience') || ql.includes('worked') || ql.includes('intern') || ql.includes('roles')) inferred.push('experience');
          if (ql.includes('resume') || ql.includes('cv')) inferred.push('resume');
          if (ql.includes('education') || ql.includes('degree') || ql.includes('study') || ql.includes('university') || ql.includes('college')) inferred.push('education');
          if (ql.includes('achievement') || ql.includes('award') || ql.includes('badges') || ql.includes('accomplishment')) inferred.push('achievements');
          if (ql.includes('who are you') || ql.includes('about you') || ql.includes('me')) inferred.push('me');

          const unique = Array.from(new Set(inferred));
          if (unique.length > 0) {
            for (const card of unique) {
              if (card === 'me') payloads.push({ type: 'me', personal: db.personal || {}, natural: '' });
              if (card === 'projects') payloads.push({ type: 'projects', projects: db.projects || [], natural: '' });
              if (card === 'skills') payloads.push({ type: 'skills', skills: db.skills || [], natural: '' });
              if (card === 'experience') payloads.push({ type: 'experience', experience: db.experience || [], natural: '' });
              if (card === 'contact') payloads.push({ type: 'contact', contact: db.contact || {}, natural: '' });
              if (card === 'resume') payloads.push({ type: 'resume', resume: db?.personal?.resume || '', natural: '' });
              if (card === 'education') payloads.push({ type: 'education', education: db.education || [], natural: '' });
              if (card === 'achievements') payloads.push({ type: 'achievements', achievements: db.achievements || [], natural: '' });
            }
          } else {
            payloads.push({ type: 'me', personal: db.personal || {}, natural: '' });
          }
        }

        // Append assistant message containing all cards (user message already appended)
        const multiPayload = { items: payloads };
        setMessages((prev: any) => [
          ...prev,
          { role: 'assistant', content: `::card-multi::${JSON.stringify(multiPayload)}` },
        ]);
      } catch {
        setMessages([
          ...messages,
          { role: 'user', content: query },
          { role: 'assistant', content: 'Unable to load data locally.' },
        ] as any);
      } finally {
        setLoadingSubmit(false);
        setIsTalking(false);
      }
    };

    // Always handle locally to keep the app fully offline
    setLoadingSubmit(true);
    setIsTalking(true);
    // Immediately show user's message on the right (like real chat apps)
    setMessages((prev: any) => [
      ...prev,
      { role: 'user', content: query },
    ]);
    handleLocal();
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.pause();
    }

    if (initialQuery && !autoSubmitted) {
      setAutoSubmitted(true);
      setInput('');
      submitQuery(initialQuery);
    }
  }, [initialQuery, autoSubmitted]);

  useEffect(() => {
    if (videoRef.current) {
      if (isTalking) {
        videoRef.current.play().catch((error) => {
          console.error('Failed to play video:', error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isTalking]);

  //@ts-ignore
  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isToolInProgress) return;
    submitQuery(input);
    setInput('');
  };

  const handleStop = () => {
    stop();
    setLoadingSubmit(false);
    setIsTalking(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Check if this is the initial empty state (no messages)
  const isEmptyState =
    !currentAIMessage && !latestUserMessage && !loadingSubmit;

  // Calculate header height based on hasActiveTool
  const headerHeight = hasActiveTool ? 100 : 180;

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute top-6 right-8 z-51 flex flex-col-reverse items-center justify-center gap-1 md:flex-row">
        <WelcomeModal
          trigger={
            <div className="hover:bg-accent cursor-pointer rounded-2xl px-3 py-1.5">
              <Info className="text-accent-foreground h-8" />
            </div>
          }
        />
        
      </div>

      {/* Fixed Avatar Header with Gradient */}
      <div
        className="fixed top-0 right-0 left-0 z-50"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%)',
        }}
      >
        <div
          className={`transition-all duration-300 ease-in-out ${hasActiveTool ? 'pt-6 pb-0' : 'py-6'}`}
        >
          <div className="relative flex justify-center">
            <div className="absolute left-4 top-0">
              <button
                onClick={() => (window.location.href = '/')}
                className="rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-sm text-neutral-700 shadow-sm hover:bg-white"
              >
                Home
              </button>
            </div>
            <ClientOnly>
              <Avatar
                hasActiveTool={hasActiveTool}
                videoRef={videoRef}
                isTalking={isTalking}
              />
            </ClientOnly>
          </div>

          <AnimatePresence>
            {latestUserMessage && !currentAIMessage && (
              <motion.div
                {...MOTION_CONFIG}
                className="ml-auto flex max-w-3xl px-4 justify-end"
              >
                <ChatBubble variant="sent">
                  <ChatBubbleMessage>
                    <ChatMessageContent
                      message={latestUserMessage}
                      isLast={true}
                      isLoading={false}
                      reload={() => Promise.resolve(null)}
                    />
                  </ChatBubbleMessage>
                </ChatBubble>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto flex h-full max-w-3xl flex-col">
        {/* Scrollable Chat Content */}
        <div
          className="flex-1 overflow-y-auto px-2"
          style={{ paddingTop: `${headerHeight}px` }}
        >
          <AnimatePresence mode="wait">
            {isEmptyState ? (
              <motion.div
                key="landing"
                className="flex min-h-full items-center justify-center"
                {...MOTION_CONFIG}
              >
                <ChatLanding submitQuery={submitQuery} />
              </motion.div>
            ) : currentAIMessage ? (
              <div className="pb-4">
                {latestUserMessage && (
                  <div className="ml-auto mb-2 flex max-w-3xl px-4 justify-end">
                    <ChatBubble variant="sent">
                      <ChatBubbleMessage>
                        <ChatMessageContent
                          message={latestUserMessage}
                          isLast={false}
                          isLoading={false}
                          reload={() => Promise.resolve(null)}
                        />
                      </ChatBubbleMessage>
                    </ChatBubble>
                  </div>
                )}
                <SimplifiedChatView
                  message={currentAIMessage}
                  isLoading={isLoading}
                  reload={reload}
                  addToolResult={addToolResult}
                />
              </div>
            ) : (
              loadingSubmit && (
                <motion.div
                  key="loading"
                  {...MOTION_CONFIG}
                  className="px-4 pt-18"
                >
                  <ChatBubble variant="received">
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="sticky bottom-0 bg-white px-2 pt-3 md:px-0 md:pb-4">
          <div className="relative flex flex-col items-center gap-3">
            <HelperBoost submitQuery={submitQuery} setInput={setInput} />
            <ChatBottombar
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={onSubmit}
              isLoading={isLoading}
              stop={handleStop}
              isToolInProgress={isToolInProgress}
            />
          </div>
        </div>
        <a
          href="https://x.com/bantola_krishna"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-3 bottom-0 z-10 mb-4 hidden cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm hover:underline md:block"
        >
          @Krishna
        </a>
      </div>
    </div>
  );
};

export default Chat;
