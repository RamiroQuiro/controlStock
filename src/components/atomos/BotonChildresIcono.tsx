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
        <button onClick={onClick} className={`${className} flex items-center gap-2 px-3 py-2  rounded-lg  transition-colors`}>
            <Icon className="w-4 h-4" />
            {children}
        </button>
    )
}
