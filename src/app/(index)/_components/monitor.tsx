"use client";

import { useState } from "react";

import { MorphoKeyInput } from "@/app/components/morpho-key-input";

export function Monitor() {
  const [str, setStr] = useState<string>("");

  return (
    <div>
      <p>Input: {str}</p>
      <MorphoKeyInput onChange={setStr} />
    </div>
  );
}
