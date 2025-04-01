import { useStore } from "@nanostores/react";
import ConfeccionTablaMovimientos from "./ConfeccionTablaMovimientos";
import { stockStore } from "../../../../context/store";



export default function ContenedorTablaMovimientos() {

const {data,loading,error}=useStore(stockStore)


console.log(data)
  return (


<div class="flex flex-col items-start justify-start bg-primary-bg-componentes w-full p-2">

        <ConfeccionTablaMovimientos arrayProduct={[]} client:load/>
</div>

)
}
