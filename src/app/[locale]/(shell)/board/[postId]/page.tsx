import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getLocale, getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { BOARD_COMMENTS_PAGE_PARAM, BoardCommentsPageSchema } from '@entities/board/board.dto'
import { getBoardPostPathname } from '@entities/board/board-page'
import { boardCommentsQueryOptions, boardPostQueryOptions } from '@entities/board/board.query-options'
import { getBoardCommentList, getBoardPost, getBoardViewer } from '@entities/board/board.server'
import { parseRichTextDocument } from '@entities/board/rich-text'
import { getRichTextSummary } from '@entities/board/rich-text-summary'
import { BoardPostJsonLd } from '@features/json-ld/board-post-json-ld'
import { RichTextContent } from '@features/rich-text-content/rich-text-content'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { createPageMetadata, createSeoDescription, getAbsoluteUrl, NO_INDEX_ROBOTS, normalizeSeoText } from '@shared/lib/seo'
import { BoardFrame } from '@widgets/board-list/board-frame'
import { BoardListLink } from '@widgets/board-list/board-list-link'
import { BoardPost } from '@widgets/board-post/board-post'
import { BoardPostSkeleton } from '@widgets/board-post/board-post-skeleton'
import { BoardPostUnavailable } from '@widgets/board-post/board-post-unavailable'

type BoardPostRouteProps = Pick<PageProps<'/[locale]/board/[postId]'>, 'params' | 'searchParams'>

const BoardPostDataBoundary = async ({ params, searchParams }: BoardPostRouteProps) => {
    const [{ postId }, query, viewer, t] = await Promise.all([params, searchParams, getBoardViewer(), getTranslations('board')])
    const post = await getBoardPost(viewer, postId)

    if (!post) return <BoardPostUnavailable />

    const commentsPage = BoardCommentsPageSchema.parse([query[BOARD_COMMENTS_PAGE_PARAM]].flat()[0])
    const comments = await getBoardCommentList(viewer, post.id, commentsPage)
    const content = parseRichTextDocument(post.content)
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_QUERY_STALE_TIME_MS } } })

    await Promise.all([
        queryClient.prefetchQuery(boardPostQueryOptions(post.id, async () => post)),
        comments ? queryClient.prefetchQuery(boardCommentsQueryOptions(post.id, commentsPage, async () => comments)) : null,
    ])

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BoardPostJsonLd post={post} content={content.ok ? content.document : null} comments={comments?.comments ?? []} />
            <BoardPost postId={post.id} initialUserId={viewer?.userId ?? null}>
                {content.ok ? (
                    <RichTextContent content={content.document} />
                ) : (
                    <p className='text-sm text-muted-foreground'>{t('contentUnavailable')}</p>
                )}
            </BoardPost>
        </HydrationBoundary>
    )
}

const BoardPostPage = ({ params, searchParams }: BoardPostRouteProps) => {
    const t = useTranslations('navigation')

    return (
        <BoardFrame title={t('board')} actions={<BoardListLink />}>
            <Suspense fallback={<BoardPostSkeleton />}>
                <BoardPostDataBoundary params={params} searchParams={searchParams} />
            </Suspense>
        </BoardFrame>
    )
}

export const generateMetadata = async ({ params }: Pick<BoardPostRouteProps, 'params'>) => {
    const [{ postId }, locale, t] = await Promise.all([params, getLocale(), getTranslations()])
    const post = await getBoardPost(null, postId)

    if (!post) return { title: t('navigation.board'), robots: NO_INDEX_ROBOTS }

    const content = parseRichTextDocument(post.content)
    const { text, imageSource } = getRichTextSummary(content.ok ? content.document : null)
    const description = createSeoDescription(text)

    return createPageMetadata({
        locale,
        pathname: getBoardPostPathname(post.id),
        title: normalizeSeoText(post.title),
        description: description === '' ? t('seo.postFallbackDescription', { author: post.author.name }) : description,
        siteName: t('app.name'),
        openGraph: { type: 'article', publishedTime: post.createdAt, modifiedTime: post.updatedAt },
        imageUrl: imageSource === null ? null : getAbsoluteUrl(imageSource),
        hasLargeImage: true,
    })
}

export default BoardPostPage
