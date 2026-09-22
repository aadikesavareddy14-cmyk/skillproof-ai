import { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, ZoomOut, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ProfilePhotoUploaderProps {
  size?: 'md' | 'lg';
  showDetails?: boolean;
  onPhotoUpdated?: (url: string | null) => void;
}

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export function ProfilePhotoUploader({
  size = 'lg',
  showDetails = true,
  onPhotoUpdated,
}: ProfilePhotoUploaderProps) {
  const { profile, uploadAvatarFile, removeAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentAvatar = profile.avatarUrl;
  const circleSizeClass = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';

  const handleContainerClick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      setError('Please select a JPG or PNG image file (.jpg, .jpeg, .png).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image is too large. Please select a photo under 8MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSelectedImageSrc(objectUrl);
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setCropModalOpen(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConfirmCrop = async () => {
    if (!selectedImageSrc || !selectedFile) return;
    setLoading(true);

    try {
      // Render cropped circular image to offscreen canvas
      const img = new Image();
      img.src = selectedImageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const targetSize = 400; // Output square size
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Circular clipping
        ctx.save();
        ctx.beginPath();
        ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2, 0, Math.PI * 2);
        ctx.clip();

        // Calculate aspect ratio scaling
        const minDim = Math.min(img.naturalWidth, img.naturalHeight);
        const scale = (targetSize / minDim) * zoom;
        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        const drawX = (targetSize - drawW) / 2 + (panX / 120) * (targetSize / 2);
        const drawY = (targetSize - drawH) / 2 + (panY / 120) * (targetSize / 2);

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();

        // Convert canvas to blob/file
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const croppedFile = new File([blob], `avatar-${Date.now()}.png`, {
                type: 'image/png',
              });
              const res = await uploadAvatarFile(croppedFile);
              if (res.error) {
                setError(res.error);
              } else {
                onPhotoUpdated?.(res.url);
              }
            }
            setLoading(false);
            setCropModalOpen(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
          },
          'image/png',
          0.92,
        );
      } else {
        // Fallback directly with original file
        const res = await uploadAvatarFile(selectedFile);
        if (res.error) setError(res.error);
        else onPhotoUpdated?.(res.url);
        setLoading(false);
        setCropModalOpen(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error processing photo';
      setError(msg);
      setLoading(false);
      setCropModalOpen(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    setLoading(true);
    await removeAvatar();
    onPhotoUpdated?.(null);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Cleanup object url
  useEffect(() => {
    return () => {
      if (selectedImageSrc) URL.revokeObjectURL(selectedImageSrc);
    };
  }, [selectedImageSrc]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* Circular photo placeholder with camera overlay */}
        <div className="relative group">
          <button
            type="button"
            onClick={handleContainerClick}
            disabled={loading}
            className={`${circleSizeClass} rounded-full overflow-hidden border-2 transition-all relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950 ${
              currentAvatar
                ? 'border-zinc-700 hover:border-blue-500 bg-zinc-900'
                : 'border-dashed border-zinc-700 hover:border-blue-500 bg-zinc-900/60 hover:bg-zinc-800/80 cursor-pointer'
            }`}
            title={currentAvatar ? 'Click to change photo' : 'Click to add profile photo'}
          >
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Profile Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex flex-col items-center justify-center text-zinc-400 group-hover:text-white transition-colors p-2 text-center">
                <Camera className="w-6 h-6 mb-1 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                <span className="text-[10px] font-semibold tracking-tight uppercase">
                  Add photo
                </span>
              </div>
            )}

            {/* Hover Camera Overlay if photo already exists */}
            {currentAvatar && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs gap-1">
                <Camera className="w-5 h-5 text-blue-400" />
                <span className="text-[10px] font-medium">Change</span>
              </div>
            )}
          </button>

          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center z-10">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Text Details & Remove Option */}
        {showDetails && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-200">Profile Photo</span>
              {currentAvatar && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              JPG or PNG, max 8MB. Recommended square aspect ratio.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleContainerClick}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {currentAvatar ? 'Upload new photo' : 'Choose file...'}
              </button>

              {currentAvatar && (
                <>
                  <span className="text-zinc-700">•</span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={loading}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove photo
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Native File Input (never in-app fake modal) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload profile photo"
        />
      </div>

      {/* Inline Format/Size Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-xs text-red-400 animate-fade-slide">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Circular Crop & Preview Modal */}
      {cropModalOpen && selectedImageSrc && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <button
              onClick={() => {
                setCropModalOpen(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-zinc-100 mb-1">Position & Crop Photo</h3>
            <p className="text-xs text-zinc-400 mb-5">
              Drag to position and use slider to zoom into the circular frame.
            </p>

            {/* Circular Crop Viewport */}
            <div
              className="relative w-64 h-64 mx-auto rounded-2xl bg-zinc-900 overflow-hidden cursor-grab active:cursor-grabbing select-none border border-zinc-800 flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Image with transform */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
              >
                <img
                  src={selectedImageSrc}
                  alt="Crop preview"
                  className="max-w-none max-h-none object-contain"
                  style={{ width: '240px', height: '240px' }}
                />
              </div>

              {/* Translucent overlay with circular hole */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full">
                  <defs>
                    <mask id="circle-cutout">
                      <rect width="100%" height="100%" fill="white" />
                      <circle cx="128" cy="128" r="96" fill="black" />
                    </mask>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="rgba(9, 9, 11, 0.75)"
                    mask="url(#circle-cutout)"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="96"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                </svg>
              </div>
            </div>

            {/* Zoom Control Slider */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <ZoomOut className="w-3.5 h-3.5 text-zinc-500" />
                  Zoom
                </span>
                <span className="tabular-nums font-mono text-zinc-300">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setCropModalOpen(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Apply & Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
