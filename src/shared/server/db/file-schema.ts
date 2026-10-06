import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { FILE_PURPOSES } from '@shared/constants/file'
import { user } from '@shared/server/db/auth-schema'

export const uploadedFile = sqliteTable(
    'uploaded_file',
    {
        key: text('key').primaryKey(),
        ownerId: text('owner_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        purpose: text('purpose', { enum: FILE_PURPOSES }).notNull(),
        contentType: text('content_type').notNull(),
        size: integer('size').notNull(),
        createdAt: text('created_at').notNull(),
    },
    (table) => [index('uploaded_file_owner_id_created_at_idx').on(table.ownerId, table.createdAt)],
)
