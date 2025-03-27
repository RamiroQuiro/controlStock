import DivReact from "../../../../components/atomos/DivReact";



export default function StatsDashboard({ textColor, icon: Icon,descripcion, h2, data }) {
  return (


<DivReact styleDiv="w-full h-32 ">
  <h2 className="text-base text-gray-600">{h2}</h2>
  <div className="flex items-end gap-2  h-1/2 w-full ">
    <div className={` text-xs flex gap-2 justify-center mt-2 items-center`}>
      <Icon className={`${textColor} w-8 h-8`} />
      <p className={` ${textColor}  text-2xl font-bold`}>{data}</p>
    </div> 
    <span className="text-sm font-semibold text-gray-500 ml-1">{descripcion}</span>
  </div>
</DivReact>

  )
}
