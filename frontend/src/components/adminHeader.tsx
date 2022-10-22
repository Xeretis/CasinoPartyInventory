import { Box, Header, Text, UnstyledButton, createStyles } from "@mantine/core";

import { useNavigate } from "react-router-dom";
import { usePocketbase } from "../hooks/pocketbaseHooks";

const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
    root: {
        zIndex: 1,
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "100%",
        width: "100%",
    },

    logout: {
        display: "block",
        lineHeight: 1,
        padding: "8px 12px",
        borderRadius: theme.radius.sm,
        textDecoration: "none",
        fontSize: theme.fontSizes.sm,
        fontWeight: 500,
        color: theme.colors.red[6],

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        },

        [theme.fn.smallerThan("sm")]: {
            borderRadius: 0,
            padding: theme.spacing.md,
        },
    },
}));

export function AdminHeader() {
    const { classes } = useStyles();
    const client = usePocketbase();
    const navigate = useNavigate();

    return (
        <Header withBorder={false} height={HEADER_HEIGHT} className={classes.root}>
            <Box className={classes.header} p="md">
                <Text weight={500} size="lg">
                    Casino párt
                </Text>

                <UnstyledButton
                    className={classes.logout}
                    onClick={async () => {
                        await client?.realtime.unsubscribe();
                        client?.authStore.clear();
                        navigate("/");
                    }}
                >
                    Kilépés
                </UnstyledButton>
            </Box>
        </Header>
    );
}
