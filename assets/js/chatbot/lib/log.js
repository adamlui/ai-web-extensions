// Requires <app|config|env>

window.log = {

    styles: {
        prefix: {
            get base() { return `color: white ; padding: 2px 3px 2px 5px ; border-radius: 2px ; ${
                env.browser.isFF ? 'font-size: 13px ;' : '' }`},
            info: 'background: linear-gradient(344deg, rgba(0,0,0,1) 0%,'
                + 'rgba(0,0,0,1) 39%, rgba(30,29,43,0.6026611328125) 93%)',
            working: 'background: linear-gradient(342deg, rgba(255,128,0,1) 0%,'
                + 'rgba(255,128,0,0.9612045501794468) 57%, rgba(255,128,0,0.7539216370141807) 93%)' ,
            success: 'background: linear-gradient(344deg, rgba(0,107,41,1) 0%,'
                + 'rgba(3,147,58,1) 39%, rgba(24,126,42,0.7735294801514356) 93%)',
            warning: 'background: linear-gradient(344deg, rgba(255,0,0,1) 0%,'
                + 'rgba(232,41,41,0.9079832616640406) 57%, rgba(222,49,49,0.6530813008797269) 93%)',
            caller: 'color: blue'
        },

        msg: { working: 'color: #ff8000', warning: 'color: red' }
    },

    regEx: {
        greenVals: { caseInsensitive: /\b(?:true|\d+)\b|success\W?/i, caseSensitive: /\bON\b/ },
        redVals: { caseInsensitive: /\bfalse\b|error\W?/i, caseSensitive: /\BOFF\b/ },
        purpVals: /[ '"]\w+['"]?: / },

    prettifyObj(obj) { return JSON.stringify(obj)
        .replace(/([{,](?=")|":)/g, '$1 ') // append spaces to { and "
        .replace(/((?<!\})\})/g, ' $1') // prepend spaces to }
        .replace(/"/g, '\'') // replace " w/ '
    },

    toTitleCase(str) { return str[0].toUpperCase() + str.slice(1) }

} ; ['info', 'error', 'debug'].forEach(logType =>
    log[logType] = function() {
        if (logType == 'debug' && !config.debugMode) return

        const args = [...arguments].map(arg => typeof arg == 'object' ? JSON.stringify(arg) : arg)
        const msgType = args.some(arg => /\.{3}$/.test(arg)) ? 'working'
                        : args.some(arg => /\bsuccess\b|!$/i.test(arg)) ? 'success'
                        : args.some(arg => /\b(?:error|fail)\b/i.test(arg)) || logType == 'error' ? 'warning' : 'info'
        const prefixStyle = log.styles.prefix.base + log.styles.prefix[msgType]
        const baseMsgStyle = log.styles.msg[msgType] || '', msgStyles = []

        // Combine regex
        const allPatterns = Object.values(log.regEx).flatMap(val =>
            val instanceof RegExp ? [val] : Object.values(val).filter(val => val instanceof RegExp))
        const combinedPattern = new RegExp(allPatterns.map(pattern => pattern.source).join('|'), 'g')

        // Combine args into finalMsg, color chars
        let finalMsg = logType == 'error' && args.length == 1 && !/error:/i.test(args[0]) ? 'ERROR: ' : ''
        args.forEach((arg, idx) => {
            finalMsg += idx > 0 ? (idx == 1 ? ': ' : ' ') : '' // separate multi-args
            finalMsg += arg?.toString().replace(combinedPattern, match => {
                const matched = (
                    Object.values(log.regEx.greenVals).some(val =>
                        val.test(match) && (msgStyles.push('color: green', baseMsgStyle), true))
                    || Object.values(log.regEx.redVals).some(val =>
                        val.test(match) && (msgStyles.push('color: red', baseMsgStyle), true))
                )
                if (!matched && log.regEx.purpVals.test(match)) { msgStyles.push('color: #dd29f4', baseMsgStyle) }
                return `%c${match}%c`
            })
        })

        console[logType == 'error' ? logType : 'info'](
            `${app.symbol} %c${app.name}%c ${ log.caller ? `${log.caller} » ` : '' }%c${finalMsg}`,
            prefixStyle, log.styles.prefix.caller, baseMsgStyle, ...msgStyles
        )
    }
);
