"use client";

import { useState } from "react";

type Props = {
  value: string;
  label: string;
};

export function CopyButton({ value, label }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="button-secondary" onClick={onCopy}>
      {copied ? "Copied" : label}
    </button>
  );
}
