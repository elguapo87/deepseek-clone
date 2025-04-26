"use client";

import { useUser } from "@clerk/nextjs";
import { createContext } from "react";

interface AppContextType {

};

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: { children: React.ReactNode }) => {

    const { user } = useUser();

    const value = {
        user
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
};

export default AppContextProvider;