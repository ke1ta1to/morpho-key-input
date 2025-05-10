import { useEffect, useState } from "react";

import { morphologicalAnalysis } from "@/actions/morphological-analysis";
import type { MorphologicalAnalysisResult } from "@/actions/morphological-analysis";

interface MorphoKeyInputProps {
  onChange: (value: string) => void;
  sourceStr: string;
}

const colors: Record<string, string> = {
  名詞: "bg-blue-300 hover:bg-blue-400",
  動詞: "bg-red-300 hover:bg-red-400",
  形容詞: "bg-green-300 hover:bg-green-400",
  副詞: "bg-purple-300 hover:bg-purple-400",
  助詞: "bg-yellow-300 hover:bg-yellow-400",
  接続詞: "bg-orange-300 hover:bg-orange-400",
  感動詞: "bg-amber-300 hover:bg-amber-400",
  フィラー: "bg-stone-300 hover:bg-stone-400",
  記号: "bg-zinc-300 hover:bg-zinc-400",
  その他: "bg-gray-300 hover:bg-gray-400",
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

  // 単語を削除する関数
  const removeLastWord = () => {
    if (strArr.length > 0) {
      setStrArr((prev) => prev.slice(0, -1));
    }
  };

  // 入力をクリアする関数
  const clearInput = () => {
    setStrArr([]);
  };

  // 確率順にソート
  const sortedWordsByWeight = [...lastWordMorphoKey].sort(
    (a, b) => b.weight - a.weight
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700">入力済みテキスト</h3>
          <div className="flex space-x-2">
            <button
              onClick={removeLastWord}
              disabled={strArr.length === 0}
              className="px-2 py-1 text-sm bg-amber-100 text-amber-700 rounded hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              title="最後の単語を削除"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z"
                  clipRule="evenodd"
                />
              </svg>
              戻す
            </button>
            <button
              onClick={clearInput}
              disabled={strArr.length === 0}
              className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              title="クリア"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              クリア
            </button>
          </div>
        </div>
        <div className="min-h-[100px] p-3 bg-gray-50 rounded border border-gray-200 overflow-auto">
          {strArr.length > 0 ? (
            <p className="break-words text-lg leading-relaxed">
              {strArr.join("")}
            </p>
          ) : (
            <p className="text-gray-400 italic">
              下の候補から単語を選択してください
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700">次の単語候補</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-600">品詞:</span>
            {Object.entries(colors).map(([pos, colorClass]) => (
              <div
                key={pos}
                className="flex items-center text-xs text-gray-600"
              >
                <span
                  className={`inline-block w-3 h-3 rounded-full mr-1 ${
                    colorClass.split(" ")[0]
                  }`}
                ></span>
                {pos}
              </div>
            ))}
          </div>
        </div>

        {sortedWordsByWeight.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sortedWordsByWeight.map((word, index) => (
              <button
                key={index}
                onClick={() => {
                  setStrArr((prev) => [...prev, word.text]);
                }}
                className={`px-3 py-2 rounded-md shadow-sm ${
                  colors[word.partsOfSpeech] || colors["その他"]
                } text-gray-800 transition-all transform hover:scale-105 hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center`}
              >
                <span>{word.text}</span>
                <span className="ml-1 text-xs font-light opacity-70 text-gray-600">
                  {Math.round(word.weight * 100)}%
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded text-center text-gray-500">
            候補がありません。入力ソースを更新してください。
          </div>
        )}
      </div>
    </div>
  );
}
