import styles from './SearchResults.module.sass'
import SearchLoader from '../SearchLoader/SearchLoader'
import LuaHighlighter from '@/components/LuaHighlighter/LuaHighlighter'

interface SearchResultsProps {
    results: (LuaKBEntry & { score: number })[]
    isSearching: boolean
}

export default function SearchResults({ results, isSearching }: SearchResultsProps) {
    return (
        <div className={styles.searchResultsWrapper}>
            {isSearching ? (
                <SearchLoader />
            ) : (
                <div className={styles.searchResults}>
                    {results.map((item) => {
                        const score = item.score * 100
                        const hue = score * 1.2
                        const textColor = `hsl(${hue}, 70%, 60%)`

                        return (
                            <div key={item.id} className={styles.card}>
                                <div className={styles.matchScore}>
                                    <div className={styles.matchBadge}>
                                        <span className={styles.matchPercent} style={{ color: textColor }}>
                                            {score.toFixed(0)}%
                                        </span>
                                        <span className={styles.matchLabel}>MATCH</span>
                                    </div>
                                </div>
                                <pre className={styles.code}>
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
