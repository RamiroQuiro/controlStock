// Implementación simple de caché en memoria
const memoryCache: Record<string, { value: any; expiry: number }> = {};

export const cache = {
  set:async(key: string, value: any, ttlSeconds: number = 300) =>{
    const expiry = Date.now() + ttlSeconds * 1000;
    memoryCache[key] = { value, expiry };
  },

  get:async(key: string)=> {
    const cacheEntry = memoryCache[key];
    if (cacheEntry && cacheEntry.expiry > Date.now()) {
      // console.log("Cache hit for key:", key, cacheEntry);
      return cacheEntry.value;
    }
    return null;
  },
  invalidate:async(prefix: string)=> {
    // Elimina todas las claves que empiezan con un prefijo específico
    Object.keys(memoryCache).forEach((key) => {
      if (key.startsWith(prefix)) {
        delete memoryCache[key];
      }
    });
  },
};
