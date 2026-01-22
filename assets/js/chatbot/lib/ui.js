// Requires component/<menus|tooltip>.js + <app|env|fontSizeSlider|get|inputEvents|modals|show|toggle|update>

window.ui = {

    addListeners: {
        appDiv() { // requires <app|fontSizeSlider|inputEvents|update>
            app.div.addEventListener(inputEvents.down, event => { // to dismiss visible font size slider
                if (event.button != 0) return // prevent non-left-click dismissal
                if (document.getElementById(`${app.slug}-font-size-slider-track`) // slider is visible
                    && !event.target.closest('[id*=font-size]') // not clicking slider elem
                    && getComputedStyle(event.target).cursor != 'pointer') // ...or other interactive elem
                        fontSizeSlider.toggle('off')
            })
            app.div.onmouseover = app.div.onmouseout = update.bylineVisibility
        },

        btns: {
            appHeader() { // requires component/<menus|tooltip>.js + <app|env|fontSizeSlider|modals|toggle>
                app.div.querySelectorAll(`.${app.slug}-header-btn`).forEach(btn => { // from right to left
                    const btnType = /-([\w-]+)-btn$/.exec(btn.id)?.[1]

                    // Add click listener
                    btn.onclick = {
                        about: () => modals.open('about'),
                        arrows: ({ currentTarget }) => { toggle.expandedMode() ; tooltip.update(currentTarget) },
                        chevron: () => {
                            if (app.div.querySelector('[id$=font-size-slider-track]')?.classList.contains('active'))
                                fontSizeSlider.toggle('off')
                            toggle.minimized()
                        },
                        pin: () => (btn.onmouseenter = btn.onmouseleave = btn.onclick = menus.hover.toggle),
                        settings: () => modals.open('settings'),
                        'font-size': () => fontSizeSlider.toggle(),
                        wsb: ({ currentTarget }) => { toggle.sidebar('wider') ; tooltip.update(currentTarget) }
                    }[btnType]

                    // Add hover listener
                    if (!env.browser.isMobile)
                        btn.onmouseenter = btn.onmouseleave = btnType == 'pin' ? menus.hover.toggle : tooltip.toggle

                    // Add zoom/fade-out to corner buttons
                    if (/about|settings/.test(btn.id)) btn.onmouseup = () => {
                        if (config.fgAnimationsDisabled) return
                        btn.style.animation = 'btn-zoom-fade-out 0.2s ease-out'
                        if (env.browser.isFF) // end animation 0.08s early to avoid icon overgrowth
                            setTimeout(handleAnimationEnded, 0.12 *1000)
                        else btn.onanimationend = handleAnimationEnded
                        function handleAnimationEnded() {
                            Object.assign(btn.style, { opacity: '0', visibility: 'hidden', animation: '' }) // hide btn
                            setTimeout(() => // show btn after short delay
                                Object.assign(btn.style, { visibility: 'visible', opacity: '1' }), 135)
                        }
                    }
                })
            },

            chatbar() { // requires component/tooltip.js + lib/prompts.js + <app|env|get|show>
                app.div.querySelectorAll(`.${app.slug}-chatbar-btn`).forEach(btn => {
                    btn.onclick = () => {
                        tooltip.toggle('off') // hide lingering tooltip when not in Standby mode
                        const btnType = /-([\w-]+)-btn$/.exec(btn.id)?.[1]
                        if (btnType == 'send') return // since handled by form submit
                        app.msgChain.push({ time: Date.now(), role: 'user', content: prompts.create(
                            btnType == 'shuffle' ? 'randomQA' : 'summarizeResults', { mods: 'all' })})
                        get.reply({ msgs: app.msgChain, src: btnType })
                        show.reply.chatbarFocused = false ; show.reply.userInteracted = true
                    }
                    if (!env.browser.isMobile) // add hover listener for tooltips
                        btn.onmouseenter = btn.onmouseleave = tooltip.toggle
                })
            }
        },

        replySection() { // requires <app|get|show>

            // Add form key listener
            const replyForm = app.div.querySelector('form')
            replyForm.onkeydown = event => {
                if (event.key == 'Enter' || event.keyCode == 13) {
                    if (event.ctrlKey) { // add newline
                        const chatTextarea = app.div.querySelector(`#${app.slug}-chatbar`),
                              caretPos = chatTextarea.selectionStart,
                              textBefore = chatTextarea.value.substring(0, caretPos),
                              textAfter = chatTextarea.value.substring(caretPos)
                        chatTextarea.value = textBefore + '\n' + textAfter // add newline
                        chatTextarea.selectionStart = chatTextarea.selectionEnd = caretPos + 1 // preserve caret pos
                        ui.addListeners.replySection.chatbarAutoSizer()
                    } else if (!event.shiftKey) ui.addListeners.replySection.submitHandler(event)
            }}

            // Add form submit listener
            ui.addListeners.replySection.submitHandler = event => {
                event.preventDefault()
                const chatTextarea = app.div.querySelector(`#${app.slug}-chatbar`)

                // No reply, change placeholder + focus chatbar
                if (chatTextarea.value.trim() == '') {
                    chatTextarea.placeholder = `${app.msgs.placeholder_typeSomething}...`
                    chatTextarea.focus()

                // Yes reply, submit it + transform to loading UI
                } else {
                    app.msgChain.push({ time: Date.now(), role: 'user', content: chatTextarea.value })
                    get.reply({ msgs: app.msgChain, src: 'submit' })
                    show.reply.chatbarFocused = false ; show.reply.userInteracted = true
                }
            }
            replyForm.onsubmit = ui.addListeners.replySection.submitHandler

            // Add chatbar autosizer
            const chatTextarea = app.div.querySelector(`#${app.slug}-chatbar`),
                { paddingTop, paddingBottom } = getComputedStyle(chatTextarea),
                vOffset = parseInt(paddingTop) + parseInt(paddingBottom)
            let prevLength = chatTextarea.value.length
            ui.addListeners.replySection.chatbarAutoSizer = () => {
                const newLength = chatTextarea.value.length
                if (newLength < prevLength) { // if deleting txt
                    chatTextarea.style.height = 'auto' // ...auto-fit height
                    if (parseInt(getComputedStyle(chatTextarea).height) < ( // if down to one line
                        /amazon|brave/.test(app.slug) ? 55 : 35 )
                    ) chatTextarea.style.height = '19px' // ...reset to original height
                }
                const unpaddedHeight = chatTextarea.scrollHeight - vOffset
                chatTextarea.style.height = `${{
                    amazongpt: chatTextarea.scrollHeight > 60 ? ( chatTextarea.scrollHeight +2 ) : 46,
                    bravegpt: chatTextarea.scrollHeight > 60 ? ( chatTextarea.scrollHeight +2 ) : 43,
                    duckduckgpt: chatTextarea.scrollHeight - vOffset,
                    googlegpt: unpaddedHeight > 29 ? unpaddedHeight : 16
                }[app.slug]}px`
                prevLength = newLength
            }
            chatTextarea.oninput = ui.addListeners.replySection.chatbarAutoSizer

            // Add button listeners
            this.btns.chatbar()
        }
    },

    getScheme() {
        return document.documentElement?.classList?.contains('dark') // from Brave Search pref
            || document.documentElement?.className?.includes('dark') // from DDG pref
            || document.querySelector('meta[name="color-scheme"]')?.content?.includes('dark') // from Google pref
            || window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    },

    visibilizeOverflow() { // used by BraveGPT for boundless hover fx // requires app
        let appAncestor = app.parentDiv
        while (appAncestor) {
            if (getComputedStyle(appAncestor).overflow != 'visible') appAncestor.style.overflow = 'visible'
            appAncestor = appAncestor.parentElement
        }
    }
};
