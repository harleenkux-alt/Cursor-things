import { usePluginStore } from "../store";

const priorityClass = {
  High: "badge-risk",
  Medium: "badge-warn",
  Low: "badge-good"
} as const;

export function Recommendations() {
  const { recommendations, isAnalyzing } = usePluginStore();

  return (
    <section className="panel">
      <h2 className="panel-title">Design recommendations</h2>

      {isAnalyzing ? (
        <p className="muted">Processing recommendations…</p>
      ) : recommendations.length > 0 ? (
        <div className="rec-list">
          {recommendations.map((recommendation) => (
            <article key={recommendation.id} className="rec-item">
              <div className="rec-head">
                <h3 className="rec-title">{recommendation.title}</h3>
                <span className={`badge ${priorityClass[recommendation.priority]}`}>
                  {recommendation.priority}
                </span>
              </div>
              <p className="rec-rationale">{recommendation.rationale}</p>
              <p className="rec-action">{recommendation.action}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="muted">Pick a simulation to see recommendations.</p>
      )}
    </section>
  );
}
