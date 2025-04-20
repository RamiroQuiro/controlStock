import { useStore } from '@nanostores/react'
import { Edit, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { rolesStore } from '../../../../context/store'
import BotonEditar from '../../../../components/moleculas/BotonEditar'
import BotonEliminar from '../../../../components/moleculas/BotonEliminar'

export default function ContenedorRoles() {

const{data,loading,error}=useStore(rolesStore)
const [roles, setRoles] = useState(data?.rolesDB)
useEffect(() => {
  if(!data)return

  setRoles(data.rolesDB)
}, [loading])

  return (


<div className="space-y-2">
    {
      roles.map((rol) => (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-primary-textoTitle">
              {rol.nombre}
            </h3>
            <div className="flex space-x-2">
               <BotonEditar />
                <BotonEliminar   />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">{rol.descripcion}</p>
          <div className="flex flex-wrap gap-2">
            {JSON.parse(rol.permisos)?.map((permiso) => (
              <span className="bg-primary-100 text-white text-xs px-2 py-1 rounded-full">
                {permiso}
              </span>
            ))}
          </div>
        </div>
      ))
    }
  </div>  
  )
}