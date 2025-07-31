// Requires lib/dom.js + env.site + sites

window.ui = {
    async getScheme() {
        return /\b(light|dark)\b/.exec(document.documentElement.className)?.[1]
            || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    },

    async isFullWin() {
        const { site } = env
        if (site == 'poe') return styles.fullWin.node.isConnected
        else if (!sites[site].hasSidebar) return true
        else { // calc widths to determine on sites w/ native toggle
            const barWidths = {} ; ['left', 'right'].forEach(side => {
                const barSelector = sites[site].selectors[`${ side == 'left' ? 'side' : 'right' }bar`],
                      barElem = document.querySelector(barSelector)
                barWidths[side] = barElem ? dom.get.computedWidth(barElem) : 0
            })
            return barWidths.left < 100 && barWidths.right < 100 // true if both bars skinny/hidden
        }
    }
};
