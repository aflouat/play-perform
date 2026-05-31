'use client';

import React, { useRef, useState } from 'react';
import clsx from 'clsx';

interface ImportDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function ImportDropzone({ onFile, disabled = false }: ImportDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File | null) {
    if (!file || !file.name.endsWith('.csv')) return;
    onFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Zone de dépôt CSV"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={clsx(
        'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors',
        dragging ? 'border-violet-500 bg-violet-50' : 'border-slate-300 hover:border-violet-400',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <p className="text-4xl mb-3">📂</p>
      <p className="text-slate-600 font-medium">Glisse un fichier <code className="text-violet-600">.csv</code> ici</p>
      <p className="text-slate-400 text-sm mt-1">ou clique pour choisir</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
