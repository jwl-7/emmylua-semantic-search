import SearchBar from '@/SearchBar'
import FileUpload from '@/FileUpload'

interface SearchPanelProps {
    query: string
    onQueryChange: (query: string) => void
    modelReady: boolean
    fileName: string
    onFileUpload: (data: any, name: string) => void
    onClearFile: () => void
}

export default function SearchPanel({
    query,
    onQueryChange,
    modelReady,
    fileName,
    onFileUpload,
    onClearFile,
}: SearchPanelProps) {
    return (
        <div className="search-panel">
            <h1 className="title">EmmyLua Search</h1>
            <div className="main-controls">
                <SearchBar
                    query={query}
                    onQueryChange={onQueryChange}
                    modelReady={modelReady}
                />
                <FileUpload
                    fileName={fileName}
                    onFileUpload={onFileUpload}
                    onClearFile={onClearFile}
                />
            </div>
        </div>
    )
}

