'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Film, Image as ImageIcon, CheckCircle2, X } from 'lucide-react';

interface UploadMeta {
  name: string;
  size: string;
  previewUrl?: string;
  rawFile?: File;
}

interface UploadDropzoneProps {
  acceptType: 'video' | 'image';
  value?: string;
  existingMeta?: UploadMeta | null;
  onSelect: (meta: UploadMeta | null) => void;
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function UploadDropzone({
  acceptType,
  value,
  existingMeta,
  onSelect,
  label,
  hint,
  required = false,
  className = '',
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadMeta | null>(existingMeta || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const acceptMime =
    acceptType === 'video'
      ? 'video/mp4,video/webm'
      : 'image/jpeg,image/png,image/webp';

  const defaultHint =
    acceptType === 'video'
      ? 'MP4 atau WebM (Pratinjau di browser)'
      : 'JPG, PNG, atau WebP (Rasio 16:9 atau 2:3)';

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    // Clean previous object URL
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    let previewUrl: string | undefined = undefined;
    if (acceptType === 'image' || acceptType === 'video') {
      try {
        previewUrl = URL.createObjectURL(file);
        objectUrlRef.current = previewUrl;
      } catch (e) {
        console.warn('Could not create object URL:', e);
      }
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${Math.round(file.size / 1024)} KB`;

    const meta: UploadMeta = {
      name: file.name,
      size: sizeStr,
      previewUrl,
      rawFile: file,
    };

    setSelectedFile(meta);
    onSelect(meta);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSelectedFile(null);
    onSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const IconComp = acceptType === 'video' ? Film : ImageIcon;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#24172B] uppercase tracking-wide">
          {label} {required && <span className="text-[#D94152]">*</span>}
        </label>
        {selectedFile && (
          <span className="text-[11px] font-semibold text-[#21865B] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            File Dipilih
          </span>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#4B0B7A] bg-[#F6F1F8]'
            : selectedFile || value
            ? 'border-[#21865B]/40 bg-[#EAF8F1]/20'
            : 'border-[#EEE8F0] hover:border-[#4B0B7A]/50 bg-[#F8F7FA] hover:bg-[#F6F1F8]/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptMime}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {selectedFile || value ? (
          <div className="flex flex-col items-center">
            {/* Image Preview if available */}
            {acceptType === 'image' && (selectedFile?.previewUrl || value) && (
              <div className="relative w-full max-h-40 h-32 rounded-xl overflow-hidden bg-black/5 mb-3 border border-[#EEE8F0]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedFile?.previewUrl || value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Video preview if local object url */}
            {acceptType === 'video' && selectedFile?.previewUrl && (
              <div className="w-full max-h-48 rounded-xl overflow-hidden bg-black mb-3">
                <video src={selectedFile.previewUrl} controls className="w-full max-h-44" />
              </div>
            )}

            <div className="flex items-center justify-between w-full p-2.5 rounded-xl bg-white border border-[#EEE8F0]">
              <div className="flex items-center gap-2.5 min-w-0 text-left">
                <div className="p-2 rounded-lg bg-[#EAF8F1] text-[#21865B]">
                  <IconComp className="w-4 h-4 shrink-0" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#24172B] truncate">
                    {selectedFile?.name || value?.split('/').pop() || 'Aset Terpilih'}
                  </p>
                  <p className="text-[10px] text-[#786F7D]">
                    {selectedFile?.size ? `Ukuran: ${selectedFile.size}` : 'Aset bawaan'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg text-[#786F7D] hover:text-[#D94152] hover:bg-[#FEECEF] transition-colors"
                title="Hapus pilihan file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-3 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-[#EEE8F0] text-[#4B0B7A] flex items-center justify-center mb-2.5">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[#24172B]">
              Tarik file ke sini, atau <span className="text-[#4B0B7A] underline">pilih dari komputer</span>
            </p>
            <p className="text-[11px] text-[#786F7D] mt-1">{hint || defaultHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
