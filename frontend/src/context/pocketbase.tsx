import { createContext, useEffect, useState } from "react";

import PocketBase from "pocketbase";

export const PocketbaseContext = createContext<PocketBase | undefined>(undefined);

export type PocketbaseProviderProps = {
    children: React.ReactNode;
    serverURL: string;
};

export const PocketbaseProvider = ({ children, serverURL }: PocketbaseProviderProps) => {
    const [client, setClient] = useState<PocketBase | undefined>(undefined);

    useEffect(() => {
        const client = new PocketBase(serverURL);
        setClient(client);
    }, [serverURL]);

    return <PocketbaseContext.Provider value={client}>{children}</PocketbaseContext.Provider>;
};
