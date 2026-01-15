import React, { useState, useEffect, useMemo } from 'react'
import { pipeline, cos_sim } from '@xenova/transformers'
import LuaHighlighter from '@/LuaHighlighter'
import luaKbData from '@/lua_kb.json'
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
    const [kbData, setKbData] = useState<LuaKBEntry[]>(luaKbData as LuaKBEntry[])
    const [fileName, setFileName] = useState<string>('lua_kb.json')

    useEffect(() => {
        async function init() {
            const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
            setModel(() => extractor)
        }
        init()
    }, [])

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string)
                setKbData(json)
                setFileName(file.name)
            } catch (err) {
                alert("Invalid JSON format")
            }
        }
        reader.readAsText(file)
    }

    const clearFile = () => {
        setKbData(luaKbData as LuaKBEntry[])
        setFileName('lua_kb.json')
    }

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

    const isActive = query.length > 0

    return (
        <div className={`app-wrapper ${isActive ? 'active' : ''}`}>
            <div className="content-wrapper">
                <div className="search-panel">
                    <h1 className="title">EmmyLua Search</h1>

                    <div className="main-controls">
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

                        <div className="file-box">
                            <div className="file-info">
                                <span className="label">ACTIVE KB</span>
                                <span className="file-name">{fileName}</span>
                            </div>
                            <div className="file-actions">
                                <label className="modern-upload">
                                    BROWSE
                                    <input type="file" accept=".json" onChange={handleFileUpload} hidden />
                                </label>
                                {fileName !== 'lua_kb.json' && (
                                    <button className="clear-btn" onClick={clearFile}>RESET</button>
                                )}
                            </div>
                        </div>
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
