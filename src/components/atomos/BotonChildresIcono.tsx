import React from 'react'
import type { LucideIcon } from "lucide-react"
interface Props{
    className?:string,
    handleClick?:()=>void,
    icono:LucideIcon,
    children:string

}

export default function BotonChildresIcono({className, handleClick,icono:Icon,children}:Props) {

    const onClick=()=>{
        console.log('click')
        handleClick()
    }
    return (
        <button onClick={onClick} className={`${className} flex items-center md:gap-2 gap-1 md:px-3 px-2 md:py-2 py-1  rounded-sm  transition-colors`}>
            <Icon className="w-4 h-4" />
            {children}
        </button>
    )
}
