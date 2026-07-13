// Requires lib/dom.js + <app|env>

window.themes = {
    apply(theme) { // requires lib/dom.js
        if (!this.styleNode) document.head.append(this.styleNode = dom.create.style())
        this.styleNode.textContent = this.styles[theme]
    },

    selectors: { // requires app.slug
        btn: {
            get after() { return this.shared.split(',').map(sel => `${sel}::after`).join(', ') },
            get before() { return this.shared.split(',').map(sel => `${sel}::before`).join(', ') },
            get hover() { return this.shared.split(',').map(sel => `${sel}:hover`).join(', ') },
            get hoverAfter() { return this.hover.split(',').map(sel => `${sel}::after`).join(', ') },
            get hoverBefore() { return this.hover.split(',').map(sel => `${sel}::before`).join(', ') },
            get hoverSVG() { return this.hover.split(',').map(sel => `${sel} svg`).join(', ') },
            get modal() { return `body:has(#${app.slug}) .modal-buttons button` },
            get modalPrimary() { return `body:has(#${app.slug}) .primary-modal-btn` },
            get shared() { return `${this.modal},${this.standby}` },
            get span() { return this.shared.split(',').map(sel => `${sel} span`).join(', ') },
            get standby() { return `button.${app.slug}-standby-btn` },
            get svg() { return this.shared.split(',').map(sel => `${sel} svg`).join(', ') }
        }
    },

    styles: { // requres <app|env>
        get lines() { const { selectors } = themes ; return `

            /* General button styles */
            ${selectors.btn.shared} {
                --content-color: ${ env.ui.app.scheme == 'light' ? '0,0,0' : '255,255,255' };
                --side-line-fill: linear-gradient(rgb(var(--content-color)), rgb(var(--content-color))) ;
                --skew: skew(-13deg) ; --counter-skew: skew(13deg) ; --btn-svg-zoom: scale(1.2) ;
                --btn-transition: 0.1s ease all ;
                position: relative ; border-width: 1px ; cursor: crosshair ;
                border: 1px solid rgb(var(--content-color)) ;
                background: /* side lines */
                    var(--side-line-fill) left / 2px 50% no-repeat,
                    var(--side-line-fill) right / 2px 50% no-repeat ;
                background-position-y: 81% ;
                background-color: #ffffff00 ; /* clear bg */
                color: rgba(var(--content-color), ${ env.ui.app.scheme == 'light' ? 0.85 : 1 }) ;
                font-size: 0.8em ; font-family: "Roboto", sans-serif ; text-transform: uppercase }
            ${selectors.btn.svg} {
                stroke: rgba(var(--content-color), ${ env.ui.app.scheme == 'light' ? 0.65 : 1 }) ;
                ${ app.config.fgAnimationsDisabled ? '' : `transition: var(--btn-transition) ;
                        -webkit-transition: var(--btn-transition) ; -moz-transition: var(--btn-transition) ;
                        -o-transition: var(--btn-transition) ; -ms-transition: var(--btn-transition)` }}
            ${selectors.btn.span} { font-weight: 600 ; display: inline-block } /* text */
            ${selectors.btn.before}, ${selectors.btn.after} { /* top/bottom lines */
                content: "" ; position: absolute ; background: rgb(var(--content-color)) ;
                ${ app.config.fgAnimationsDisabled ? '' : `transition: var(--btn-transition) ;
                        -webkit-transition: var(--btn-transition) ; -moz-transition: var(--btn-transition) ;
                        -o-transition: var(--btn-transition) ; -ms-transition: var(--btn-transition)` }}
            ${selectors.btn.before} { top: 0 ; left: 10% ; width: 65% ; height: 1px } /* top line */
            ${selectors.btn.after} { bottom: 0 ; right: 10% ; width: 80% ; height: 1px } /* bottom line */
            ${selectors.btn.hover} {
                color: rgb(var(--content-color)) ;
                background: /* extend side lines */
                    var(--side-line-fill) left / 2px 100% no-repeat,
                    var(--side-line-fill) right / 2px 100% no-repeat !important }
            ${selectors.btn.hoverBefore} { left: 0 ; width: 20px } /* top line on hover */
            ${selectors.btn.hoverAfter} { right: 0 ; width: 20px } /* bottom line on hover */
            ${selectors.btn.hoverSVG} { transform: var(--btn-svg-zoom) ; stroke: rgba(var(--content-color),1) }

            /* Modal styles */
            .${modals.class} { border-radius: 0 !important } /* square the corners to match the buttons */

            /* Modal button styles */
            ${selectors.btn.modal} {
                --modal-btn-y-offset: 2px ; --glow-color: #a0fdff ;
                --modal-btn-zoom: scale(1.075) ;
                --modal-btn-transition: transform 0.1s ease, background 0.2s ease, box-shadow 0.5s ease ;
                ${ app.config.fgAnimationsDisabled ? /* override chatgpt.js transitions */
                    `transition: none ;
                        -webkit-transition: none ; -moz-transition: none ;
                        -o-transition: none ; -ms-transition: none`
                    : `transition: var(--modal-btn-transition) ;
                        -webkit-transition: var(--modal-btn-transition) ;
                        -moz-transition: var(--modal-btn-transition) ;
                        -o-transition: var(--modal-btn-transition) ;
                        -ms-transition: var(--modal-btn-transition)` }}
            ${selectors.btn.modalPrimary} {
                ${ env.ui.app.scheme == 'dark' ? 'background-color: white !important ; color: black'
                                                : 'background-color: black !important ; color: white' }}
            ${selectors.btn.modal}:nth-child(odd) {
                transform: translateY(calc(-1 * var(--modal-btn-y-offset))) }
            ${selectors.btn.modal}:nth-child(even) {
                transform: translateY(var(--modal-btn-y-offset)) }
            ${selectors.btn.modal}:nth-child(odd):hover {
                transform: translateY(calc(-1 * var(--modal-btn-y-offset))) ${
                    env.browser.isMobile ? '' : 'var(--modal-btn-zoom)' }}
            ${selectors.btn.modal}:nth-child(even):hover {
                transform: translateY(var(--modal-btn-y-offset)) ${
                    env.browser.isMobile ? '' : 'var(--modal-btn-zoom)' }}
            ${selectors.btn.modal}:hover { /* add glow */
                background-color: var(--glow-color) !important ;
                box-shadow: 2px 1px 30px var(--glow-color) ;
                    -webkit-box-shadow: 2px 1px 30px var(--glow-color) ;
                    -moz-box-shadow: 2px 1px 30px var(--glow-color) }

            /* Standby button styles */
            ${ app.slug == 'amazongpt' ? '' : `
                ${selectors.btn.standby} {
                    --standby-btn-transition: transform 0.18s ease, background 0.2s ease ;
                    font-size: ${ app.slug == 'bravegpt' ? 10
                                : app.slug == 'duckduckgpt' ? 11.5
                                : /* googlegpt */ 11 }px ;
                    width: 80% ; height: ${ app.slug == 'bravegpt' ? 43 : 51 }px ;
                    margin-bottom: ${ app.slug == 'bravegpt' ? 13 : 16 }px }
                ${selectors.btn.standby}:nth-child(odd) { margin-right: 20% ; margin-left: 15px }
                ${selectors.btn.standby}:nth-child(even) { margin-left: 20% ; margin-bottom: 19px }
                ${selectors.btn.standby}:hover {
                    border : 1px rgba(var(--content-color), ${
                        env.ui.app.scheme == 'dark' ? '1) solid' : '0.6) dotted' }}`}`
        }
    }
};
