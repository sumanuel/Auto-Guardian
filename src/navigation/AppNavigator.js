import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Platform } from "react-native";
import { useTheme } from "../context/ThemeContext";

// Screens
import AddContactScreen from "../screens/AddContactScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import AddMaintenanceScreen from "../screens/AddMaintenanceScreen";
import AddVehicleScreen from "../screens/AddVehicleScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import ContactsScreen from "../screens/ContactsScreen";
import HomeScreen from "../screens/HomeScreen";
import InvestmentDetailScreen from "../screens/InvestmentDetailScreen";
import MaintenanceHistoryScreen from "../screens/MaintenanceHistoryScreen";
import MoreScreen from "../screens/MoreScreen";
import SettingsScreen from "../screens/SettingsScreen";
import StatsScreen from "../screens/StatsScreen";
import UpdateKmScreen from "../screens/UpdateKmScreen";
import VehicleDetailScreen from "../screens/VehicleDetailScreen";

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
        options={{ title: "Agregar Gasto" }}
      />
      <Stack.Screen
        name="MaintenanceHistory"
        component={MaintenanceHistoryScreen}
        options={{ title: "Historial de Mantenimientos" }}
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
        name="Categories"
        component={CategoriesScreen}
        options={{ title: "Tipos de Mantenimientos" }}
      />
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
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Inicio") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Inversión") {
              iconName = focused ? "cash" : "cash-outline";
            } else if (route.name === "Más") {
              iconName = focused
                ? "ellipsis-horizontal-circle"
                : "ellipsis-horizontal-circle-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            borderTopWidth: 1,
            borderTopColor: colors.tabBarBorder,
            paddingBottom: Platform.OS === "ios" ? 34 : 16,
            paddingTop: 8,
            height: Platform.OS === "ios" ? 95 : 80,
            elevation: 8,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "600",
            marginBottom: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        })}
      >
        <Tab.Screen name="Inicio" component={HomeStack} />
        <Tab.Screen name="Inversión" component={StatsStack} />
        <Tab.Screen name="Más" component={MoreStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
