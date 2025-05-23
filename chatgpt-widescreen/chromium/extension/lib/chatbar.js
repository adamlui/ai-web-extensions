// Requires components/<buttons|icons>.js + lib/<chatbar|dom>.js + <env|sites>

window.chatbar = {

    async get() { // requires lib/dom.js + <env|sites>
        const { site } = env, { [site]: { selectors }} = sites
        return site == 'chatgpt' ? document.querySelector('form[data-type=unified-composer] > div')
            : (await dom.get.loadedElem(selectors.input)).parentNode.parentNode
    },

    is: {
        async dark() { // requires lib/chatbar.js + env
            return env.site != 'chatgpt' ? undefined
                : getComputedStyle(await chatbar.get() || document.documentElement)
                    .backgroundColor == 'rgb(48, 48, 48)'
        },

        async tall() { return (await chatbar.get())?.getBoundingClientRect().height > 60 } // requires lib/chatbar.js
    },

    async reset() { // requires <env|sites>
        const chatbarDiv = await this.get() ; if (!chatbarDiv) return
        const { site } = env, { [site]: { selectors }} = sites
        if (site == 'chatgpt') { // restore chatbar inner width
            const inputArea = chatbarDiv.querySelector(selectors.input)
            if (inputArea) inputArea.style.width = inputArea.parentNode.style.width = 'initial'
        } else if (site == 'poe') // restore Attach File button icon + Poe Mic button position
            ['attachFile', 'mic'].forEach(btnType => {
                const btn = chatbarDiv.querySelector(selectors.btns[btnType]) ; if (!btn) return
                if (btnType == 'attachFile' && buttons.poe.attachFile.plusIcon)
                    btn.querySelector('svg').replaceWith(buttons.poe.attachFile.plusIcon.cloneNode(true))
                else /* Mic */ btn.style.marginRight = ''
            })
    },

    async tweak() { // requires components/<buttons|icons>.js + lib/dom.js + <env|sites>
        const chatbarDiv = await this.get() ; if (!chatbarDiv) return
        const { site } = env, { [site]: { selectors }} = sites
        if (site == 'chatgpt') { // update chatbar inner width
            const inputArea = chatbarDiv.querySelector(selectors.input) ; if (!inputArea) return
            if (chatgpt.canvasIsOpen()) inputArea.parentNode.style.width = '100%'
            else if (!await this.is.tall()) { // narrow it to not clash w/ buttons
                const widths = { chatbar: dom.get.computedWidth(chatbarDiv) },
                      visibleBtnTypes = [...buttons.get.types.visible(), 'end']
                visibleBtnTypes.forEach(type => widths[type] = (
                    dom.get.computedWidth(buttons[type] || chatbarDiv.querySelector(
                        `${selectors.btns.send}, ${selectors.btns.stop}, ${selectors.btns.voice}`))
                ))
                const totalBtnWidths = visibleBtnTypes.reduce((sum, btnType) => sum + widths[btnType], 0)
                inputArea.parentNode.style.width = `${ // expand to close gap w/ buttons
                    widths.chatbar - totalBtnWidths -40 }px`
                inputArea.style.width = '100%' // rid h-scrollbar
            }
        } else if (site == 'poe') { // replace Attach File btn icon + move Mic btn closer to Send
            const btnLoadTimeout = 5000 // ms
            dom.get.loadedElem(selectors.btns.attachFile, { timeout: btnLoadTimeout }).then(btn => {
                if (!btn) return
                const plusIcon = btn.querySelector('svg:has(> path[d^="M13 4.5a1"])')
                buttons.poe ||= { attachFile: { plusIcon }} // cache for this.reset()
                plusIcon?.replaceWith(icons.create({
                    key: 'paperclip',  style: 'height: 15px !important ; width: 15px !important' }))
            })
            dom.get.loadedElem(selectors.btns.mic, { timeout: btnLoadTimeout })
                .then(btn => { if (btn) btn.style.marginRight = '-7px' })
        }
    }
};
