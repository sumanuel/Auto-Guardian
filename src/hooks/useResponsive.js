import { useWindowDimensions } from "react-native";

const guidelineBaseWidth = 375; // iPhone 6/7/8 width
const guidelineBaseHeight = 667; // iPhone 6/7/8 height

const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const scale = (size) => (width / guidelineBaseWidth) * size;
  const verticalScale = (size) => (height / guidelineBaseHeight) * size;
  const moderateScale = (size, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  return {
    width,
    height,
    scale,
    verticalScale,
    moderateScale,
    isSmallDevice: width < 375,
    isLargeDevice: width > 414,
  };
};

export { useResponsive };
export default useResponsive;
