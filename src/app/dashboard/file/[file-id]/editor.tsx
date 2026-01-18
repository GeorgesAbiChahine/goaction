'use client';

import { EditorContainer, Editor as PlateEditor } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { MarkToolbarButton } from '@/components/ui/mark-toolbar-button';
import { ToolbarButton, ToolbarSeparator } from '@/components/ui/toolbar';
import { Plate } from 'platejs/react';

interface EditorProps {
    editor: any;
    onCommit?: () => void;
    pendingCount?: number;
}

export default function Editor({ editor, onCommit, pendingCount = 0 }: EditorProps) {
    return (
        <div>
            <Plate editor={editor}>
                <FixedToolbar className="justify-start w-fit mx-auto rounded-lg bg-sidebar border p-0.5">
                    <ToolbarButton
                        onClick={onCommit}
                        disabled={pendingCount === 0}
                        className={`h-7! bg-blue-600 mr-2 text-white hover:bg-blue-500 hover:text-white transition-colors ${pendingCount > 0 ? 'opacity-100' : 'opacity-50'}`}
                    >
                        Commit
                    </ToolbarButton>
                    <ToolbarButton onClick={() => editor.tf.h1.toggle()}>H1</ToolbarButton>
                    <ToolbarButton onClick={() => editor.tf.h2.toggle()}>H2</ToolbarButton>
                    <ToolbarButton onClick={() => editor.tf.h3.toggle()}>H3</ToolbarButton>
                    <ToolbarButton onClick={() => editor.tf.blockquote.toggle()}>Quote</ToolbarButton>
                    <MarkToolbarButton className='size-7!' nodeType="bold" tooltip="Bold (⌘+B)">B</MarkToolbarButton>
                    <MarkToolbarButton className='size-7!' nodeType="italic" tooltip="Italic (⌘+I)">I</MarkToolbarButton>
                    <MarkToolbarButton className='size-7!' nodeType="underline" tooltip="Underline (⌘+U)">U</MarkToolbarButton>
                </FixedToolbar>
                <EditorContainer>
                    <PlateEditor className='pt-8' placeholder="Type your amazing content here..." />
                </EditorContainer>
            </Plate>
        </div>
    )
}