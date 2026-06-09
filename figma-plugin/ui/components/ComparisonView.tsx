import { simulationById } from "@/lib/simulations/catalog";
import { usePluginStore } from "../store";

export function ComparisonView() {
  const { imageUrl, selectedSimulation, result, isSimulating } = usePluginStore();
  const simulation = simulationById[selectedSimulation];

  if (!imageUrl) {
    return null;
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Compare</h2>

      <div className="compare-block">
        <p className="compare-label">Original</p>
        <div className="compare-frame">
          <img src={imageUrl} alt="Original frame" className="compare-image" />
        </div>
      </div>

      <div className="compare-block">
        <p className="compare-label">{simulation.name}</p>
        <div className="compare-frame compare-frame-sim">
          {result ? (
            <img src={result.dataUrl} alt={`${simulation.name} simulation`} className="compare-image" />
          ) : (
            <img src={imageUrl} alt="Loading simulation" className="compare-image compare-image-dim" />
          )}
          {isSimulating ? <div className="compare-overlay">Processing…</div> : null}
        </div>
      </div>
    </section>
  );
}
