"use client";

import Image from "next/image";
import { useState } from "react";
import { assets } from "../../assets/assets";
import Sidebar from "@/components/Sidebar";
import PromptBox from "@/components/PromptBox";
import Message from "@/components/Message";

export default function Home() {

  const [expand, setExpand] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
               (<div>
                  <Message role="user" content="What is Next JS?" />
               </div>)
          }

          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
          <p className="text-xs absolute bottom-1 text-gray-500">AI generated, for refrence only</p>
        </div>

      </div>
    </div>
  );
}
