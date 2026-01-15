// import '@styles/styles.sass'

// export function App() {
//     return (
//         <div className="App">
//         </div>
//     )
// }

import React, { useState, useEffect } from 'react'
import { pipeline, cos_sim } from '@xenova/transformers'
import luaData from '@/lua_kb.json'
import '@/styles.sass'

interface LuaKBEntry {
    id: string
    file: string
    content: string
    vector: number[]
}

export default function App() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<(LuaKBEntry & { score: number })[]>([])
    const [model, setModel] = useState<any>(null)
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        async function init() {
            const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
            setModel(() => extractor)
        }
        init()
    }, [])

    useEffect(() => {
        if (!model || !query.trim()) {
            setResults([])
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true)

            const output = await model(query, { pooling: 'mean', normalize: true })
            const queryVector = Array.from(output.data) as number[]

            const scored = (luaData as LuaKBEntry[]).map(item => ({
                ...item,
                score: cos_sim(queryVector, item.vector)
            }))

            const topResults = scored
                .filter(item => item.score > 0.3)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)

            setResults(topResults)
            setIsSearching(false)
        }, 500) // Debounce for 500ms

        return () => clearTimeout(timeoutId)
    }, [query, model])

    return (
        <div className="appWrapper">
            <div className="contentWrapper">
                <header className="header">
                    <h1 className="title">EmmyLua Search</h1>
                </header>

                <div className="searchPanel">
                    <input
                        type="text"
                        placeholder="Search EmmyLua metafile..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={!model}
                    />
                    {isSearching && (
                        <div className="searchLoader">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    )}
                </div>

                <div className="resultsList">
                    {results.map((item) => {
                        const score = item.score * 100
                        const hue = score * 1.2 // 0% = 0° (red), 100% = 120° (green)
                        const bgColor = `hsla(${hue}, 70%, 50%, 0.1)`
                        const borderColor = `hsla(${hue}, 70%, 50%, 0.3)`
                        const textColor = `hsl(${hue}, 70%, 60%)`

                        return (
                            <div key={item.id} className="resultCard">
                                <div className="scoreHeader">
                                    <div
                                        className="matchBadge"
                                        style={{
                                            background: bgColor,
                                            border: `1px solid ${borderColor}`
                                        }}
                                    >
                                        <span className="percent" style={{ color: textColor }}>
                                            {score.toFixed(0)}%
                                        </span>
                                        <span className="label">MATCH</span>
                                    </div>
                                </div>
                                <pre className="codeContainer">
                                    <code>{item.content}</code>
                                </pre>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}