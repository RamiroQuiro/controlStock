import { EggIcon, Eye, EyeClosed } from 'lucide-react'
import React from 'react'

export default function InputFormularioSolicitud({ name, placeholder,type, id, children ,onchange,value ,className, isMoney,disabled}) {
    const visiblePass=(e)=>{
        e.preventDefault()
        const input = document.getElementById(id)
        if (input.type === 'password') {
            input.type = 'text'
        } else {
            input.type = 'password'
        }
    }
    return (
        <div className="relative w-full  group">
            <label for={id} className=" top-0 left-0 group-hover:text-primary-100/50 duration-300 ring-0 valid:ring-0 py-1  focus:outline-none outline-none z-20 text-sm text-primary-textoTitle font-semibold  ">
                {children}
            </label>
            <input disabled={disabled} placeholder={placeholder} type={type} name={name} id={id} value={value} onChange={onchange} className={` ${className} disabled:bg-transparent  peer  disabled:p-0 border border-primary-100/50 focus:ring focus:border-transparent peer z-10 w-full disabled:px-1  left-0 px-1 py-1 text-sm rounded-md valid:ring-0   outline-none   focus:outline-none ${isMoney && 'text-end'}` }/>
            {type === 'password' && (
                <button  onClick={visiblePass} className="absolute top-1/2 right-1 transform  transition">
                    {type === 'password' ? <EyeClosed width={16}/> : <Eye width={16}/>}
                </button>
            )}
        </div>
    )
}
