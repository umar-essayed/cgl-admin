'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle2, Image as ImageIcon, Video, Loader2, RefreshCw } from 'lucide-react';

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  mediaType?: 'image' | 'video';
  onMediaTypeChange?: (type: 'image' | 'video') => void;
  folder?: string;
  label?: string;
  description?: string;
}

export default function MediaUploader({
  value,
  onChange,
  mediaType = 'image',
  onMediaTypeChange,
  folder = 'hero',
  label = 'الخلفية (صورة أو مقطع فيديو)',
  description
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = mediaType === 'video' || (value && (value.endsWith('.mp4') || value.endsWith('.webm') || value.endsWith('.mov')));

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);

    if (file.type.startsWith('video/') && onMediaTypeChange) {
      onMediaTypeChange('video');
    } else if (file.type.startsWith('image/') && onMediaTypeChange) {
      onMediaTypeChange('image');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.message || 'فشل في رفع الملف');
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Controls: Label and Type Selector */}
      <div className="flex items-center justify-between">
        {label && <label className="block text-xs text-stone-200 font-medium">{label}</label>}
        {onMediaTypeChange && (
          <div className="flex items-center gap-1 bg-[#0c0e12] p-1 rounded-xl border border-[#222630]">
            <button
              type="button"
              onClick={() => onMediaTypeChange('image')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all ${
                mediaType === 'image'
                  ? 'bg-[#3b76b3] text-white font-bold shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>صورة</span>
            </button>
            <button
              type="button"
              onClick={() => onMediaTypeChange('video')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all ${
                mediaType === 'video'
                  ? 'bg-[#3b76b3] text-white font-bold shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>فيديو</span>
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={mediaType === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/png,image/jpeg,image/webp,video/mp4,video/webm'}
        onChange={onFileSelect}
        className="hidden"
      />

      {value ? (
        /* Clean Preview with Change / Delete */
        <div className="flex items-center justify-between gap-3 bg-[#0e1014] border border-[#222630] rounded-xl p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-14 w-20 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-[#2a2f3d] flex items-center justify-center">
              {isVideo ? (
                <video
                  src={value}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={value}
                  alt="Selected Media"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src = '/assets/cgl-logo1.png';
                  }}
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-[#3b76b3] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تم اختيار {isVideo ? 'مقطع الفيديو' : 'الصورة'} بنجاح</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">جاهز للعرض في الهيرو</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1e26] hover:bg-[#242a36] text-stone-300 hover:text-white text-xs font-medium border border-[#2e3442] transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>تغيير</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              title="إزالة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Simple Clean Drop Zone */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
            ${dragActive ? 'border-[#3b76b3] bg-[#3b76b3]/5' : 'border-[#2a2f3d] bg-[#0e1014] hover:border-stone-500 hover:bg-[#12151b]'}
            ${uploading ? 'opacity-60 pointer-events-none' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <div className="flex items-center gap-2 text-xs text-[#3b76b3] font-medium py-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري رفع {isVideo ? 'الفيديو' : 'الصورة'}...</span>
              </div>
            ) : (
              <>
                <div className="p-2.5 rounded-full bg-[#181c24] border border-[#2a2f3d] text-[#3b76b3]">
                  {isVideo ? <Video className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs text-stone-200 font-medium">
                    انقر لاختيار {isVideo ? 'مقطع فيديو' : 'صورة'} أو اسحب الملف هنا
                  </p>
                  {description && <p className="text-[11px] text-stone-500 mt-0.5">{description}</p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
}
