import styles from './FileUpload.module.sass'
import React from 'react'

interface FileUploadProps {
    fileName: string
    onFileUpload: (data: any, fileName: string) => void
    onClearFile: () => void
}

export default function FileUpload({
    fileName,
    onFileUpload,
    onClearFile
}: FileUploadProps) {
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string)
                onFileUpload(json, file.name)
            } catch (err) {
                alert("Invalid JSON format")
            }
        }
        reader.readAsText(file)
    }

    return (
        <div className={styles.fileUploadWrapper}>
            <div className={styles.fileInfo}>
                <span className={styles.fileName}>{fileName}</span>
            </div>
            <div className={styles.fileControls}>
                <label className={styles.fileUpload}>
                    BROWSE
                    <input type="file" accept=".json" onChange={handleFileUpload} hidden />
                </label>
                {fileName !== 'lua_kb.json' && (
                    <button className={styles.fileClear} onClick={onClearFile}>CLEAR</button>
                )}
            </div>
        </div>
    )
}
