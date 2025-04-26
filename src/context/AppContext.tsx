"use client";

import { useUser } from "@clerk/nextjs";
import { createContext } from "react";
import { UserResource } from "@clerk/types";
 
interface AppContextType {
    user: UserResource | null | undefined;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: { children: React.ReactNode }) => {

    const { user } = useUser();

    console.log(user);
    

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