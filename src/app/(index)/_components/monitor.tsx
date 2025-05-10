"use client";

import { useState } from "react";

import { MorphoKeyInput } from "@/app/components/morpho-key-input";

export function Monitor() {
  const [sourceStr, setSourceStr] = useState<string>("");

  // 入力結果は使用しないので空の関数を渡す
  const handleChange = () => {
    // 入力結果は表示しないので何もしない
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700">入力ソーステキスト</h3>
        </div>
        <textarea
          value={sourceStr}
          onChange={(e) => void setSourceStr(e.target.value)}
          className="w-full p-3 bg-gray-50 rounded border border-gray-200 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={5}
          placeholder="ここにテキストを入力してください..."
        />
      </div>

      <MorphoKeyInput sourceStr={sourceStr} onChange={handleChange} />
    </div>
  );
}
