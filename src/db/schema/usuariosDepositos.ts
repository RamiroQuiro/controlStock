
import { users } from "./users";
import { depositos } from "./depositos";
import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const usuariosDepositos = sqliteTable(
  "usuariosDepositos",
  {
    usuarioId: text("usuarioId")
      .notNull()
      .references(() => users.id),
    depositoId: text("depositoId")
      .notNull()
      .references(() => depositos.id),
  },
   (t) => [
     // Índice único compuesto para evitar duplicados de nombre por usuario
     unique().on(t.usuarioId, t.depositoId),
   ]
);

export const usuariosDepositosRelations = relations(
  usuariosDepositos,
  ({ one }) => ({
    deposito: one(depositos, {
      fields: [usuariosDepositos.depositoId],
      references: [depositos.id],
    }),
    usuario: one(users, {
      fields: [usuariosDepositos.usuarioId],
      references: [users.id],
    }),
  })
);
