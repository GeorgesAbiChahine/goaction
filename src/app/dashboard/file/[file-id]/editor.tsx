'use client';

import { EditorContainer, Editor as PlateEditor } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { MarkToolbarButton } from '@/components/ui/mark-toolbar-button';
import { ToolbarButton } from '@/components/ui/toolbar';
import { Plate } from 'platejs/react';

interface EditorProps {
    editor: any;
    onChange?: (value: any) => void;
    hasFlowchart?: boolean;
    onOpenFlowchart?: () => void;
    fileTitle?: string;
}

export default function Editor({ editor, onChange, hasFlowchart, onOpenFlowchart, fileTitle }: EditorProps) {
    return (
        <div>
            <Plate editor={editor} onChange={onChange}>
                <FixedToolbar className="justify-start w-fit mx-auto rounded-lg bg-sidebar border p-0.5 px-1 relative">
                    <div className='h-7 capitalize border p-1 px-1.5 rounded-lg bg-muted text-sm flex items-center justify-center font-medium'>
                        {fileTitle || "Untitled"}
                    </div>
                    <div className="w-px h-5 bg-border mx-1" />
                    <ToolbarButton onClick={() => editor.tf.h1.toggle()}>H1</ToolbarButton>
                    <ToolbarButton onClick={() => editor.tf.h2.toggle()}>H2</ToolbarButton>
                    <ToolbarButton onClick={() => editor.tf.h3.toggle()}>H3</ToolbarButton>
                    <ToolbarButton onClick={() => editor.tf.blockquote.toggle()}>Quote</ToolbarButton>
                    <MarkToolbarButton className='size-7!' nodeType="bold" tooltip="Bold (⌘+B)">B</MarkToolbarButton>
                    <MarkToolbarButton className='size-7!' nodeType="italic" tooltip="Italic (⌘+I)">I</MarkToolbarButton>
                    <MarkToolbarButton className='size-7!' nodeType="underline" tooltip="Underline (⌘+U)">U</MarkToolbarButton>
                    {hasFlowchart && (
                        <>
                            <div className="w-px h-5 bg-border mx-1" />
                            <ToolbarButton
                                onClick={onOpenFlowchart}
                                className="h-7! bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground ml-1"
                            >
                                Flowchart
                            </ToolbarButton>
                        </>
                    )}
                </FixedToolbar>
                <EditorContainer>
                    <PlateEditor className='pt-8' placeholder="Start recording something..." />
                </EditorContainer>
            </Plate>
        </div>
    )
}