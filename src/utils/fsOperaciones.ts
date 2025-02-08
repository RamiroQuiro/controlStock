import path from "path";
import { promises as fs } from "fs";
export async function createUserDirectories(userId: string): Promise<string> {
    const userDir = path.join(
      process.cwd(),
      "element",
      "imgs",
      userId,
      "productos"
    );
    await fs.mkdir(userDir, { recursive: true });
    return userDir;
  }
  
  export async function deleteUserImage(imagePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), "public", imagePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
    }
  }