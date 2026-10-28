import { pgTable, uuid, text, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:        uuid('id').primaryKey().defaultRandom(),
  googleId:  text('google_id').unique().notNull(),
  email:     text('email').unique().notNull(),
  name:      text('name').notNull(),
  image:     text('image'),
  isAdmin:   boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const categories = pgTable('categories', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      text('name').notNull().unique(),
  color:     text('color').notNull().default('#6366f1'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const tags = pgTable('tags', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      text('name').notNull().unique(),
  color:     text('color').notNull().default('#6366f1'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const tools = pgTable('tools', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         text('name').notNull(),
  description:  text('description'),
  iconUrl:      text('icon_url'),
  isActive:     boolean('is_active').notNull().default(true),
  type:         text('type').notNull().default('tool'),
  url:          text('url'),
  instructions: text('instructions'),
  categoryId:   uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
})

export const toolTags = pgTable('tool_tags', {
  toolId: uuid('tool_id').notNull().references(() => tools.id, { onDelete: 'cascade' }),
  tagId:  uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.toolId, table.tagId] }),
}))

export const credentials = pgTable('credentials', {
  id:          uuid('id').primaryKey().defaultRandom(),
  toolId:      uuid('tool_id').notNull().references(() => tools.id),
  username:    text('username'),
  passwordEnc: text('password_enc'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})

export const credentialRequests = pgTable('credential_requests', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id),
  toolId:      uuid('tool_id').notNull().references(() => tools.id),
  requestedAt: timestamp('requested_at').notNull().defaultNow(),
  status:      text('status').notNull().default('sent'),
})
