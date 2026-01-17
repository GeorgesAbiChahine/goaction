'use client';

import { Plate, PlateContent, usePlateEditor } from 'platejs/react';
import {
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import { Editor as PlateEditor, EditorContainer } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { MarkToolbarButton } from '@/components/ui/mark-toolbar-button';
import { Value } from 'platejs';
import { ToolbarSeparator } from '@/components/ui/toolbar';

const initialValue: Value = [
    {
        type: 'p',
        children: [
            { text: 'Hello! Try out the ' },
            { text: 'bold', bold: true },
            { text: ', ' },
            { text: 'italic', italic: true },
            { text: ', and ' },
            { text: 'underline', underline: true },
            { text: ' formatting.' },
        ],
    },
];

export default function Editor() {
    const editor = usePlateEditor({
        plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin],
        value: initialValue,
    });
    return (
        <div>
            <Plate editor={editor}>
                <FixedToolbar className="justify-start w-fit mx-auto rounded-lg bg-sidebar border p-0.5">
                    <MarkToolbarButton className='h-7! bg-foreground text-background hover:bg-foreground/80 hover:text-background' nodeType='transcript' tooltip="Start transcripting">Transcript</MarkToolbarButton>
                    <ToolbarSeparator />
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