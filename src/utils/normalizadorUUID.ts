import { nanoid } from "nanoid";

export const normalizadorUUID = (prefijo: string, length: number = 10) => {
  return `${prefijo}-${nanoid(length)}`;
};
