import { useState } from 'react'
import BotonEditar from '../atomos/BotonEditarLts'
import BotonEliminarLts from '../atomos/BotonEliminarLts'
import BotonPdfLts from '../atomos/BotonPdfLts'

export default function ContenedorBotonera({handleDelete,handleEdit,disableEdit}) {


    return (
        <div className="flex text-sm gap-2">
            <BotonEditar disable={disableEdit} handleClick={handleEdit} />
            <BotonEliminarLts handleClick={handleDelete} />
            <BotonPdfLts />

        </div>
    )
}
