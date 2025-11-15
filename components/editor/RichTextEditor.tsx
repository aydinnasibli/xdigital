// components/editor/RichTextEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { useCallback } from 'react';

interface RichTextEditorProps {
    content?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    className?: string;
    editable?: boolean;
    mentionSuggestions?: Array<{ id: string; label: string }>;
}

export function RichTextEditor({
    content = '',
    onChange,
    placeholder = 'Type your message...',
    className = '',
    editable = true,
    mentionSuggestions = [],
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention bg-blue-100 text-blue-800 px-1 rounded',
                },
                suggestion: {
                    items: ({ query }) => {
                        return mentionSuggestions
                            .filter(item =>
                                item.label.toLowerCase().startsWith(query.toLowerCase())
                            )
                            .slice(0, 5);
                    },
                },
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getHTML());
            }
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm max-w-none focus:outline-none min-h-[100px] p-3 ${className}`,
                placeholder,
            },
        },
    });

    const setLink = useCallback(() => {
        const previousUrl = editor?.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Toolbar */}
            {editable && (
                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        className={`px-3 py-1 rounded hover:bg-gray-200 ${
                            editor.isActive('bold') ? 'bg-gray-300' : ''
                        }`}
                        title="Bold"
                    >
                        <strong>B</strong>
                    </button>

                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        className={`px-3 py-1 rounded hover:bg-gray-200 ${
                            editor.isActive('italic') ? 'bg-gray-300' : ''
                        }`}
                        title="Italic"
                    >
                        <em>I</em>
                    </button>

                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={!editor.can().chain().focus().toggleStrike().run()}
                        className={`px-3 py-1 rounded hover:bg-gray-200 ${
                            editor.isActive('strike') ? 'bg-gray-300' : ''
                        }`}
                        title="Strikethrough"
                    >
                        <s>S</s>
                    </button>

                    <div className="w-px bg-gray-300 mx-1" />

                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`px-3 py-1 rounded hover:bg-gray-200 ${
                            editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
                        }`}
                        title="Heading 1"
                    >
                        H1
                    </button>

                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`px-3 py-1 rounded hover:bg-gray-200 ${
                            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
                        }`}
                        title="Heading 2"
                    >
                        H2
                    </button>

                    <div className="w-px bg-gray-300 mx-1" />

                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`px-3 py-1 rounded hover:bg-gray-200 ${
                            editor.isActive('bulletList') ? 'bg-gray-300' : ''
                        }`}
                        title="Bullet List"
                    >
                        •
                    </button>

                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`px-3 py-1 rounded hover:bg-gray-200 ${
                            editor.isActive('orderedList') ? 'bg-gray-300' : ''
                        }`}
                        title="Numbered List"
                    >
                        1.
                    </button>

                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`px-3 py-1 rounded hover:bg-gray-200 ${
                            editor.isActive('blockquote') ? 'bg-gray-300' : ''
                        }`}
                        title="Quote"
                    >
                        "
                    </button>

                    <div className="w-px bg-gray-300 mx-1" />

                    <button
                        onClick={setLink}
                        className={`px-3 py-1 rounded hover:bg-gray-200 ${
                            editor.isActive('link') ? 'bg-gray-300' : ''
                        }`}
                        title="Link"
                    >
                        🔗
                    </button>

                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        disabled={!editor.can().chain().focus().toggleCode().run()}
                        className={`px-3 py-1 rounded hover:bg-gray-200 ${
                            editor.isActive('code') ? 'bg-gray-300' : ''
                        }`}
                        title="Code"
                    >
                        {'</>'}
                    </button>

                    <div className="w-px bg-gray-300 mx-1" />

                    <button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run()}
                        className="px-3 py-1 rounded hover:bg-gray-200"
                        title="Undo"
                    >
                        ↶
                    </button>

                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run()}
                        className="px-3 py-1 rounded hover:bg-gray-200"
                        title="Redo"
                    >
                        ↷
                    </button>
                </div>
            )}

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}
