import { AspectRatio, Badge, Card, Group, Image, Text, createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
    card: {
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
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

export const ItemCard = ({ item }: { item: any }) => {
    const { classes } = useStyles();

    return (
        <Card p="md" radius="md" className={classes.card}>
            <AspectRatio ratio={1920 / 1080}>
                <Image
                    src={
                        item.image
                            ? `${import.meta.env.VITE_BACKEND_URL}/api/files/items/${item.id}/${
                                  item.image
                              }`
                            : `${import.meta.env.VITE_BACKEND_URL}/api/files/categories/${
                                  item["@expand"].category.id
                              }/${item["@expand"].category.image}`
                    }
                />
            </AspectRatio>
            <Group position="apart" className={classes.spacedContainer} pt="md">
                <Text
                    color="dimmed"
                    size="xs"
                    transform="uppercase"
                    weight={700}
                    className={classes.categoryText}
                >
                    {item["@expand"].category.name}
                </Text>
                {item.auction && <Badge>Árverés</Badge>}
            </Group>
            <Group position="apart" className={classes.spacedContainer} pt={5}>
                <Text className={classes.nameText}>{item.name}</Text>
                <Text>{item.amount}db</Text>
            </Group>
        </Card>
    );
};
