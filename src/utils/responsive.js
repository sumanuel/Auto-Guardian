import { Dimensions, PixelRatio } from "react-native";

const BASE_WIDTH = 375; // iPhone X-ish baseline
const MIN_SCALE = 1; // no shrink on small devices (your phone already looks good)
const MAX_SCALE = 1.45; // avoid comically large UI on very big screens

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getScale = () => {
  const { width, height } = Dimensions.get("window");
  const shortSide = Math.min(width, height);
  return clamp(shortSide / BASE_WIDTH, MIN_SCALE, MAX_SCALE);
};

export const s = (size) => size * getScale();

export const ms = (size, factor = 0.6) => {
  const scaled = s(size);
  return size + (scaled - size) * factor;
};

// Slightly stronger default scaling for typography.
export const rf = (fontSize, factor = 0.85) => {
  const scaled = ms(fontSize, factor);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

export const isTablet = () => {
  const { width, height } = Dimensions.get("window");
  return Math.min(width, height) >= 600;
};
