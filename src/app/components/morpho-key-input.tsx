import { useEffect, useState } from "react";

import { morphologicalAnalysis } from "@/actions/morphological-analysis";
import type { MorphologicalAnalysisResult } from "@/actions/morphological-analysis";

interface MorphoKeyInputProps {
  onChange: (value: string) => void;
  sourceStr: string;
}

const colors: Record<string, string> = {
  その他: "bg-gray-300",
  フィラー: "bg-stone-300",
  感動詞: "bg-amber-300",
  記号: "bg-zinc-300",
  形容詞: "bg-green-300",
  助詞: "bg-yellow-300",
  接続詞: "bg-orange-300",
  動詞: "bg-red-300",
  副詞: "bg-purple-300",
  名詞: "bg-blue-300",
};

export function MorphoKeyInput({ onChange, sourceStr }: MorphoKeyInputProps) {
  // 内部入力文字列配列
  const [strArr, setStrArr] = useState<string[]>([]);

  // 文字列の変更を検知して、onChangeを呼び出す
  useEffect(() => void onChange(strArr.join("")), [strArr, onChange]);

  // 形態素解析結果
  const [morphoKeyArr, setMorphoKeyArr] = useState<MorphologicalAnalysisResult>(
    {}
  );

  useEffect(() => {
    (async () => {
      const result = await morphologicalAnalysis(sourceStr);
      setMorphoKeyArr(result);
    })();
  }, [sourceStr]);

  const lastWord = strArr[strArr.length - 1] || "";
  let lastWordMorphoKey = morphoKeyArr[lastWord];

  if (!lastWordMorphoKey) {
    // textの値が重複しないようにフィルタリング
    const allWords = Object.values(morphoKeyArr).flat();
    const uniqueWords = allWords.filter(
      (word, index, self) =>
        index === self.findIndex((w) => w.text === word.text)
    );
    lastWordMorphoKey = uniqueWords;
  }

  return (
    <div>
      <textarea
        value={strArr.join("")}
        readOnly
        onChange={() => {}}
        rows={5}
        className="w-full"
      />

      {/* 次の単語を入れるボタン */}
      <div>
        {lastWordMorphoKey.map((word, index) => (
          <button
            key={index}
            onClick={() => {
              setStrArr((prev) => [...prev, word.text]);
            }}
            className={`m-1 p-2 rounded ${colors[word.partsOfSpeech] || ""}`}
          >
            {word.text}
          </button>
        ))}
      </div>
    </div>
  );
}
