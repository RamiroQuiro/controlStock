import React from 'react'
import { useState } from 'react'
import InputComponenteJsx from '../../dashboard/componente/InputComponenteJsx'
import { PlusCircle } from 'lucide-react'

export default function CategoriasSelector() {
    const [categorias, setCategorias] = useState([])
    const [categoria, setCategoria] = useState('')
    const [mostrarModal, setMostrarModal] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (categoria) {
            setCategorias([...categorias, categoria])
            setCategoria('')
            setMostrarModal(false)
        }
    }

    const handleAgregarCategoria = () => {
        setMostrarModal(true)
    }

    return (
    <div className='w-full flex items-center justify-between gap-2 relative'>
      <InputComponenteJsx
        name="categoria"
        type="search"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        placeholder="Agregar Categoria"
      />
<div className='absolute top-[110%] right-0 w-full h-full bg-primary-100 z-10'>

</div>
        <button type="button" onClick={handleAgregarCategoria} className='text-primary-100 px-2 py-1 hover:bg-primary-100/80 transition-colors duration-150 flex items-center gap-2'><PlusCircle className='w-6 h-6' /></button>
    </div>
  )
}
