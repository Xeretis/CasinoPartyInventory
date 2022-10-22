import { PocketbaseContext } from "../context/pocketbase";
import { useContext } from "react";

export const usePocketbase = () => {
    return useContext(PocketbaseContext);
};

export const useAdmin = () => {
    const client = usePocketbase();

    return client?.authStore.model;
};
