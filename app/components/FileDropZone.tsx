'use client';

import { useCallback, useRef, useState } from 'react';
import { formatBytes } from '../lib/assembler';
import { IconUpload, IconFile } from './Icons';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  selectedFile?: File | null;
}

export default function FileDropZone({
  onFileSelected,
  disabled,
  selectedFile,
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFileSelected(file);
    },
    [disabled, onFileSelected],
  );

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  if (selectedFile) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-nexus-500/10">
            <IconFile size={24} className="text-nexus-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{selectedFile.name}</p>
            <p className="text-sm text-muted">{formatBytes(selectedFile.size)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 sm:p-12 ${
        isDragOver
          ? 'border-nexus-500 bg-nexus-500/5'
          : 'border-border hover:border-nexus-500/50'
      } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
      />
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-nexus-500/10">
        <IconUpload size={28} className="text-nexus-500" />
      </div>
      <p className="mb-1 text-base font-medium text-foreground">
        Drag & drop your file here
      </p>
      <p className="text-sm text-muted">or click to browse</p>
    </div>
  );
}
