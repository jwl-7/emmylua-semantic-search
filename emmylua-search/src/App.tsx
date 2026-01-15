import { useState } from 'react'
import { useSemanticSearch } from '@/useSemanticSearch'
import SearchResults from '@/SearchResults'
import SearchBar from '@/SearchBar'
import FileUpload from '@/FileUpload'
import luaKbData from '@/lua_kb.json'
import '@/styles.sass'

export default function App() {
    const [query, setQuery] = useState('')
    const [kbData, setKbData] = useState<LuaKBEntry[]>(luaKbData as LuaKBEntry[])
    const [fileName, setFileName] = useState<string>('lua_kb.json')

    const { results, isSearching, modelReady } = useSemanticSearch(query, kbData)

    const handleFileUpload = (data: any, name: string) => {
        setKbData(data)
        setFileName(name)
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
                        <SearchBar
                            query={query}
                            onQueryChange={setQuery}
                            modelReady={modelReady}
                        />

                        <FileUpload
                            fileName={fileName}
                            onFileUpload={handleFileUpload}
                            onClearFile={clearFile}
                            isDefaultFile={fileName === 'lua_kb.json'}
                        />
                    </div>
                </div>

                <SearchResults results={results} isSearching={isSearching} />
            </div>
        </div>
    )
}
