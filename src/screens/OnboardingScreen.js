import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ms, rf } from "../utils/responsive";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    title: "¡Bienvenido a Auto Guardian!",
    description:
      "Tu asistente personal para mantener tus vehículos en perfectas condiciones.",
    icon: "🚗",
  },
  {
    id: 2,
    title: "Gestión de Vehículos",
    description:
      "Registra todos tus vehículos, mantén un historial completo y organiza tu flota.",
    icon: "📋",
  },
  {
    id: 3,
    title: "Mantenimiento Inteligente",
    description:
      "Recibe alertas automáticas de mantenimiento, registra servicios y controla gastos.",
    icon: "🔧",
  },
  {
    id: 4,
    title: "Documentos y Más",
    description:
      "Guarda documentos importantes, administra gastos y mantén todo organizado.",
    icon: "📄",
  },
];

export const OnboardingScreen = ({ onComplete }) => {
  const { colors } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("onboardingCompleted", "true");
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.primaryDark }]}
    >
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{slide.icon}</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                currentSlide === index && [
                  styles.activeIndicator,
                  { backgroundColor: "#fff" },
                ],
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: "#fff" }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, { color: colors.primaryDark }]}>
            {currentSlide === slides.length - 1 ? "Comenzar" : "Siguiente"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: ms(20),
    paddingTop: ms(50),
  },
  skipButton: {
    paddingVertical: ms(8),
    paddingHorizontal: ms(16),
  },
  skipText: {
    color: "#fff",
    fontSize: rf(16),
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: ms(40),
  },
  iconContainer: {
    width: ms(120),
    height: ms(120),
    borderRadius: ms(60),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: ms(40),
  },
  icon: {
    fontSize: rf(60),
  },
  textContainer: {
    alignItems: "center",
    maxWidth: ms(300),
  },
  title: {
    fontSize: rf(24),
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: ms(20),
  },
  description: {
    fontSize: rf(14),
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: ms(22),
  },
  footer: {
    paddingHorizontal: ms(20),
    paddingBottom: ms(40),
    paddingTop: ms(20),
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: ms(30),
  },
  indicator: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    marginHorizontal: ms(5),
  },
  activeIndicator: {
    width: ms(20),
  },
  nextButton: {
    paddingVertical: ms(15),
    paddingHorizontal: ms(30),
    borderRadius: ms(25),
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: rf(18),
    fontWeight: "bold",
  },
});

export default OnboardingScreen;
