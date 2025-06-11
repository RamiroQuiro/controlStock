import { CarTaxiFront } from 'lucide-react'
import React from 'react'

export default function Cart() {
  return (
    <div className={` animate-[aparecer_.3s] z-[50] bg-gray-700/40 backdrop-blur-sm fixed w-full h-screen  top-0 left-0  `}>
        <CarTaxiFront
                items={items}
         isOpen={isOpen}
         getSubtotal={getSubtotal}
        />
       
    </div>
  )
}
