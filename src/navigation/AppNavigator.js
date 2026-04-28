import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { borderRadius, hs, isTablet, ms, rf, s } from "../utils/responsive";

// Screens
// import AddContactScreen from "../screens/AddContactScreen";
import AddDocumentScreen from "../screens/AddDocumentScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import AddMaintenanceScreen from "../screens/AddMaintenanceScreen";
import AddRepairScreen from "../screens/AddRepairScreen";
import AddVehicleScreen from "../screens/AddVehicleScreen";
import AlertSummaryScreen from "../screens/AlertSummaryScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
// import ContactsScreen from "../screens/ContactsScreen";
import CurrencySettingsScreen from "../screens/CurrencySettingsScreen";
import DataManagementScreen from "../screens/DataManagementScreen";
import DocumentsScreen from "../screens/DocumentsScreen";
import HomeScreen from "../screens/HomeScreen";
import InvestmentDetailScreen from "../screens/InvestmentDetailScreen";
import LearnCarScreen from "../screens/LearnCarScreen";
import LearnMoreScreen from "../screens/LearnMoreScreen";
import MaintenanceHistoryScreen from "../screens/MaintenanceHistoryScreen";
import MoreScreen from "../screens/MoreScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import RecommendationsScreen from "../screens/RecommendationsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import StatsScreen from "../screens/StatsScreen";
import TipsScreen from "../screens/TipsScreen";
import UpdateKmScreen from "../screens/UpdateKmScreen";
import VehicleDetailScreen from "../screens/VehicleDetailScreen";
import VehicleDocumentsScreen from "../screens/VehicleDocumentsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color, size, containerSize }) => (
  <View
    style={{
      width: containerSize,
      height: containerSize,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Ionicons name={name} size={size} color={color} />
  </View>
);

// Stack Navigator para el Home y sus pantallas relacionadas
const HomeStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primaryDark,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: rf(18),
        },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{ title: "Detalle del Vehículo" }}
      />
      <Stack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={({ route }) => ({
          title: route.params?.vehicle ? "Editar Vehículo" : "Agregar Vehículo",
        })}
      />
      <Stack.Screen
        name="AddMaintenance"
        component={AddMaintenanceScreen}
        options={{ title: "Agregar Mantenimiento" }}
      />
      <Stack.Screen
        name="UpdateKm"
        component={UpdateKmScreen}
        options={{ title: "Actualizar Kilometraje" }}
      />
      <Stack.Screen
        name="MaintenanceHistory"
        component={MaintenanceHistoryScreen}
        options={{ title: "Historial de Mantenimientos" }}
      />
      <Stack.Screen
        name="AlertSummary"
        component={AlertSummaryScreen}
        options={{ title: "Resumen de Alertas" }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator para Historial
const HistoryStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primaryDark,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: rf(18),
        },
      }}
    >
      <Stack.Screen
        name="HistoryMain"
        component={MaintenanceHistoryScreen}
        options={{ title: "Historial de Mantenimientos" }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator para Inversión
const StatsStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primaryDark,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: rf(18),
        },
      }}
    >
      <Stack.Screen
        name="StatsMain"
        component={StatsScreen}
        options={{ title: "Inversión" }}
      />
      <Stack.Screen
        name="InvestmentDetail"
        component={InvestmentDetailScreen}
        options={{ title: "Detalle de Inversión" }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ title: "Agregar otro" }}
      />
      <Stack.Screen
        name="AddRepair"
        component={AddRepairScreen}
        options={{ title: "Agregar Reparación" }}
      />
      <Stack.Screen
        name="MaintenanceHistory"
        component={MaintenanceHistoryScreen}
        options={{ title: "Historial de Mantenimientos" }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator para Documentos
const DocumentsStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primaryDark,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: rf(18),
        },
      }}
    >
      <Stack.Screen
        name="DocumentsMain"
        component={DocumentsScreen}
        options={{ title: "Documentos" }}
      />
      <Stack.Screen
        name="VehicleDocuments"
        component={VehicleDocumentsScreen}
        options={{ title: "Documentos del Vehículo" }}
      />
      <Stack.Screen
        name="AddDocument"
        component={AddDocumentScreen}
        options={{ title: "Agregar Documento" }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator para Más opciones
const MoreStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primaryDark,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: rf(18),
        },
      }}
    >
      <Stack.Screen
        name="MoreMain"
        component={MoreScreen}
        options={{ title: "Más" }}
      />
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: "Configuración" }}
      />
      <Stack.Screen
        name="CurrencySettings"
        component={CurrencySettingsScreen}
        options={{ title: "Moneda" }}
      />
      <Stack.Screen
        name="LearnMore"
        component={LearnMoreScreen}
        options={{ title: "Tips & Guías" }}
      />
      <Stack.Screen
        name="Tips"
        component={TipsScreen}
        options={{ title: "Consejos" }}
      />
      <Stack.Screen
        name="Recommendations"
        component={RecommendationsScreen}
        options={{ title: "Recomendaciones" }}
      />
      <Stack.Screen
        name="LearnCar"
        component={LearnCarScreen}
        options={{ title: "Aprende sobre tu auto" }}
      />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: "Tipos de Mantenimientos" }}
      />
      <Stack.Screen
        name="DocumentTypes"
        component={require("../screens/DocumentTypesScreen").default}
        options={{ title: "Tipos de Documentos" }}
      />
      {/*
      <Stack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ title: "Contactos" }}
      />
      <Stack.Screen
        name="AddContact"
        component={AddContactScreen}
        options={{ title: "Agregar Contacto" }}
      />
      */}
      <Stack.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ title: "Notificaciones" }}
      />
      <Stack.Screen
        name="DataManagement"
        component={DataManagementScreen}
        options={{ title: "Gestión de datos" }}
      />
      <Stack.Screen
        name="About"
        component={require("../screens/AboutScreen").default}
        options={{ title: "Acerca de" }}
      />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator principal
