import { Monitor } from "./_components/monitor";

export default async function IndexPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Morpho Key Input
        </h1>
        <p className="text-gray-600">形態素解析を使った入力支援ツール</p>
      </div>
      <Monitor />
    </div>
  );
}
