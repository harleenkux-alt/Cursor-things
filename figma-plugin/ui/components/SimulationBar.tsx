import { simulations } from "@/lib/simulations/catalog";
import type { SimulationCategory } from "@/lib/simulations/types";
import { usePluginStore } from "../store";

const categories: SimulationCategory[] = ["Visual", "Cognitive", "Motor"];

export function SimulationBar() {
  const { selectedSimulation, selectSimulation, isSimulating } = usePluginStore();

  return (
    <section className="panel">
      <h2 className="panel-title">Choose a simulation</h2>
      {categories.map((category) => {
        const options = simulations.filter((simulation) => simulation.category === category);

        return (
          <div key={category} className="category-block">
            <p className="category-label">{category}</p>
            <div className="chip-row">
              {options.map((simulation) => {
                const isActive = selectedSimulation === simulation.id;

                return (
                  <button
                    key={simulation.id}
                    type="button"
                    disabled={isSimulating}
                    className={`chip ${isActive ? "chip-active" : ""}`}
                    onClick={() => void selectSimulation(simulation.id)}
                  >
                    {simulation.chipLabel ?? simulation.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
