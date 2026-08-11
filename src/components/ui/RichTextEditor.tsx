"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { useEffect, useState, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function Btn({ onClick, active, title, children, danger }: {
  onClick: () => void; active?: boolean; title: string;
  children: React.ReactNode; danger?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors flex-shrink-0 ${
        danger ? "text-red-500 hover:bg-red-50" :
        active ? "bg-landes-forest text-white" : "text-gray-600 hover:bg-gray-100"
      }`}>
      {children}
    </button>
  );
}

function Sep() { return <div className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />; }

const HEADING_OPTIONS = [
  { label: "Paragraphe", value: "paragraph" },
  { label: "Titre H1",   value: "h1" },
  { label: "Titre H2",   value: "h2" },
  { label: "Titre H3",   value: "h3" },
];

export default function RichTextEditor({
  value, onChange,
  placeholder = "Décrivez votre activité, services, savoir-faire…",
  minHeight = 160,
}: RichTextEditorProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl]             = useState("");
  const [showHeading, setShowHeading]     = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-landes-forest underline cursor-pointer" } }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: { class: "outline-none text-gray-700 text-sm leading-relaxed" },
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value || "");
  }, [value, editor]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!headingRef.current?.contains(e.target as Node)) setShowHeading(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applyLink = () => {
    if (!editor) return;
    if (linkUrl.trim()) {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const getCurrentHeading = () => {
    if (!editor) return "Paragraphe";
    if (editor.isActive("heading", { level: 1 })) return "Titre H1";
    if (editor.isActive("heading", { level: 2 })) return "Titre H2";
    if (editor.isActive("heading", { level: 3 })) return "Titre H3";
    return "Paragraphe";
  };

  const applyHeading = (val: string) => {
    if (!editor) return;
    if (val === "paragraph") editor.chain().focus().setParagraph().run();
    else if (val === "h1")   editor.chain().focus().toggleHeading({ level: 1 }).run();
    else if (val === "h2")   editor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (val === "h3")   editor.chain().focus().toggleHeading({ level: 3 }).run();
    setShowHeading(false);
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-visible focus-within:ring-2 focus-within:ring-landes-sage focus-within:border-transparent bg-white">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">

        {/* Menu déroulant Titre / Paragraphe */}
        <div className="relative" ref={headingRef}>
          <button type="button" onClick={() => setShowHeading(!showHeading)}
            className="flex items-center gap-1.5 px-3 h-8 rounded text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200 bg-white min-w-[110px] justify-between flex-shrink-0">
            <span>{getCurrentHeading()}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l4 4 4-4"/></svg>
          </button>
          {showHeading && (
            <div className="absolute top-10 left-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden min-w-[140px]">
              {HEADING_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => applyHeading(opt.value)}
                  className={`w-full text-left px-4 py-2.5 transition-colors hover:bg-landes-forest/5 ${
                    getCurrentHeading() === opt.label
                      ? "text-landes-forest font-semibold bg-landes-forest/5"
                      : "text-gray-700"
                  } ${opt.value === "h1" ? "text-base font-bold" : opt.value === "h2" ? "font-semibold" : opt.value === "h3" ? "font-medium" : "text-sm"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <Sep />

        {/* Formatage */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Gras"><strong className="text-xs">G</strong></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italique"><em className="text-xs">I</em></Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Souligné"><u className="text-xs">S</u></Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Barré"><s className="text-xs">B</s></Btn>
        <Sep />

        {/* Listes */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Liste à puces">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><circle cx="1.5" cy="3" r="1.5"/><rect x="4" y="2" width="10" height="2" rx="1"/><circle cx="1.5" cy="7" r="1.5"/><rect x="4" y="6" width="10" height="2" rx="1"/><circle cx="1.5" cy="11" r="1.5"/><rect x="4" y="10" width="10" height="2" rx="1"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Liste numérotée">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><text x="0" y="5" fontSize="5" fontWeight="bold">1.</text><rect x="5" y="2" width="9" height="2" rx="1"/><text x="0" y="9" fontSize="5" fontWeight="bold">2.</text><rect x="5" y="6" width="9" height="2" rx="1"/><text x="0" y="13" fontSize="5" fontWeight="bold">3.</text><rect x="5" y="10" width="9" height="2" rx="1"/></svg>
        </Btn>
        <Sep />

        {/* Alignement */}
        <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({textAlign:"left"})} title="Aligner à gauche">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2" rx="1"/><rect x="0" y="5" width="10" height="2" rx="1"/><rect x="0" y="9" width="12" height="2" rx="1"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({textAlign:"center"})} title="Centrer">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2" rx="1"/><rect x="2" y="5" width="10" height="2" rx="1"/><rect x="1" y="9" width="12" height="2" rx="1"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({textAlign:"right"})} title="Aligner à droite">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2" rx="1"/><rect x="4" y="5" width="10" height="2" rx="1"/><rect x="2" y="9" width="12" height="2" rx="1"/></svg>
        </Btn>
        <Sep />

        {/* Lien */}
        <Btn onClick={() => { if (!editor) return; setLinkUrl(editor.getAttributes("link").href || ""); setShowLinkModal(true); }} active={editor.isActive("link")} title="Insérer un lien">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </Btn>
        {editor.isActive("link") && (
          <Btn onClick={() => editor.chain().focus().unsetLink().run()} title="Supprimer le lien" danger>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="4" y1="4" x2="20" y2="20"/></svg>
          </Btn>
        )}
        <Sep />

        {/* Citation + séparateur */}
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citation">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="2" width="2" height="10" rx="1"/><rect x="4" y="4" width="10" height="2" rx="1"/><rect x="4" y="8" width="8" height="2" rx="1"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Séparateur horizontal">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="6" width="14" height="2" rx="1"/></svg>
        </Btn>
        <Sep />

        {/* Undo / Redo */}
        <Btn onClick={() => editor.chain().focus().undo().run()} active={false} title="Annuler">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} active={false} title="Rétablir">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
        </Btn>
      </div>

      {/* ── Contenu ── */}
      <div className="px-4 py-3 relative cursor-text" style={{ minHeight }} onClick={() => editor.commands.focus()}>
        {editor.isEmpty && (
          <p className="absolute top-3 left-4 text-gray-400 text-sm pointer-events-none select-none">{placeholder}</p>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-1.5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-between">
        <span className="text-xs text-gray-400">{editor.getText().length} caractère{editor.getText().length !== 1 ? "s" : ""}</span>
        <span className="text-xs text-gray-300">Ctrl+B gras · Ctrl+I italique</span>
      </div>

      {/* ── Modal lien ── */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center" onClick={() => setShowLinkModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <p className="font-bold text-landes-pine mb-4">Insérer un lien</p>
            <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applyLink()}
              placeholder="https://mon-site.fr"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-landes-sage mb-4"
              autoFocus />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowLinkModal(false)} className="btn-secondary py-2 px-4 text-sm">Annuler</button>
              <button type="button" onClick={applyLink} className="btn-primary py-2 px-4 text-sm">Appliquer</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .ProseMirror h1 { font-size:1.4rem; font-weight:800; margin:.7rem 0 .35rem; color:#1A3A2A; }
        .ProseMirror h2 { font-size:1.2rem; font-weight:700; margin:.6rem 0 .3rem; color:#1A3A2A; }
        .ProseMirror h3 { font-size:1.05rem; font-weight:600; margin:.5rem 0 .25rem; color:#2D5A3D; }
        .ProseMirror p { margin:.25rem 0; }
        .ProseMirror ul { list-style:disc; padding-left:1.4rem; margin:.3rem 0; }
        .ProseMirror ol { list-style:decimal; padding-left:1.4rem; margin:.3rem 0; }
        .ProseMirror li { margin:.15rem 0; }
        .ProseMirror blockquote { border-left:3px solid #7BAE8A; padding:.4rem .8rem; color:#6b7280; margin:.5rem 0; font-style:italic; background:#f0faf0; border-radius:0 .5rem .5rem 0; }
        .ProseMirror hr { border:none; border-top:2px solid #e5e7eb; margin:1rem 0; }
        .ProseMirror a { color:#2D5A3D; text-decoration:underline; cursor:pointer; }
        .ProseMirror a:hover { color:#1A3A2A; }
        .ProseMirror strong { font-weight:700; }
        .ProseMirror em { font-style:italic; }
        .ProseMirror u { text-decoration:underline; }
        .ProseMirror s { text-decoration:line-through; }
        .ProseMirror:focus { outline:none; }
      `}</style>
    </div>
  );
}
