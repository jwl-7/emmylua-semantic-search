import React from 'react'

interface FileUploadProps {
    fileName: string
    onFileUpload: (data: any, fileName: string) => void
    onClearFile: () => void
    isDefaultFile: boolean
}

export default function FileUpload({
    fileName,
    onFileUpload,
    onClearFile,
    isDefaultFile
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
        <div className="file-box">
            <div className="file-info">
                <span className="file-name">{fileName}</span>
            </div>
            <div className="file-actions">
                <label className="modern-upload">
                    BROWSE
                    <input type="file" accept=".json" onChange={handleFileUpload} hidden />
                </label>
                {!isDefaultFile && (
                    <button className="clear-btn" onClick={onClearFile}>RESET</button>
                )}
            </div>
        </div>
    )
}
