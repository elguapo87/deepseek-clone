"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { createContext, useEffect, useState } from "react";
import { UserResource } from "@clerk/types";
import axios from "axios";
import toast from "react-hot-toast";

interface AppContextType {
    user: UserResource | null | undefined;
    chats: any[];
    setChats: React.Dispatch<React.SetStateAction<any[]>>;
    selectedChat: any | null;
    setSelectedChat: React.Dispatch<React.SetStateAction<any | null>>;
    fetchUsersChats: () => Promise<void>;
    createNewChat: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const { getToken } = useAuth();

    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);

    const createNewChat = async () => {
        try {
            if (!user) return;

            const token = await getToken();

            await axios.post(
                "/api/chat/create",
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            await fetchUsersChats();

        } catch (error) {
            const errMessage =
                error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage || "Something went wrong.");
        }
    };

    const fetchUsersChats = async () => {
        try {
            const token = await getToken();

            const { data } = await axios.get("/api/chat/get", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.success) {
                setChats(data.data);

                if (data.data.length === 0) {
                    await createNewChat();
                    return fetchUsersChats();
                } else {
                    data.data.sort(
                        (
                            a: { updatedAt: string | number | Date },
                            b: { updatedAt: string | number | Date }
                        ) =>
                            new Date(b.updatedAt).getTime() -
                            new Date(a.updatedAt).getTime()
                    );

                    setSelectedChat(data.data[0]);
                }
            } else {
                toast.error(data.message || "Failed to load chats.");
            }
        } catch (error) {
            const errMessage =
                error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage || "Something went wrong.");
        }
    };

    useEffect(() => {
        if (user) {
            fetchUsersChats();
        }
    }, [user]);

    const value = {
        user,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        fetchUsersChats,
        createNewChat,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
