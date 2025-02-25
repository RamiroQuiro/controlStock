import React from 'react'

export default function InputFormularioSolicitud({ name, type, id, children ,onchange,value ,className, isMoney,disabled}) {
    return (
        <div className="relative w-full  group">
            <label for={id} className=" top-0 left-0 duration-300 ring-0 valid:ring-0 py-1  focus:outline-none outline-none z-20 text-xs text-primary-100/80   ">
                {children}
            </label>
            <input disabled={disabled} type={type} name={name} id={id} value={value} onChange={onchange} className={` ${className} disabled:bg-transparent  disabled:shadow-none disabled:p-0 bg-gray-100 peer z-10 w-full  left-0 px-1 py-1 text-sm rounded shadow valid:ring-0   outline-none   focus:outline-none ${isMoney && 'text-end'}` }/>
        </div>
    )
}
