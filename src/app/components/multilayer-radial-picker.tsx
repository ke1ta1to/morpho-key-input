import { useEffect, useState, useCallback, memo, useRef, useMemo } from "react";

// レイヤーの種類を定数として定義
const LAYER = {
  CHAR_SET: 0,
  ROW: 1,
  CHAR: 2,
} as const;

type LayerType = (typeof LAYER)[keyof typeof LAYER];

interface MultilayerRadialPickerProps {
  onChange: (value: string) => void;
}

// 文字セットの定義
const CHAR_SETS = {
  hiragana: {
    name: "平仮名",
    rows: [
      { name: "あ行", chars: ["あ", "い", "う", "え", "お"] },
      { name: "か行", chars: ["か", "き", "く", "け", "こ"] },
      { name: "さ行", chars: ["さ", "し", "す", "せ", "そ"] },
      { name: "た行", chars: ["た", "ち", "つ", "て", "と"] },
      { name: "な行", chars: ["な", "に", "ぬ", "ね", "の"] },
      { name: "は行", chars: ["は", "ひ", "ふ", "へ", "ほ"] },
      { name: "ま行", chars: ["ま", "み", "む", "め", "も"] },
      { name: "や行", chars: ["や", "ゆ", "よ"] },
      { name: "ら行", chars: ["ら", "り", "る", "れ", "ろ"] },
      { name: "わ行", chars: ["わ", "を", "ん"] },
    ],
  },
  katakana: {
    name: "片仮名",
    rows: [
      { name: "ア行", chars: ["ア", "イ", "ウ", "エ", "オ"] },
      { name: "カ行", chars: ["カ", "キ", "ク", "ケ", "コ"] },
      { name: "サ行", chars: ["サ", "シ", "ス", "セ", "ソ"] },
      { name: "タ行", chars: ["タ", "チ", "ツ", "テ", "ト"] },
      { name: "ナ行", chars: ["ナ", "ニ", "ヌ", "ネ", "ノ"] },
      { name: "ハ行", chars: ["ハ", "ヒ", "フ", "ヘ", "ホ"] },
      { name: "マ行", chars: ["マ", "ミ", "ム", "メ", "モ"] },
      { name: "ヤ行", chars: ["ヤ", "ユ", "ヨ"] },
      { name: "ラ行", chars: ["ラ", "リ", "ル", "レ", "ロ"] },
      { name: "ワ行", chars: ["ワ", "ヲ", "ン"] },
    ],
  },
  alphabet: {
    name: "英字",
    rows: [
      { name: "A-E", chars: ["A", "B", "C", "D", "E"] },
      { name: "F-J", chars: ["F", "G", "H", "I", "J"] },
      { name: "K-O", chars: ["K", "L", "M", "N", "O"] },
      { name: "P-T", chars: ["P", "Q", "R", "S", "T"] },
      { name: "U-Z", chars: ["U", "V", "W", "X", "Y", "Z"] },
      { name: "a-e", chars: ["a", "b", "c", "d", "e"] },
      { name: "f-j", chars: ["f", "g", "h", "i", "j"] },
      { name: "k-o", chars: ["k", "l", "m", "n", "o"] },
      { name: "p-t", chars: ["p", "q", "r", "s", "t"] },
      { name: "u-z", chars: ["u", "v", "w", "x", "y", "z"] },
    ],
  },
  symbols: {
    name: "記号",
    rows: [
      {
        name: "数字",
        chars: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      },
      { name: "記号1", chars: [".", ",", "!", "?", ":", ";"] },
      { name: "記号2", chars: ["+", "-", "*", "/", "=", "@"] },
      { name: "記号3", chars: ["(", ")", "[", "]", "{", "}"] },
      { name: "記号4", chars: ["#", "$", "%", "&", "^", "_"] },
    ],
  },
};

// 文字セットの種類をタイプとして定義
type CharSetType = keyof typeof CHAR_SETS;
const CHAR_SET_TYPES: CharSetType[] = Object.keys(CHAR_SETS) as CharSetType[];

// サイズに応じたクラスマップを定義
const RING_ITEM_SIZE_CLASSES = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
} as const;

// リングの設定を定義
const RING_CONFIG = {
  [LAYER.CHAR_SET]: { radius: 190, size: "lg" as const },
  [LAYER.ROW]: { radius: 115, size: "md" as const },
  [LAYER.CHAR]: { radius: 55, size: "sm" as const },
};

