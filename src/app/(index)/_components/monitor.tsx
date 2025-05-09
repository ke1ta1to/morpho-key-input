"use client";

import { useState } from "react";

import { MultilayerRadialPicker } from "@/app/components/multilayer-radial-picker";

export function Monitor() {
  const [str, setStr] = useState<string>("");

  return (
    <div>
      <p>Input: {str}</p>
      <MultilayerRadialPicker onChange={setStr} />
    </div>
  );
}
