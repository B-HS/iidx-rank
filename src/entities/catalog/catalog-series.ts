const SERIES_LOGOS = new Map([
    ['1st', '/iidx-logo/1.webp'],
    ['2nd', '/iidx-logo/2.webp'],
    ['3rd', '/iidx-logo/3.webp'],
    ['4th', '/iidx-logo/4.webp'],
    ['5th', '/iidx-logo/5.png'],
    ['6th', '/iidx-logo/6.webp'],
    ['7th', '/iidx-logo/7.webp'],
    ['8th', '/iidx-logo/8.webp'],
    ['9th', '/iidx-logo/9.webp'],
    ['10th', '/iidx-logo/10.jpg'],
    ['iidxred', '/iidx-logo/11-red.png'],
    ['happysky', '/iidx-logo/12-happy-sky.png'],
    ['distorted', '/iidx-logo/13-distorted.png'],
    ['gold', '/iidx-logo/14-gold.png'],
    ['djtroopers', '/iidx-logo/15-troopers.png'],
    ['empress', '/iidx-logo/16-empress.png'],
    ['sirius', '/iidx-logo/17-sirius.png'],
    ['resortanthem', '/iidx-logo/18-resortanthem.png'],
    ['lincle', '/iidx-logo/19-lincle.png'],
    ['tricoro', '/iidx-logo/20-tricoro.png'],
    ['spada', '/iidx-logo/21-spada.png'],
    ['pendual', '/iidx-logo/22-pendual.png'],
    ['copula', '/iidx-logo/23-copula.png'],
    ['sinobuz', '/iidx-logo/24-sinobuz.png'],
    ['cannonballers', '/iidx-logo/25-cannon-ballers.png'],
    ['rootage', '/iidx-logo/26-rootage.png'],
    ['heroicverse', '/iidx-logo/27-heroic-verse.png'],
    ['bistrover', '/iidx-logo/28-bistrover.png'],
    ['casthour', '/iidx-logo/29-casthour.png'],
    ['resident', '/iidx-logo/30-resident.png'],
    ['epolis', '/iidx-logo/31-epolis.png'],
    ['pinkycrush', '/iidx-logo/32-pinky-crush.png'],
    ['sparkleshower', '/iidx-logo/33-sparkle-shower.png'],
    ['zinrai', '/iidx-logo/34-zinrai.png'],
])
const SERIES_ORDERS = new Map([...SERIES_LOGOS.keys()].map((series, order) => [series, order]))
const UNREGISTERED_SERIES_ORDER = SERIES_ORDERS.size

const normalizeSeriesVersion = (version: string) =>
    version
        .toLowerCase()
        .replace(/[\s_-]/g, '')
        .replace(/style$/, '')

export const getSeriesLogo = (version: string) => SERIES_LOGOS.get(normalizeSeriesVersion(version)) ?? null

export const compareSeriesVersions = (left: string, right: string, locale: string) => {
    const leftOrder = SERIES_ORDERS.get(normalizeSeriesVersion(left)) ?? UNREGISTERED_SERIES_ORDER
    const rightOrder = SERIES_ORDERS.get(normalizeSeriesVersion(right)) ?? UNREGISTERED_SERIES_ORDER

    return leftOrder === rightOrder ? left.localeCompare(right, locale) : leftOrder - rightOrder
}
