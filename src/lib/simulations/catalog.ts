import type { SimulationDefinition } from "./types";

export const simulations: SimulationDefinition[] = [
  {
    id: "low-vision",
    name: "Low Vision",
    category: "Visual",
    summary: "Strong blur and compressed contrast to model reduced visual acuity.",
    designRisk: "Dense layouts and fine interface details become difficult to distinguish."
  },
  {
    id: "deuteranopia",
    name: "Colorblindness (Deuteranopia)",
    category: "Visual",
    summary: "Green-light deficiency transformation using an accepted color-vision matrix.",
    designRisk: "Success/error states relying only on hue may lose meaning."
  },
  {
    id: "protanopia",
    name: "Colorblindness (Protanopia)",
    category: "Visual",
    summary: "Red-light deficiency transformation using an accepted color-vision matrix.",
    designRisk: "Red and green status signals can become hard to separate."
  },
  {
    id: "cataracts",
    name: "Cataracts",
    category: "Visual",
    summary: "Blurred, yellowed, low-contrast vision that makes fine text and details harder to read.",
    designRisk: "Small text, subtle borders, and low-contrast controls can disappear."
  },
  {
    id: "glare-sensitivity",
    name: "Glare Sensitivity",
    category: "Visual",
    summary: "Bright wash and bloom that flatten contrast under harsh lighting conditions.",
    designRisk: "Light backgrounds, glossy UI, and low-contrast text wash out in bright environments."
  },
  {
    id: "adhd",
    name: "ADHD Focus Mode",
    category: "Cognitive",
    summary: "Visual noise, competing highlights, and attention magnets that fragment focus.",
    designRisk: "Ads, badges, dense cards, and repeated CTAs can overpower the primary task."
  },
  {
    id: "cognitive-load",
    name: "Cognitive Load",
    category: "Cognitive",
    summary: "Overlapping UI cues and density that increase decision fatigue.",
    designRisk: "Too many simultaneous choices, labels, and states slow comprehension."
  },
  {
    id: "reading-difficulty",
    name: "Reading Difficulty",
    category: "Cognitive",
    summary: "Reading instability through line jitter, ghosted glyphs, and subtle word-shape disruption.",
    designRisk: "Long paragraphs, tight line-height, and decorative text increase reading effort."
  },
  {
    id: "tremors",
    name: "Tremor Simulation",
    category: "Motor",
    summary: "Pointer shake, target drift, and repeated cursor offsets to model unstable movement.",
    designRisk: "Small controls and tightly clustered targets become error-prone."
  },
  {
    id: "one-hand-navigation",
    name: "One-Hand Navigation",
    category: "Motor",
    summary: "Reach and precision constraints showing where controls are hard to tap one-handed.",
    designRisk: "Edge-positioned actions and small targets are difficult to reach with a thumb."
  }
];

export const simulationById = Object.fromEntries(simulations.map((simulation) => [simulation.id, simulation]));
