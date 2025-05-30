import React from 'react'

export default function DivReact({children,className}:{children:React.ReactNode,className?:string}) {
  return (
    <div className={`${className} border bg-white w-full flex-col  items-start justify-between rounded-lg  p-4 shadow-sm `}>	
        {children}
    </div>
  )
}
