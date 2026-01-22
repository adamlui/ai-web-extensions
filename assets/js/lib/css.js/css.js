// Copyright © 2026 Adam Lui (https://github.com/adamlui) under the MIT license
// Source: https://github.com/adamlui/ai-web-extensions/blob/main/assets/js/lib/css.js/css.js

window.css = {

    addRisingParticles(targetNode, { lightScheme = 'gray', darkScheme = 'white' } = {}) {
    // * Requires https://assets.aiwebextensions.com/styles/rising-particles/dist/<lightScheme>.min.css

        if (targetNode.querySelector('[id*=particles]')) return
        const particlesDivsWrapper = document.createElement('div')
        particlesDivsWrapper.style.cssText = (
            'position: absolute ; top: 0 ; left: 0 ;' // hug targetNode's top-left corner
          + 'height: 100% ; width: 100% ; border-radius: 15px ; overflow: clip ;' // bound innards exactly by targetNode
          + 'z-index: -1' ) // allow interactive elems to be clicked
        ;['sm', 'med', 'lg'].forEach(particleSize => {
            const particlesDiv = document.createElement('div')
            particlesDiv.id = config?.bgAnimationsDisabled ? `particles-${particleSize}-off`
                : `${( env?.ui?.scheme || env?.ui?.app?.scheme ) == 'dark' ? darkScheme
                    : lightScheme }-particles-${particleSize}`
            particlesDivsWrapper.append(particlesDiv)
        })
        targetNode.prepend(particlesDivsWrapper)
    },

    selectors: {
        extract(obj, type = 'all') {
            if (!obj || typeof obj != 'object')
                throw new TypeError('First parameter must be an object')

            const validTypes = ['all', 'css', 'xpath']
            if (!validTypes.includes(type))
                throw new TypeError(`Type must be one of: ${validTypes.join(', ')}`)

            const selectors = Object.values(obj).flatMap(val => {
                if (val && typeof val == 'object') return this.extract(val, type) // recurse into nested objs
                return typeof val == 'string' ? [val] : [] // only include strings
            })

            return type == 'css'   ? selectors.filter(sel => !sel?.startsWith('//'))
                 : type == 'xpath' ? selectors.filter(sel =>  sel?.startsWith('//'))
                 : selectors
        },

        fromClasses(classList) {
            return classList.toString()
                .replace(/([:[\]\\])/g, '\\$1') // escape special chars :[]\
                .replace(/^| /g, '.') // prefix w/ dot, convert spaces to dots
        }
    }
};
