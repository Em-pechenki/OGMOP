import { useThemeContext } from "@frontend/context/ThemeContext";

export function useTheme() {
  return useThemeContext();
}

export default useTheme;