import { FileText } from 'lucide-react'
import BotonChildresIcono from './BotonChildresIcono'

export default function BotonPdfLts({ handleClick }) {
    return (
        <BotonChildresIcono handleClick={handleClick} children='Editar' icono={FileText} className=' bg-lime-600 text-white rounded-lg hover:bg-green-700'  >
            Generar PDF
        </BotonChildresIcono>
    )
}