const AppNavigator = () => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const tablet = isTablet();
  const tabIconSize = tablet ? rf(24) : rf(21);
  const tabLabelSize = tablet ? rf(13) : rf(12);
  const tabIconContainerSize = tablet ? ms(34) : ms(28);
  const tabBarBottomPadding =
    Platform.OS === "ios"
      ? Math.max(insets.bottom, tablet ? ms(16) : ms(12))
      : tablet
        ? ms(10)
        : ms(8);
  const tabBarHeight =
    Platform.OS === "ios"
      ? (tablet ? ms(70) : ms(60)) + tabBarBottomPadding
      : (tablet ? ms(74) : ms(66)) + tabBarBottomPadding;
  const tabBarBottomOffset = Platform.OS === "ios" ? ms(10) : ms(6);
  const tabBarReservedSpace = tabBarHeight + tabBarBottomOffset;
  const navigationTheme = isDarkMode
    ? {
        ...NavigationDarkTheme,
        colors: {
          ...NavigationDarkTheme.colors,
          background: colors.background,
          card: colors.background,
          border: colors.border,
          primary: colors.primaryDark,
          text: colors.text,
        },
      }
    : {
        ...NavigationDefaultTheme,
        colors: {
          ...NavigationDefaultTheme.colors,
          background: colors.background,
          card: colors.background,
          border: colors.border,
          primary: colors.primaryDark,
          text: colors.text,
        },
      };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          sceneStyle: {
            paddingBottom: tabBarReservedSpace,
          },
          tabBarLabelPosition: "below-icon",
          tabBarIcon: ({ focused, color }) => {
            let iconName;

            if (route.name === "Inicio") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "MRO") {
              iconName = focused ? "cash" : "cash-outline";
            } else if (route.name === "Documentos") {
              iconName = focused ? "document-text" : "document-text-outline";
            } else if (route.name === "Más") {
              iconName = focused
                ? "ellipsis-horizontal-circle"
                : "ellipsis-horizontal-circle-outline";
            }

            return (
              <TabBarIcon
                name={iconName}
                color={color}
                size={tabIconSize}
                containerSize={tabIconContainerSize}
              />
            );
          },
          tabBarActiveTintColor: colors.primaryDark,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            position: "absolute",
            left: hs(14),
            right: hs(14),
            bottom: tabBarBottomOffset,
            backgroundColor: colors.tabBarBackground,
            borderTopWidth: 0,
            borderRadius: borderRadius.xl,
            paddingBottom: tabBarBottomPadding,
            paddingTop: tablet ? ms(8) : ms(4),
            height: tabBarHeight,
            elevation: 8,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: s(6) },
            shadowOpacity: 0.12,
            shadowRadius: s(14),
          },
          tabBarItemStyle: {
            paddingVertical: tablet ? ms(4) : 0,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: borderRadius.lg,
          },
          tabBarLabelStyle: {
            fontSize: tabLabelSize,
            fontWeight: "600",
            includeFontPadding: false,
            marginTop: tablet ? ms(1) : 0,
            textAlign: "center",
          },
          tabBarIconStyle: {
            marginTop: 0,
            height: tabIconContainerSize,
            width: tabIconContainerSize,
          },
        })}
      >
        <Tab.Screen
          name="Inicio"
          component={HomeStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              navigation.navigate("Inicio", { screen: "HomeMain" });
            },
          })}
        />
        <Tab.Screen
          name="MRO"
          component={StatsStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              navigation.navigate("MRO", { screen: "StatsMain" });
            },
          })}
        />
        <Tab.Screen
          name="Documentos"
          component={DocumentsStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              navigation.navigate("Documentos", { screen: "DocumentsMain" });
            },
          })}
        />
        <Tab.Screen
          name="Más"
          component={MoreStack}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              navigation.navigate("Más", { screen: "MoreMain" });
            },
          })}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;
