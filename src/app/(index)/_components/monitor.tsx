"use client";

import { useState } from "react";

import { MorphoKeyInput } from "@/app/components/morpho-key-input";

export function Monitor() {
  const [str, setStr] = useState<string>("");
  const [sourceStr, setSourceStr] = useState<string>("");

  return (
    <div>
      <p>Input: {str}</p>
      <textarea
        value={sourceStr}
        onChange={(e) => void setSourceStr(e.target.value)}
        className="w-full"
        rows={5}
      />
      <MorphoKeyInput sourceStr={sourceStr} onChange={setStr} />
    </div>
  );
}
