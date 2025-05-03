"use client";

import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { assets } from "../../assets/assets";
import Sidebar from "@/components/Sidebar";
import PromptBox from "@/components/PromptBox";
import Message from "@/components/Message";
import { AppContext } from "@/context/AppContext";

type MessageType = {
  _id: number;
  role: string;
  content: string;
  timestamp: number;
};

export default function Home() {

  const context = useContext(AppContext);
  if (!context) throw new Error("HomePage must be within AppContextProvider");
  const { selectedChat } = context;
;
  const [expand, setExpand] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [messages]);

  console.log(selectedChat);
  

  return (
    <div>
      <div className="flex h-screen">
        
        <Sidebar expand={expand} setExpand={setExpand} />

        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 bg-[#29222d] text-white relative">
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            <Image onClick={() => setExpand(prev => !prev)} src={assets.menu_icon} alt="" className="rotate-180"  />
            <Image src={assets.chat_icon} alt="" className="opacity-70"  />
          </div>

          {
            messages.length === 0
                  ?
                (<>
                  <div className="flex items-center gap-3">
                    <Image src={assets.logo_icon} alt="" className="h-16" />
                    <p className="text-2xl font-medium">Hi, I&apos;m DeepSeek</p>
                  </div>
                  <p className="text-sm mt-2">How can I help you today?</p>
                </>)
                  :
               (<div ref={containerRef} className="relative flex flex-col items-center justify-start w-full mt-20 max-h-screen overflow-y-auto">
                  <p className="fixed top-8 border border-transparent hover:border-gray-500/50 px-2 py-1 rounded-lg font-semibold mb-6">{selectedChat.name}</p>

                  {messages.map((msg, index) => (
                    // <Message key={msg._id} role={msg.role} content={msg.content} />
                    <Message key={`${msg._id}-${index}`} role={msg.role} content={msg.content} />
                  ))}

                  {isLoading && (
                    <div className="flex gap-4 max-w-3xl w-full py-3">
                      <Image src={assets.logo_icon} alt="Logo" className="h-9 w-9 p-1 border border-white/15 rounded-full" />
                      <div className="loader flex justify-center items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                        <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                        <div className="w-1 h-1 rounded-full bg-white animate-bounce"></div>
                      </div>
                    </div>
                  )}
               </div>)
          }

          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
          <p className="text-xs absolute bottom-1 text-gray-500">AI generated, for refrence only</p>
        </div>

      </div>
    </div>
  );
}
