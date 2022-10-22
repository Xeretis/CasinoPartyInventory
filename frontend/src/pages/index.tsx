import {
    Anchor,
    AppShell,
    Center,
    Group,
    Loader,
    Modal,
    MultiSelect,
    NumberInput,
    SimpleGrid,
    Text,
    createStyles,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

import { ItemCard } from "../components/itemCard";
import { PublicHeader } from "../components/publicHeader";
import { usePocketbase } from "../hooks/pocketbaseHooks";

const useStyles = createStyles((theme) => ({
    topContainer: {
        alignItems: "flex-end",
    },
    centeredContainer: {
        height: "100%",
    },
    card: {
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0],
    },
    spacedContainer: {
        alignItems: "center",
    },
    categoryText: {
        width: "60%",
    },
    nameText: {
        width: "70%",
    },
}));

export const IndexPage = () => {
    const { classes } = useStyles();
    const client = usePocketbase();
    const [items, setItems] = useState<any>({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [filterOpened, setFilterOpened] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string[]>([]);
    const [filterAmount, setFilterAmount] = useState<number>(0);

    useEffect(() => {
        (async () => {
            try {
                const res = await client?.records.getFullList("items", 1024, {
                    expand: "category",
                });
                const itemMap = res?.reduce((map: any, item: any) => {
                    map[item.id] = item;
                    return map;
                }, {});
                setItems(itemMap);

                await client?.realtime.subscribe("items", async (event) => {
                    const item = event.record;
                    if (event.action === "delete") {
                        setItems((items: any) => {
                            const newItems = { ...items };
                            delete newItems[item.id];
                            return newItems;
                        });
                        return;
                    }
                    if (
                        items[item.id] &&
                        Object.keys(items[item.id]["@expand"]).indexOf("category") !== -1 &&
                        item.category === items[item.id].category
                    ) {
                        //@ts-ignore
                        delete item["@expand"];
                    } else {
                        const category = await client?.records.getOne("categories", item.category);
                        item["@expand"] = { category };
                    }
                    setItems((items: any) => ({
                        ...items,
                        [item.id]: {
                            ...items[item.id],
                            ...item,
                        },
                    }));
                });

                await client?.realtime.subscribe("categories", (event) => {
                    const category = event.record;
                    setItems((items: any) => {
                        const newItems = { ...items };

                        for (const item of Object.values(items) as any[]) {
                            if (item["@expand"].category.id === category.id) {
                                newItems[item.id] = {
                                    ...item,
                                    "@expand": {
                                        category: {
                                            ...item["@expand"].category,
                                            ...category,
                                        },
                                    },
                                };
                            }
                        }

                        return newItems;
                    });
                });
                console.log(items);
            } catch (e) {
                if (e.originalError && e.originalError.name === "AbortError") return;
                console.error(e.originalError ?? e);
                setError(
                    "Nem sikerült a termékek lekérése. Kérlek frissítsd az oldalt vagy próbáld újra később."
                );
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            client?.realtime.unsubscribe();
        };
    }, [client]);

    const renderedItems = useMemo(() => {
        if (items) {
            const list = [];
            for (const item of Object.values(items) as any[]) {
                if (
                    filterCategory.length > 0 &&
                    !filterCategory.includes(item["@expand"].category.id)
                ) {
                    continue;
                }

                if (item.amount < filterAmount) {
                    continue;
                }

                list.push(<ItemCard item={item} key={item.id} />);
            }
            return list;
        }
    }, [items, filterCategory, filterAmount]);

    const categories = useMemo(() => {
        if (items) {
            const categories = [];
            for (const item of Object.values(items) as any[]) {
                categories.push({
                    value: item["@expand"].category.id,
                    label: item["@expand"].category.name,
                });
            }
            return categories.filter(
                (value, index, self) =>
                    index ===
                    self.findIndex((t) => t.value === value.value && t.label === value.label)
            );
        }
    }, [items]);

    if (loading) {
        return (
            <AppShell header={<PublicHeader active="/" />}>
                <Center className={classes.centeredContainer}>
                    <Loader size="xl" />
                </Center>
            </AppShell>
        );
    }

    if (error) {
        return (
            <AppShell header={<PublicHeader active="/" />}>
                <Center className={classes.centeredContainer}>
                    <Text color="red" align="center">
                        {error}
                    </Text>
                </Center>
            </AppShell>
        );
    }

    return (
        <AppShell header={<PublicHeader active="/" />}>
            <Group position="apart" className={classes.topContainer} mb="md">
                <Text weight={500} size="lg" color="dimmed">
                    Kincstár
                </Text>
                <Anchor onClick={() => setFilterOpened(true)} weight={500} color="gray.6">
                    Szűrés
                </Anchor>
            </Group>
            <SimpleGrid
                cols={4}
                spacing="lg"
                breakpoints={[
                    { maxWidth: 1200, cols: 3, spacing: "md" },
                    { maxWidth: 900, cols: 2, spacing: "sm" },
                    { maxWidth: 600, cols: 1, spacing: "sm" },
                ]}
            >
                {renderedItems && renderedItems.length > 0 ? (
                    renderedItems
                ) : (
                    <Center className={classes.centeredContainer}>
                        <Text color="red" align="center">
                            {error}
                        </Text>
                    </Center>
                )}
            </SimpleGrid>
            <Modal
                opened={filterOpened}
                onClose={() => setFilterOpened(false)}
                title="Szűrés"
                padding="lg"
            >
                <MultiSelect
                    data={categories || []}
                    value={filterCategory}
                    onChange={(value) => setFilterCategory(value)}
                    label="Kategóriák:"
                    placeholder="Minden kategória"
                />
                <NumberInput
                    min={0}
                    value={filterAmount}
                    onChange={(value) => setFilterAmount(value || 0)}
                    label="Minimum mennyiség:"
                />
            </Modal>
        </AppShell>
    );
};
