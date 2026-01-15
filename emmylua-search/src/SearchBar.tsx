interface SearchBarProps {
    query: string
    onQueryChange: (query: string) => void
    modelReady: boolean
}

export default function SearchBar({ query, onQueryChange, modelReady }: SearchBarProps) {
    return (
        <div className="input-container">
            <input
                type="text"
                placeholder="Search EmmyLua metafile..."
                autoFocus
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                disabled={!modelReady}
            />
        </div>
    )
}
