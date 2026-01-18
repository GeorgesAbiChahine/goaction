"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, CheckSquare, Mail, X } from "lucide-react"
import { useEffect, useState } from "react"

export type ActionType = "google_task" | "google_calendar" | "gmail"

export interface ActionItem {
    action_type: ActionType
    summary: string
    description?: string
    recipient?: string
    start_time?: string
}

interface ActionReviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    actions: ActionItem[]
    onConfirm: (actions: ActionItem[]) => Promise<void>
}

export function ActionReviewDialog({ open, onOpenChange, actions: initialActions, onConfirm }: ActionReviewDialogProps) {
    const [actions, setActions] = useState<ActionItem[]>(initialActions)
    const [loading, setLoading] = useState(false)

    // Reset actions when dialog opens
    // Note: In a real app we might want to use useEffect to sync with props
    // but for now we assume the parent handles the state refresh or we initialize on mount.
    // Better: use a derived state or effect if props change.
    // Let's assume initialActions changes when the dialog re-opens with new data.
    if (initialActions !== actions && !loading && open) {
        // Simple sync for now, though this might cause loop if not careful.
        // Actually, let's just use initialActions as the source of truth if we don't support editing here.
        // If we support removing, we need local state.
    }

    const handleRemove = (index: number) => {
        const newActions = [...actions]
        newActions.splice(index, 1)
        setActions(newActions)
    }

    useEffect(() => {
        setActions(initialActions)
    }, [initialActions])
    // We will just use the props directly for now to avoid complexity, 
    // assuming the parent passes the correct list. 
    // Wait, if user wants to delete, we need local state.
    // Let's implement the useEffect sync.

    // Actually, hooks cannot be conditional.
    // Let's rely on the parent or just set local state on render if we switched ID.
    // For simplicity, let's assume the parent passes a fresh array reference.

    // Let's fix the sync manually:
    // We will use a key on the component in the parent to force reset, or just useEffect.
    /*
    useEffect(() => {
        setActions(initialActions)
    }, [initialActions])
    */

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm(actions)
            onOpenChange(false)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getIcon = (type: ActionType) => {
        switch (type) {
            case "google_task":
                return <CheckSquare className="h-5 w-5 text-blue-500" />
            case "google_calendar":
                return <Calendar className="h-5 w-5 text-green-500" />
            case "gmail":
                return <Mail className="h-5 w-5 text-red-500" />
        }
    }

    const getLabel = (type: ActionType) => {
        switch (type) {
            case "google_task": return "Google Task"
            case "google_calendar": return "Calendar Event"
            case "gmail": return "Email Draft"
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Review Actions</DialogTitle>
                    <DialogDescription>
                        I found the following actions. Review them before sending to Gumloop.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-4 max-h-[60vh] overflow-y-auto">
                    {actions.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No actions found.
                        </div>
                    )}
                    {actions.map((action, i) => (
                        <div key={i} className="flex flex-col gap-2 p-3 border rounded-lg bg-card/50 relative group">
                            <div className="flex items-center gap-2 mb-1">
                                {getIcon(action.action_type)}
                                <span className="font-medium text-sm text-muted-foreground">
                                    {getLabel(action.action_type)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemove(i)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="font-semibold">{action.summary}</div>

                            {action.description && (
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                    {action.description}
                                </div>
                            )}

                            {action.action_type === "gmail" && action.recipient && (
                                <div className="text-xs bg-muted px-2 py-1 rounded w-fit mt-1">
                                    To: {action.recipient}
                                </div>
                            )}

                            {action.action_type === "google_calendar" && action.start_time && (
                                <div className="text-xs bg-muted px-2 py-1 rounded w-fit mt-1">
                                    Time: {action.start_time}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading || actions.length === 0}>
                        {loading ? "Sending..." : "Send to Gumloop"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
