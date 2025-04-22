// Requires lib/<chatgpt|dom>.js + components/<chatbar|tooltip>.js + app + env + sites + toggleMode + tweaksStyle

window.buttons = {
    import(deps) { Object.assign(this.imports = this.imports || {}, deps) },

    types: [ 'fullscreen', 'fullWindow', 'widescreen', 'newChat' ], // right-to-left
    get class() { return `${this.imports.app.slug}-btn` },

    state: {
        status: 'missing', // or 'inserting', 'inserted'
        hasFadedIn: false // to prevent fade-in on subsequent .insert()s till .remove()
    },

    svgElems: {
        fullscreen: {
            off: [
                dom.create.svgElem('path', { stroke: 'none', d: 'm10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z' }),
                dom.create.svgElem('path', { stroke: 'none', d: 'm20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z' }),
                dom.create.svgElem('path', { stroke: 'none', d: 'm24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z' }),
                dom.create.svgElem('path',
                    { stroke: 'none', d: 'M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z' }) ],
            on: [
                dom.create.svgElem('path', { stroke: 'none', d: 'm14,14-4,0 0,2 6,0 0,-6 -2,0 0,4 0,0 z' }),
                dom.create.svgElem('path', { stroke: 'none', d: 'm22,14 0,-4 -2,0 0,6 6,0 0,-2 -4,0 0,0 z' }),
                dom.create.svgElem('path', { stroke: 'none', d: 'm20,26 2,0 0,-4 4,0 0,-2 -6,0 0,6 0,0 z' }),
                dom.create.svgElem('path', { stroke: 'none', d: 'm10,22 4,0 0,4 2,0 0,-6 -6,0 0,2 0,0 z' }) ]
        },

        fullWin: [
            dom.create.svgElem('rect',
                { fill: 'none', x: '3', y: '3', width: '17', height: '17', rx: '2', ry: '2' }),
            dom.create.svgElem('line', { x1: '9', y1: '3', x2: '9', y2: '21' })
        ],

        newChat: [ dom.create.svgElem('path', { stroke: 'none', d: 'M22,13h-4v4h-2v-4h-4v-2h4V7h2v4h4V13z' }) ],

        widescreen: {
            off: [
                dom.create.svgElem('path', { stroke: 'none', 'fill-rule': 'evenodd',
                    d: 'm28,11 0,14 -20,0 0,-14 z m-18,2 16,0 0,10 -16,0 0,-10 z' }) ],
            on: [
                dom.create.svgElem('path', { stroke: 'none', 'fill-rule': 'evenodd',
                    d: 'm26,13 0,10 -16,0 0,-10 z m-14,2 12,0 0,6 -12,0 0,-6 z' }) ]
        }
    },

    animate() { // used in sync.configToUI() on Button Animations toggle-on
        const btnHoverStyles = new RegExp(`.${this.class}-btn:hover\\s*\\{([^}]*)\\}`, 'm')
            .exec(this.imports.tweaksStyle.innerText)?.[1].trim()
        this.types.slice().reverse().forEach((btnType, idx) => {
            const btn = this[btnType] ; if (!btn) return
            setTimeout(() => { // apply/remove fx
                btn.style.cssText += btnHoverStyles
                setTimeout(() => btn.style.cssText = btn.style.cssText.replace(btnHoverStyles, ''), 150)
            }, idx *75) // ...staggered @ 75ms interval
        })
    },

    stylize() {
        const site = this.imports.env.site
        this.styles = dom.create.style(`
            .${this.class} {
                cursor: pointer ; position: relative ;
                --transition: transform 0.15s ease, opacity 0.5s ease ; /* for tweaksStyle's :hover + .insert()'s fade-in */
                    -webkit-transition: var(--transition) ; -moz-transition: var(--transition) ;
                    -o-transition: var(--transition) ; -ms-transition: var(--transition) ;
                ${ /chatgpt|perplexity/.test(site) ? // remove overlay
                    'background-color: transparent ; border-color: transparent ;' : '' }
            }
            ${ this.imports.sites[site].selectors.sidebar ? // hide FW btn when window skinny on sites where sync req'd
                `@media (max-width: 768px) {
                    #fullWindow-btn { display: none }
                    #widescreen-btn { margin-right: ${ site == 'perplexity' ? 9 : 19 }px }}`
                : '' }`
        )
        document.head.append(this.styles)
    },

    async create() {
        if (!this.styles) this.stylize()
        const site = this.imports.env.site, hasTallChatbar = this.imports.env.ui.hasTallChatbar,
              btnSelectors = this.imports.sites[site].selectors.btns
        if (/chatgpt|perplexity/.test(site)) this.rightBtn = await this.get.rightBtn() // for rOffset + styles
        const validBtnTypes = this.get.types.valid()
        const spreadFactor = site == 'poe' ? 1.1 : site == 'perplexity' ? -7 : hasTallChatbar ? -16.5 : -8.85
        const rOffset = site == 'poe' ? -6.5 : site == 'perplexity' ? -4 : hasTallChatbar ? (
            this.rightBtn.getBoundingClientRect().width +2 ) *(
                document.querySelector(/\(([^()]+)\)$/.exec(btnSelectors.dictate)?.[1]) ? 2 : 1 ) -84 : -0.25

        validBtnTypes.forEach(async (btnType, idx) => {
            const btn = this[btnType] = dom.create.elem('div', { id: `${btnType}-btn`, class: this.class })

            // Position
            btn.style.right = `${ rOffset + idx * spreadFactor }px` // position left of prev button
            if (site == 'chatgpt' && hasTallChatbar) btn.style.bottom = '-0.5px'
            else btn.style.top = `${ site == 'chatgpt' ? -3.25
                                   : site == 'poe' ? ( btnType == 'newChat' ? 1 : 3 ) : 0 }px`

            if (/chatgpt|perplexity/.test(site)) // add site button classes
                btn.classList.add(...(this.rightBtn?.classList || []))

            // Add hover/click listeners
            btn.onmouseenter = btn.onmouseleave = tooltip.toggle
            btn.onclick = () => {
                if (btnType == 'newChat') {
                    document.querySelector(this.imports.sites[site].selectors.btns.newChat)?.click()
                    btn.style.cursor = 'default' ; btn.dispatchEvent(new Event('mouseleave')) // disable finger/tooltip
                    setTimeout(() => { // restore finger/tooltip after 1s
                        btn.style.cursor = 'pointer'
                        if (btn.matches(':hover')) btn.dispatchEvent(new Event('mouseenter'))
                    }, 1000)
                } else { // toggle mode
                    this.imports.toggleMode(btnType)
                    if (btnType == 'fullWindow' // disable right btn tooltips on Perplexity homepage to avoid v-flicker
                            && this.imports.env.site == 'perplexity' && location.pathname == '/') {
                        tooltip.div.style.opacity = 0;
                        ['fullWindow', 'fullscreen'].forEach(btnType => {
                            const btn = this[btnType]
                            btn.onmouseenter = btn.onmouseleave = null
                            setTimeout(() => btn.onmouseenter = btn.onmouseleave = tooltip.toggle, 300)
                        })
                    }
                }
                tooltip.update(btn)
            }
        })
    },

    get: {
        async rightBtn() {
            const btnSelectors = buttons.imports.sites[buttons.imports.env.site].selectors.btns
            return await dom.get.loadedElem(`${btnSelectors.send}, ${ btnSelectors.voice || btnSelectors.dictation }`)
        },

        types: {
            valid() { // used in buttons.<create|insert>()
                return buttons.types.filter(type =>
                    !(type == 'fullWindow' && !buttons.imports.sites[buttons.imports.env.site].hasSidebar)
                 && !(type == 'widescreen' && chatgpt.canvasIsOpen()))
            },

            visible() { // used in chatbar.tweak() for horizontal math
                return this.valid().filter(type => !(type == 'newChat' && config.ncbDisabled)) }
        }
    },

    async insert() {
        if (!config.btnsVisible || this.state.status == 'inserting' || this.fullscreen?.isConnected) return
        this.state.status = 'inserting' ; if (!this.fullscreen) await this.create()

        // Init elems
        const chatbarDiv = await chatbar.get() ; if (!chatbarDiv) return this.state.status = 'missing'
        const btnTypesToInsert = this.get.types.valid()
        const parentToInsertInto = (
            this.imports.env.site == 'chatgpt' ? (await this.get.rightBtn()).closest('[class*=bottom]') // right btn div
          : chatbarDiv.lastChild ) // parent of [Perplexity right btns or Poe Mic/Send btns]
        const elemToInsertBefore = parentToInsertInto[
            this.imports.env.site == 'chatgpt' ? 'lastChild' // right btn
          : 'firstChild'] // Perplexity Pro spam toggle or Poe Mic btn

        // Insert buttons
        btnTypesToInsert.slice().reverse().forEach((btnType, idx) => {
            const btn = this[btnType]
            this.update.svg(btnType) // update icon
            elemToInsertBefore.before(btn) // insert button
            if (!this.state.hasFadedIn) { // fade-in
                btn.style.opacity = 0 ; setTimeout(() => btn.style.opacity = 1, (idx +1) *30)
                if (idx == btnTypesToInsert.length -1) // final button scheduled for fade-in
                    this.state.hasFadedIn = true // ...so disable fade-in on subsequent .insert()s till .remove()
            }
        })
        setTimeout(() => chatbar.tweak(), 1) ; this.update.color()
        this.state.status = 'inserted'
    },

    async remove() {
        if (!await chatbar.get() || !this.fullscreen?.isConnected) return
        this.types.forEach(type => this[type]?.remove()) ; tooltip.div?.remove()
        this.state.status = 'missing' // ensure next .insert() doesn't return early
        this.state.hasFadedIn = false // ensure next .insert() fades in buttons
    },

    update: {
        async color() {
            buttons.color = (
                buttons.imports.env.site == 'chatgpt' ? (
                    await chatbar.is.dark() || buttons.imports.env.ui.scheme == 'dark' ? 'white' : '#202123'
                ) : buttons.imports.env.site == 'perplexity' ? (
                    buttons.imports.env.ui.scheme == 'dark' ?
                        'oklch(var(--dark-text-color-100)/var(--tw-text-opacity))'
                      : 'oklch(var(--text-color-100)/var(--tw-text-opacity))'
                ) : 'currentColor'
            )
            if (buttons.widescreen?.style.fill != buttons.color)
                buttons.types.forEach(type => {
                    if (buttons[type]) buttons[type].style.fill = buttons[type].style.stroke = buttons.color })
        },

        svg(mode, state = '') {
            if (!buttons.widescreen) buttons.create()

            // Pick appropriate button/elements
            const [btn, ONelems, OFFelems] = (
                mode == 'fullscreen' ? [
                    buttons.fullscreen, buttons.svgElems.fullscreen.on, buttons.svgElems.fullscreen.off]
              : mode == 'fullWindow' ? [buttons.fullWindow, buttons.svgElems.fullWin, buttons.svgElems.fullWin]
              : mode == 'widescreen' ? [
                    buttons.widescreen, buttons.svgElems.widescreen.on, buttons.svgElems.widescreen.off]
                                     : [buttons.newChat, buttons.svgElems.newChat, buttons.svgElems.newChat])
            if (!btn) return

            // Set SVG attributes
            const btnSVG = btn?.querySelector('svg') || dom.create.svgElem('svg')
            if (mode == 'fullWindow') { // stylize full-window button
                btnSVG.setAttribute('stroke-width', '2')
                const btnSize = buttons.imports.env.site == 'chatgpt' ? 17 : 18
                btnSVG.setAttribute('height', btnSize) ; btnSVG.setAttribute('width', btnSize)
            }
            btnSVG.setAttribute('viewBox', (
                mode == 'newChat' ? '11 6 ' : mode == 'fullWindow' ? '-2 -0.5 ' : '8 8 ' )
            + ( mode == 'newChat' ? '13 13' : mode == 'fullWindow' ? '24 24' : '20 20' )
            )
            btnSVG.style.pointerEvents = 'none' // prevent triggering tooltips twice
            btnSVG.style.height = btnSVG.style.width = ( // override button resizing
                buttons.imports.env.site == 'chatgpt' ? '1.3rem' : '18px' )

            // Update SVG elements
            btnSVG.textContent = ''
            const svgElems = config[mode] || state.toLowerCase() == 'on' ? ONelems : OFFelems
            svgElems.forEach(elem => btnSVG.append(elem))

            // Update SVG
            if (!btn.contains(btnSVG)) btn.append(btnSVG)
        }
    }
};
