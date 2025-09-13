// Requires chatgpt.js + <app|icons|menus|session|settings|toggle>

window.feedback = {

    appAlert(...alerts) { // requires <app|session|toggle>
        alerts = alerts.flat() // flatten array args nested by spread operator
        app.div.textContent = ''
        const alertP = dom.create.elem('p', { class: `${app.slug}-alert no-user-select` })
        if (app.slug == 'bravegpt' || app.slug == 'googlegpt' && !alerts.includes('waitingResponse'))
            alertP.style.marginBottom = '-20px' // counteract app.div padding

        alerts.forEach((alert, idx) => { // process each alert for display
            let msg = app.alerts[alert] || alert // use string verbatim if not found in app.alerts
            if (idx > 0) msg = ' ' + msg // left-pad 2nd+ alerts
            if (msg.includes(app.alerts.login)) session.deleteOpenAIcookies()

            // Add login link to login msgs
            if (msg.includes('@'))
                msg += '<a class="alert-link" target="_blank" rel="noopener" href="https://chatgpt.com">chatgpt.com</a>'
                     + `, ${app.msgs.alert_thenRefreshPage}. (${app.msgs.alert_ifIssuePersists}, ${
                            app.msgs.alert_try.toLowerCase()} ${app.msgs.alert_switchingOn} ${app.msgs.mode_proxy})`

            // Hyperlink app.msgs.alert_suggestDiffAPI
            if (msg.includes(app.alerts.suggestDiffAPI)) {
                const selectPhrase = `${app.msgs.alert_selectingDiff} API`
                msg = msg.replace(selectPhrase, `<a class="alert-link suggest-api" href="#">${selectPhrase}</a>`)
            }

            // Hyperlink app.msgs.alert_switching<On|Off>
            const foundState = ['On', 'Off'].find(state =>
                msg.includes(app.msgs['alert_switching' + state]) || new RegExp(`\\b${state}\\b`, 'i').test(msg))
            if (foundState) { // hyperlink switch phrase for click listener to toggle.proxyMode()
                const switchPhrase = app.msgs['alert_switching' + foundState] || 'switching ' + foundState.toLowerCase()
                msg = msg.replace(switchPhrase, `<a class="alert-link switch-proxy" href="#">${switchPhrase}</a>`)
            }

            // Create/fill/append msg span
            const msgSpan = dom.create.elem('span') ; msgSpan.innerHTML = msg ; alertP.append(msgSpan)

            // Activate toggle link if necessary
            msgSpan.querySelectorAll('a[href="#"]').forEach(anchor =>
                anchor.onclick = () => anchor.classList.contains('suggest-api') ? modals.open('api')
                    : anchor.classList.contains('switch-proxy') ? toggle.proxyMode() : {}
            )
        })
        app.div.append(alertP)
    },

    notify(msg, pos = '', notifDuration = '', shadow = 'shadow') { // requires chatgpt.js + <icons|menus|settings>

        // Strip state word to append styled one later
        const foundState = menus.toolbar.state.words.find(word => msg.includes(word))
        if (foundState) msg = msg.replace(foundState, '')

        // Show notification
        chatgpt.notify(msg, pos, notifDuration, shadow)
        const notif = document.querySelector('.chatgpt-notif:last-child')

        // Prepend app icon
        const notifIcon = /amazon|google/.test(app.slug) ? icons[app.slug].create('white')
                                                         : icons[app.slug].create()
        notifIcon.style.cssText = (
            app.slug == 'amazongpt' ? 'width: 28px ; position: relative ; top: 4.8px ; margin-right: 8px'
          : app.slug == 'bravegpt' ? 'width: 32px ; position: relative ; top: 6px ; margin-right: 6px'
          : app.slug == 'duckduckgpt' ? 'width: 31px ; position: relative ; top: 5.8px ; margin-right: 8px'
          : /* googlegpt */ 'width: 26px ; position: relative ; top: 2.8px ; margin-right: 6px'
        )
        notif.prepend(notifIcon)

        // Append notif type icon
        const iconStyles = (
            app.slug == 'amazongpt' ?
                'width: 28px ; height: 28px ; position: relative ; top: 3.5px ; margin-left: 11px ;'
          : app.slug == 'bravegpt' ? 'width: 28px ; height: 28px ; position: relative ; top: 3px ; margin-left: 11px ;'
          : app.slug == 'duckduckgpt' ?
                'width: 28px ; height: 28px ; position: relative ; top: 3.5px ; margin-left: 11px ;'
          : /* googlegpt */ 'width: 28px ; height: 28px ; position: relative ; top: 3px ; margin-left: 11px ;'
        )
        const mode = Object.keys(settings.controls).find(
            key => msg.toLowerCase().includes(settings.controls[key].label.trim().toLowerCase()))
        if (mode && !/(?:pre|suf)fix/.test(mode)) {
            const modeIcon = icons.create({ key: settings.controls[mode].icon })
            modeIcon.style.cssText = iconStyles
                + ( /preferred/i.test(mode) ? 'top: 5.5px' : '' ) // lower Preferred API icon
                + ( // raise some icons
                    /focus|scroll/i.test(mode) ? 'top: 4px' : '' )
                + ( // shrink some icons
                    /animation|debug/i.test(mode) ? 'width: 23px ; height: 23px ; margin-top: 3px' : '' )
            if (mode.includes('Animation')) // customize sparkle fill
                modeIcon[`${ mode.startsWith('fg') ? 'last' : 'first' }Child`].style.fill = 'none'
            notif.append(modeIcon)
        }

        // Append styled state word
        if (foundState) {
            const stateStyles = {
                on: {
                    light: 'color: #5cef48 ; text-shadow: rgba(255,250,169,0.38) 2px 1px 5px',
                    dark:  'color: #5cef48 ; text-shadow: rgb(55,255,0) 3px 0 10px'
                },
                off: {
                    light: 'color: #ef4848 ; text-shadow: rgba(255,169,225,0.44) 2px 1px 5px',
                    dark:  'color: #ef4848 ; text-shadow: rgba(255, 116, 116, 0.87) 3px 0 9px'
                }
            }
            const styledStateSpan = dom.create.elem('span')
            styledStateSpan.style.cssText = ( app.slug != 'googlegpt' ? 'font-weight: bold ;' : '' )
                + stateStyles[foundState == menus.toolbar.state.words[0] ? 'off' : 'on'][env.ui.site.scheme]
            styledStateSpan.append(foundState) ; notif.insertBefore(styledStateSpan, notif.children[2])
        }

        // Overcome Amazon line-height off-centers text if no icon appended
        if (app.slug == 'amazongpt' && !(notif.lastChild instanceof SVGElement))
            Object.assign(notif.style, { lineHeight: 'normal', height: '61px' })
    }
};
