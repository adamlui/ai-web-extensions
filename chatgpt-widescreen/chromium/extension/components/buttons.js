// Requires lib/<chatgpt|dom>.js + components/<chatbar|tooltip>.js
//   + appName: app.name + env + sites + toggleMode + tweaksStyle

window.buttons = {
    import(deps) { Object.assign(this.imports = this.imports || {}, deps) },

    types: [ 'fullScreen', 'fullWindow', 'wideScreen', 'newChat' ], // right-to-left
    get class() { return `${this.imports.appName.replace(/ /g, '-').toLowerCase()}-btn` },

    state: {
        status: 'missing', // or 'inserting', 'inserted'
        hasFadedIn: false // to prevent fade-in on subsequent .insert()s till .remove()
    },

    svgElems: {
        fullScreen: {
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

        wideScreen: {
            off: [
                dom.create.svgElem('path', { stroke: 'none', 'fill-rule': 'evenodd',
                    d: 'm28,11 0,14 -20,0 0,-14 z m-18,2 16,0 0,10 -16,0 0,-10 z' }) ],
            on: [
                dom.create.svgElem('path', { stroke: 'none', 'fill-rule': 'evenodd',
                    d: 'm26,13 0,10 -16,0 0,-10 z m-14,2 12,0 0,6 -12,0 0,-6 z' }) ]
        }
    },

    animate() { // used in sync.configToUI() on Button Animations toggle-on
        const btnHoverStyles = new RegExp(`.${this.class}:hover\\s*\\{([^}]*)\\}`, 'm')
            .exec(this.imports.tweaksStyle.innerText)?.[1].trim()
        this.types.slice().reverse().forEach((btnType, idx) => {
            const btn = this[btnType] ; if (!btn) return
            setTimeout(() => { // apply/remove fx
                btn.style.cssText += btnHoverStyles
                setTimeout(() => btn.style.cssText = btn.style.cssText.replace(btnHoverStyles, ''), 150)
            }, idx *75) // ...staggered @ 75ms interval
        })
    },

    async create() {
        const site = this.imports.env.site, hasTallChatbar = this.imports.env.ui.hasTallChatbar
        if (/chatgpt|perplexity/.test(site)) this.rightBtn = await this.getRightBtn() // for rOffset + styles
        const validBtnTypes = this.getTypes.valid()
        const spreadFactor = site == 'poe' ? 1.1
                           : site == 'perplexity' ? -7
                           : hasTallChatbar ? ( 28 + ( this.imports.env.browser.isFF ? 2 : 0 ))
                           : -8.85
        const rOffset = site == 'poe' ? -6.5 : site == 'perplexity' ? -4
                      : hasTallChatbar ? ( this.rightBtn.getBoundingClientRect().width +6 ) : -0.25
        const transitionStyles = 'transform 0.15s ease, opacity 0.5s ease'

        validBtnTypes.forEach(async (btnType, idx) => {
            const btn = this[btnType] = dom.create.elem('div')
            btn.id = `${btnType}-btn` // for tooltip.toggle()
            btn.className = this.class // for update.style.tweaks()
            Object.assign(btn.style, {
                position: site == 'chatgpt' && hasTallChatbar ? 'absolute' : 'relative',
                cursor: 'pointer',
                right: `${ rOffset + idx * spreadFactor }px`, // position left of prev button
                transition: transitionStyles, // for tweaksStyle's :hover + .insert()'s fade-in
                    '-webkit-transition': transitionStyles, '-moz-transition': transitionStyles,
                    '-o-transition': transitionStyles, '-ms-transition': transitionStyles
            })
            if (site == 'chatgpt' && hasTallChatbar) btn.style.bottom = '-0.5px'
            else btn.style.top = `${ site == 'chatgpt' ? -3.25
                                   : site == 'poe' ? ( btnType == 'newChat' ? 1 : 3 ) : 0 }px`
            if (/chatgpt|perplexity/.test(site)) { // assign classes + tweak styles
                btn.classList.add(...(this.rightBtn?.classList || []))
                Object.assign(btn.style, { // remove dark mode overlay
                    backgroundColor: 'transparent', borderColor: 'transparent' })
            }

            // Add hover/click listeners
            btn.onmouseover = btn.onmouseout = tooltip.toggle
            btn.onclick = () => {
                if (btnType == 'newChat') {
                    document.querySelector(this.imports.sites[site].selectors.btns.newChat)?.click()
                    tooltip.div.style.opacity = 0
                } else { // toggle mode
                    this.imports.toggleMode(btnType)
                    if (btnType == 'fullWindow' // disable right btn tooltips on Perplexity homepage to avoid v-flicker
                            && this.imports.env.site == 'perplexity' && location.pathname == '/') {
                        tooltip.div.style.opacity = 0;
                        ['fullWindow', 'fullScreen'].forEach(btnType => {
                            const btn = this[btnType]
                            btn.onmouseover = btn.onmouseout = null
                            setTimeout(() => btn.onmouseover = btn.onmouseout = tooltip.toggle, 300)
                        })
                    }
                }
            }
        })
    },

    async getRightBtn() {
        const btnSelectors = this.imports.sites[this.imports.env.site].selectors.btns
        return await dom.get.loadedElem(`${btnSelectors.send}, ${btnSelectors.voice}`)
    },

    getTypes: {
        valid() { // used in buttons.create() + buttons.insert() + this.visible()
            return buttons.types.filter(type =>
                !(type == 'fullWindow' && !buttons.imports.sites[buttons.imports.env.site].hasSidebar)
             && !(type == 'wideScreen' && chatgpt.canvasIsOpen()))
        },

        visible() { // used in tooltip.update() + chatbar.tweak() for horizontal math
            return this.valid().filter(type => !(type == 'newChat' && config.ncbDisabled)) }
    },

    async insert() {
        if (this.state.status == 'inserting' || this.fullScreen?.isConnected) return
        this.state.status = 'inserting' ; if (!this.fullScreen) await this.create()

        // Init elems
        const chatbarDiv = await chatbar.get() ; if (!chatbarDiv) return this.state.status = 'missing'
        const btnTypesToInsert = this.getTypes.valid()
        const parentToInsertInto = (
            this.imports.env.site == 'chatgpt' ? (await this.getRightBtn()).closest('[class*=bottom]') // right btn div
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
        elemToInsertBefore.before(tooltip.div) // add tooltips
        setTimeout(() => chatbar.tweak(), 1) ; this.update.color()
        this.state.status = 'inserted'
    },

    async remove() {
        if (!await chatbar.get() || !this.fullScreen?.isConnected) return
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
            if (buttons.wideScreen?.style.fill != buttons.color)
                buttons.types.forEach(type => {
                    if (buttons[type]) buttons[type].style.fill = buttons[type].style.stroke = buttons.color })
        },

        svg(mode, state = '') {
            if (!buttons.wideScreen) buttons.create()

            // Pick appropriate button/elements
            const [btn, ONelems, OFFelems] = (
                mode == 'fullScreen' ? [
                    buttons.fullScreen, buttons.svgElems.fullScreen.on, buttons.svgElems.fullScreen.off]
              : mode == 'fullWindow' ? [buttons.fullWindow, buttons.svgElems.fullWin, buttons.svgElems.fullWin]
              : mode == 'wideScreen' ? [
                    buttons.wideScreen, buttons.svgElems.wideScreen.on, buttons.svgElems.wideScreen.off]
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
