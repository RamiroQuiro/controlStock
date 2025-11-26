import { atom } from "nanostores";

interface RolesData {
  userDB: any[];
  rolesDB: any[];
}

interface RolesStore {
  loading: boolean;
  data: RolesData | null;
  error: string | null;
}

export const rolesStore = atom<RolesStore>({
  loading: true,
  data: { userDB: [], rolesDB: [] },
  error: null,
});

export const fetchRolesData = async () => {
  rolesStore.set({ loading: true, data: null, error: null });
  try {
    // Obtener usuarios
    const usersResponse = await fetch("/api/users/getUsers");
    const usersData = await usersResponse.json();

    // Obtener roles
    const rolesResponse = await fetch("/api/roles");
    const rolesData = await rolesResponse.json();

    rolesStore.set({
      loading: false,
      data: {
        userDB: usersData.data || [],
        rolesDB: rolesData.data || [],
      },
      error: null,
    });
  } catch (error) {
    console.error("Error fetching roles data:", error);
    rolesStore.set({
      loading: false,
      data: null,
      error: "Error al cargar los roles",
    });
  }
};
