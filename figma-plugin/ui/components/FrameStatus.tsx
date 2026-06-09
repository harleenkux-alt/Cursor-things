import { usePluginStore } from "../store";

export function FrameStatus() {
  const { frameName, selectionHint, isAnalyzing, isSimulating, error } = usePluginStore();

  return (
    <section className="panel status-panel">
      <div className="status-row">
        <span className="status-label">Selection</span>
        <span className="status-value">{frameName ?? "—"}</span>
      </div>
      <p className="status-hint">{selectionHint}</p>
      {(isAnalyzing || isSimulating) && (
        <p className="status-loading">{isAnalyzing ? "Analyzing frame…" : "Generating simulation…"}</p>
      )}
      {error ? <p className="status-error">{error}</p> : null}
    </section>
  );
}
