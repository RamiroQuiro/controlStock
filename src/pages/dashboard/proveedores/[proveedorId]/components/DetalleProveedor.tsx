import React from 'react'
import DivReact from '../../../../../components/atomos/DivReact';
import type { Proveedor } from '../../../../../types';

export const DetalleProveedor = ({ proveedor }: { proveedor: Proveedor}) => {
   return (
     <DivReact >
     <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
     <div className="grid grid-cols-2 gap-4">
       <div>
         <p className="text-gray-600">DNI</p>
         <p className="font-medium">{proveedor.dni}</p>
       </div>
       <div>
         <p className="text-gray-600">Teléfono</p>
         <p className="font-medium">{proveedor.celular || '-'}</p>
       </div>
       <div>
         <p className="text-gray-600">Email</p>
         <p className="font-medium">{proveedor.email || '-'}</p>
       </div>
       <div>
         <p className="text-gray-600">Dirección</p>
         <p className="font-medium">{proveedor.direccion || '-'}</p>
       </div>
       <div>
         <p className="text-gray-600">Categoría</p>
         <span className={`px-2 py-1 rounded-full text-xs ${
           proveedor.categoria === 'VIP' 
             ? 'bg-purple-100 text-purple-800' 
             : proveedor.categoria === 'regular'
             ? 'bg-blue-100 text-blue-800'
             : 'bg-green-100 text-green-800'
         }`}>
           {proveedor.categoria}
         </span>
       </div>
       <div>
         <p className="text-gray-600">Estado</p>
         <span className={`px-2 py-1 rounded-full text-xs ${
           proveedor.estado === 'activo' 
             ? 'bg-green-100 text-green-800' 
             : 'bg-red-100 text-red-800'
         }`}>
           {proveedor.estado}
         </span>
       </div>
     </div>
 
     {proveedor.observaciones && (
       <div className="mt-4">
         <p className="text-gray-600">Observaciones</p>
         <p className="mt-1">{proveedor.observaciones}</p>
       </div>
     )}
   </DivReact>
   )
};