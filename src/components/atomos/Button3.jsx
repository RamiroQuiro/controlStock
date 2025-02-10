import { useStore } from '@nanostores/react'
import React from 'react'

export default function Button3({ children, className,isActive,id ,onClick}) {


    return (
        <button
        id={id}
            onClick={onClick}

            className={`${className?className:'bg-transparent hover:bg-primary-100/80 hover:text-white  border-primary-100'} px-3 py-1 rounded-lg font-semibold capitalize duration-300 text-xs  border  `}>

            {children}
        </button>
    )
}
