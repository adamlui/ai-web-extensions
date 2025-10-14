// Requires lib/<browser|chatgpt|dom|styles>.js + <app|env|configt>

window.feedback = {
    notify(msg, pos = '', notifDuration = '', shadow = '') {
        if (!styles.toast.node) styles.update({ key: 'toast' })
        if (config.notifDisabled
            && !new RegExp(`${i18n.getMsg('menuLabel_show')} ${i18n.getMsg('menuLabel_notifs')}`, 'i')
                .test(msg)
        ) return

        // Strip state word to append colored one later
        const foundState = [
            i18n.getMsg('state_on').toUpperCase(), i18n.getMsg('state_off').toUpperCase()
        ].find(word => msg.includes(word))
        if (foundState) msg = msg.replace(foundState, '')

        // Show notification
        chatgpt.notify(`${app.symbol} ${msg}`, pos ||( config.notifBottom ? 'bottom' : '' ),
            notifDuration, shadow || env.ui.scheme == 'light')
        const notif = document.querySelector('.chatgpt-notif:last-child')
        notif.classList.add(app.slug) // for styles.toast

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
            styledStateSpan.style.cssText = stateStyles[
                foundState == i18n.getMsg('state_off').toUpperCase() ? 'off' : 'on'][env.ui.scheme]
            styledStateSpan.append(foundState) ; notif.append(styledStateSpan)
        }
    }
};
