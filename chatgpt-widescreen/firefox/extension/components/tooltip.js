// Requires lib/dom.js + components/buttons.js + env + msgs: app.msgs (Greasemonkey only) + sites

window.tooltip = {
    import(deps) { Object.assign(this.imports = this.imports || {}, deps) },

    createDiv() { this.div = dom.create.elem('div', { class: 'cwm-tooltip' }) },

    getMsg(key) {
        return typeof GM_info != 'undefined' ?
            this.imports.msgs[key] // from tooltip.import({ msgs: app.msgs }) in userscript
                : chrome.i18n.getMessage(key) // from ./_locales/*/messages.json
    },

    stylize() {
        if (this.styles) return
        this.styles = dom.create.style(`.cwm-tooltip {
            background-color: rgba(0,0,0,0.71) ; padding: 5px 6px ; border-radius: 6px ; border: 1px solid #d9d9e3 ;
            font-size: 0.85rem ; color: white ; white-space: nowrap ; /* text style */
            --shadow: 4px 6px 16px 0 rgb(0 0 0 / 38%) ;
                box-shadow: var(--shadow) ; -webkit-box-shadow: var(--shadow) ; -moz-box-shadow: var(--shadow) ;
            position: absolute ; bottom: 58px ; opacity: 0 ; z-index: 9999 ; /* visibility */
            transition: opacity 0.1s ; -webkit-transition: opacity 0.1s ; -moz-transition: opacity 0.1s ;
                -ms-transition: opacity 0.1s ; -o-transition: opacity 0.1s ;
            user-select: none ; webkit-user-select: none ; -moz-user-select: none ; -ms-user-select: none }`
        )
        document.head.append(this.styles)
    },

    toggle(event) {
        tooltip.update(event.currentTarget.id.replace(/-btn$/, ''))
        tooltip.div.style.opacity = event.type == 'mouseover' ? 1 : 0
    },

    async update(btnType) { // text & position
        const site = this.imports.env.site
        const rightBtnRect = (await buttons.getRightBtn()).getBoundingClientRect()
        const ctrAddend = rightBtnRect.width + (
            site == 'perplexity' ? ( location.pathname == '/' ? -1
                : innerWidth - rightBtnRect.right -( innerWidth < 768 ? 11 : 26 ))
          : site == 'poe' ? 22 : -3 )
        const spreadFactor = site == 'chatgpt' ? ( this.imports.env.browser.isFF ? 29.5 : 28 ) : 27
        const iniRoffset = spreadFactor * ( buttons.getTypes.visible().indexOf(btnType) +1 ) + ctrAddend
                         + ( site == 'chatgpt' && await chatbar.is.tall() ? -2 : 4 )
        this.div.innerText = this.getMsg(`tooltip_${btnType}${
            !/full|wide/i.test(btnType) ? '' : (config[btnType] ? 'OFF' : 'ON')}`)
        this.div.style.right = `${ iniRoffset - this.div.getBoundingClientRect().width /2 }px` // x-pos
        this.div.style.bottom = ( // y-pos
            site == 'perplexity' ? (
                location.pathname != '/' ? '64px' // not homepage
                  : document.querySelector( // logged-in homepage
                        this.imports.sites.perplexity.selectors.btns.settings) ? 'revert-layer'
                                         : '50vh' // logged-out homepage
            ) : site == 'poe' ? '50px' : '42px'
        )
    }
};
