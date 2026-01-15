import { useMemo } from 'react'

interface HighlighterProps {
    code: string
}

export default ({ code }: HighlighterProps) => {
    const highlighted = useMemo(() => {
        let h = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

        // @param
        h = h.replace(/(---@param\s+)([a-zA-Z_]\w*)(\s+.*)/g, (match, tag, name, type) => {
            return `<span class="lua-cyan">${tag}</span><span class="lua-orange">${name}</span><span class="lua-cyan">${type}</span>`
        })

        // @tags
        h = h.replace(/(---@(?!param).+)/g, '<span class="lua-cyan">$1</span>')

        // keywords
        h = h.replace(/\b(function|end)\b(?![^<]*>)/g, '<span class="lua-red">$1</span>')

        // function name
        h = h.replace(/(lua-red">function<\/span>\s+)([\w\.:]+)/g, '$1<span class="lua-green">$2</span>')

        // parenthesis content
        h = h.replace(/(\()([^)]*)(\))/g, (match, open, content, close) => {
            if (open.includes('<') || content.includes('<')) return match
            const orangeParams = content.replace(/\b([a-zA-Z_]\w*)\b/g, '<span class="lua-orange">$1</span>')
            return `${open}${orangeParams}${close}`
        })

        return h
    }, [code])

    return <code dangerouslySetInnerHTML={{ __html: highlighted }} />
}
