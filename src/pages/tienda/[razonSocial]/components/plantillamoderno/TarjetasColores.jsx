
export const TarjetasColores = ({ className, h2, span, button, src }) => {
    return (
      <div
        className={`${className}  w-5/12 md:h-52 h-0 pl-10 rounded-lg md:block hidden relative `}
      >
        <div className="md:flex flex-col gap-3 items-start justify-center text-white h-full  hidden ">
          <h2 className="text-2xl font-bold tracking-wider">{h2}</h2>
          <span className="font-medium">{span}</span>
          <button className="rounded-2xl hover:-translate-y-1 hover:shadow-lg duration-100 py-2 px-3 bg-white text-gray-700 text-xs tracking-wider shadow-md font-medium ">
            {button}
          </button>
        </div>
        <div className="absolute  w-2/3 h-full bottom-10 right-2">
          <img src={src}  alt="illustraciones" />
        </div>
      </div>
    );
  };