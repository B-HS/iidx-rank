import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getLocale, getTranslations } from 'next-intl/server'
import { UserListPageQuerySchema } from '@entities/profile/profile.dto'
import { getUserListPathname } from '@entities/profile/profile-page'
import { userListQueryOptions } from '@entities/profile/profile.query-options'
import { getUserList } from '@entities/profile/profile.server'
import { UserListJsonLd } from '@features/json-ld/user-list-json-ld'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { createPageMetadata } from '@shared/lib/seo'
import { UserList } from '@widgets/user-list/user-list'
import { UserListLoading } from '@widgets/user-list/user-list-loading'

type UserListRouteProps = Pick<PageProps<'/[locale]/users'>, 'searchParams'>

const FIRST_PAGE = 1

const readUserListPage = async (searchParams: UserListRouteProps['searchParams']) => {
    const parsedQuery = UserListPageQuerySchema.safeParse({ page: [(await searchParams).page].flat()[0] })

    return parsedQuery.success ? parsedQuery.data.page : FIRST_PAGE
}

const UserListDataBoundary = async ({ searchParams }: UserListRouteProps) => {
    const page = await readUserListPage(searchParams)
    const userList = await getUserList(page)
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_QUERY_STALE_TIME_MS } } })

    await queryClient.prefetchQuery(userListQueryOptions(page, async () => userList))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <UserListJsonLd page={page} users={userList.users} />
            <UserList page={page} />
        </HydrationBoundary>
    )
}

const UserListPage = ({ searchParams }: UserListRouteProps) => (
    <Suspense fallback={<UserListLoading />}>
        <UserListDataBoundary searchParams={searchParams} />
    </Suspense>
)

export const generateMetadata = async ({ searchParams }: UserListRouteProps) => {
    const [page, locale, t] = await Promise.all([readUserListPage(searchParams), getLocale(), getTranslations()])

    return createPageMetadata({
        locale,
        pathname: getUserListPathname(page),
        title: page > FIRST_PAGE ? t('seo.usersPagedTitle', { page }) : t('navigation.users'),
        description: t('seo.usersDescription'),
        siteName: t('app.name'),
    })
}

export default UserListPage
