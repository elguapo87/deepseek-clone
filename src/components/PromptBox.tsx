"use client";

import Image from 'next/image'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { assets } from '../../assets/assets'

type HomePageProps = {
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>
}

const PromptBox = ({ isLoading, setIsLoading }: HomePageProps) => {

    const [prompt, setPrompt] = useState("");

    return (
        <form className={`w-full ${false ? "max-w-3xl" : "max-w-2xl"} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>
            <textarea onChange={(e) => setPrompt(e.target.value)} value={prompt} rows={2} placeholder='Message DeepSeek' className='outline-none w-full resize-none overflow-hidden break-words bg-transparent' required></textarea>

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
