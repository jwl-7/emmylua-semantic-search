import LuaHighlighter from '@/LuaHighlighter'

interface LuaKBEntry {
    id: string
    file: string
    content: string
    vector: number[]
}

interface SearchResultsProps {
    results: (LuaKBEntry & { score: number })[]
}

export default function SearchResults({ results }: SearchResultsProps) {
    return (
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
    )
}
