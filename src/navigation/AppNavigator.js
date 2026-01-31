import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Platform } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { isTablet, ms, rf } from "../utils/responsive";

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

// Stack Navigator para el Home y sus pantallas relacionadas
const HomeStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
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
          backgroundColor: colors.primary,
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
          backgroundColor: colors.primary,
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
          backgroundColor: colors.primary,
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
          backgroundColor: colors.primary,
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
        options={{ title: "Gestión de Datos" }}
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
  const { colors } = useTheme();
  const tablet = isTablet();
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarLabelPosition: "below-icon",
          tabBarIcon: ({ focused, color, size }) => {
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
              <Ionicons
                name={iconName}
                size={ms(tablet ? size - 1 : size)}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            borderTopWidth: ms(1),
            borderTopColor: colors.tabBarBorder,
            paddingBottom:
              Platform.OS === "ios"
                ? tablet
                  ? ms(24)
                  : 34
                : tablet
                  ? ms(16)
                  : 44,
            paddingTop: tablet ? ms(8) : 8,
            height:
              Platform.OS === "ios"
                ? tablet
                  ? ms(84)
                  : 95
                : tablet
                  ? ms(84)
                  : 96,
            elevation: ms(8),
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: ms(-2) },
            shadowOpacity: 0.1,
            shadowRadius: ms(3),
          },
          tabBarItemStyle: {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          },
          tabBarLabelStyle: {
            fontSize: rf(13),
            fontWeight: "600",
            marginBottom: ms(4),
            textAlign: "center",
            gap: ms(2),
          },
          tabBarIconStyle: {
            marginTop: ms(4),
            height: ms(24),
            width: ms(24),
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