// 各リングのアイテムコンポーネント（メモ化）
const RingItem = memo(
  ({
    text,
    isActive,
    onClick,
    size = "md",
  }: {
    text: string;
    isActive: boolean;
    onClick?: () => void;
    size?: keyof typeof RING_ITEM_SIZE_CLASSES;
  }) => {
    return (
      <div
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center 
        ${isActive ? "text-white bg-blue-600 scale-110" : "text-gray-700 bg-white"}
        ${RING_ITEM_SIZE_CLASSES[size]} rounded-full shadow transition-all duration-200 cursor-pointer`}
        onClick={onClick}
        role="button"
        aria-pressed={isActive}
      >
        {text}
      </div>
    );
  }
);
RingItem.displayName = "RingItem";

// 確定ボタンコンポーネント
const ConfirmButton = memo(
  ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 
        w-16 h-16 rounded-full ${
          disabled
            ? "bg-gray-200 text-gray-400"
            : "bg-green-500 text-white hover:bg-green-600"
        } 
        text-base font-medium transition-colors shadow-lg`}
        aria-label="確定"
      >
        確定
      </button>
    );
  }
);
ConfirmButton.displayName = "ConfirmButton";

export function MultilayerRadialPicker({
  onChange,
}: MultilayerRadialPickerProps) {
  // 内部入力文字列
  const [str, setStr] = useState<string>("");

  // 各リングの選択状態
  const [charSetIndex, setCharSetIndex] = useState<number>(0);
  const [rowIndex, setRowIndex] = useState<number>(0);
  const [charIndex, setCharIndex] = useState<number>(-1); // -1は未選択

  // アクティブなレイヤー (0:文字セット, 1:行, 2:文字)
  const [activeLayer, setActiveLayer] = useState<LayerType>(LAYER.CHAR_SET);

  // 回転操作の状態管理
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startAngleRef = useRef<number>(0);

  // 選択中の文字セット、行、文字の取得
  const currentCharSet = CHAR_SETS[CHAR_SET_TYPES[charSetIndex]];
  const currentRows = currentCharSet.rows;
  const currentRow = activeLayer > 0 ? currentRows[rowIndex] : null;
  // useMemoを使用してcurrentCharsの再計算を最適化
  const currentChars = useMemo(() => {
    return currentRow?.chars || [];
  }, [currentRow]);

  // 文字列の変更を検知して、onChangeを呼び出す
  useEffect(() => void onChange(str), [str, onChange]);

  // ハプティックフィードバック関数
  const triggerHapticFeedback = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, []);

  // 回転角度からインデックスを計算する関数
  const angleToIndex = useCallback(
    (angle: number, itemCount: number): number => {
      // 正規化された角度を計算 (0-360)
      const normalizedAngle = ((angle % 360) + 360) % 360;
      // インデックスに変換
      return Math.floor((normalizedAngle / 360) * itemCount);
    },
    []
  );

  // タッチ位置から角度を計算する関数
  const calculateAngle = useCallback(
    (clientX: number, clientY: number): number => {
      if (!containerRef.current) return 0;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      return (
        Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90
      );
    },
    []
  );

  // ポインターイベントハンドラー
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current) return;

      isDraggingRef.current = true;
      startAngleRef.current = calculateAngle(e.clientX, e.clientY);

      // タッチイベントがスクロールを引き起こさないようにする
      e.preventDefault();
    },
    [calculateAngle]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const currentAngle = calculateAngle(e.clientX, e.clientY);

      // アクティブなレイヤーに応じてインデックスを更新
      if (activeLayer === LAYER.CHAR_SET) {
        const newIndex = angleToIndex(currentAngle, CHAR_SET_TYPES.length);
        if (newIndex !== charSetIndex) {
          setCharSetIndex(newIndex);
          triggerHapticFeedback();
        }
      } else if (activeLayer === LAYER.ROW) {
        const newIndex = angleToIndex(currentAngle, currentRows.length);
        if (newIndex !== rowIndex) {
          setRowIndex(newIndex);
          triggerHapticFeedback();
        }
      } else if (activeLayer === LAYER.CHAR) {
        const newIndex = angleToIndex(currentAngle, currentChars.length);
        if (newIndex !== charIndex) {
          setCharIndex(newIndex);
          triggerHapticFeedback();
        }
      }

      e.preventDefault();
    },
    [
      activeLayer,
      calculateAngle,
      angleToIndex,
      charSetIndex,
      rowIndex,
      charIndex,
      currentRows,
      currentChars,
      triggerHapticFeedback,
    ]
  );

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // レイヤーを次に進める
  const moveToNextLayer = useCallback(() => {
    if (activeLayer === LAYER.CHAR_SET) {
      setActiveLayer(LAYER.ROW);
      setRowIndex(0);
    } else if (activeLayer === LAYER.ROW) {
      setActiveLayer(LAYER.CHAR);
      setCharIndex(0);
    }
  }, [activeLayer]);

  // 確定ボタンのハンドラ
  const handleConfirm = useCallback(() => {
    if (
      activeLayer === LAYER.CHAR &&
      charIndex >= 0 &&
      charIndex < currentChars.length
    ) {
      // 選択された文字を文字列に追加
      setStr((prev) => prev + currentChars[charIndex]);
      triggerHapticFeedback();

      // 文字選択をリセットして行レイヤーに戻る
      setCharIndex(-1);
      setActiveLayer(LAYER.ROW);
    }
  }, [activeLayer, charIndex, currentChars, triggerHapticFeedback]);

  // レイヤー選択のハンドラ
  const handleLayerSelect = useCallback((layer: LayerType) => {
    setActiveLayer(layer);
  }, []);

  // isActive条件をチェックするヘルパー関数
  const isItemActive = useCallback(
    (index: number, isNames: boolean, layer: LayerType): boolean => {
      return (
        (layer === LAYER.CHAR_SET && index === charSetIndex && isNames) ||
        (layer === LAYER.ROW && index === rowIndex && isNames) ||
        (layer === LAYER.CHAR && index === charIndex && !isNames)
      );
    },
    [charSetIndex, rowIndex, charIndex]
  );

  // 円周上のアイテム配置ロジックを共通化
  const calculateCircularPosition = useCallback(
    (index: number, total: number, radius: number) => {
      // 時計の12時位置から時計回りに進む角度（calculateAngleと一致させる）
      const angle = (360 / total) * index + 90;
      const radian = (angle * Math.PI) / 180;
      return {
        x: radius * Math.cos(radian),
        y: radius * Math.sin(radian),
      };
    },
    []
  );

  // リングアイテムの配置
  const renderRingItems = useCallback(
    (
      items: string[],
      isNames: boolean,
      layer: LayerType,
      onItemClick?: (index: number) => void
    ) => {
      const { radius, size } = RING_CONFIG[layer];
      // アイテム数とサイズに応じた半径の調整
      let adjustedRadius;
      const itemSize =
        parseInt(RING_ITEM_SIZE_CLASSES[size].split(" ")[0].substring(1)) * 2; // w-8 → 8px * 2

      if (items.length <= 4) {
        adjustedRadius = radius * 0.9;
      } else if (items.length <= 6) {
        adjustedRadius = radius * 0.92;
      } else if (items.length <= 8) {
        adjustedRadius = radius * 0.94;
      } else {
        adjustedRadius = radius * 0.96;
      }

      // アイテムの大きさに応じてさらに調整
      adjustedRadius += itemSize / 4;

      return items.map((item, index) => {
        const isActive = isItemActive(index, isNames, layer);
        const { x, y } = calculateCircularPosition(
          index,
          items.length,
          adjustedRadius
        );

        return (
          <div
            key={`${item}-${index}`}
            className="absolute"
            style={{
              top: `calc(50% + ${y}px)`,
              left: `calc(50% + ${x}px)`,
              transform: "translate(-50%, -50%)",
              zIndex: isActive ? 10 : 1,
            }}
          >
            <RingItem
              text={item}
              isActive={isActive}
              size={size}
              onClick={onItemClick ? () => onItemClick(index) : undefined}
            />
          </div>
        );
      });
    },
    [isItemActive, calculateCircularPosition]
  );

  // レイヤー名を取得する関数
  const getLayerName = useCallback((layer: LayerType): string => {
    return layer === LAYER.CHAR_SET
      ? "文字セット選択"
      : layer === LAYER.ROW
        ? "行選択"
        : "文字選択";
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto my-4">
      {/* 現在の入力テキスト表示 */}
      <div className="w-full p-4 border rounded-lg bg-white shadow-sm">
        <p className="text-xl font-medium min-h-8" aria-live="polite">
          {str || "ここに入力されます"}
        </p>
      </div>

      {/* 3層リングピッカー */}
      <div
        ref={containerRef}
        className="relative w-[450px] h-[450px] rounded-full bg-gray-50 mx-auto shadow-lg overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="文字選択ホイール"
        role="application"
        style={{ cursor: isDraggingRef.current ? 'grabbing' : 'default' }}
      >
        {/* 外側リング: 文字セット選択 */}
        <div
          className={`absolute top-0 left-0 w-full h-full rounded-full transition-all duration-200
            ${activeLayer === LAYER.CHAR_SET ? "ring-4 ring-blue-400 ring-offset-2 bg-blue-50 cursor-grab" : "ring-1 ring-gray-200 hover:bg-gray-100"}`}
          onClick={() => handleLayerSelect(LAYER.CHAR_SET)}
        >
          {renderRingItems(
            CHAR_SET_TYPES.map((type) => CHAR_SETS[type].name),
            true,
            LAYER.CHAR_SET,
            (index) => {
              setCharSetIndex(index);
              moveToNextLayer();
            }
          )}
        </div>

        {/* 中央リング: 行選択 */}
        <div
          className={`absolute top-1/2 left-1/2 w-[62%] h-[62%] rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-200
            ${activeLayer === LAYER.ROW ? "ring-4 ring-blue-400 ring-offset-2 bg-blue-50 cursor-grab" : "ring-1 ring-gray-300 hover:bg-gray-100"}`}
          onClick={() => handleLayerSelect(LAYER.ROW)}
        >
          {activeLayer >= LAYER.ROW &&
            renderRingItems(
              currentRows.map((row) => row.name),
              true,
              LAYER.ROW,
              (index) => {
                setRowIndex(index);
                moveToNextLayer();
              }
            )}
        </div>

        {/* 内側リング: 文字選択 */}
        <div
          className={`absolute top-1/2 left-1/2 w-[35%] h-[35%] rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-200
            ${activeLayer === LAYER.CHAR ? "ring-4 ring-blue-400 ring-offset-2 bg-blue-50 cursor-grab" : "ring-1 ring-gray-300 hover:bg-gray-100"}`}
          onClick={() => handleLayerSelect(LAYER.CHAR)}
        >
          {activeLayer >= LAYER.CHAR &&
            renderRingItems(currentChars, false, LAYER.CHAR)}
        </div>

        {/* 確定ボタン */}
        {activeLayer === LAYER.CHAR && (
          <ConfirmButton onClick={handleConfirm} disabled={charIndex < 0} />
        )}

        {/* アクセシビリティのための現在選択中の情報 */}
        <div className="sr-only" aria-live="polite">
          {activeLayer === LAYER.CHAR_SET
            ? `文字セット: ${currentCharSet.name}`
            : activeLayer === LAYER.ROW
              ? `行: ${currentRow?.name}`
              : activeLayer === LAYER.CHAR && charIndex >= 0
                ? `文字: ${currentChars[charIndex]}`
                : "選択してください"}
        </div>
      </div>

      {/* 操作説明 */}
      <div className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100 w-full max-w-lg">
        <p className="mb-2">
          <span className="font-semibold">操作方法:</span>{" "}
          <span className="bg-yellow-50 px-1 py-0.5 rounded">色付きのリングをドラッグして回転させ</span>、文字を選択し、中央の「確定」ボタンで入力します
        </p>
        <p>
          <span className="font-semibold">現在のレイヤー:</span>{" "}
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
            {getLayerName(activeLayer)}
          </span>
        </p>
      </div>

      {/* 文字列削除ボタン */}
      <div className="flex gap-4 mt-2">
        <button
          onClick={() => setStr((prev) => prev.slice(0, -1))}
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="1文字削除"
          disabled={str.length === 0}
        >
          ⌫ 削除
        </button>
        <button
          onClick={() => setStr("")}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="すべて削除"
          disabled={str.length === 0}
        >
          クリア
        </button>
      </div>
    </div>
  );
}
