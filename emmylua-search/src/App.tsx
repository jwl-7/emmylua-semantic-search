import React, { useState, useEffect, useMemo } from 'react'
import { pipeline, cos_sim } from '@xenova/transformers'
import luaData from '@/lua_kb.json'
import '@/styles.sass'

interface LuaKBEntry {
    id: string
    file: string
    content: string
    vector: number[]
}

// VERY Lightweight Lua Syntax Highlighter
const LuaHighlighter = ({ code }: { code: string }) => {
    const highlighted = useMemo(() => {
        return code
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            // Comments
            .replace(/(--.*)/g, '<span class="code-comment">$1</span>')
            // Annotations (@param, etc)
            .replace(/(@\w+)/g, '<span class="code-annotation">$1</span>')
            // Strings
            .replace(/("[^"]*"|'[^']*')/g, '<span class="code-string">$1</span>')
            // Keywords
            .replace(/\b(function|local|return|if|then|else|end|for|in|while|do|and|or|not|true|false|nil)\b/g,
                '<span class="code-keyword">$1</span>')
    }, [code])

    return <code dangerouslySetInnerHTML={{ __html: highlighted }} />
}

export default function App() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<(LuaKBEntry & { score: number })[]>([])
    const [model, setModel] = useState<any>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)

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
            setHasStarted(false)
            return
        }
        setHasStarted(true)

        const timeoutId = setTimeout(async () => {
            if (!model) return
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
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [query, model])

    const isActive = query.length > 0

    return (
        <div className={`appWrapper ${isActive ? 'active' : ''}`}>
            <div className="contentWrapper">
                <div className="searchPanel">
                    <h1 className="title">EmmyLua Search</h1>
                    <div className="inputContainer">
                        <input
                            type="text"
                            placeholder="Search EmmyLua metafile..."
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={!model}
                        />
                        {isSearching && (
                            <div className="searchLoader">
                                <div></div>
                                <div></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="resultsList">
                    {/* Centered loader for initial search state */}
                    {isSearching && results.length === 0 && (
                        <div className="centeredLoader">
                            <div className="searchLoader large">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </div>
                    )}

                    {results.map((item) => {
                        const score = item.score * 100
                        const hue = score * 1.2
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
                                    <LuaHighlighter code={item.content} />
                                </pre>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
