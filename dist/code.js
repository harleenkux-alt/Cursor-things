var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
(function() {
  "use strict";
  const DEFAULT_SETTINGS = {
    wcagVersion: "2.2",
    conformanceTarget: "AA",
    minFontSize: 12,
    minTouchTarget: 44,
    language: "en",
    darkMode: false
  };
  const WEIGHT_MAP = [
    [/thin|hairline/i, 100],
    [/extra\s?light|ultra\s?light/i, 200],
    [/light/i, 300],
    [/regular|normal|book/i, 400],
    [/medium/i, 500],
    [/semi\s?bold|demi\s?bold/i, 600],
    [/extra\s?bold|ultra\s?bold/i, 800],
    [/black|heavy/i, 900],
    [/bold/i, 700]
  ];
  function resolveFontWeight(style) {
    for (const [pattern, weight] of WEIGHT_MAP) {
      if (pattern.test(style)) return weight;
    }
    return 400;
  }
  const isMixed = (v) => v === figma.mixed;
  function safeNumber(v, fallback = 0) {
    return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
  }
  function extractPaints(paints) {
    var _a;
    if (isMixed(paints) || !Array.isArray(paints)) return [];
    const out = [];
    for (const paint of paints) {
      if (paint.visible === false) continue;
      if (paint.type === "SOLID") {
        const color = {
          r: paint.color.r,
          g: paint.color.g,
          b: paint.color.b,
          a: (_a = paint.opacity) != null ? _a : 1
        };
        out.push({ type: "SOLID", color });
      } else if (paint.type.startsWith("GRADIENT")) {
        const stops = ("gradientStops" in paint ? paint.gradientStops : []).map((s) => ({
          r: s.color.r,
          g: s.color.g,
          b: s.color.b,
          a: s.color.a
        }));
        out.push({ type: "GRADIENT", stops });
      } else if (paint.type === "IMAGE") {
        out.push({ type: "IMAGE", scaleMode: paint.scaleMode });
      }
    }
    return out;
  }
  function extractEffects(effects) {
    if (!effects) return [];
    return effects.map((e) => ({
      type: e.type,
      visible: e.visible !== false,
      radius: "radius" in e ? e.radius : void 0
    }));
  }
  function extractReactions(node) {
    const reactions = node.reactions;
    if (!reactions || reactions.length === 0) return [];
    return reactions.map((r) => {
      var _a, _b, _c;
      const action = (_b = (_a = r.actions) == null ? void 0 : _a[0]) != null ? _b : r.action;
      const transition = action == null ? void 0 : action.transition;
      return {
        trigger: (_c = r.trigger) == null ? void 0 : _c.type,
        actionType: action == null ? void 0 : action.type,
        transitionType: transition == null ? void 0 : transition.type,
        transitionDurationMs: (transition == null ? void 0 : transition.duration) ? transition.duration * 1e3 : void 0,
        hasSmartAnimate: (transition == null ? void 0 : transition.type) === "SMART_ANIMATE"
      };
    });
  }
  function extractText(node) {
    const fontName = isMixed(node.fontName) ? { family: "Mixed", style: "Mixed" } : node.fontName;
    const fontSize = isMixed(node.fontSize) ? 14 : node.fontSize;
    const lineHeightRaw = node.lineHeight;
    let lineHeight = { value: 0, unit: "AUTO" };
    if (!isMixed(lineHeightRaw)) {
      const lh = lineHeightRaw;
      lineHeight = lh.unit === "AUTO" ? { value: 0, unit: "AUTO" } : { value: lh.value, unit: lh.unit };
    }
    const letterSpacingRaw = node.letterSpacing;
    const letterSpacing = isMixed(letterSpacingRaw) ? { value: 0, unit: "PERCENT" } : {
      value: letterSpacingRaw.value,
      unit: letterSpacingRaw.unit
    };
    return {
      characters: node.characters,
      fontSize,
      fontFamily: fontName.family,
      fontStyle: fontName.style,
      fontWeight: resolveFontWeight(fontName.style),
      lineHeight,
      letterSpacing,
      paragraphSpacing: safeNumber(node.paragraphSpacing),
      textAlignHorizontal: isMixed(node.textAlignHorizontal) ? "LEFT" : node.textAlignHorizontal,
      textCase: isMixed(node.textCase) ? "ORIGINAL" : String(node.textCase),
      textDecoration: isMixed(node.textDecoration) ? "NONE" : String(node.textDecoration)
    };
  }
  function buildNode(node, rootBox, depth) {
    var _a, _b, _c, _d;
    const box = "absoluteBoundingBox" in node ? node.absoluteBoundingBox : null;
    const x = box && rootBox ? box.x - rootBox.x : safeNumber(node.x);
    const y = box && rootBox ? box.y - rootBox.y : safeNumber(node.y);
    const width = box ? box.width : safeNumber(node.width);
    const height = box ? box.height : safeNumber(node.height);
    const geometry = node;
    const cornerRadius = "cornerRadius" in node && !isMixed(node.cornerRadius) ? safeNumber(node.cornerRadius) : 0;
    const strokeWeight = "strokeWeight" in geometry && !isMixed(geometry.strokeWeight) ? safeNumber(geometry.strokeWeight) : 0;
    const auto = node;
    const layoutMode = (_a = auto.layoutMode) != null ? _a : "NONE";
    const fills = "fills" in node ? extractPaints(node.fills) : [];
    const strokes = "strokes" in node ? extractPaints(node.strokes) : [];
    const auditNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      visible: node.visible,
      locked: node.locked,
      opacity: "opacity" in node ? safeNumber(node.opacity, 1) : 1,
      x,
      y,
      width,
      height,
      depth,
      fills,
      strokes,
      strokeWeight,
      cornerRadius,
      effects: "effects" in node ? extractEffects(node.effects) : [],
      layoutMode,
      itemSpacing: safeNumber(auto.itemSpacing),
      paddingTop: safeNumber(auto.paddingTop),
      paddingRight: safeNumber(auto.paddingRight),
      paddingBottom: safeNumber(auto.paddingBottom),
      paddingLeft: safeNumber(auto.paddingLeft),
      primaryAxisAlignItems: auto.primaryAxisAlignItems,
      counterAxisAlignItems: auto.counterAxisAlignItems,
      layoutGrow: node.layoutGrow,
      constraints: "constraints" in node && node.constraints ? {
        horizontal: node.constraints.horizontal,
        vertical: node.constraints.vertical
      } : void 0,
      mainComponentName: node.type === "INSTANCE" ? (_c = (_b = node.mainComponent) == null ? void 0 : _b.name) != null ? _c : void 0 : void 0,
      componentPropertyNames: node.type === "INSTANCE" ? Object.keys((_d = node.componentProperties) != null ? _d : {}) : void 0,
      isComponentInstance: node.type === "INSTANCE",
      hasImageFill: fills.some((f) => f.type === "IMAGE"),
      isMask: "isMask" in node ? Boolean(node.isMask) : false,
      reactions: extractReactions(node),
      text: node.type === "TEXT" ? extractText(node) : void 0,
      children: []
    };
    if ("children" in node) {
      for (const child of node.children) {
        auditNode.children.push(buildNode(child, rootBox, depth + 1));
      }
    }
    return auditNode;
  }
  function extractSnapshot(root) {
    const start = Date.now();
    const rootBox = "absoluteBoundingBox" in root ? root.absoluteBoundingBox : null;
    const tree = buildNode(root, rootBox, 0);
    const nodeCount = countNodes(tree);
    return {
      root: tree,
      nodeCount,
      extractionMs: Date.now() - start,
      documentName: figma.root.name,
      pageName: figma.currentPage.name
    };
  }
  function countNodes(node) {
    return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
  }
  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16)
    };
  }
  async function getNodesByIds(ids) {
    const nodes = [];
    for (const id of ids) {
      const node = await figma.getNodeByIdAsync(id);
      if (node && "type" in node && node.type !== "PAGE" && node.type !== "DOCUMENT") {
        nodes.push(node);
      }
    }
    return nodes;
  }
  async function locateNodes(ids) {
    const nodes = await getNodesByIds(ids);
    if (nodes.length === 0) {
      figma.notify("Could not find the layer — it may have been deleted.", {
        error: true
      });
      return;
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
  async function applyFix(fix) {
    var _a, _b, _c, _d;
    if (!fix.nodeId) {
      return { ok: false, message: "This fix has no target layer." };
    }
    const node = await figma.getNodeByIdAsync(fix.nodeId);
    if (!node) {
      return { ok: false, message: "Target layer no longer exists." };
    }
    try {
      switch (fix.kind) {
        case "setFontSize": {
          const text = node;
          if (text.type !== "TEXT") return notApplicable();
          await loadFonts(text);
          const size = parseFloat((_b = (_a = fix.suggestedValue) != null ? _a : fix.recommended) != null ? _b : "0");
          if (!size) return { ok: false, message: "No target size specified." };
          text.fontSize = size;
          break;
        }
        case "setLineHeight": {
          const text = node;
          if (text.type !== "TEXT") return notApplicable();
          await loadFonts(text);
          const value = parseFloat((_d = (_c = fix.suggestedValue) != null ? _c : fix.recommended) != null ? _d : "0");
          if (!value) return { ok: false, message: "No target line height." };
          text.lineHeight = { value, unit: "PERCENT" };
          break;
        }
        case "setTextColor":
        case "setFillColor": {
          const hex = fix.suggestedValue;
          if (!hex) return { ok: false, message: "No target color specified." };
          const { r, g, b } = hexToRgb(hex);
          if ("fills" in node) {
            const solid = {
              type: "SOLID",
              color: { r: r / 255, g: g / 255, b: b / 255 }
            };
            node.fills = [solid];
          }
          break;
        }
        default:
          return { ok: false, message: "This fix must be applied manually." };
      }
      figma.currentPage.selection = [node];
      return { ok: true, nodeId: fix.nodeId, message: "Fix applied." };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Failed to apply fix."
      };
    }
  }
  function notApplicable() {
    return { ok: false, message: "Fix not applicable to this layer type." };
  }
  async function loadFonts(text) {
    const fonts = text.getRangeAllFontNames(0, Math.max(text.characters.length, 1));
    await Promise.all(fonts.map((f) => figma.loadFontAsync(f)));
  }
  const SETTINGS_KEY = "inclusive-audit:settings";
  const UI_SIZE = { width: 880, height: 720 };
  figma.showUI(__html__, __spreadProps(__spreadValues({}, UI_SIZE), { themeColors: true }));
  function post(message) {
    figma.ui.postMessage(message);
  }
  function isFrameLike(node) {
    return node.type === "FRAME" || node.type === "COMPONENT" || node.type === "COMPONENT_SET" || node.type === "INSTANCE" || node.type === "SECTION" || node.type === "GROUP";
  }
  function currentSelectionState() {
    const selection = figma.currentPage.selection;
    const frame = selection.find(isFrameLike);
    return {
      hasFrame: Boolean(frame),
      frameName: frame == null ? void 0 : frame.name,
      frameId: frame == null ? void 0 : frame.id,
      selectionCount: selection.length
    };
  }
  function emitSelection() {
    post({ type: "selection-changed", selection: currentSelectionState() });
  }
  async function loadSettings() {
    try {
      const stored = await figma.clientStorage.getAsync(SETTINGS_KEY);
      return __spreadValues(__spreadValues({}, DEFAULT_SETTINGS), stored != null ? stored : {});
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }
  async function runAnalysis() {
    const selection = figma.currentPage.selection;
    const frame = selection.find(isFrameLike);
    if (!frame) {
      post({ type: "analysis-error", message: "Select a frame to begin." });
      return;
    }
    post({ type: "analysis-started" });
    post({ type: "analysis-progress", message: "Reading layers…", percent: 20 });
    await new Promise((r) => setTimeout(r, 0));
    try {
      const snapshot = extractSnapshot(frame);
      post({
        type: "analysis-progress",
        message: `Extracted ${snapshot.nodeCount} layers`,
        percent: 60
      });
      post({ type: "snapshot-ready", snapshot });
    } catch (err) {
      post({
        type: "analysis-error",
        message: err instanceof Error ? err.message : "Failed to read the frame."
      });
    }
  }
  const MAX_PREVIEW_DIMENSION = 1400;
  async function runSimulation() {
    var _a, _b, _c, _d;
    const selection = figma.currentPage.selection;
    const frame = selection.find(isFrameLike);
    if (!frame) {
      post({ type: "analysis-error", message: "Select a frame to begin." });
      return;
    }
    post({ type: "analysis-started" });
    post({ type: "analysis-progress", message: "Reading layers…", percent: 15 });
    await new Promise((r) => setTimeout(r, 0));
    try {
      const snapshot = extractSnapshot(frame);
      post({ type: "analysis-progress", message: "Rendering preview…", percent: 55 });
      const box = "absoluteBoundingBox" in frame ? frame.absoluteBoundingBox : null;
      const maxDim = Math.max((_a = box == null ? void 0 : box.width) != null ? _a : frame.width, (_b = box == null ? void 0 : box.height) != null ? _b : frame.height, 1);
      const scale = Math.max(0.25, Math.min(2, MAX_PREVIEW_DIMENSION / maxDim));
      const bytes = await frame.exportAsync({
        format: "PNG",
        constraint: { type: "SCALE", value: scale }
      });
      post({
        type: "simulation-ready",
        snapshot,
        image: {
          bytes,
          width: Math.round(((_c = box == null ? void 0 : box.width) != null ? _c : frame.width) * scale),
          height: Math.round(((_d = box == null ? void 0 : box.height) != null ? _d : frame.height) * scale),
          scale
        }
      });
    } catch (err) {
      post({
        type: "analysis-error",
        message: err instanceof Error ? err.message : "Failed to render the frame."
      });
    }
  }
  figma.on("selectionchange", emitSelection);
  figma.ui.onmessage = async (msg) => {
    var _a;
    switch (msg.type) {
      case "ui-ready": {
        emitSelection();
        const settings = await loadSettings();
        post({ type: "settings-loaded", settings });
        break;
      }
      case "request-selection":
        emitSelection();
        break;
      case "analyze":
        await runAnalysis();
        break;
      case "run-simulation":
        await runSimulation();
        break;
      case "locate":
        await locateNodes(msg.nodeIds);
        break;
      case "apply-fix": {
        const result = await applyFix(msg.fix);
        post({
          type: "fix-applied",
          ok: result.ok,
          nodeId: result.nodeId,
          message: result.message
        });
        figma.notify((_a = result.message) != null ? _a : result.ok ? "Fix applied" : "Fix failed", {
          error: !result.ok
        });
        break;
      }
      case "load-settings": {
        const settings = await loadSettings();
        post({ type: "settings-loaded", settings });
        break;
      }
      case "save-settings":
        await figma.clientStorage.setAsync(SETTINGS_KEY, msg.settings);
        break;
      case "resize":
        figma.ui.resize(Math.max(360, msg.width), Math.max(480, msg.height));
        break;
      case "notify":
        figma.notify(msg.message, { error: msg.error });
        break;
    }
  };
})();
