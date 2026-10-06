import type { FC } from 'react'
import { createJsonLdGraph, serializeJsonLd, type JsonLdNode } from '@features/json-ld/json-ld-nodes'

type JsonLdProps = {
    nodes: JsonLdNode[]
}

export const JsonLd: FC<JsonLdProps> = ({ nodes }) => (
    <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: serializeJsonLd(createJsonLdGraph(nodes)) }} />
)
