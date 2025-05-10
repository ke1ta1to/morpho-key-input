import { useEffect, useState } from "react";

interface MorphoKeyInputProps {
  onChange: (value: string) => void;
}

export function MorphoKeyInput({ onChange }: MorphoKeyInputProps) {
  // 内部入力文字列
  const [str, setStr] = useState<string>("");

  // 文字列の変更を検知して、onChangeを呼び出す
  useEffect(() => void onChange(str), [str, onChange]);

  return (
    <div>
      <input type="text" value={str} onChange={(e) => setStr(e.target.value)} />
    </div>
  );
}
