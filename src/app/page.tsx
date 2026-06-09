import { ProductHero } from "@/components/product-hero";
import { ResearchNotes } from "@/components/research-notes";
import { SimulatorWorkspace } from "@/components/simulator-workspace";

export default function Home() {
  return (
    <>
      <ProductHero />
      <SimulatorWorkspace />
      <ResearchNotes />
    </>
  );
}
