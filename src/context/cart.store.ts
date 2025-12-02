import { map } from "nanostores";

export type CartItem = {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  srcImagen?: string;
};

export type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

export const cart = map<CartState>({
  items: [],
  isOpen: false,
});

export const addToCart = (product: any) => {
  const currentItems = cart.get().items;
  const existingItem = currentItems.find((item) => item.id === product.id);

  if (existingItem) {
    cart.setKey(
      "items",
      currentItems.map((item) =>
        item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  } else {
    cart.setKey("items", [
      ...currentItems,
      {
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: 1,
        srcImagen: product.srcImagen,
      },
    ]);
  }
  cart.setKey("isOpen", true); // Abrir carrito al agregar
};

export const removeFromCart = (productId: string) => {
  const currentItems = cart.get().items;
  cart.setKey(
    "items",
    currentItems.filter((item) => item.id !== productId)
  );
};

export const updateQuantity = (productId: string, cantidad: number) => {
  const currentItems = cart.get().items;
  if (cantidad <= 0) {
    removeFromCart(productId);
    return;
  }
  cart.setKey(
    "items",
    currentItems.map((item) =>
      item.id === productId ? { ...item, cantidad } : item
    )
  );
};

export const toggleCart = () => {
  cart.setKey("isOpen", !cart.get().isOpen);
};

export const clearCart = () => {
  cart.setKey("items", []);
};
