import { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';

interface ResumeUploadModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
}

const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx'];
const MAX_SIZE = 5 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedType(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_TYPES.some((ext) => name.endsWith(ext));
}

export function ResumeUploadModal({ open, onClose, onConfirm }: ResumeUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setError(null);
      setUploading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAcceptedType(file)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('File is too large — maximum 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!isAcceptedType(file)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('File is too large — maximum 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleConfirm = () => {
    if (!selectedFile) return;
    setUploading(true);
    setTimeout(() => {
      onConfirm(selectedFile);
      setUploading(false);
    }, 800);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-zinc-100">Upload your resume</h2>
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            PDF or Word document, up to 5MB. We'll analyze your skills, achievements, and project evidence.
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-sm text-red-400 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!selectedFile ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-zinc-700 hover:border-blue-600 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors p-8 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-sm font-medium text-zinc-300 mb-1">Click to browse or drag a file</p>
              <p className="text-xs text-zinc-600">PDF, DOC, or DOCX — max 5MB</p>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-zinc-500">{formatSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedFile || uploading}
              className="press-scale flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
