"use client"

import { useConversation } from "@elevenlabs/react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { LiveWaveform } from "@/components/ui/live-waveform"
import { cn } from "@/lib/utils"

export interface ConversationBarProps {
  agentId: string
  className?: string
  waveformClassName?: string
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  onMessage?: (message: { source: "user" | "ai"; message: string }) => void
  onSendMessage?: (message: string) => void
  onToolCall?: (toolName: string) => Promise<string>
}

export const ConversationBar = React.forwardRef<
  HTMLDivElement,
  ConversationBarProps
>(
  (
    {
      agentId,
      className,
      waveformClassName,
      onConnect,
      onDisconnect,
      onError,
      onMessage,
      onSendMessage,
      onToolCall,
    },
    ref
  ) => {
    const [agentState, setAgentState] = React.useState<
      "disconnected" | "connecting" | "connected" | "disconnecting" | null
    >("disconnected")
    const mediaStreamRef = React.useRef<MediaStream | null>(null)

    const conversation = useConversation({
      onConnect: () => {
        onConnect?.()
      },
      onDisconnect: () => {
        setAgentState("disconnected")
        onDisconnect?.()
      },
      onMessage: (message) => {
        onMessage?.(message)
      },
      onError: (error: unknown) => {
        console.error("Error:", error)
        setAgentState("disconnected")
        const errorObj =
          error instanceof Error
            ? error
            : new Error(
              typeof error === "string" ? error : JSON.stringify(error)
            )
        onError?.(errorObj)
      },
    })

    const getMicStream = React.useCallback(async () => {
      if (mediaStreamRef.current) return mediaStreamRef.current

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      return stream
    }, [])

    const startConversation = React.useCallback(async () => {
      try {
        setAgentState("connecting")

        await getMicStream()

        // @ts-ignore
        await conversation.startSession({
          agentId,
          connectionType: "webrtc",
          onStatusChange: (status) => setAgentState(status.status),
          clientTools: {
            format: async (params: any) => {
              return onToolCall ? await onToolCall("format") : "Tool not implemented";
            },
            summarize: async (params: any) => {
              return onToolCall ? await onToolCall("summarize") : "Tool not implemented";
            },
            recording: async (params: any) => {
              if (onToolCall) await onToolCall("recording");
              conversation.endSession();
              return "Switching to recording mode.";
            },
            create_flowchart: async (params: any) => {
              return onToolCall ? await onToolCall("create_flowchart") : "Tool not implemented";
            },
            end_chat: async (params: any) => {
              conversation.endSession();
              return "Goodbye";
            }
          }
        })
      } catch (error) {
        console.error("Error starting conversation:", error)
        setAgentState("disconnected")
        onError?.(error as Error)
      }
    }, [conversation, getMicStream, agentId, onError, onToolCall])

    const handleEndSession = React.useCallback(() => {
      conversation.endSession()
      setAgentState("disconnected")

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
        mediaStreamRef.current = null
      }
    }, [conversation])

    React.useEffect(() => {
      return () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop())
        }
      }
    }, [])

    const isConnected = agentState === "connected"

    return (
      <div
        ref={ref}
        className={cn("flex w-full items-end justify-center", className)}
      >
        <div className="mt-2 w-full">
          {agentState === "disconnected" ? (
            <Button
              variant="default"
              className="text-sm w-full font-medium transaction-all"
              onClick={startConversation}
            >
              Start agent chat
            </Button>
          ) : (
            <div
              className="h-8 w-full group cursor-pointer border px-2 p-1 rounded-lg"
              onClick={handleEndSession}
            >
              <LiveWaveform
                key={agentState === "disconnected" ? "idle" : "active"}
                active={isConnected}
                processing={agentState === "connecting"}
                barWidth={3}
                barGap={1}
                barRadius={4}
                fadeEdges={true}
                fadeWidth={24}
                sensitivity={1.8}
                smoothingTimeConstant={0.85}
                height={24}
                mode="static"
                className={cn("h-full w-full text-foreground", waveformClassName)}
              />
              {agentState === "connecting" && (
                <span className="absolute inset-0 flex items-center justify-center font-medium text-muted-foreground group-hover:opacity-0 transition-opacity duration-200">
                  Connecting...
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

ConversationBar.displayName = "ConversationBar"
