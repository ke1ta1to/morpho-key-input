import { TestComp } from "../components/test-comp";

import { Monitor } from "./_components/monitor";

export default async function IndexPage() {
  return (
    <div>
      <h1>Morpho Key Input</h1>
      <TestComp />
      <Monitor />
    </div>
  );
}
