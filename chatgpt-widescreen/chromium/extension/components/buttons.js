// Requires components/tooltip.js + lib/<chatbar|chatgpt|dom|styles>.js + <app|config|env|sites> + toggleMode()

window.buttons = {

    types: [ 'fullscreen', 'fullWindow', 'widescreen', 'newChat' ], // right-to-left
    get class() { return `${app.slug}-btn` },
    get opacity() { return { active: 1, inactive: 1 }},

    state: {
        status: 'missing', // or 'inserting', 'inserted'
        hasFadedIn: false // to prevent fade-in on 2nd+ .insert()s till .remove()
    },

    svgElems: {
        fullscreen: {
            off: [
                dom.create.svgElem('path', { stroke: 'none', d: 'm10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z' }),
                dom.create.svgElem('path', { stroke: 'none', d: 'm20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z' }),
                dom.create.svgElem('path', { stroke: 'none', d: 'm24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z' }),
                dom.create.svgElem('path', { stroke: 'none', d: 'M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z' }) ],
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

    async animate() { // used in lib/sync.configToUI() on Button Animations toggle-on
        const staggerInt = 75 // ms
        const btnHoverStyles = new RegExp(`.${this.class}:hover\\s*\\{([^}]*)\\}`, 'm')
            .exec(await styles.tweaks.css)?.[1].trim()
        this.types.slice().reverse().forEach((btnType, idx) => {
            const btn = this[btnType] ; if (!btn) return
            setTimeout(() => { // apply/remove fx
                const ogBtnStyle = btn.style.cssText ; btn.style.cssText += btnHoverStyles
                setTimeout(() => btn.style.cssText = ogBtnStyle, 150)
            }, idx * staggerInt)
        })
    },

    async create() { // requires components/tooltip.js + lib/dom.js + <env|sites>
        if (!this.styles) this.stylize()
        const { site, ui: { hasTallChatbar }} = env, { [site]: { selectors }} = sites,
              isGuestTempChat = selectors.btns.login && location.search.includes('temporary-chat=true'),
              validBtnTypes = this.get.types.valid()
        if (site == 'chatgpt') this.rightBtn = await this.get.rightBtn() // for styles

        validBtnTypes.forEach(async btnType => {
            const btn = this[btnType] = dom.create.elem('div', { id: `${btnType}-btn`, class: this.class })

            // Position
            if (site == 'chatgpt' && hasTallChatbar) {
                btn.style.bottom = '-0.5px'
                if (isGuestTempChat && btnType == 'widescreen') btn.style.marginRight = '3px'
            } else btn.style.top = `${ site == 'chatgpt' ? 0 : /* poe */ 3.5 }px`
            btn.style.margin = `0 ${ site == 'chatgpt' ? -5 : /* poe */ 2 }px`

            if (site == 'chatgpt') // add site button classes
                btn.classList.add(...(this.rightBtn?.classList || []))

            // Add hover/click listeners
            btn.onmouseenter = btn.onmouseleave = tooltip.toggle
            btn.onclick = () => {
                if (btnType == 'newChat') {
                    document.querySelector(selectors.btns.newChat)?.click()
                    btn.style.cursor = 'default' ; btn.dispatchEvent(new Event('mouseleave')) // disable finger/tooltip
                    setTimeout(() => { // restore finger/tooltip after 1s
                        btn.style.cursor = 'pointer'
                        if (btn.matches(':hover')) btn.dispatchEvent(new Event('mouseenter'))
                    }, 1000)
                } else toggleMode(btnType)
                tooltip.update(btn)
            }
        })
    },

    get: {
        async rightBtn() { // requires lib/dom.js + <env|sites>
            const { [env.site]: { selectors }} = sites
            return await dom.get.loadedElem(
                `${selectors.btns.send}, ${ selectors.btns.voice || selectors.btns.dictation }`)
        },

        types: {
            valid() { // used in buttons.<create|insert>()
                return buttons.types.filter(type =>
                    !(type == 'fullWindow' && !sites[env.site].hasSidebar)
                 && !(type == 'widescreen' && chatgpt.canvasIsOpen()))
            },

            visible() { // used in chatbar.tweak() for horizontal math
                return this.valid().filter(type => !(type == 'newChat' && config.ncbDisabled)) }
        }
    },

    async insert() { // requires lib/chatbar.js + <config|env>
        if (!config.btnsVisible || this.state.status == 'inserting' || this.fullscreen?.isConnected) return
        this.state.status = 'inserting' ; if (!this.fullscreen) await this.create()

        // Init elems
        const { site } = env
        const chatbarDiv = await chatbar.get() ; if (!chatbarDiv) return this.state.status = 'missing'
        const parentToInsertInto = (
            site == 'chatgpt' ? (await this.get.rightBtn()).closest('div.flex')
                    /* poe */ : chatbarDiv.lastChild )
        parentToInsertInto.prepend( // wrap btns in flexbox for better control
            this.btnsDiv ||= dom.create.elem('div', {
                style: `display: flex ; align-items: center ; gap: 3px ; position: relative ; right: ${
                    site == 'chatgpt' && document.querySelector(sites[site].selectors.btns.login) ? 1 : -11 }px`
            })
        )

        // Insert buttons
        const btnTypesToInsert = this.get.types.valid()
        btnTypesToInsert.slice().reverse().forEach((btnType, idx) => {
            const btn = this[btnType]
            this.update.svg(btnType) // update icon
            this.btnsDiv.append(btn) // insert button
            if (!this.state.hasFadedIn) { // fade-in
                btn.style.opacity = 0 ; setTimeout(() => btn.style.opacity = this.opacity.inactive, (idx +1) *30)
                if (idx == btnTypesToInsert.length -1) // final button scheduled for fade-in
                    this.state.hasFadedIn = true // ...so disable fade-in on subsequent .insert()s till .remove()
            }
        })
        setTimeout(() => chatbar.tweak(), 1) ; this.update.color()

        this.state.status = 'inserted'
    },

    async remove() { // requires components/tooltip.js + lib/chatbar.js
        if ( !await chatbar.get() || !this.fullscreen?.isConnected ) return
        ['btnsDiv', ...this.types].forEach(type => this[type]?.remove()) ; tooltip.div?.remove()
        this.state.status = 'missing' // ensure next .insert() doesn't return early
        this.state.hasFadedIn = false // ensure next .insert() fades in buttons
    },

    async stylize() { // requires lib/<chatbar|dom>.js + <env|sites>
        const { site } = env, { [site]: { selectors }} = sites
        this.style ||= dom.create.style()
        if (!this.style.isConnected) document.head.append(this.style)
        this.style.textContent = `
            .${this.class} {
                cursor: pointer ; position: relative ;
              --transition: transform 0.15s ease, opacity 0.5s ease ; /* for tweaksStyle's :hover + .insert()'s fade-in */
                   -webkit-transition: var(--transition) ; -moz-transition: var(--transition) ;
                   -o-transition: var(--transition) ; -ms-transition: var(--transition) ;
                ${ site == 'chatgpt' ? // remove overlay
                    'background-color: transparent ; border-color: transparent ;' : '' }
            }
            .${this.class}:hover {
                opacity: ${this.opacity.active} !important ;
                ${ site == 'poe' || await chatbar.is.dark() ? ''
                    : 'fill: black !important ; stroke: black !important ;' }}
            #fullWindow-btn { margin-right: 1px }
            ${ selectors.sidebar ? // hide FW btn when window skinny on sites where sync req'd
                '@media (max-width: 768px) { #fullWindow-btn { display: none } #widescreen-btn { margin-right: 19px }}'
                    : '' }
            ${ site == 'chatgpt' ? `.${this.class} svg { height: 19.5px ; width: 19.5px }` : '' }`
    },

    update: {
        color() { // requires env
            buttons.color = env.site == 'chatgpt' ? 'var(--text-primary)' : /* poe */ 'currentColor'
            if (buttons.widescreen?.style.fill != buttons.color)
                buttons.types.forEach(type => { if (buttons[type])
                    buttons[type].style.fill = buttons[type].style.stroke = buttons.color })
        },

        svg(mode, state = '') { // requires env.site
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
                const btnSize = env.site == 'chatgpt' ? 17 : 18
                btnSVG.setAttribute('height', btnSize) ; btnSVG.setAttribute('width', btnSize)
            }
            btnSVG.setAttribute('viewBox', (
                mode == 'newChat' ? '11 6 ' : mode == 'fullWindow' ? '-2 -0.5 ' : '8 8 ' )
             +( mode == 'newChat' ? '13 13' : mode == 'fullWindow' ? '24 24' : '20 20' )
            )
            btnSVG.style.pointerEvents = 'none' // prevent triggering tooltips twice
            btnSVG.style.height = btnSVG.style.width = '18px' // override button resizing

            // Update SVG elements
            btnSVG.textContent = ''
            const svgElems = config[mode] || state.toLowerCase() == 'on' ? ONelems : OFFelems
            svgElems.forEach(elem => btnSVG.append(elem))

            // Update SVG
            if (!btn.contains(btnSVG)) btn.append(btnSVG)
        }
    }
};
