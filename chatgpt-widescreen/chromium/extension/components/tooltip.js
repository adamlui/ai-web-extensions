// Requires components/buttons.js + lib/<browser|chatgpt|dom>.js + <app|config|env>

window.tooltip = {

    stylize() { // requires lib/dom.js + app.slug
        document.head.append(this.styles = dom.create.style(`.${app.slug}-tooltip {
          --shadow: 4px 6px 16px 0 rgb(0 0 0 / 38%) ; --transition: opacity 0.15s, transform 0.15s ;
            background-color: rgba(0,0,0,0.71) ; padding: 5px 6px ; border: 1px solid #d9d9e3 ; border-radius: 6px ;
            font-size: 0.85rem ; color: white ; white-space: nowrap ; position: fixed ; opacity: 0 ; z-index: 99999 ;
            box-shadow: var(--shadow) ; -webkit-box-shadow: var(--shadow) ; -moz-box-shadow: var(--shadow) ;
            transition: var(--transition) ; -webkit-transition: var(--transition) ; -moz-transition: var(--transition) ;
               -ms-transition: var(--transition) ; -o-transition: var(--transition) ;
            user-select: none ; webkit-user-select: none ; -moz-user-select: none ; -ms-user-select: none
        }`))
    },

    toggle(event) { // requires lib/dom.js + <app|env>
        if (env.browser.isMobile) return
        const togglingOn = event.type == 'mouseenter'
        tooltip.div ||= dom.create.elem('div', { class: `${app.slug}-tooltip` })
        if (!tooltip.div.isConnected) event.currentTarget?.after(tooltip.div)
        if (!tooltip.styles) tooltip.stylize()
        tooltip.update(event.currentTarget) // update text/pos
        tooltip.div.style.opacity = +togglingOn // update visibility
        if (app.config.tooltipAnimations) // update zoom
            tooltip.div.style.transform = `scale(${ togglingOn ? 1 : 0.8 })`
    },

    async update(btn) { // requires lib/<browser|chatbar|chatgpt>.js + <config|env>
        if (!this.div) return
        const { site } = env
        const btnType = btn.id.replace(/-btn$/, '')
        const btnRect = btn.getBoundingClientRect()
        const btnTransform = getComputedStyle(btn).transform
        const btnScale = btnTransform == 'none' ? 1
            : parseFloat(/matrix\(([^)]+)\)/.exec(btnTransform)[1].split(',')[0])
        const unscaledTop = btnRect.top +( btnRect.height - btnRect.height / btnScale )/2
        this.div.textContent = i18n.getMsg(`tooltip_${btnType}${
            !/full|wide/i.test(btnType) ? '' : (app.config[btnType] ? 'OFF' : 'ON')}`)
        this.div.style.left = `${ btnRect.left +( btnRect.width /2 ) -( this.div.offsetWidth /2 )
            -( site == 'poe' || await chatbar.is.tall() ? 0 : chatgpt.sidebar.isOn() ? 260 : 52 )}px`
        this.div.style.top = `${ unscaledTop - this.div.offsetHeight -( site == 'chatgpt' ? -75 : /* poe */ 19 )}px`
    }
};
