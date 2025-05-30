// Copyright © 2023–2025 Adam Lui (https://github.com/adamlui) under the MIT license
// Source: https://github.com/adamlui/ai-web-extensions/blob/main/assets/js/lib/dom.js/src/dom.js

window.dom = {

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

    create: {
        anchor(linkHref, displayContent, attrs = {}) {
            const anchor = document.createElement('a'),
                  defaultAttrs = { href: linkHref, target: '_blank', rel: 'noopener' },
                  finalAttrs = { ...defaultAttrs, ...attrs }
            Object.entries(finalAttrs).forEach(([attr, value]) => anchor.setAttribute(attr, value))
            if (displayContent) anchor.append(displayContent)
            return anchor
        },

        elem(elemType, attrs = {}) {
            const elem = document.createElement(elemType)
            for (const attr in attrs) elem.setAttribute(attr, attrs[attr])
            return elem
        },

        style(content, attrs = {}) {
            const style = document.createElement('style')
            style.setAttribute('type', 'text/css') // support older browsers
            for (const attr in attrs) style.setAttribute(attr, attrs[attr])
            if (content) style.textContent = content
            return style
        },

        svgElem(type, attrs = {}) {
            const elem = document.createElementNS('http://www.w3.org/2000/svg', type)
            for (const attr in attrs) elem.setAttributeNS(null, attr, attrs[attr])
            return elem
        }
    },

    cssSelectorize(classList) {
        return classList.toString()
            .replace(/([:[\]\\])/g, '\\$1') // escape special chars :[]\
            .replace(/^| /g, '.') // prefix w/ dot, convert spaces to dots
    },

    get: {

        computedSize(elems, { dimension } = {}) { // total width/height of elems (including margins)
        // * Returns { width: totalWidth, height: totalHeight } if no dimension passed
        // * Returns float if { dimension: 'width' | 'height' } passed

            // Validate args
            elems = elems instanceof NodeList ? [...elems] : [].concat(elems)
            elems.forEach(elem => { if (!(elem instanceof Node))
                throw new Error(`Invalid elem: Element "${JSON.stringify(elem)}" is not a valid DOM node`) })
            const validDimensions = ['width', 'height'], dimensionsToCompute = [].concat(dimension || validDimensions)
            dimensionsToCompute.forEach(dimension => { if (!validDimensions.includes(dimension))
                throw new Error('Invalid dimension: Use \'width\' or \'height\'') })

            // Compute dimensions
            const computedDimensions = { width: 0, height: 0 }
            elems.forEach(elem => {
                const elemStyle = getComputedStyle(elem) ; if (elemStyle.display == 'none') return
                Object.keys(computedDimensions).forEach(dimension => {
                    if (dimensionsToCompute.includes(dimension))
                        computedDimensions[dimension] += elem.getBoundingClientRect()[dimension]
                            + parseFloat(elemStyle[`margin${dimension == 'width' ? 'Left' : 'Top'}`])
                            + parseFloat(elemStyle[`margin${dimension == 'width' ? 'Right' : 'Bottom'}`])
                })
            })

            // Return computed dimensions
            return dimensionsToCompute.length > 1 ? computedDimensions // obj w/ width/height
                 : computedDimensions[dimensionsToCompute[0]] // single total val
        },

        computedHeight(elems) { return this.computedSize(elems, { dimension: 'height' }) }, // including margins
        computedWidth(elems) { return this.computedSize(elems, { dimension: 'width' }) }, // including margins

        loadedElem(selector, { timeout = null } = {}) {
            const raceEntries = [
                new Promise(resolve => { // when elem loads
                    const elem = document.querySelector(selector)
                    if (elem) resolve(elem)
                    else new MutationObserver((_, obs) => {
                        const elem = document.querySelector(selector)
                        if (elem) { obs.disconnect() ; resolve(elem) }
                    }).observe(document.documentElement, { childList: true, subtree: true })
                })
            ]
            if (timeout) raceEntries.push(new Promise(resolve => setTimeout(() => resolve(null), timeout)))
            return Promise.race(raceEntries)
        }
    }
};
