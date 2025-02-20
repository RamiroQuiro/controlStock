import { Trash2 } from 'lucide-react'
import BotonChildresIcono from './BotonChildresIcono'

export default function BotonEliminarLts({ handleClick }) {
    return (
        <BotonChildresIcono handleClick={handleClick} children='Editar' icono={Trash2} className=' bg-primary-400 text-white rounded-lg hover:bg-red-500'  >
            Eliminar
        </BotonChildresIcono>
    )
}
