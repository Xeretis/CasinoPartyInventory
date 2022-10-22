import {
    AppShell,
    Box,
    Button,
    Center,
    PasswordInput,
    TextInput,
    Title,
    createStyles,
} from "@mantine/core";

import { PublicHeader } from "../components/publicHeader";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import { usePocketbase } from "../hooks/pocketbaseHooks";
import { useState } from "react";

const useStyles = createStyles((theme) => ({
    container: {
        height: "100%",
        width: "100%",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        width: "25vw",

        [`@media (max-width: ${theme.breakpoints.lg}px)`]: {
            width: "35vw",
        },

        [`@media (max-width: ${theme.breakpoints.md}px)`]: {
            width: "45vw",
        },

        [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
            width: "65vw",
        },

        [`@media (max-width: ${theme.breakpoints.xs}px)`]: {
            width: "85vw",
        },
    },
}));

export const LoginPage = () => {
    const { classes } = useStyles();
    const [loading, setLoading] = useState(false);
    const form = useForm({
        initialValues: {
            email: "",
            password: "",
        },
    });

    const client = usePocketbase();
    const navigate = useNavigate();

    const submit = form.onSubmit(async (values) => {
        setLoading(true);
        try {
            await client?.admins.authViaEmail(values.email, values.password);
            navigate("/dashboard");
        } catch (e) {
            form.setFieldError("email", "Hibás email vagy jelszó");
            form.setFieldError("password", "Hibás email vagy jelszó");
        } finally {
            setLoading(false);
        }
    });

    return (
        <AppShell header={<PublicHeader active="/login" />}>
            <Center className={classes.container}>
                <form className={classes.form} onSubmit={(event) => submit(event)}>
                    <Title order={1} size="h2" align="center">
                        Admin belépés
                    </Title>
                    <TextInput
                        required
                        type="email"
                        mt="xs"
                        label="Email"
                        {...form.getInputProps("email")}
                    />
                    <PasswordInput
                        required
                        mt="xs"
                        label="Jelszó"
                        {...form.getInputProps("password")}
                    />
                    <Box mt="md">
                        <Button type="submit" loading={loading}>
                            Belépés
                        </Button>
                    </Box>
                </form>
            </Center>
        </AppShell>
    );
};
