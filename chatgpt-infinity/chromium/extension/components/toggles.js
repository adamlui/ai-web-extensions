// Requires app + env + notify + syncConfigToUI

window.toggles = {
    import(deps) { Object.assign(this.imports = this.imports || {}, deps) },

    getMsg(key) {
        return typeof GM_info != 'undefined' ?
            this.imports.app.msgs[key] // from toggles.import({ app }) in userscript
                : chrome.i18n.getMessage(key) // from ./_locales/*/messages.json
    },

    sidebar: {
        get class() { return `${toggles.imports.app.slug}-sidebar-toggle` },

        create() {

            // Init toggle elems
            this.div = document.createElement('div') ; this.div.className = this.class
            this.navicon = document.createElement('img')
            this.toggleLabel = document.createElement('label')
            this.toggleInput = document.createElement('input')
            this.switchSpan = document.createElement('span')
            this.knobSpan = document.createElement('span')

            // Assemble elems into parent div
            this.switchSpan.append(this.knobSpan)
            this.div.append(this.navicon, this.toggleInput, this.switchSpan, this.toggleLabel)

            // Stylize elems
            this.stylize() // create/append stylesheet
            if (toggles.imports.env.ui.firstLink) { // borrow/assign classes from sidebar elems
                const firstIcon = toggles.imports.env.ui.firstLink.querySelector('div:first-child'),
                      firstLabel = toggles.imports.env.ui.firstLink.querySelector('div:nth-child(2)')
                this.div.classList.add(
                    ...toggles.imports.env.ui.firstLink.classList, ...(firstLabel?.classList || []))
                this.div.querySelector('img')?.classList.add(...(firstIcon?.classList || []))
            }

            // Update scheme/state
            this.update.scheme() ; this.update.state()

            // Add hover/click listeners
            this.div.onmouseover = this.div.onmouseout = ({ type }) => // trigger OpenAI hover overlay
                this.div.style.setProperty('--item-background-color',
                    `var(--sidebar-surface-${ type == 'mouseover' ? 'secondary' : 'primary' })`)
            this.div.onclick = () => { // toggle Infinity mode
                settings.save('infinityMode', !this.toggleInput.checked)
                toggles.imports.syncConfigToUI({ updatedKey: 'infinityMode' })
                toggles.imports.notify(`${toggles.getMsg('menuLabel_infinityMode')}: ${
                    toggles.getMsg(`state_${ config.infinityMode ? 'on' : 'off' }`).toUpperCase()}`)
            }
        },

        stylize() {
            document.head.append(this.styles = dom.create.style(
                `:root { /* vars */
                    --switch-enabled-bg-color: #ad68ff ; --switch-disabled-bg-color: #ccc ;
                    --switch-enabled-box-shadow: 1px 2px 8px #d8a9ff ;
                    --switch-enabled-hover-box-shadow: 0 1px 10px #9b5ad1 ;
                    --knob-box-shadow: rgba(0,0,0,0.3) 0 1px 2px 0 ;
                    --knob-box-shadow-dark: rgba(0,0,0,0.3) 0 1px 2px 0, rgba(0,0,0,0.15) 0 3px 6px 2px }`

                // Element styles
              + `.${this.class} { /* parent div */
                    max-height: 37px ; margin: 2px 0 ; user-select: none ; cursor: pointer ;
                    opacity: 1 !important ; /* overcome OpenAI click-dim */
                    flex-grow: unset } /* overcome OpenAI .grow */
                .${this.class} > img { /* navicon */
                    width: 1.25rem ; height: 1.25rem ; margin-left: 2px ; margin-right: 4px }
                .${this.class} > input { display: none } /* hide checkbox */
                .${this.class} > span { /* switch span */
                    position: relative ; width: 30px ; height: 15px ; border-radius: 28px ;
                    background-color: var(--switch-disabled-bg-color) ;
                    bottom: ${ toggles.imports.env.ui.firstLink ? 0 : -0.15 }em ;
                    left: ${ toggles.imports.env.browser.isMobile ? 169
                           : toggles.imports.env.ui.firstLink ? 154 : 160 }px ;
                    transition: 0.4s ; -webkit-transition: 0.4s ; -moz-transition: 0.4s ;
                        -o-transition: 0.4s ; -ms-transition: 0.4s }
                .${this.class} > span.enabled { /* switch on */
                    background-color: var(--switch-enabled-bg-color) ;
                    box-shadow: var(--switch-enabled-box-shadow) ;
                        -webkit-box-shadow: var(--switch-enabled-box-shadow) ;
                        -moz-box-shadow: var(--switch-enabled-box-shadow) ;
                    transition: 0.15s ; -webkit-transition: 0.15s ; -moz-transition: 0.15s ;
                        -o-transition: 0.15s ; -ms-transition: 0.15s }
                .${this.class}:hover > span.enabled { /* switch on when hover on parent div */
                    box-shadow: var(--switch-enabled-hover-box-shadow) ;
                        -webkit-box-shadow: var(--switch-enabled-hover-box-shadow) ;
                        -moz-box-shadow: var(--switch-enabled-hover-box-shadow) }
                .${this.class} > span.disabled { /* switch off */
                    background-color: var(--switch-disabled-bg-color) ; box-shadow: none }
                .${this.class} > span > span { /* knob span */
                    position: absolute ; width: 12px ; height: 12px ; content: "" ; border-radius: 28px ;
                    background-color: white ; left: 3px ; bottom: 1.25px ;
                    box-shadow: var(--knob-box-shadow) ;
                        -webkit-box-shadow: var(--knob-box-shadow) ; -moz-box-shadow: var(--knob-box-shadow) ;
                    transition: 0.4s ; -webkit-transition: 0.4s ; -moz-transition: 0.4s ;
                        -o-transition: 0.4s ; -ms-transition: 0.4s }
                .${this.class} > label { /* toggle label */
                    cursor: pointer ; overflow: hidden ; text-overflow: ellipsis ;
                    width: ${ toggles.imports.env.browser.isMobile ? 201 : 148 }px ;
                    margin-left: -${ toggles.imports.env.ui.firstLink ? 41 : 23 }px ; /* left-shift to navicon */
                    ${ toggles.imports.env.ui.firstLink ? '' : 'font-size: 0.875rem ; font-weight: 600' }}`

                // Dark scheme mods
              + `.${this.class}.dark > span.enabled { /* switch on */
                    background-color: var(--switch-enabled-bg-color) ;
                    box-shadow: var(--switch-enabled-hover-box-shadow) ; /* use hover style instead */
                        -webkit-box-shadow: var(--switch-enabled-hover-box-shadow) ;
                        -moz-box-shadow: var(--switch-enabled-hover-box-shadow) }
                .${this.class}.dark:hover > span.enabled { /* switch on when hover on parent div */
                    box-shadow: var(--switch-enabled-box-shadow) ; /* use regular style instead */
                        -webkit-box-shadow: var(--switch-enabled-box-shadow) ;
                        -moz-box-shadow: var(--switch-enabled-box-shadow) }
                .${this.class}.dark > span > span { /* knob span */
                    box-shadow: var(--knob-box-shadow-dark) ; /* make 3D-er */*
                        -webkit-box-shadow: var(--knob-box-shadow-dark) ;
                        -moz-box-shadow: var(--knob-box-shadow-dark) }`
            ))
        },

        insert() {
            if (this.status?.startsWith('insert') || document.querySelector(`.${this.class}`)) return
            const sidebar = document.querySelectorAll('nav')[+toggles.imports.env.browser.isMobile]
            if (!sidebar) return
            this.status = 'inserting' ; if (!this.div) this.create()
            sidebar.children[1].before(this.div) ; this.status = 'inserted'
        },

        update: {

            navicon({ preload = false } = {}) {
                const baseURL = `${toggles.imports.app.urls.assetHost}/images/icons/infinity-symbol`,
                      schemeMap = { light: 'black', dark: 'white' },
                      fileName = 'icon32.png'
                if (preload)
                    Object.keys(schemeMap).forEach(scheme =>
                        new Image().src = `${baseURL}/${schemeMap[scheme]}/${fileName}`)
                else toggles.sidebar.navicon.src = `${baseURL}/${schemeMap[toggles.imports.env.ui.scheme]}/${fileName}`
            },

            scheme() { // to match UI scheme
                toggles.sidebar.div.classList.remove('dark', 'light')
                toggles.sidebar.div.classList.add(toggles.imports.env.ui.scheme)
                toggles.sidebar.update.navicon()
            },

            state() {
                if (!toggles.sidebar.div) return // since toggle never created = sidebar missing
                toggles.sidebar.div.style.display = config.toggleHidden || config.extensionDisabled ? 'none' : 'flex'
                toggles.sidebar.toggleInput.checked = config.infinityMode
                toggles.sidebar.toggleLabel.innerText = `${toggles.getMsg('menuLabel_infinityMode')} `
                    + toggles.getMsg(`state_${ toggles.sidebar.toggleInput.checked ? 'enabled' : 'disabled' }`)
                requestAnimationFrame(() => {
                    toggles.sidebar.switchSpan.className = toggles.sidebar.toggleInput.checked ? 'enabled' : 'disabled'
                    toggles.sidebar.knobSpan.style.transform = `translateX(${
                        toggles.sidebar.toggleInput.checked ? 13 : 0 }px)`
                }) // to trigger 1st transition fx
            }
        }
    }
};
