// Requires components/<icons|tooltip>.js + lib/dom.js + <apis|app|env|log|modals|settings|toggle>

window.menus = {

    hover: {
        createAppend(menuType) { // requires components/tooltip.js + lib/dom.js
            const menu = this[menuType]
            for (const component of [tooltip, this]) if (!component.styles?.isConnected) component.stylize()
            app.div.append(menu.div = dom.create.elem('div', {
                id: `${app.slug}-${menuType}-menu`, style: 'width: max-content',
                class: `${app.slug}-menu ${app.slug}-tooltip fade-in-less no-user-select`
            }))
            menu.div.append(menu.ul = dom.create.elem('ul'))
            menu.div.onmouseenter = menu.div.onmouseleave = this.toggle
            this.update(menuType) ; menu.status = 'hidden'
        },

        hide(menuType) {
            Object.assign(this[menuType].div.style, { display: 'none', opacity: 0 })
            this[menuType].status = 'hidden'
        },

        stylize() { // requires lib/dom.js + app.slug
            if (!this.styles?.isConnected) document.head.append(this.styles ||= dom.create.style())
            this.styles.textContent = `
                .${app.slug}-menu > ul { color: white } .${app.slug}-menu > ul > li::marker { color: #ffff0000 }
                .${app.slug}-menu > ul > li:first-of-type > svg { /* header entry icon */
                    width: 13px ; height: 13px ; top: 2px ; position: relative ; margin-right: 3px }
                #${app.slug}-api-menu > ul > li:first-of-type > svg { /* API header entry icon */
                    top: 3px ; margin: 0 1px 0 -4px } /* tighten pos */
                .${app.slug}-menu-item .checkmark {
                    position: relative ; float: right ; margin-right: -20px ; top: 3.5px ; fill: #b3f96d }
                .${app.slug}-menu-item:hover .checkmark { fill: green }`
        },

        toggle(event) { // visibility
            const toggleElem = event.currentTarget,
                  reMenuType = /-?(\w+)-(?:btn|menu)$/,
                  menuType = reMenuType.exec(toggleElem.id)?.[1] || reMenuType.exec(toggleElem.className)?.[1],
                  menu = menus.hover[menuType]
            clearTimeout(menu.hideTimeout) // in case rapid re-enter before ran
            if (!menu.div?.isConnected) menus.hover.createAppend(menuType)
            if (menu.status == 'hidden' && (
                event.type == 'mouseenter' && event.target != menu.div // btn hovered-on
                    || event.type == 'click' ) // btn clicked
            ) { // show menu
                menu.div.style.display = '' // for rects calc
                const rects = {
                    appDiv: app.div.getBoundingClientRect(), toggleBtn: toggleElem.getBoundingClientRect(),
                    hoverMenu: menu.div.getBoundingClientRect()
                }
                const pointDirection = ['up', 'down'][+(
                    menu.directionBias == 'up' ? rects.toggleBtn.top < ( rects.hoverMenu.height +15 )
                                               : rects.toggleBtn.bottom < ( innerHeight - rects.hoverMenu.height -15 )
                )]
                Object.assign(menu.div.style, {
                    top: `${ rects.toggleBtn.top - rects.appDiv.top +(
                        pointDirection == 'down' ? 30.5 : -rects.hoverMenu.height -13 )}px`,
                    right: `${ rects.appDiv.right - event.clientX - menu.div.offsetWidth
                        / ( pointDirection == 'up' ? /* center */ 2 : /* leftish-aligned */ 1.25 )}px`,
                    opacity: 1
                })
                menu.status = 'visible'
            } else if (/click|mouseleave/.test(event.type)) // menu/btn hovered-off or btn clicked, hide menu
                return menus.hover[menuType].hideTimeout = setTimeout(() => menus.hover.hide(menuType), 55)
        },

        update(menuType) { // requires components/icons.js + app
            this[menuType].ul.textContent = ''
            this[menuType].entries.forEach((entry, idx) => {
                const item = dom.create.elem('li', { class: `${app.slug}-menu-item` })
                if (idx == 0) { // header item
                    item.innerHTML = `<b>${entry.label}</b>`
                    item.classList.add(`${app.slug}-menu-header`)
                    item.style.cssText = 'margin-bottom: 1px ; border-bottom: 1px dotted white'
                    if (entry.iconType) item.prepend(icons.create({ key: entry.iconType }))
                } else { // child items
                    item.textContent = entry.label
                    item.style.paddingRight = '24px' // make room for checkmark
                    if (idx == 1) item.style.marginTop = '3px' // top-pad first non-header item
                    if (entry.iconType) { // prepend it
                        const icon = icons.create({ key: entry.iconType })
                        icon.style.cssText = `
                            width: 12px ; height: 12px ; position: relative ; top: 1px ; right: 5px ; margin-left: 5px`
                        if (entry.iconType == 'webCorner') icon.style.width = icon.style.height = '11px' // shrink it
                        item.prepend(icon)
                    } else // indent
                        item.style.paddingLeft = '11px'
                    if (entry.isActive) item.append(icons.create({ key: 'checkmark', size: 12 }))
                }
                item.onclick = () => {
                    if (!entry.onclick) return
                    const prevOffsetTop = app.div.offsetTop ; entry.onclick()
                    if (app.div.offsetTop != prevOffsetTop) this.hide(menuType) // since app moved
                    this.update(menuType)
                }
                this[menuType].ul.append(item)
            })
        },

        api: { // requires <apis|app>
            directionBias: 'down',
            get entries() { return [
                { label: `${app.msgs.menuLabel_preferred} API:`, iconType: 'lightning' },
                ...[app.msgs.menuLabel_random, ...Object.keys(apis).filter(api => api != 'OpenAI')].map(api => ({
                    label: api,
                    onclick: () => {
                        settings.save('preferredAPI', api == app.msgs.menuLabel_random ? false : api)
                        feedback.notify(`${app.msgs.menuLabel_preferred} API ${app.msgs.menuLabel_saved.toLowerCase()}`,
                            `${ app.config.anchored ? 'top' : 'bottom' }-right`)
                    },
                    get isActive() {
                        return !app.config.preferredAPI && api == app.msgs.menuLabel_random
                             || app.config.preferredAPI == api
                    }
                }))
            ]}
        },

        pin: { // requires <app|toggle>
            directionBias: 'up',
            get entries() { return [
                { label: `${app.msgs.menuLabel_pinTo}...`, iconType: 'pin' },
                { label: app.msgs.menuLabel_nothing, iconType: 'cancel',
                    onclick: () => { toggle.sidebar('sticky', 'off') ; toggle.anchorMode('off') },
                    get isActive() { return !app.config.stickySidebar && !app.config.anchored }
                },
                { label: app.msgs.menuLabel_sidebar, iconType: 'sidebar',
                    onclick: () => toggle.sidebar('sticky'),
                    get isActive() { return app.config.stickySidebar }
                },
                { label: app.msgs.menuLabel_bottom, iconType: 'anchor',
                    onclick: () => toggle.anchorMode(),
                    get isActive() { return app.config.anchored }
                }
            ]}
        }
    },

    toolbar: {
        state: { // requires <app|env>
            symbols: ['❌', '✔️'], get separator() { return env.scriptManager.name == 'Tampermonkey' ? ' — ' : ': ' },
            get words() { return [app.msgs.state_off.toUpperCase(), app.msgs.state_on.toUpperCase()] }
        },

        refresh() { // requires <GM_unregisterMenuCommand|log>
            if (typeof GM_unregisterMenuCommand == 'undefined')
                return log.debug('GM_unregisterMenuCommand not supported.')
            this.entryIDs.forEach(id => GM_unregisterMenuCommand(id))
            this.register()
        },

        register() { // requires <app|env|modals|settings|toggle>

            // Add Proxy API Mode toggle
            const pmLabel = this.state.symbols[+app.config.proxyAPIenabled] + ' '
                          + settings.controls.proxyAPIenabled.label + ' '
                          + this.state.separator + this.state.words[+app.config.proxyAPIenabled]
            this.entryIDs = [GM_registerMenuCommand(pmLabel, toggle.proxyMode,
                env.scriptManager.supportsTooltips ? { title: settings.controls.proxyAPIenabled.helptip }
                                                   : undefined)]
            // Add About/Settings entries
            ;['about', 'settings'].forEach(entryType => this.entryIDs.push(GM_registerMenuCommand(
                entryType == 'about' ? `💡 ${settings.controls.about.label}` : `⚙️ ${app.msgs.menuLabel_settings}`,
                () => modals.open(entryType), env.scriptManager.supportsTooltips ? { title: ' ' } : undefined
            )))
        }
    }
};
