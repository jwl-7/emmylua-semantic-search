import LuaHighlighter from '@/LuaHighlighter'

interface SearchResultsProps {
    results: (LuaKBEntry & { score: number })[]
    isSearching: boolean
}

export default function SearchResults({ results, isSearching }: SearchResultsProps) {
    return (
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
    )
}
