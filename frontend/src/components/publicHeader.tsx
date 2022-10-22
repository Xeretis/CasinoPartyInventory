import { Box, Burger, Drawer, Group, Header, Stack, Text, createStyles } from "@mantine/core";

import { ColorToggle } from "./colorToggle";
import { Link } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";

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

    links: {
        [theme.fn.smallerThan("sm")]: {
            display: "none",
        },
    },

    burger: {
        [theme.fn.largerThan("sm")]: {
            display: "none",
        },
    },

    link: {
        display: "block",
        lineHeight: 1,
        padding: "8px 12px",
        borderRadius: theme.radius.sm,
        textDecoration: "none",
        color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],
        fontSize: theme.fontSizes.sm,
        fontWeight: 500,

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
        },

        [theme.fn.smallerThan("sm")]: {
            borderRadius: 0,
            padding: theme.spacing.md,
        },
    },

    linkActive: {
        "&, &:hover": {
            backgroundColor: theme.fn.variant({ variant: "light", color: theme.primaryColor })
                .background,
            color: theme.fn.variant({ variant: "light", color: theme.primaryColor }).color,
        },
    },
}));

export function PublicHeader({ active }: { active: string }) {
    const links = [
        {
            link: "/",
            label: "Kincstár",
        },
        {
            link: "/login",
            label: "Admin belépés",
        },
    ];

    const [opened, { toggle, close }] = useDisclosure(false);
    const { classes, cx } = useStyles();

    const items = links.map((link) => (
        <Link
            key={link.label}
            to={link.link}
            className={cx(classes.link, { [classes.linkActive]: active === link.link })}
        >
            {link.label}
        </Link>
    ));

    return (
        <Header withBorder={false} height={HEADER_HEIGHT} className={classes.root}>
            <Box className={classes.header} p="md">
                <Text weight={500} size="lg">
                    Casino párt
                </Text>

                <Group>
                    <ColorToggle />

                    <Group spacing={5} className={classes.links}>
                        {items}
                    </Group>

                    <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />
                </Group>

                <Drawer
                    opened={opened}
                    position="right"
                    title="Navigáció"
                    padding="lg"
                    onClose={() => close()}
                >
                    <Stack spacing={5}>{items}</Stack>
                </Drawer>
            </Box>
        </Header>
    );
}
