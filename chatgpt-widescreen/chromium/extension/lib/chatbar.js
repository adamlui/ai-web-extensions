// Requires lib/dom.js + components/<buttons|icons>.js + site: env.site + sites

window.chatbar = {
    import(deps) { Object.assign(this.imports = this.imports || {}, deps) },

    async get() {
        const site = this.imports.site
        return site == 'chatgpt' ? document.querySelector('form[data-type=unified-composer] > div')
             : (await dom.get.loadedElem(this.imports.sites[site].selectors.input)).parentNode.parentNode
    },

    is: {
        async dark() {
            return chatbar.imports.site != 'chatgpt' ? undefined
                : getComputedStyle(await chatbar.get() || document.documentElement)
                    .backgroundColor == 'rgb(48, 48, 48)'
        },

        async tall() { return (await chatbar.get())?.getBoundingClientRect().height > 60 }
    },

    async reset() { // all tweaks for popup master toggle-off
        const site = this.imports.site
        const chatbarDiv = await this.get() ; if (!chatbarDiv) return
        const selectors = this.imports.sites[site].selectors
        if (site == 'chatgpt') { // restore chatbar inner width
            const inputArea = chatbarDiv.querySelector(selectors.input)
            if (inputArea) inputArea.style.width = inputArea.parentNode.style.width = 'initial'
        } else if (site == 'perplexity') { // restore left-align right buttons
            const leftAlignedBtns = chatbarDiv.querySelectorAll('[data-left-aligned]')
            if (leftAlignedBtns.length) {
                const ogBtnParents = [...chatbarDiv.querySelectorAll('[data-btn-moved]')].reverse()
                leftAlignedBtns.forEach((btn, idx) => {
                    ogBtnParents[idx].append(btn) ; ogBtnParents[idx].removeAttribute('data-btn-moved')
                    btn.style.margin = '' ; btn.removeAttribute('data-left-aligned') // reset margins/attr
                })
                const modeDiv = chatbarDiv.querySelector('button').closest('div')
                modeDiv.style.marginRight = modeDiv.parentNode.style.paddingRight = '' // reset gap x-hacks
            }
        } else if (site == 'poe') // restore Attach File button icon + Poe Mic button position
            ['attachFile', 'mic'].forEach(btnType => {
                const btn = chatbarDiv.querySelector(selectors.btns[btnType]) ; if (!btn) return
                if (btnType == 'attachFile')
                    btn.querySelector('svg').replaceWith(buttons.poe.attachFile.icon.cloneNode(true))
                else /* Mic */ btn.style.marginRight = ''
            })
    },

    stylize() {
        if (!this.styles) { this.styles = dom.create.style() ; document.head.append(this.styles) }
        this.styles.innerText = ({
            chatgpt: !config.widerChatbox &&
                `main form { max-width: ${this.nativeWidth}px !important ; margin: auto }`,
            poe: config.widerChatbox && config.widescreen &&
                '[class^=ChatPageMainFooter_footerInner] { width: 98% ; margin-right: 15px }'
        })[this.imports.site]
    },

    async tweak() { // update ChatGPT chatbar inner width or hack Perplexity/Poe buttons
        const site = this.imports.site
        const chatbarDiv = await this.get() ; if (!chatbarDiv) return
        const selectors = this.imports.sites[site].selectors
        if (site == 'chatgpt') { // update chatbar inner width
            const inputArea = chatbarDiv.querySelector(selectors.input) ; if (!inputArea) return
            if (chatgpt.canvasIsOpen()) inputArea.parentNode.style.width = '100%'
            else if (!await this.is.tall()) { // narrow it to not clash w/ buttons
                const widths = { chatbar: chatbarDiv.getBoundingClientRect().width }
                const visibleBtnTypes = [...buttons.get.types.visible(), 'end']
                visibleBtnTypes.forEach(type => widths[type] = buttons[type]?.getBoundingClientRect().width
                  || document.querySelector(`${selectors.btns.send}, ${selectors.btns.stop}, ${selectors.btns.voice}`)
                        ?.getBoundingClientRect().width || 0 )
                const totalBtnWidths = visibleBtnTypes.reduce((sum, btnType) => sum + widths[btnType], 0)
                inputArea.parentNode.style.width = `${ // expand to close gap w/ buttons
                    widths.chatbar - totalBtnWidths -43 }px`
                inputArea.style.width = '100%' // rid h-scrollbar
            }
        } else if (site == 'perplexity') { // left-align Attach File + Search src buttons
            const modeDiv = chatbarDiv.querySelector('button').closest('div') ; if (!modeDiv) return
            const rightBtns = {} ; ['attachFile', 'searchSrcs'].forEach(btnType =>
                rightBtns[btnType] = chatbarDiv.querySelector(selectors.btns[btnType]))
            Object.values(rightBtns).forEach(btn => { if (!btn) return
                btn.style.marginTop = '2px' // lower it
                btn.dataset.leftAligned = true ; btn.parentNode.dataset.btnMoved = true // for this.reset()
                modeDiv.after(btn) // move to right of selector
            })
            if (chatbarDiv.querySelector('[data-left-aligned]')) {
                modeDiv.style.marginRight = '-2px' // close gap vs. right buttons
                modeDiv.parentNode.style.paddingRight = '5px' // extend bg rightward
            }
        } else if (site == 'poe') { // replace Attach File btn icon + move Mic btn closer to Send
            const btnLoadTimeout = 5000
            dom.get.loadedElem(selectors.btns.attachFile, { timeout: btnLoadTimeout }).then(btn => {
                if (!btn) return
                buttons.poe = buttons.poe || { attachFile: { icon: btn.querySelector('svg') }} // cache for this.reset()
                btn.querySelector('svg').replaceWith(icons.create('paperclip', {
                    style: 'height: 15px !important ; width: 15px !important' }))
            })
            dom.get.loadedElem(selectors.btns.mic, { timeout: btnLoadTimeout })
                .then(btn => { if (btn) btn.style.marginRight = '-7px' })
        }
    }
};
