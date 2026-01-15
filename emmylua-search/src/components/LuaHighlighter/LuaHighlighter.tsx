import styles from './LuaHighlighter.module.sass'
import { useMemo } from 'react'

interface HighlighterProps {
    code: string
}

export default ({ code }: HighlighterProps) => {
    const highlighted = useMemo(() => {
        let h = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

        // @param
        h = h.replace(/(---@param\s+)([a-zA-Z_]\w*)(\s+.*)/g, (match, tag, name, type) => {
            return `<span class=${styles.cyan}>${tag}</span><span class=${styles.orange}>${name}</span><span class=${styles.cyan}>${type}</span>`
        })

        // @tags
        h = h.replace(/(---@(?!param).+)/g, `<span class=${styles.cyan}>$1</span>`)

        // keywords
        h = h.replace(/\b(function|end)\b(?![^<]*>)/g, `<span class=${styles.red}>$1</span>`)

        // function name
        h = h.replace(/\bfunction\s+([\w\.:]+)/g, (match, name) => {
            return `<span class="${styles.red}">function</span> <span class="${styles.green}">${name}</span>`
        })

        // parenthesis content
        h = h.replace(/(\()([^)]*)(\))/g, (match, open, content, close) => {
            if (open.includes('<') || content.includes('<')) return match
            const orangeParams = content.replace(/\b([a-zA-Z_]\w*)\b/g, `<span class=${styles.orange}>$1</span>`)
            return `${open}${orangeParams}${close}`
        })

        return h
    }, [code])

    return <code dangerouslySetInnerHTML={{ __html: highlighted }} />
}
