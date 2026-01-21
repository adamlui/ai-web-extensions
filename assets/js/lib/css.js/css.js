// Copyright © 2026 Adam Lui (https://github.com/adamlui) under the MIT license
// Source: https://github.com/adamlui/ai-web-extensions/blob/main/assets/js/lib/css.js/css.js

window.css = {
    extractSelectors(obj, type = 'all') {
        if (!obj || typeof obj !== 'object')
            throw new TypeError('First parameter must be an object')

        const validTypes = ['all', 'css', 'xpath']
        if (!validTypes.includes(type))
            throw new TypeError(`Type must be one of: ${validTypes.join(', ')}`)

        const selectors = Object.values(obj).flatMap(val => {
            if (val && typeof val == 'object') return this.extractSelectors(val, type) // recurse into nested objs
            return typeof val == 'string' ? [val] : [] // only include strings
        })

        return type == 'css' ? selectors.filter(sel => sel && !sel.startsWith('//'))
             : type == 'xpath' ? selectors.filter(sel => sel && sel.startsWith('//'))
             : selectors
    }
};
