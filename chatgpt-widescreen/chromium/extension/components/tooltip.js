// Requires components/buttons.js + lib/<browser|dom>.js + <app|config|env>

window.tooltip = {

    stylize() { // requires lib/dom.js + app
        document.head.append(this.styles = dom.create.style(`.${app.slug}-tooltip {
            background-color: /* bubble style */
                rgba(0,0,0,0.71) ; padding: 5px 6px ; border-radius: 6px ; border: 1px solid #d9d9e3 ;
            font-size: 0.85rem ; color: white ; white-space: nowrap ; /* text style */
          --shadow: 4px 6px 16px 0 rgb(0 0 0 / 38%) ;
                box-shadow: var(--shadow) ; -webkit-box-shadow: var(--shadow) ; -moz-box-shadow: var(--shadow) ;
            position: fixed ; opacity: 0 ; z-index: 99999 ; /* visibility */
            transition: opacity 0.15s ; -webkit-transition: opacity 0.15s ; -moz-transition: opacity 0.15s ;
                -ms-transition: opacity 0.15s ; -o-transition: opacity 0.15s ;
            user-select: none ; webkit-user-select: none ; -moz-user-select: none ; -ms-user-select: none }`
        ))
    },

    toggle(event) { // requires lib/dom.js + <app|env>
        if (env.browser.isMobile) return
        tooltip.div ||= dom.create.elem('div', { class: `${app.slug}-tooltip` })
        if (!tooltip.div.isConnected) event.currentTarget?.after(tooltip.div)
        if (!tooltip.styles) tooltip.stylize()
        tooltip.update(event.currentTarget)
        tooltip.div.style.opacity = +(event.type == 'mouseenter')
    },

    update(btn) { // requires lib/browser.js + <config|env>
        if (!this.div) return
        const { site } = env
        const btnType = btn.id.replace(/-btn$/, '')
        const btnRect = btn.getBoundingClientRect()
        const btnTransform = getComputedStyle(btn).transform
        const btnScale = btnTransform == 'none' ? 1
            : parseFloat(/matrix\(([^)]+)\)/.exec(btnTransform)[1].split(',')[0])
        const unscaledTop = btnRect.top +( btnRect.height - btnRect.height / btnScale )/2
        this.div.textContent = browserAPI.getMsg(`tooltip_${btnType}${
            !/full|wide/i.test(btnType) ? '' : (config[btnType] ? 'OFF' : 'ON')}`)
        this.div.style.left = `${ btnRect.left +( btnRect.width /2 ) -( this.div.offsetWidth /2 )}px`
        this.div.style.top = `${ unscaledTop - this.div.offsetHeight -(
            site == 'chatgpt' ? -75 : site == 'perplexity' ? 11 : /* poe */ 19 )}px`
    }
};
