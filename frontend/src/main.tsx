import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { useColorScheme, useHotkeys, useLocalStorage } from "@mantine/hooks";

import { AppRouter } from "./router/appRouter";
import { HashRouter } from "react-router-dom";
import { PocketbaseProvider } from "./context/pocketbase";
import ReactDOM from "react-dom/client";

const App = () => {
    const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: "theme",
        defaultValue: preferredColorScheme,
    });
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

    useHotkeys([["mod+J", () => toggleColorScheme()]]);

    return (
        <PocketbaseProvider serverURL={import.meta.env.VITE_BACKEND_URL}>
            <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
                <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                    <HashRouter>
                        <AppRouter />
                    </HashRouter>
                </MantineProvider>
            </ColorSchemeProvider>
        </PocketbaseProvider>
    );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
