import { useState, useEffect } from 'react'
import { pipeline, cos_sim } from '@xenova/transformers'

interface LuaKBEntry {
    id: string
    file: string
    content: string
    vector: number[]
}

export function useSemanticSearch(query: string, kbData: LuaKBEntry[]) {
    const [model, setModel] = useState<any>(null)
    const [results, setResults] = useState<(LuaKBEntry & { score: number })[]>([])
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        async function init() {
            const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
            setModel(() => extractor)
        }
        init()
    }, [])

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            setIsSearching(false)
            return
        }

        setIsSearching(true)

        const timeoutId = setTimeout(async () => {
            if (!model) return

            const output = await model(query, { pooling: 'mean', normalize: true })
            const queryVector = Array.from(output.data) as number[]

            const scored = kbData.map(item => ({
                ...item,
                score: cos_sim(queryVector, item.vector)
            }))

            const topResults = scored
                .filter(item => item.score > 0.3)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)

            setResults(topResults)
            setIsSearching(false)
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [query, model, kbData])

    return { results, isSearching, modelReady: !!model }
}
