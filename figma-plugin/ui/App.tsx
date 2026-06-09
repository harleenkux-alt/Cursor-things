import { useEffect } from "react";
import { ComparisonView } from "./components/ComparisonView";
import { FrameStatus } from "./components/FrameStatus";
import { Recommendations } from "./components/Recommendations";
import { Scorecard } from "./components/Scorecard";
import { SimulationBar } from "./components/SimulationBar";
import { usePluginStore } from "./store";

type PluginMessage =
  | { type: "frame-image"; imageBase64: string; frameName: string; width: number; height: number; fileSize: number }
  | { type: "no-selection" }
  | { type: "error"; message: string };

export function App() {
  const { imageUrl, loadFrame, clearFrame, setSelectionHint, setError } = usePluginStore();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage as PluginMessage | undefined;
      if (!message?.type) {
        return;
      }

      if (message.type === "frame-image") {
        void loadFrame({
          imageBase64: message.imageBase64,
          frameName: message.frameName,
          width: message.width,
          height: message.height,
          fileSize: message.fileSize
        });
        return;
      }

      if (message.type === "no-selection") {
        clearFrame();
        setSelectionHint("Select a frame in Figma to begin.");
        return;
      }

      if (message.type === "error") {
        clearFrame();
        setError(message.message);
        setSelectionHint(message.message);
      }
    };

    window.addEventListener("message", handleMessage);
    parent.postMessage({ pluginMessage: { type: "refresh" } }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, [clearFrame, loadFrame, setError, setSelectionHint]);

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Inclusive Design Simulator</h1>
        <p className="subtitle">Select a frame to preview accessibility simulations</p>
      </header>

      <FrameStatus />

      {imageUrl ? (
        <>
          <SimulationBar />
          <ComparisonView />
          <Scorecard />
          <Recommendations />
        </>
      ) : (
        <section className="panel empty-panel">
          <p className="empty-title">No frame selected</p>
          <p className="empty-copy">
            Click a frame, component, or section on the canvas. The plugin exports it automatically and runs
            simulations here.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => parent.postMessage({ pluginMessage: { type: "refresh" } }, "*")}
          >
            Refresh selection
          </button>
        </section>
      )}
    </div>
  );
}
