import React from "react";
import ItemsCategorias from "./ItemsCategorias";

export default function SidebarProductos() {
  return (
    <div>
      {[1].map((item, i) => {
        return (
          <div class="md:w-[265px] md:min-w-[260px] w-full md:py-10 pl-3 md:pl-10 bg-white sticky top-[68px] md:h-[90vh] h-14 overflow-hidden duration-700 hover:h-max md:hover:h-[90vh] border flex-col flex">
            <ul key={i} className="flex flex-col w-10/12  text-gray-500">
              <ItemsCategorias name={"cat"} imgSrc={""} data={"data"} />
            </ul>
          </div>
        );
      })}
    </div>
  );
}
