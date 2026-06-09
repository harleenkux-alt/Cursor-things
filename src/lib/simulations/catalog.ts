import type { SimulationDefinition } from "./types";

export const simulations: SimulationDefinition[] = [
  {
    id: "cataracts",
    name: "Cataracts",
    category: "Visual",
    summary: "Blurred, yellowed, low-contrast vision that makes fine text and details harder to read.",
    designRisk: "Small text, subtle borders, and low-contrast controls can disappear."
  },
  {
    id: "glaucoma",
    name: "Glaucoma",
    category: "Visual",
    summary: "Tunnel-vision effect with the center preserved and peripheral information darkened.",
    designRisk: "Navigation, alerts, and secondary actions near edges may be missed."
  },
  {
    id: "low-vision",
    name: "Low Vision",
    category: "Visual",
    summary: "Strong blur and compressed contrast to model reduced visual acuity.",
    designRisk: "Dense layouts and fine interface details become difficult to distinguish."
  },
  {
    id: "protanopia",
    name: "Protanopia",
    category: "Visual",
    summary: "Red-light deficiency transformation using an accepted color-vision matrix.",
    designRisk: "Red and green status signals can become hard to separate."
  },
  {
    id: "deuteranopia",
    name: "Deuteranopia",
    category: "Visual",
    summary: "Green-light deficiency transformation using an accepted color-vision matrix.",
    designRisk: "Success/error states relying only on hue may lose meaning."
  },
  {
    id: "tritanopia",
    name: "Tritanopia",
    category: "Visual",
    summary: "Blue-light deficiency transformation using an accepted color-vision matrix.",
    designRisk: "Blue/yellow distinctions and chart palettes may collapse."
  },
  {
    id: "adhd",
    name: "ADHD",
    category: "Cognitive",
    summary: "Visual noise, competing highlights, and attention magnets that fragment focus.",
    designRisk: "Ads, badges, dense cards, and repeated CTAs can overpower the primary task."
  },
  {
    id: "dyslexia",
    name: "Dyslexia",
    category: "Cognitive",
    summary: "Reading instability through line jitter, ghosted glyphs, and subtle word-shape disruption.",
    designRisk: "Long paragraphs, tight line-height, and decorative text increase reading effort."
  },
  {
    id: "tremors",
    name: "Tremors",
    category: "Motor",
    summary: "Pointer shake, target drift, and repeated cursor offsets to model unstable movement.",
    designRisk: "Small controls and tightly clustered targets become error-prone."
  },
  {
    id: "limited-precision",
    name: "Limited Precision",
    category: "Motor",
    summary: "Hit-area uncertainty overlay showing where taps and clicks can land off-target.",
    designRisk: "Controls below recommended target size need more spacing and larger hit areas."
  }
];

export const simulationById = Object.fromEntries(simulations.map((simulation) => [simulation.id, simulation]));
