const HTML_MIME_TYPE = 'text/html'

const parsePastedHtml = (html: string) => new DOMParser().parseFromString(html, HTML_MIME_TYPE)

/**
 * Tells whether pasted HTML carries visible text, as opposed to an image-only clipboard entry.
 * @param html - HTML string from the clipboard
 */
export const hasPastedText = (html: string) => (parsePastedHtml(html).body.textContent ?? '').trim() !== ''

/**
 * Removes images that are not served from the allowed same-origin path and rewrites the kept ones to that path.
 * HTML without images is returned untouched.
 * @param html - HTML string from the clipboard or a drop
 * @param sourcePrefix - path prefix every image source must start with
 */
export const keepAllowedImages = (html: string, sourcePrefix: string) => {
    const pastedDocument = parsePastedHtml(html)
    const images = [...pastedDocument.querySelectorAll('img')]

    if (images.length === 0) return html

    images.forEach((image) => {
        const source = image.getAttribute('src') ?? ''
        const url = URL.canParse(source, window.location.origin) ? new URL(source, window.location.origin) : null

        if (url?.origin !== window.location.origin || !url.pathname.startsWith(sourcePrefix)) {
            image.remove()
            return
        }

        image.setAttribute('src', url.pathname)
    })

    return pastedDocument.body.innerHTML
}
