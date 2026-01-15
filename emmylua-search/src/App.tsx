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

const LuaHighlighter = ({ code }: { code: string }) => {
    const highlighted = useMemo(() => {
        let h = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        h = h.replace(/(---@.*)/g, '<span class="lua-cyan">$1</span>');
        h = h.replace(/\b(function|end)\b(?![^<]*>)/g, '<span class="lua-red">$1</span>');
        h = h.replace(/(lua-red">function<\/span>\s+)([\w\.:]+)/g, '$1<span class="lua-green">$2</span>');
        h = h.replace(/(\()([^)]*)(\))/g, (match, open, content, close) => {
            if (open.includes('<') || content.includes('<')) return match;
            const orangeParams = content.replace(/\b([a-zA-Z_]\w*)\b/g, '<span class="lua-orange">$1</span>');
            return `${open}${orangeParams}${close}`;
        });
        return h;
    }, [code]);
    return <code dangerouslySetInnerHTML={{ __html: highlighted }} />
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
        <div className={`app-wrapper ${isActive ? 'active' : ''}`}>
            <div className="content-wrapper">
                <div className="search-panel">
                    <h1 className="title">EmmyLua Search</h1>
                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="Search EmmyLua metafile..."
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={!model}
                        />
                    </div>
                </div>

                <div className="results-area">
                    {isSearching ? (
                        <div className="centered-loader">
                            <div className="mega-ripple">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </div>
                    ) : (
                        <div className="results-list">
                            {results.map((item) => {
                                const score = item.score * 100
                                const hue = score * 1.2
                                const textColor = `hsl(${hue}, 70%, 60%)`
                                return (
                                    <div key={item.id} className="result-card">
                                        <div className="score-header">
                                            <div className="match-badge">
                                                <span className="percent" style={{ color: textColor }}>
                                                    {score.toFixed(0)}%
                                                </span>
                                                <span className="label">MATCH</span>
                                            </div>
                                        </div>
                                        <pre className="code-container">
                                            <LuaHighlighter code={item.content} />
                                        </pre>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
