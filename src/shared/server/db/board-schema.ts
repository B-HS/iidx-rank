import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { BOARD_POST_KINDS } from '@shared/constants/board'
import { user } from '@shared/server/db/auth-schema'

export const boardPost = sqliteTable(
    'board_post',
    {
        id: text('id').primaryKey(),
        authorId: text('author_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        kind: text('kind', { enum: BOARD_POST_KINDS }).notNull(),
        title: text('title').notNull(),
        content: text('content').notNull(),
        commentCount: integer('comment_count').notNull().default(0),
        createdAt: text('created_at').notNull(),
        updatedAt: text('updated_at').notNull(),
    },
    (table) => [index('board_post_kind_created_at_idx').on(table.kind, table.createdAt)],
)

export const boardComment = sqliteTable(
    'board_comment',
    {
        id: text('id').primaryKey(),
        postId: text('post_id')
            .notNull()
            .references(() => boardPost.id, { onDelete: 'cascade' }),
        authorId: text('author_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        content: text('content').notNull(),
        createdAt: text('created_at').notNull(),
    },
    (table) => [index('board_comment_post_id_created_at_idx').on(table.postId, table.createdAt)],
)
