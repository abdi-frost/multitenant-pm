import { boolean, jsonb, timestamp } from "drizzle-orm/pg-core";

export const systemFields = {
    metadata: jsonb("metadata").notNull().default({}),
    deleted: boolean("deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}