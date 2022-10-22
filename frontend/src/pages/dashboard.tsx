import {
    AppShell,
    Button,
    Center,
    FileInput,
    Group,
    Loader,
    Modal,
    NumberInput,
    Select,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    TextInput,
    createStyles,
} from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";

import { AdminHeader } from "../components/adminHeader";
import { EditItemCard } from "../components/editItemCard";
import { useForm } from "@mantine/form";
import { usePocketbase } from "../hooks/pocketbaseHooks";

const useStyles = createStyles((theme) => ({
    topContainer: {
        alignItems: "center",
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

export const DashboardPage = () => {
    const { classes } = useStyles();
    const client = usePocketbase();
    const [items, setItems] = useState<any>({});
    const [categories, setCategories] = useState<any>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [itemModalOpened, setItemModalOpened] = useState(false);
    const [editItemModalOpened, setEditItemModalOpened] = useState(false);

    const itemForm = useForm({
        initialValues: {
            name: "",
            category: "",
            amount: 0,
            auction: false,
            image: null,
        },
    });

    const editItemForm = useForm({
        initialValues: {
            id: "",
            name: "",
            category: "",
            amount: 0,
            auction: false,
            image: null,
        },
    });

    useEffect(() => {
        (async () => {
            try {
                const resItems = await client?.records.getFullList("items", 1024, {
                    expand: "category",
                });
                const itemMap = resItems?.reduce((map: any, item: any) => {
                    map[item.id] = item;
                    return map;
                }, {});
                setItems(itemMap);

                const resCategories = await client?.records.getFullList("categories", 1024);
                const categoryMap = resCategories?.map((category) => ({
                    value: category.id,
                    label: category.name,
                }));
                setCategories(categoryMap);

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

                    setCategories((categories: any) => {
                        const newCategories = [...categories];
                        const index = newCategories.findIndex((c) => c.value === category.id);
                        if (index === -1) {
                            newCategories.push({
                                value: category.id,
                                label: category.name,
                            });
                        } else {
                            newCategories[index] = {
                                value: category.id,
                                label: category.name,
                            };
                        }
                        return newCategories;
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

        //* No need for it here as it's done on logout (or cleared up by the server after inactivity)
        // return () => {
        //     client?.realtime.unsubscribe();
        // };
    }, [client]);

    const onNewAmount = async (item: any, amount: number) => {
        try {
            await client?.records.update("items", item.id, { amount });
        } catch (e) {
            console.error(e);
        }
    };

    const onEditItem = async (item: any) => {
        editItemForm.setValues({
            id: item.id,
            name: item.name,
            category: item.category,
            amount: item.amount,
            auction: item.auction,
            image: null,
        });
        setEditItemModalOpened(true);
    };

    const renderedItems = useMemo(() => {
        if (items) {
            return Object.values(items).map((item: any) => (
                <EditItemCard
                    item={item}
                    onEdit={onEditItem}
                    onNewAmount={onNewAmount}
                    key={item.id}
                />
            ));
        }
    }, [items]);

    if (loading) {
        return (
            <AppShell header={<AdminHeader />}>
                <Center className={classes.centeredContainer}>
                    <Loader size="xl" />
                </Center>
            </AppShell>
        );
    }

    if (error) {
        return (
            <AppShell header={<AdminHeader />}>
                <Center className={classes.centeredContainer}>
                    <Text color="red" align="center">
                        {error}
                    </Text>
                </Center>
            </AppShell>
        );
    }

    const itemSubmit = itemForm.onSubmit(async (values) => {
        console.log(values);
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("category", values.category);
        formData.append("amount", values.amount.toString());
        formData.append("auction", String(values.auction));
        //@ts-ignore
        if (values.image) formData.append("image", values.image);
        try {
            await client?.records.create("items", formData);
            setItemModalOpened(false);
        } catch (e) {
            console.error(e.data);
            e.data &&
                itemForm.setFieldError(
                    "name",
                    e.data.data.name ? e.data.data.name.message ?? "" : ""
                );
            e.data &&
                itemForm.setFieldError(
                    "category",
                    e.data.data.category ? e.data.data.category.message ?? "" : ""
                );
            e.data &&
                itemForm.setFieldError(
                    "amount",
                    e.data.data.amount ? e.data.data.amount.message ?? "" : ""
                );
            e.data &&
                itemForm.setFieldError(
                    "auction",
                    e.data.data.auction ? e.data.data.auction.message ?? "" : ""
                );
            e.data &&
                itemForm.setFieldError(
                    "image",
                    e.data.data.image ? e.data.data.image.message ?? "" : ""
                );
        }
    });

    const editItemSubmit = editItemForm.onSubmit(async (values) => {
        console.log(values);
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("category", values.category);
        formData.append("amount", values.amount.toString());
        formData.append("auction", String(values.auction));
        //@ts-ignore
        if (values.image) formData.append("image", values.image);
        try {
            await client?.records.update("items", values.id, formData);
            setEditItemModalOpened(false);
        } catch (e) {
            console.error(e.data);
            e.data &&
                editItemForm.setFieldError(
                    "name",
                    e.data.data.name ? e.data.data.name.message ?? "" : ""
                );
            e.data &&
                editItemForm.setFieldError(
                    "category",
                    e.data.data.category ? e.data.data.category.message ?? "" : ""
                );
            e.data &&
                editItemForm.setFieldError(
                    "amount",
                    e.data.data.amount ? e.data.data.amount.message ?? "" : ""
                );
            e.data &&
                editItemForm.setFieldError(
                    "auction",
                    e.data.data.auction ? e.data.data.auction.message ?? "" : ""
                );
            e.data &&
                editItemForm.setFieldError(
                    "image",
                    e.data.data.image ? e.data.data.image.message ?? "" : ""
                );
        }
    });

    const deleteItem = async () => {
        try {
            await client?.records.delete("items", editItemForm.values.id);
            setEditItemModalOpened(false);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AppShell header={<AdminHeader />}>
            <Group position="apart" className={classes.topContainer} mb="md">
                <Text>Termékek</Text>
                <Button onClick={() => setItemModalOpened(true)} variant="light">
                    Új termék
                </Button>
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
                {renderedItems}
            </SimpleGrid>
            <Modal
                opened={itemModalOpened}
                onClose={() => setItemModalOpened(false)}
                title="Új termék"
                padding="lg"
            >
                <form onSubmit={(event) => itemSubmit(event)}>
                    <Stack spacing={5}>
                        <TextInput {...itemForm.getInputProps("name")} required label="Név" />
                        <Select
                            required
                            clearable={false}
                            data={categories || []}
                            {...itemForm.getInputProps("category")}
                            label="Kategória"
                        />
                        <NumberInput
                            required
                            {...itemForm.getInputProps("amount")}
                            min={0}
                            label="Mennyiség"
                        />
                        <Group position="apart" mb={-3} mt={5}>
                            <Text size="sm" weight={500}>
                                Árverés
                            </Text>
                            <Switch {...itemForm.getInputProps("auction", { type: "checkbox" })} />
                        </Group>
                        <FileInput
                            label="Kép"
                            accept="image/jpg, image/jpeg, image/png, image/svg+xml, image/gif"
                            clearable
                            {...itemForm.getInputProps("image")}
                        />
                        <Button type="submit" mt="sm">
                            Mentés
                        </Button>
                    </Stack>
                </form>
            </Modal>
            <Modal
                opened={editItemModalOpened}
                onClose={() => setEditItemModalOpened(false)}
                title="Termék szerkesztése"
                padding="lg"
            >
                <form onSubmit={(event) => editItemSubmit(event)}>
                    <Stack spacing={5}>
                        <TextInput {...editItemForm.getInputProps("name")} required label="Név" />
                        <Select
                            data={categories || []}
                            required
                            {...editItemForm.getInputProps("category")}
                            label="Kategória"
                        />
                        <NumberInput
                            {...editItemForm.getInputProps("amount")}
                            required
                            min={0}
                            label="Mennyiség"
                        />
                        <Group position="apart" mb={-3} mt={5}>
                            <Text size="sm" weight={500}>
                                Árverés
                            </Text>
                            <Switch
                                {...editItemForm.getInputProps("auction", { type: "checkbox" })}
                            />
                        </Group>
                        <FileInput
                            label="Kép"
                            accept="image/jpg, image/jpeg, image/png, image/svg+xml, image/gif"
                            clearable
                            placeholder="Jelenleg kiválasztott/kategória kép"
                            {...editItemForm.getInputProps("image")}
                        />
                        <Group position="apart">
                            <Button onClick={() => deleteItem()} color="red" mt="sm">
                                Törlés
                            </Button>
                            <Button type="submit" mt="sm">
                                Mentés
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </AppShell>
    );
};
