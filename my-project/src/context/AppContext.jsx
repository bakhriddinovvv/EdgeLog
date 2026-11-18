import { createContext, useContext, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { dict } from "../i18n";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("edgelog_theme", "dark");
  const [lang, setLang] = useLocalStorage("edgelog_lang", "uz");

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.lang = lang;
  }, [theme, lang]);

  const t = (key, vars = {}) => {
    let s = dict[lang][key] ?? dict.en[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => {
      s = s.replace(`{${k}}`, () => v);
    });
    return s;
  };

  return (
    <AppContext.Provider value={{ theme, setTheme, lang, setLang, t }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);