// Country passport photo presets. Dimensions in mm, DPI for print.
export type Preset = {
  id: string;
  name: string;
  flag: string;
  width: number; // mm
  height: number; // mm
  headMin: number; // mm — head height min
  headMax: number; // mm — head height max
  bg: string; // recommended background color
  dpi: number;
};

export const PRESETS: Preset[] = [
  { id: "in", name: "India Passport", flag: "🇮🇳", width: 35, height: 45, headMin: 25, headMax: 35, bg: "#ffffff", dpi: 600 },
  { id: "us", name: "USA Passport", flag: "🇺🇸", width: 51, height: 51, headMin: 25, headMax: 35, bg: "#ffffff", dpi: 600 },
  { id: "uk", name: "UK Passport", flag: "🇬🇧", width: 35, height: 45, headMin: 29, headMax: 34, bg: "#dcdcdc", dpi: 600 },
  { id: "ca", name: "Canada Passport", flag: "🇨🇦", width: 50, height: 70, headMin: 31, headMax: 36, bg: "#ffffff", dpi: 600 },
  { id: "schengen", name: "Schengen Visa", flag: "🇪🇺", width: 35, height: 45, headMin: 32, headMax: 36, bg: "#ffffff", dpi: 600 },
  { id: "bd", name: "Bangladesh", flag: "🇧🇩", width: 45, height: 55, headMin: 30, headMax: 36, bg: "#ffffff", dpi: 600 },
  { id: "aadhaar", name: "Aadhaar", flag: "🇮🇳", width: 35, height: 45, headMin: 25, headMax: 35, bg: "#ffffff", dpi: 300 },
  { id: "pan", name: "PAN Card", flag: "🇮🇳", width: 25, height: 35, headMin: 18, headMax: 25, bg: "#ffffff", dpi: 300 },
];

export const BG_COLORS = [
  { id: "white", name: "Pure White", color: "#ffffff" },
  { id: "blue", name: "Passport Blue", color: "#6ea7d5" },
  { id: "gray", name: "Visa Gray", color: "#dcdcdc" },
  { id: "red", name: "Red", color: "#d23030" },
  { id: "cream", name: "Cream", color: "#f5f0e6" },
  { id: "sky", name: "Sky", color: "#cfe8ff" },
];

export const PRINT_SIZES = [
  { id: "4r", name: "4R (6×4 in)", w: 152, h: 102 },
  { id: "a4", name: "A4 (210×297)", w: 210, h: 297 },
  { id: "letter", name: "Letter (8.5×11)", w: 216, h: 279 },
];
