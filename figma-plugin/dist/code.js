// code.ts
var EXPORTABLE = /* @__PURE__ */ new Set(["FRAME", "COMPONENT", "INSTANCE", "SECTION", "GROUP"]);
figma.showUI("", {
  width: 440,
  height: 780,
  themeColors: true,
  title: "Inclusive Design Simulator"
});
async function exportSelection() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: "no-selection" });
    return;
  }
  if (selection.length > 1) {
    figma.ui.postMessage({
      type: "error",
      message: "Select a single frame to simulate."
    });
    return;
  }
  const node = selection[0];
  if (!EXPORTABLE.has(node.type)) {
    figma.ui.postMessage({
      type: "error",
      message: "Select a frame, component, instance, section, or group."
    });
    return;
  }
  if (!("exportAsync" in node)) {
    figma.ui.postMessage({ type: "error", message: "This layer cannot be exported." });
    return;
  }
  try {
    const bytes = await node.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: 2 }
    });
    const width = "width" in node ? Math.round(node.width) : 0;
    const height = "height" in node ? Math.round(node.height) : 0;
    figma.ui.postMessage({
      type: "frame-image",
      imageBase64: `data:image/png;base64,${figma.base64Encode(bytes)}`,
      frameName: node.name,
      width,
      height,
      fileSize: bytes.length
    });
  } catch (e) {
    figma.ui.postMessage({
      type: "error",
      message: "Could not export the selected frame. Try a smaller selection."
    });
  }
}
figma.on("selectionchange", () => {
  void exportSelection();
});
figma.ui.onmessage = (message) => {
  if (message.type === "refresh") {
    void exportSelection();
  }
  if (message.type === "close") {
    figma.closePlugin();
  }
};
void exportSelection();
