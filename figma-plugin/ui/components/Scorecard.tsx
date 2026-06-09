import { usePluginStore } from "../store";

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function Score({ label, value }: { label: string; value: number }) {
  const rounded = Math.round(value);
  const tone = rounded >= 76 ? "good" : rounded >= 58 ? "warn" : "bad";

  return (
    <div className="score-card">
      <p className="score-label">{label}</p>
      <p className="score-value">{rounded}</p>
      <div className="score-bar">
        <div className={`score-fill score-fill-${tone}`} style={{ width: `${rounded}%` }} />
      </div>
    </div>
  );
}

export function Scorecard() {
  const { report, isAnalyzing } = usePluginStore();

  return (
    <section className="panel">
      <h2 className="panel-title">Accessibility scorecard</h2>

      {isAnalyzing ? (
        <p className="muted">Processing metrics…</p>
      ) : report ? (
        <>
          <div className="score-grid">
            <Score label="Contrast" value={report.contrastScore} />
            <Score label="Readability" value={report.readabilityScore} />
            <Score label="Density" value={report.densityScore} />
            <Score label="Touch" value={report.touchTargetScore} />
          </div>
          <p className="meta-line">
            {report.imageMeta.width} × {report.imageMeta.height} · {formatBytes(report.imageMeta.fileSize)}
          </p>
          <div className="finding-list">
            {report.findings.slice(0, 3).map((finding) => (
              <div key={finding.id} className="finding-item">
                <div className="finding-head">
                  <span className="finding-title">{finding.label}</span>
                  <span className={`badge badge-${finding.severity}`}>{finding.value}</span>
                </div>
                <p className="finding-copy">{finding.explanation}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="muted">Select a frame to generate scores.</p>
      )}
    </section>
  );
}
