import { useState } from 'react';
import { FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ResumePasteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (text: string, title: string) => void;
}

export function ResumePasteModal({ open, onClose, onConfirm }: ResumePasteModalProps) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('My Resume');
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = () => {
    if (!text.trim() || text.trim().length < 30) {
      setError('Please paste at least a basic resume with your name, experience, or skills.');
      return;
    }
    onConfirm(text.trim(), title.trim() || 'My Resume');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">Paste Resume Text</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Paste your resume text directly. We will parse your actual contact info, experience, projects, and skills.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">Resume Label / Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Software Engineer Resume"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">Resume Text:</label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            placeholder={`Paste your resume text here...

Jane Doe
Frontend Engineer | jane@example.com | San Francisco, CA

Professional Summary
Experienced engineer specializing in React and TypeScript...

Experience
Software Engineer | Acme Corp | 2022 - Present
- Built high-performance responsive web applications...`}
            rows={10}
            className="w-full font-mono rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-xs text-zinc-200 placeholder-zinc-600 focus:border-teal-500 focus:outline-none transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="press-scale flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-500/20 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Parse & Load Resume
          </button>
        </div>
      </div>
    </div>
  );
}
