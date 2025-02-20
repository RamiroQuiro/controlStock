import { Edit, Pencil } from 'lucide-react'
import BotonChildresIcono from './BotonChildresIcono'

export default function BotonEditar({ handleClick }) {
  return (
    <BotonChildresIcono children='Editar' icono={Edit} className='bg-blue-400 hover:bg-blue-500 text-white'  >
      Editar
    </BotonChildresIcono>
  )
}
