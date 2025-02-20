import { useState } from 'react'
import BotonEditar from '../atomos/BotonEditarLts'
import BotonEliminarLts from '../atomos/BotonEliminarLts'
import BotonPdfLts from '../atomos/BotonPdfLts'

export default function ContenedorBotonera({handleDelete}) {


    return (
        <div className="flex text-sm gap-2">
            <BotonEditar />
            <BotonEliminarLts handleClick={handleDelete} />
            <BotonPdfLts />

        </div>
    )
}
