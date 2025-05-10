"use server";

import MeCab from "mecab-async";

type MorphologicalAnalysisResult = Record<
  string,
  {
    /**
     * 予測される単語
     */
    text: string;

    /**
     * 確率
     */
    weight: number;

    /**
     * 品詞
     */
    partsOfSpeech: string;
  }[]
>;

/**
 * 形態素解析し、単語の次に予測される単語と確率を返す
 * @param input 解析する文字列
 * @returns 単語ごとの予測候補と確率
 */
export async function morphologicalAnalysis(
  input: string
): Promise<MorphologicalAnalysisResult> {
  return new Promise((resolve, reject) => {
    const mecabInstance = new MeCab();
    mecabInstance.parse(input, (err: Error, result: string[][]) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const analysisResult: Record<
          string,
          { text: string; weight: number; partsOfSpeech: string }[]
        > = {};
        const wordCounts: Record<string, number> = {};
        const wordSequence: string[] = [];
        const wordPosMap: Record<string, string> = {};
        const wordTransitions: Record<string, Record<string, number>> = {};

        // 単語情報の抽出
        result.forEach((wordInfo) => {
          if (!wordInfo || wordInfo.length < 2) return;

          const word = wordInfo[0];
          const pos = wordInfo[1];

          if (pos === "記号") return;

          wordSequence.push(word);
          wordCounts[word] = (wordCounts[word] || 0) + 1;
          wordPosMap[word] = pos;
        });

        // 単語の遷移関係を収集
        for (let i = 0; i < wordSequence.length - 1; i++) {
          const currentWord = wordSequence[i];
          const nextWord = wordSequence[i + 1];

          if (!wordTransitions[currentWord]) {
            wordTransitions[currentWord] = {};
          }

          wordTransitions[currentWord][nextWord] =
            (wordTransitions[currentWord][nextWord] || 0) + 1;
        }

        // 単語ごとに予測候補を計算
        for (const word in wordCounts) {
          if (!analysisResult[word]) {
            analysisResult[word] = [];
          }

          // 単語が文末または他の単語と接続していない場合
          if (!wordTransitions[word]) {
            analysisResult[word].push({
              text: word,
              weight: 1.0,
              partsOfSpeech: wordPosMap[word],
            });
            continue;
          }

          // 遷移確率の計算
          const totalFollowingWords = Object.values(
            wordTransitions[word]
          ).reduce((a, b) => a + b, 0);
          const candidates = [];

          for (const nextWord in wordTransitions[word]) {
            const transitionCount = wordTransitions[word][nextWord];
            const probability = transitionCount / totalFollowingWords;

            if (probability > 0) {
              candidates.push({
                text: nextWord,
                rawProbability: probability,
                partsOfSpeech: wordPosMap[nextWord] || "不明",
              });
            }
          }

          // 確率の正規化と候補の追加
          const totalProbability = candidates.reduce(
            (sum, candidate) => sum + candidate.rawProbability,
            0
          );

          candidates.forEach(({ text, rawProbability, partsOfSpeech }) => {
            const normalizedWeight =
              totalProbability > 0 ? rawProbability / totalProbability : 0;

            analysisResult[word].push({
              text,
              weight: normalizedWeight,
              partsOfSpeech,
            });
          });

          // 降順ソート（確率が高い順）
          analysisResult[word].sort((a, b) => b.weight - a.weight);

          // エッジケース: 候補がない場合
          if (analysisResult[word].length === 0) {
            analysisResult[word].push({
              text: word,
              weight: 1.0,
              partsOfSpeech: wordPosMap[word],
            });
          }
        }

        resolve(analysisResult);
      } catch (error) {
        reject(error);
      }
    });
  });
}
