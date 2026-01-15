import React, { useState, useEffect } from 'react'
import LuaHighlighter from '@/LuaHighlighter'
import { useSemanticSearch } from '@/useSemanticSearch'
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
    const [kbData, setKbData] = useState<LuaKBEntry[]>(luaKbData as LuaKBEntry[])
    const [fileName, setFileName] = useState<string>('lua_kb.json')

    const { results, isSearching, modelReady } = useSemanticSearch(query, kbData)

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
                                disabled={!modelReady}
                            />
                        </div>

                        <div className="file-box">
                            <div className="file-info">
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