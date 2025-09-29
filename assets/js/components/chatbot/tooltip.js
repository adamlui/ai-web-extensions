window.tooltip = { // requires dom.js + <app|config|env>

    stylize() { // requires dom.js + app.slug
        document.head.append(this.styles = dom.create.style(`.${app.slug}-tooltip {
          --shadow: 3px 5px 16px 0 rgb(0,0,0,0.21) ; --transition: opacity 0.15s, transform 0.15s ;
            background-color: rgba(0,0,0,0.64) ; padding: ${ app.slug == 'googlegpt' ? '6px 7px' : '4px 6px 4px' };
            border: 1px solid #d9d9e3 ; border-radius: 6px ;
            font-size: ${
                /amazon|duck/.test(app.slug) ? 0.87 : app.slug == 'bravegpt' ? 0.58 : /* googlegpt */ 0.75 }rem ;
            color: white ; fill: white ; stroke: white ; /* font/icon style */
            position: absolute ; /* for this.update() calcs */
            opacity: 0 ; height: fit-content ; z-index: 1250 ; /* visibility */
            box-shadow: var(--shadow) ; -webkit-box-shadow: var(--shadow) ; -moz-box-shadow: var(--shadow) ;
            transition: var(--transition) ; -webkit-transition: var(--transition) ; -moz-transition: var(--transition) ;
                -ms-transition: var(--transition) ; -o-transition: var(--transition)
        }`))
    },

    toggle(stateOrEvent) { // requires dom.js + <app|env>
        if (env.browser.isMobile) return
        const togglingOn = stateOrEvent?.type == 'mouseenter' || stateOrEvent == 'on'
        tooltip.div ||= dom.create.elem('div', { class: `${app.slug}-tooltip no-user-select` })
        if (!tooltip.div.isConnected) app.div.append(tooltip.div)
        if (!tooltip.styles) tooltip.stylize()
        if (typeof stateOrEvent == 'object') // mouse event, update text/pos
            tooltip.update(stateOrEvent.currentTarget)
        tooltip.div.style.opacity = +togglingOn ; tooltip.div.style.transform = `scale(${ togglingOn ? 1 : 0.8 })`
    },

    update(btn) { // requires <app|config>
        if (!this.div) return // since nothing to update
        const btnType = /-([\w-]+)-btn$/.exec(btn.id)?.[1]
        const baseText = {
            about: app.msgs.menuLabel_about,
            arrows: app.msgs[`tooltip_${ config.expanded ? 'shrink' : 'expand' }`],
            chevron: app.msgs[`tooltip_${ config.minimized ? 'restore' : 'minimize' }`],
            copy:
                btn.firstChild.id.includes('-copy-') ?
                    `${app.msgs.tooltip_copy}${ btn.closest('code') ? ''
                        : ` ${app.msgs.tooltip_reply.toLowerCase()}`}`
                : `${app.msgs.notif_copiedToClipboard}!`,
            download:
                btn.firstChild.id.includes('-download-') ? app.msgs.btnLabel_download
                    : `${app.msgs.tooltip_code} ${app.msgs.notif_downloaded}!`,
            'font-size': app.msgs.tooltip_fontSize,
            regen:
                btn.firstChild.style.animation || btn.firstChild.style.transform ?
                    `${app.msgs.tooltip_regenerating} ${app.msgs.tooltip_reply.toLowerCase()}...`
                  : `${app.msgs.tooltip_regenerate} ${app.msgs.tooltip_reply.toLowerCase()}`,
            send: app.msgs.tooltip_sendReply,
            settings: app.msgs.menuLabel_settings,
            share:
                btn.style.animation ? `${app.msgs.tooltip_generating} HTML...`
                    : `${app.msgs.tooltip_generate} ${app.msgs.btnLabel_convo} ${
                         app.msgs.tooltip_page.toLowerCase()}`,
            shuffle: app.msgs[`tooltip_${ app.slug == 'googlegpt' ? 'feelingLucky' : 'askRandQuestion' }`],
            speak:
                btn.querySelector('svg').id.includes('-speak-') ?
                    `${app.msgs.tooltip_play} ${app.msgs.tooltip_reply.toLowerCase()}`
                : btn.querySelector('svg').id.includes('generating-') ? `${app.msgs.tooltip_generatingAudio}...`
                : `${app.msgs.tooltip_playing} ${app.msgs.tooltip_reply.toLowerCase()}...`,
            summarize: app.msgs.tooltip_summarizeResults,
            wsb: ( config.widerSidebar ? `${app.msgs.prefix_exit} ` : '' ) + app.msgs.menuLabel_widerSidebar
        }[btnType]

        // Update text
        tooltip.div.textContent = baseText
        tooltip.nativeRpadding = tooltip.nativeRpadding
            || parseFloat(window.getComputedStyle(tooltip.div).paddingRight)
        clearInterval(tooltip.dotCycler)
        if (baseText.endsWith('...')) { // animate the dots
            const noDotText = baseText.slice(0, -3), dotWidth = 2.75 ; let dotCnt = 3
            tooltip.dotCycler = setInterval(() => {
                dotCnt = (dotCnt % 3) + 1 // cycle thru 1 → 2 → 3
                tooltip.div.textContent = noDotText + '.'.repeat(dotCnt)
                tooltip.div.style.paddingRight = `${ // adjust based on dotCnt
                    tooltip.nativeRpadding + (3 - dotCnt) * dotWidth }px`
            }, 350)
        } else // restore native right-padding
            tooltip.div.style.paddingRight = tooltip.nativeRpadding

        // Update position
        const elems = { appDiv: app.div, btn, btnsDiv: btn.closest('[id*=btns], [class*=btns]') }
        const rects = {} ; Object.keys(elems).forEach(key => rects[key] = elems[key]?.getBoundingClientRect())
        tooltip.div.style.top = `${ rects[rects.btnsDiv ? 'btnsDiv' : 'btn'].top - rects.appDiv.top
            -( app.slug == 'bravegpt' ? 36 : app.slug == 'googlegpt' ? 37 : 39 )}px`
        tooltip.div.style.right = `${
            rects.appDiv.right -( rects.btn.left + rects.btn.right )/2 - tooltip.div.offsetWidth /2 }px`
    }
};
