"use client";

import Image from 'next/image'
import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';

type HomePageProps = {
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>
}

 // eslint-disable-next-line @typescript-eslint/no-unused-vars
const PromptBox = ({ isLoading, setIsLoading }: HomePageProps) => {

    const context = useContext(AppContext);
    if (!context) throw new Error("PromptBox must be within AppContextProvider");
    const { user, chats, setChats, selectedChat, setSelectedChat } = context;

    const [prompt, setPrompt] = useState("");

    const handleKeyDown = (e: { key: string; shiftKey: any; preventDefault: () => void; }) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendPrompt(e);
        }
    };
    
    const sendPrompt = async (e: { preventDefault: () => void; }) => {
        const promptCopy = prompt;

        try {
            e.preventDefault();

            if (!user) return toast.error("Login to send message");

            if (isLoading) return toast.error("Wait for the previous prompt response");

            setIsLoading(true);

            setPrompt("");

            const userPrompt = {
                role: "user",
                content: prompt,
                timestamp: Date.now()
            }

            // Saving user prompt in chats array
            setChats((prevChats) => prevChats.map((chat) => chat._id === selectedChat._id ? { ...chat, messages: [...chat.messages, userPrompt] } : chat));

            // Saving user prompt in selected chat
            setSelectedChat((prev: { messages: any; }) => ({ ...prev, messages: [...prev.messages, userPrompt] }));

            const { data } = await axios.post("/api/chat/ai", {
                chatId: selectedChat._id,
                prompt
            });

            if (data.success) {
                setChats((prevChats) => prevChats.map((chat) => chat._id === selectedChat._id ? { ...chat, messages: [...chat.messages, data.data] } : chat));

                const message = data.data.content;
                const messageTokens = message.split(" ");
                let assistantMessage = {
                    role: "model",
                    content: "",
                    timestamp: Date.now()
                };

                setSelectedChat((prev: { messages: any; }) => ({ ...prev, messages: [...prev.messages, assistantMessage] }));

                for (let i = 0; i < messageTokens.length; i++) {
                    setTimeout(() => {
                        assistantMessage.content = messageTokens.slice(0, i + 1).join(" ");
                        setSelectedChat((prev: { messages: string | any[]; }) => { const updatedMessages = [...prev.messages.slice(0, -1), assistantMessage]; return { prev, messages: updatedMessages } });
                    }, i * 100)
                }

            } else {
                toast.error(data.message);
                setPrompt(promptCopy);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage || "Something went wrong.");
            setPrompt(promptCopy);
             
        } finally {
            setIsLoading(false);
        }
    };

    
    return (
        <form onSubmit={sendPrompt} className={`w-full ${selectedChat?.messages.length > 0 ? "max-w-3xl" : "max-w-2xl"} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>
            <textarea onKeyDown={handleKeyDown} onChange={(e) => setPrompt(e.target.value)} value={prompt} rows={2} placeholder='Message DeepSeek' className='outline-none w-full resize-none overflow-hidden break-words bg-transparent' required></textarea>

            <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2'>
                    <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
                        <Image src={assets.deepthink_icon} alt='' className='h-5' />
                        DeepThink (R1)
                    </p>

                    <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
                        <Image src={assets.search_icon} alt='' className='h-5' />
                        Search
                    </p>
                </div>

                <div className='flex items-center gap-2'>
                    <Image src={assets.pin_icon} alt='' className='w-4 cursor-pointer' />
                    <button className={`${prompt ? "bg-primary" : "bg-[#71717a]"} rounded-full p-2 cursor-pointer`}>
                        <Image src={prompt ? assets.arrow_icon : assets.arrow_icon_dull} alt='' className='w-3.5 aspect-square' />
                    </button>
                </div>
            </div>
        </form>
    )
}

export default PromptBox
