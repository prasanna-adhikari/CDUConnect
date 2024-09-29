import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigation from "./src/navigation/AppNavigation";
import { DefaultTheme } from "react-native-paper";
import Toast from "react-native-toast-message";
export default function App() {
  return (
    <PaperProvider>
      <AppNavigation />
      <Toast />
    </PaperProvider>
  );
}
