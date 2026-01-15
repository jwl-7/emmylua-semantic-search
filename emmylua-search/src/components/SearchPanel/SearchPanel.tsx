import styles from './SearchPanel.module.sass'
import SearchBar from '@/components/SearchBar/SearchBar'
import FileUpload from '@/components/FileUpload/FileUpload'

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
        <div className={styles.searchPanel}>
            <h1 className={styles.title}>EmmyLua Search</h1>
            <div className={styles.controls}>
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

