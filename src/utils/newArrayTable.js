export const armandoNewArray = (newArray, keyPropiedades) => {
    if (!Array.isArray(newArray) || newArray.length === 0) return [];
  
    return newArray.map((element, i) => {
      let nuevoObjeto = { id: element.id, "N°": i + 1 };
  
      keyPropiedades.forEach((key) => {
        if (element.hasOwnProperty(key)) {
          nuevoObjeto[key] = element[key];
        }
      });
  
      return nuevoObjeto;
    });
  };
  
  