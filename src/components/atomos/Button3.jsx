import { useStore } from '@nanostores/react'
import React from 'react'

export default function Button3({ children, isActive,id ,onClick}) {


    return (
        <button
        id={id}
            onClick={onClick}

            className={` px-3 py-1 rounded-lg font-semibold capitalize border-primary-100 duration-300 text-xs  border bg-transparent hover:bg-primary-100/80 hover:text-white `}>

            {children}
        </button>
    )
}
