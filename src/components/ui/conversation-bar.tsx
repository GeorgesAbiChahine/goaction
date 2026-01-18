"use client"

import { useConversation } from "@elevenlabs/react"
import * as React from "react"

import { ActionItem, ActionReviewDialog } from "@/components/action-review-dialog"
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
  onToolCall?: (toolName: string, params?: any) => Promise<string>
  reviewActions?: ActionItem[] | null
  onReviewActionsChange?: (actions: ActionItem[] | null) => void
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
      reviewActions,
      onReviewActionsChange,
    },
    ref
  ) => {
    const [agentState, setAgentState] = React.useState<
      "disconnected" | "connecting" | "connected" | "disconnecting" | null
    >("disconnected")
    const mediaStreamRef = React.useRef<MediaStream | null>(null)

    const setReviewActions = onReviewActionsChange || (() => { })

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
            get_flowchart: async (params: any) => {
              return onToolCall ? await onToolCall("get_flowchart") : "Tool not implemented";
            },
            add_node: async (params: any) => {
              return onToolCall ? await onToolCall("add_node", params) : "Tool not implemented";
            },
            update_node: async (params: any) => {
              return onToolCall ? await onToolCall("update_node", params) : "Tool not implemented";
            },
            delete_node: async (params: any) => {
              return onToolCall ? await onToolCall("delete_node", params) : "Tool not implemented";
            },
            format: async (params: any) => {
              return onToolCall ? await onToolCall("format", params) : "Tool not implemented";
            },
            summarize: async (params: any) => {
              return onToolCall ? await onToolCall("summarize", params) : "Tool not implemented";
            },
            recording: async (params: any) => {
              if (onToolCall) await onToolCall("recording", params);
              conversation.endSession();
              return "Switching to recording mode.";
            },
            create_flowchart: async (params: any) => {
              return onToolCall ? await onToolCall("create_flowchart", params) : "Tool not implemented";
            },
            find_actions: async (params: any) => {
              console.log("find_actions received params:", JSON.stringify(params, null, 2))
              let actions = Array.isArray(params) ? params : (params?.actions || [])

              if (actions.length === 0 && onToolCall) {
                console.log("No actions from agent, scanning document via client tool...")
                try {
                  const toolResult = await onToolCall("find_actions", {})
                  console.log("Client tool result:", toolResult)
                  const parsed = JSON.parse(toolResult)
                  console.log("Parsed client tool result:", parsed)
                  if (parsed.actions && Array.isArray(parsed.actions)) {
                    actions = parsed.actions
                  }
                } catch (e) {
                  console.error("Failed to scan document for actions:", e)
                }
              }

              if (actions.length > 0) {
                setReviewActions(actions)
                conversation.endSession()
                return `I have found ${actions.length} actions in the document. The review dialog is now open.`;
              }
              return "I scanned the document but did not find any specific actions to take.";
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
        <div className="w-full">
          {agentState === "disconnected" ? (
            <Button
              variant="default"
              className={cn("text-sm w-full max-w-[200px] h-7 font-medium transaction-all", className)}
              onClick={startConversation}
            >
              Start agent chat
            </Button>
          ) : (
            <div
              className="h-7 w-full group cursor-pointer flex items-center justify-center border px-2 p-1 rounded-lg"
              onClick={handleEndSession}
            >
              <LiveWaveform
                key="active"
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
            </div>
          )}
        </div>

        <ActionReviewDialog
          open={!!reviewActions}
          onOpenChange={(open) => !open && setReviewActions(null)}
          actions={reviewActions || []}
          onConfirm={async (actions) => {
            // Process actions to add default date for tasks if missing
            const processedActions = actions.map(a => {
              if (a.action_type === 'google_task' && !a.start_time) {
                const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString();
                return { ...a, start_time: oneHourLater };
              }
              return a;
            });

            try {
              const resp = await fetch("/api/gumloop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actions: processedActions })
              })
              if (!resp.ok) {
                console.error("Failed to send actions to Gumloop")
                throw new Error("Failed to send to Gumloop");
              }
              setReviewActions(null)
            } catch (err) {
              console.error("Error sending actions:", err)
              throw err;
            }
          }}
        />
      </div>
    )
  }
)

ConversationBar.displayName = "ConversationBar"
