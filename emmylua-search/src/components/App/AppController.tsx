import styles from './AppController.module.sass'
import { useState } from 'react'
import { useSemanticSearch } from '@/hooks/useSemanticSearch'
import SearchPanel from '@/components/SearchPanel/SearchPanel'
import SearchResults from '@/components/SearchResults/SearchResults'
import clsx from 'clsx'
import luaKbData from '@/data/lua_kb.json'

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
        <div className={clsx(styles.appWrapper, isActive && styles.active)}>
            <div className={styles.contentWrapper}>
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
