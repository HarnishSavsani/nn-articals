'use client';

import { useState } from 'react';

interface CodeInputProps {
  onSubmit: (code: string) => void;
  disabled?: boolean;
  error?: string | null;
}

export default function CodeInput({ onSubmit, disabled, error }: CodeInputProps) {
  const [code, setCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6 && !disabled) {
      onSubmit(code);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-6">
      <label className="mb-4 block text-center text-sm text-muted">
        Enter the sharing code
      </label>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={code}
        onChange={handleChange}
        disabled={disabled}
        placeholder="000000"
        className="mb-4 block w-full rounded-lg border border-border bg-background px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-foreground placeholder:text-muted/40 focus:border-nexus-500 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 sm:text-3xl"
      />
      {error && (
        <p className="mb-4 text-center text-sm text-danger">{error}</p>
      )}
      <button
        type="submit"
        disabled={code.length !== 6 || disabled}
        className="w-full rounded-lg bg-nexus-500 px-4 py-3 font-medium text-white transition-colors hover:bg-nexus-600 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? 'Connecting...' : 'Connect'}
      </button>
    </form>
  );
}
