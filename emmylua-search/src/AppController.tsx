import { useState } from 'react'
import { useSemanticSearch } from '@/useSemanticSearch'
import SearchPanel from '@/SearchPanel'
import SearchResults from '@/SearchResults'
import luaKbData from '@/lua_kb.json'

export default function AppController() {
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
                <SearchPanel
                    query={query}
                    onQueryChange={setQuery}
                    modelReady={modelReady}
                    fileName={fileName}
                    onFileUpload={handleFileUpload}
                    onClearFile={clearFile}
                />
                <SearchResults
                    results={results}
                    isSearching={isSearching}
                />
            </div>
        </div>
    )
}
