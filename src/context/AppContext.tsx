"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";
import { UserResource } from "@clerk/types";
import axios from "axios";
import toast from "react-hot-toast";

interface AppContextType {
    user: UserResource | null | undefined;
    chats: any[]; // Or replace `any` with a specific type if known, e.g., `Chat[]`
    setChats: Dispatch<SetStateAction<never[]>>;
    selectedChat: any | null;
    setSelectedChat: Dispatch<SetStateAction<any | null>>;
    fetchUsersChats: () => Promise<void>;
    createNewChat: () => Promise<void>;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: { children: React.ReactNode }) => {

    const { user } = useUser();
    const { getToken } = useAuth();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);

    const createNewChat = async (): Promise<void> => {
        try {
            if (!user) return;
    
            const token = await getToken();
    
            const { data } = await axios.post("/api/chat/create", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (data.success) {
                toast.success(data.message);
                await fetchUsersChats();
    
            } else {
                toast.error(data.message);
            }
    
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };

    
    const fetchUsersChats = async () => {
        try {
            const token = await getToken();

            const { data } = await axios.get("/api/chat/get", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                console.log(data.data);
                setChats(data.data);

                // If user has no chats, create one
                if (data.data.length === 0) {
                    await createNewChat();
                    return fetchUsersChats();

                } else {
                    // Sort chats by updated date
                    data.data.sort((a: { updatedAt: string | number | Date; }, b: { updatedAt: string | number | Date; }) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

                    // Set recently updated chat as selected chat
                    setSelectedChat(data.data[0]);
                    console.log(data.data[0]);
                }

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };
    

    useEffect(() => {
        if (user) {
            fetchUsersChats();
        }
    }, [user]);

    const value = {
        user,
        chats, setChats,
        selectedChat, setSelectedChat,
        fetchUsersChats,
        createNewChat
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
};

export default AppContextProvider;