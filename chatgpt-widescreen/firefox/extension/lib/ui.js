// Requires lib/dom.js + site: env.site + sites

window.ui = {
    import(deps) { Object.assign(this.imports ||= {}, deps) },

    async getScheme() {
        const site = this.imports.site,
              rootElem = await dom.get.loadedElem(`html${ site == 'perplexity' ? '[data-color-scheme]' : '' }`)
        return site == 'perplexity' ? rootElem.dataset.colorScheme
            : /light|dark/.test(rootElem.className) ? rootElem.className
            : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    },

    isFullWin() {
        const { site, sites } = this.imports
        if (site == 'poe') return !!document.getElementById('fullWindow-mode')
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
