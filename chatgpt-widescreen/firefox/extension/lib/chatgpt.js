// This library is a condensed version of chatgpt.js v3.8.0
// © 2023–2025 KudoAI & contributors under the MIT license.
// Source: https://github.com/KudoAI/chatgpt.js
// User guide: https://chatgptjs.org/userguide
// Latest minified release: https://cdn.jsdelivr.net/npm/@kudoai/chatgpt.js/chatgpt.min.js

// Init feedback props
localStorage.alertQueue = JSON.stringify([])
localStorage.notifyProps = JSON.stringify({ queue: { topRight: [], bottomRight: [], bottomLeft: [], topLeft: [] }})

// Define chatgpt API
const chatgpt = {

    selectors: {
        btns: {
            continue: 'button:has(svg[class*=rotate] > path[d^="M4.47189"])',
            createImage: 'button[data-testid="composer-create-image"]',
            deepResearch: 'button[data-testid="composer-deep-research"]',
            login: 'button[data-testid*=login]',
            newChat: 'a[href="/"]:has(svg),' // Pencil button (when logged in)
                   + 'button:has([d^="M3.06957"])', // Cycle Arrows button (in temp chat logged out)
            regen: 'button[data-testid*=regenerate],' // oval button in place of chatbar on errors
                    // 'Try Again' entry of model selector below msg
                 + 'div[role=menuitem] div:has(svg):has(path[d^="M3.06957"])',
            scroll: 'button:has(> svg > path[d^="M12 21C11.7348"])',
            search: 'button[data-testid="composer-button-search"]',
            reason: 'button[data-testid="composer-button-reason"]',
            send: 'button[data-testid=send-button]',
            sidebar: 'button[data-testid*=sidebar-button]',
            stop: 'button[data-testid=stop-button]',
            upload: 'button:has(> svg > path[d^="M12 3C12.5523"])',
            voice: 'button[data-testid*=composer-speech-button]'
        },
        chatDivs: {
            convo: 'div[class*=thread]', msg: 'div[data-message-author-role]',
            reply: 'div[data-message-author-role=assistant]'
        },
        chatHistory: 'div#history',
        errors: { toast: 'div.toast-root', txt: 'div[class*=text-error]' },
        footer: 'div#thread-bottom-container > div:last-of-type > div, span.text-sm.leading-none',
        header: 'div#page-header, main div.sticky:first-of-type',
        links: { newChat: 'nav a[href="/"]', sidebarItem: 'nav a' },
        sidebar: 'div[class*=sidebar]:has(nav > div#sidebar-header)',
        ssgManifest: 'script[src*="_ssgManifest.js"]'
    },

    alert(title, msg, btns, checkbox, width) {
    // [ title/msg = strings, btns = [named functions], checkbox = named function, width (px) = int ] = optional
    // * Spaces are inserted into button labels by parsing function names in camel/kebab/snake case

        // Init env context
        const scheme = chatgpt.isDarkMode() ? 'dark' : 'light',
              isMobile = chatgpt.browser.isMobile()

        // Define event handlers
        const handlers = {

            dismiss: {
                click(event) {
                    if (event.target == event.currentTarget || event.target.closest('[class*=-close-btn]'))
                        dismissAlert()
                },

                key(event) {
                    if (!/^(?: |Space|Enter|Return|Esc)/.test(event.key) || ![32, 13, 27].includes(event.keyCode))
                        return
                    for (const alertId of alertQueue) { // look to handle only if triggering alert is active
                        const alert = document.getElementById(alertId)
                        if (!alert || alert.style.display == 'none') return
                        if (event.key.startsWith('Esc') || event.keyCode == 27) dismissAlert() // and do nothing
                        else { // Space/Enter pressed
                            const mainBtn = alert.querySelector('.modal-buttons').lastChild // look for main button
                            if (mainBtn) { mainBtn.click() ; event.preventDefault() } // click if found
                        }
                    }
                }
            },

            drag: {
                mousedown(event) { // find modal, update styles, attach listeners, init XY offsets
                    if (event.button != 0) return // prevent non-left-click drag
                    if (getComputedStyle(event.target).cursor == 'pointer') return // prevent drag on interactive elems
                    chatgpt.draggingModal = event.currentTarget
                    event.preventDefault() // prevent sub-elems like icons being draggable
                    Object.assign(chatgpt.draggingModal.style, {
                        transition: '0.1s', willChange: 'transform', transform: 'scale(1.05)' })
                    document.body.style.cursor = 'grabbing'; // update cursor
                    [...chatgpt.draggingModal.children] // prevent hover FX if drag lags behind cursor
                        .forEach(child => child.style.pointerEvents = 'none');
                    ['mousemove', 'mouseup'].forEach(eventType => // add listeners
                        document.addEventListener(eventType, handlers.drag[eventType]))
                    const draggingModalRect = chatgpt.draggingModal.getBoundingClientRect()
                    handlers.drag.offsetX = event.clientX - draggingModalRect.left +21
                    handlers.drag.offsetY = event.clientY - draggingModalRect.top +12
                },

                mousemove(event) { // drag modal
                    if (!chatgpt.draggingModal) return
                    const newX = event.clientX - handlers.drag.offsetX,
                          newY = event.clientY - handlers.drag.offsetY
                    Object.assign(chatgpt.draggingModal.style, { left: `${newX}px`, top: `${newY}px` })
                },

                mouseup() { // restore styles/pointer events, remove listeners, reset chatgpt.draggingModal
                    Object.assign(chatgpt.draggingModal.style, { // restore styles
                        cursor: 'inherit', transition: 'inherit', willChange: 'auto', transform: 'scale(1)' })
                    document.body.style.cursor = ''; // restore cursor
                    [...chatgpt.draggingModal.children] // restore pointer events
                        .forEach(child => child.style.pointerEvents = '');
                    ['mousemove', 'mouseup'].forEach(eventType => // remove listeners
                        document.removeEventListener(eventType, handlers.drag[eventType]))
                    chatgpt.draggingModal = null
                }
            }
        }

        // Create modal parent/children elems
        const modalContainer = document.createElement('div')
        modalContainer.id = Math.floor(chatgpt.randomFloat() * 1000000) + Date.now()
        modalContainer.classList.add('chatgpt-modal') // add class to main div
        const modal = document.createElement('div'),
              modalTitle = document.createElement('h2'),
              modalMessage = document.createElement('p')

        // Create/append/update modal style (if missing or outdated)
        const thisUpdated = 1739338889852 // timestamp of last edit for this file's `modalStyle`
        let modalStyle = document.querySelector('#chatgpt-modal-style') // try to select existing style
        if (!modalStyle || parseInt(modalStyle.getAttribute('last-updated'), 10) < thisUpdated) { // if missing or outdated
            if (!modalStyle) { // outright missing, create/id/attr/append it first
                modalStyle = document.createElement('style') ; modalStyle.id = 'chatgpt-modal-style'
                modalStyle.setAttribute('last-updated', thisUpdated.toString())
                document.head.append(modalStyle)
            }
            modalStyle.textContent = ( // update prev/new style contents
                `.chatgpt-modal { /* vars */
                      --transition: opacity 0.65s cubic-bezier(.165,.84,.44,1), /* for fade-in */
                                    transform 0.55s cubic-bezier(.165,.84,.44,1) ; /* for move-in */
                      --bg-transition: background-color 0.25s ease ; /* for bg dim */
                      --btn-transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out ; /* for smooth zoom */
                      --btn-shadow: 2px 1px ${ scheme == 'dark' ? '54px #00cfff' : '30px #9cdaff' }}`

                + '.no-mobile-tap-outline { outline: none ; -webkit-tap-highlight-color: transparent }'

                // Background styles
                + `.chatgpt-modal {
                      pointer-events: auto ; /* override any disabling from site modals (like guest login spam) */
                      position: fixed ; top: 0 ; left: 0 ; width: 100% ; height: 100% ; /* expand to full view-port */
                      display: flex ; justify-content: center ; align-items: center ; z-index: 9999 ; /* align */
                      transition: var(--bg-transition) ; /* for bg dim */
                          -webkit-transition: var(--bg-transition) ; -moz-transition: var(--bg-transition) ;
                          -o-transition: var(--bg-transition) ; -ms-transition: var(--bg-transition) }`

                // Alert styles
                + `.chatgpt-modal > div {
                      position: absolute ; /* to be click-draggable */
                      opacity: 0 ; /* to fade-in */
                      font-family: -apple-system, system-ui, BlinkMacSystemFont, Segoe UI, Roboto,
                                   Oxygen-Sans, Ubuntu, Cantarell, Helvetica Neue, sans-serif ;
                      padding: 20px ; margin: 12px 23px ; font-size: 20px ;
                      color: ${ scheme == 'dark' ? 'white' : 'black' };
                      background-color: ${ scheme == 'dark' ? 'black' : 'white' };
                      border: 1px solid ${ scheme == 'dark' ? 'white' : '#b5b5b5' };
                      transform: translateX(-3px) translateY(7px) ; /* offset to move-in from */
                      max-width: 75vw ; word-wrap: break-word ; border-radius: 15px ;
                      --shadow: 0 30px 60px rgba(0,0,0,0.12) ; box-shadow: var(--shadow) ;
                          -webkit-box-shadow: var(--shadow) ; -moz-box-shadow: var(--shadow) ;
                      user-select: none ; -webkit-user-select: none ; -moz-user-select: none ;
                          -o-user-select: none ; -ms-user-select: none ;
                      transition: var(--transition) ; /* for fade-in + move-in */
                          -webkit-transition: var(--transition) ; -moz-transition: var(--transition) ;
                          -o-transition: var(--transition) ; -ms-transition: var(--transition) }
                  .chatgpt-modal h2 { font-weight: bold ; font-size: 24px ; margin-bottom: 9px }
                  .chatgpt-modal a { color: ${ scheme == 'dark' ? '#00cfff' : '#1e9ebb' }}
                  .chatgpt-modal a:hover { text-decoration: underline }
                  .chatgpt-modal.animated > div {
                      z-index: 13456 ; opacity: 0.98 ; transform: translateX(0) translateY(0) }
                  @keyframes alert-zoom-fade-out {
                      0% { opacity: 1 } 50% { opacity: 0.25 ; transform: scale(1.05) }
                      100% { opacity: 0 ; transform: scale(1.35) }}`

                // Button styles
                + `.modal-buttons {
                        display: flex ; justify-content: flex-end ; margin: 20px -5px -3px 0 ;
                        ${ isMobile ? 'flex-direction: column-reverse' : '' }}
                  .chatgpt-modal button {
                      font-size: 14px ; text-transform: uppercase ;
                      margin-left: ${ isMobile ? 0 : 10 }px ; padding: ${ isMobile ? 15 : 8 }px 18px ;
                      ${ isMobile ? 'margin-top: 5px ; margin-bottom: 3px ;' : '' }
                      border-radius: 0 ; border: 1px solid ${ scheme == 'dark' ? 'white' : 'black' };
                      transition: var(--btn-transition) ;
                          -webkit-transition: var(--btn-transition) ; -moz-transition: var(--btn-transition) ;
                          -o-transition: var(--btn-transition) ; -ms-transition: var(--btn-transition) }
                  .chatgpt-modal button:hover {
                      transform: scale(1.055) ; color: black ;
                      background-color: #${ scheme == 'dark' ? '00cfff' : '9cdaff' };
                      box-shadow: var(--btn-shadow) ;
                          -webkit-box-shadow: var(--btn-shadow) ; -moz-box-shadow: var(--btn-shadow) }
                  .primary-modal-btn {
                      border: 1px solid ${ scheme == 'dark' ? 'white' : 'black' };
                      background: ${ scheme == 'dark' ? 'white' : 'black' };
                      color: ${ scheme == 'dark' ? 'black' : 'white' }}
                  .modal-close-btn {
                      cursor: pointer ; width: 29px ; height: 29px ; border-radius: 17px ;
                      float: right ; position: relative ; right: -6px ; top: -5px }
                  .modal-close-btn svg { margin: 10px } /* center SVG for hover underlay */
                  .modal-close-btn:hover { background-color: #f2f2f2${ scheme == 'dark' ? '00' : '' }}`

                // Checkbox styles
                + `.chatgpt-modal .checkbox-group { margin: 5px 0 -8px 5px }
                  .chatgpt-modal input[type=checkbox] {
                      cursor: pointer ; transform: scale(0.7) ; margin-right: 5px ;
                      border: 1px solid ${ scheme == 'dark' ? 'white' : 'black' }}
                  .chatgpt-modal input[type=checkbox]:checked {
                      background-color: black ; position: inherit ;
                      border: 1px solid ${ scheme == 'dark' ? 'white' : 'black' }}
                  .chatgpt-modal input[type=checkbox]:focus {
                      outline: none ; box-shadow: none ; -webkit-box-shadow: none ; -moz-box-shadow: none }
                  .chatgpt-modal .checkbox-group label {
                      cursor: pointer ; font-size: 14px ; color: ${ scheme == 'dark' ? '#e1e1e1' : '#1e1e1e' }}`
            )
        }

        // Insert text into elems
        modalTitle.textContent = title || '' ; modalMessage.textContent = msg || '' ; chatgpt.renderHTML(modalMessage)

        // Create/append buttons (if provided) to buttons div
        const modalButtons = document.createElement('div')
        modalButtons.classList.add('modal-buttons', 'no-mobile-tap-outline')
        if (btns) { // are supplied
            if (!Array.isArray(btns)) btns = [btns] // convert single button to array if necessary
            btns.forEach((buttonFn) => { // create title-cased labels + attach listeners
                const button = document.createElement('button')
                button.textContent = buttonFn.name
                    .replace(/[_-]\w/g, match => match.slice(1).toUpperCase()) // convert snake/kebab to camel case
                    .replace(/([A-Z])/g, ' $1') // insert spaces
                    .replace(/^\w/, firstChar => firstChar.toUpperCase()) // capitalize first letter
                button.onclick = () => { dismissAlert() ; buttonFn() }
                modalButtons.insertBefore(button, modalButtons.firstChild)
            })
        }

        // Create/append OK/dismiss button to buttons div
        const dismissBtn = document.createElement('button')
        dismissBtn.textContent = btns ? 'Dismiss' : 'OK'
        modalButtons.insertBefore(dismissBtn, modalButtons.firstChild)

        // Highlight primary button
        modalButtons.lastChild.classList.add('primary-modal-btn')

        // Create/append checkbox (if provided) to checkbox group div
        const checkboxDiv = document.createElement('div')
        if (checkbox) { // is supplied
            checkboxDiv.classList.add('checkbox-group')
            const checkboxFn = checkbox, // assign the named function to checkboxFn
                  checkboxInput = document.createElement('input')
            checkboxInput.type = 'checkbox' ; checkboxInput.onchange = checkboxFn

            // Create/show label
            const checkboxLabel = document.createElement('label')
            checkboxLabel.onclick = () => { checkboxInput.checked = !checkboxInput.checked ; checkboxFn() }
            checkboxLabel.textContent = checkboxFn.name[0].toUpperCase() // capitalize first char
                + checkboxFn.name.slice(1) // format remaining chars
                    .replace(/([A-Z])/g, (match, letter) => ' ' + letter.toLowerCase()) // insert spaces, convert to lowercase
                    .replace(/\b(\w+)nt\b/gi, '$1n\'t') // insert apostrophe in 'nt' suffixes
                    .trim() // trim leading/trailing spaces

            checkboxDiv.append(checkboxInput) ; checkboxDiv.append(checkboxLabel)
        }

        // Create close button
        const closeBtn = document.createElement('div')
        closeBtn.title = 'Close' ; closeBtn.classList.add('modal-close-btn', 'no-mobile-tap-outline')
        const closeSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        closeSVG.setAttribute('height', '10px')
        closeSVG.setAttribute('viewBox', '0 0 14 14')
        closeSVG.setAttribute('fill', 'none')
        const closeSVGpath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        closeSVGpath.setAttribute('fill-rule', 'evenodd')
        closeSVGpath.setAttribute('clip-rule', 'evenodd')
        closeSVGpath.setAttribute('fill', chatgpt.isDarkMode() ? 'white' : 'black')
        closeSVGpath.setAttribute('d', 'M13.7071 1.70711C14.0976 1.31658 14.0976 0.683417 13.7071 0.292893C13.3166 -0.0976312 12.6834 -0.0976312 12.2929 0.292893L7 5.58579L1.70711 0.292893C1.31658 -0.0976312 0.683417 -0.0976312 0.292893 0.292893C-0.0976312 0.683417 -0.0976312 1.31658 0.292893 1.70711L5.58579 7L0.292893 12.2929C-0.0976312 12.6834 -0.0976312 13.3166 0.292893 13.7071C0.683417 14.0976 1.31658 14.0976 1.70711 13.7071L7 8.41421L12.2929 13.7071C12.6834 14.0976 13.3166 14.0976 13.7071 13.7071C14.0976 13.3166 14.0976 12.6834 13.7071 12.2929L8.41421 7L13.7071 1.70711Z')
        closeSVG.append(closeSVGpath) ; closeBtn.append(closeSVG)

        // Assemble/append div
        modal.append(closeBtn, modalTitle, modalMessage, checkboxDiv, modalButtons)
        modal.style.width = `${ width || 458 }px`
        modalContainer.append(modal) ; document.body.append(modalContainer)

        // Enqueue alert
        let alertQueue = JSON.parse(localStorage.alertQueue)
        alertQueue.push(modalContainer.id)
        localStorage.alertQueue = JSON.stringify(alertQueue)

        // Show alert if none active
        modalContainer.style.display = 'none'
        if (alertQueue.length == 1) {
            modalContainer.style.display = ''
            setTimeout(() => { // dim bg
                modal.parentNode.style.backgroundColor = `rgba(67,70,72,${ scheme == 'dark' ? 0.62 : 0.33 })`
                modal.parentNode.classList.add('animated')
            }, 100) // delay for transition fx
        }

        // Add listeners
        [modalContainer, closeBtn, closeSVG, dismissBtn].forEach(elem => elem.onclick = handlers.dismiss.click)
        document.addEventListener('keydown', handlers.dismiss.key)
        modal.onmousedown = handlers.drag.mousedown // enable click-dragging

        // Define alert dismisser
        const dismissAlert = () => {
            modalContainer.style.backgroundColor = 'transparent'
            modal.style.animation = 'alert-zoom-fade-out 0.165s ease-out'
            modal.onanimationend = () => {

                // Remove alert
                modalContainer.remove() // ...from DOM
                alertQueue = JSON.parse(localStorage.alertQueue)
                alertQueue.shift() // + memory
                localStorage.alertQueue = JSON.stringify(alertQueue) // + storage
                document.removeEventListener('keydown', handlers.dismiss.key) // prevent memory leaks

                // Check for pending alerts in queue
                if (alertQueue.length > 0) {
                    const nextAlert = document.getElementById(alertQueue[0])
                    setTimeout(() => {
                        nextAlert.style.display = ''
                        setTimeout(() => nextAlert.classList.add('animated'), 100)
                    }, 500)
                }
            }
        }

        return modalContainer.id // if assignment used
    },

    browser: {
        isFullScreen() {
            const userAgentStr = navigator.userAgent
            return userAgentStr.includes('Chrome') ? window.matchMedia('(display-mode: fullscreen)').matches
                 : userAgentStr.includes('Firefox') ? window.fullScreen
                 : /MSIE|rv:/.test(userAgentStr) ? document.msFullscreenElement : document.webkitIsFullScreen
        },

        isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) }
    },

    getNewChatButton() { return document.querySelector(chatgpt.selectors.btns.newChat) },
    getNewChatLink() { return document.querySelector(chatgpt.selectors.links.newChat) },
    getSendButton() { return document.querySelector(chatgpt.selectors.btns.send) },
    getStopButton() { return document.querySelector(chatgpt.selectors.btns.stop) },
    isDarkMode() { return document.documentElement.classList.contains('dark') },

    async isLoaded(timeout = null) {
        const timeoutPromise = timeout ? new Promise(resolve => setTimeout(() => resolve(false), timeout)) : null
        const isLoadedPromise = new Promise(resolve => {
            if (chatgpt.getNewChatBtn()) resolve(true)
            else new MutationObserver((_, obs) => {
                if (chatgpt.getNewChatBtn()) { obs.disconnect() ; resolve(true) }
            }).observe(document.documentElement, { childList: true, subtree: true })
        })
        return await ( timeoutPromise ? Promise.race([isLoadedPromise, timeoutPromise]) : isLoadedPromise )
    },

    isFullScreen() { return chatgpt.browser.isFullScreen() },
    isTyping() { return !!this.getStopButton() },

    notify(msg, position, notifDuration, shadow) {
        notifDuration = notifDuration ? +notifDuration : 1.75; // sec duration to maintain notification visibility
        const fadeDuration = 0.35, // sec duration of fade-out
              vpYoffset = 23, vpXoffset = 27 // px offset from viewport border

        // Create/append notification div
        const notificationDiv = document.createElement('div') // make div
        notificationDiv.id = Math.floor(chatgpt.randomFloat() * 1000000) + Date.now()
        notificationDiv.classList.add('chatgpt-notif')
        notificationDiv.textContent = msg // insert msg
        document.body.append(notificationDiv) // insert into DOM

        // Create/append close button
        const closeBtn = document.createElement('div')
        closeBtn.title = 'Dismiss'; closeBtn.classList.add('notif-close-btn', 'no-mobile-tap-outline')
        const closeSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        closeSVG.setAttribute('height', '8px')
        closeSVG.setAttribute('viewBox', '0 0 14 14')
        closeSVG.setAttribute('fill', 'none')
        closeSVG.style.height = closeSVG.style.width = '8px' // override SVG styles on non-OpenAI sites
        const closeSVGpath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        closeSVGpath.setAttribute('fill-rule', 'evenodd')
        closeSVGpath.setAttribute('clip-rule', 'evenodd')
        closeSVGpath.setAttribute('fill', 'white')
        closeSVGpath.setAttribute('d', 'M13.7071 1.70711C14.0976 1.31658 14.0976 0.683417 13.7071 0.292893C13.3166 -0.0976312 12.6834 -0.0976312 12.2929 0.292893L7 5.58579L1.70711 0.292893C1.31658 -0.0976312 0.683417 -0.0976312 0.292893 0.292893C-0.0976312 0.683417 -0.0976312 1.31658 0.292893 1.70711L5.58579 7L0.292893 12.2929C-0.0976312 12.6834 -0.0976312 13.3166 0.292893 13.7071C0.683417 14.0976 1.31658 14.0976 1.70711 13.7071L7 8.41421L12.2929 13.7071C12.6834 14.0976 13.3166 14.0976 13.7071 13.7071C14.0976 13.3166 14.0976 12.6834 13.7071 12.2929L8.41421 7L13.7071 1.70711Z');
        closeSVG.append(closeSVGpath) ; closeBtn.append(closeSVG) ; notificationDiv.append(closeBtn)

        // Determine div position/quadrant
        notificationDiv.isTop = !position || !/low|bottom/i.test(position)
        notificationDiv.isRight = !position || !/left/i.test(position)
        notificationDiv.quadrant = (notificationDiv.isTop ? 'top' : 'bottom')
                                 + (notificationDiv.isRight ? 'Right' : 'Left')

        // Create/append/update notification style (if missing or outdated)
        const thisUpdated = 1735767823541 // timestamp of last edit for this file's `notifStyle`
        let notifStyle = document.querySelector('#chatgpt-notif-style') // try to select existing style
        if (!notifStyle || parseInt(notifStyle.getAttribute('last-updated'), 10) < thisUpdated) { // if missing or outdated
            if (!notifStyle) { // outright missing, create/id/attr/append it first
                notifStyle = document.createElement('style') ; notifStyle.id = 'chatgpt-notif-style'
                notifStyle.setAttribute('last-updated', thisUpdated.toString())
                document.head.append(notifStyle)
            }
            notifStyle.textContent = ( // update prev/new style contents
                '.chatgpt-notif {'
                    + 'font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC",'
                        + '"Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", sans-serif ;'
                    + '.no-mobile-tap-outline { outline: none ; -webkit-tap-highlight-color: transparent }'
                    + 'background-color: black ; padding: 10px 13px 10px 18px ;' // bubble style
                        + 'border-radius: 11px ; border: 1px solid #f5f5f7 ;'
                    + 'opacity: 0 ; position: fixed ; z-index: 9999 ; font-size: 1.8rem ; color: white ;' // visibility
                    + 'user-select: none ; -webkit-user-select: none ; -moz-user-select: none ; -o-user-select: none ;'
                        + '-ms-user-select: none ;'
                    + `transform: translateX(${ // init off-screen for transition fx
                          !notificationDiv.isRight ? '-' : '' }35px) ;`
                    + ( shadow ? `--shadow: -8px 13px 25px 0 ${ /\b(?:shadow|on)\b/i.test(shadow) ? 'gray' : shadow };
                        box-shadow: var(--shadow) ; -webkit-box-shadow: var(--shadow) ; -moz-box-shadow: var(--shadow)`
                            : '' ) + '}'
                + `.notif-close-btn {
                      cursor: pointer ; float: right ; position: relative ; right: -4px ; margin-left: -3px ;`
                    + 'display: grid }' // top-align for non-OpenAI sites
                + '@keyframes notif-zoom-fade-out { 0% { opacity: 1 ; transform: scale(1) }' // transition out keyframes
                    + '15% { opacity: 0.35 ; transform: rotateX(-27deg) scale(1.05) }'
                    + '45% { opacity: 0.05 ; transform: rotateX(-81deg) }'
                    + '100% { opacity: 0 ; transform: rotateX(-180deg) scale(1.15) }}'
            )
        }

        // Enqueue notification
        let notifyProps = JSON.parse(localStorage.notifyProps)
        notifyProps.queue[notificationDiv.quadrant].push(notificationDiv.id)
        localStorage.notifyProps = JSON.stringify(notifyProps)

        // Position notification (defaults to top-right)
        notificationDiv.style.top = notificationDiv.isTop ? vpYoffset.toString() + 'px' : ''
        notificationDiv.style.bottom = !notificationDiv.isTop ? vpYoffset.toString() + 'px' : ''
        notificationDiv.style.right = notificationDiv.isRight ? vpXoffset.toString() + 'px' : ''
        notificationDiv.style.left = !notificationDiv.isRight ? vpXoffset.toString() + 'px' : ''

        // Reposition old notifications
        const thisQuadrantQueue = notifyProps.queue[notificationDiv.quadrant]
        if (thisQuadrantQueue.length > 1) {
            try { // to move old notifications
                for (const divId of thisQuadrantQueue.slice(0, -1)) { // exclude new div
                    const oldDiv = document.getElementById(divId),
                          offsetProp = oldDiv.style.top ? 'top' : 'bottom', // pick property to change
                          vOffset = +parseInt(oldDiv.style[offsetProp]) +5 + oldDiv.getBoundingClientRect().height
                    oldDiv.style[offsetProp] = `${ vOffset }px` // change prop
                }
            } catch (err) {}
        }

        // Show notification
        setTimeout(() => {
            notificationDiv.style.opacity = chatgpt.isDarkMode() ? 0.8 : 0.67 // show msg
            notificationDiv.style.transform = 'translateX(0)' // bring from off-screen
            notificationDiv.style.transition = 'transform 0.15s ease, opacity 0.15s ease'
        }, 10)

        // Init delay before hiding
        const hideDelay = fadeDuration > notifDuration ? 0 // don't delay if fade exceeds notification duration
                        : notifDuration - fadeDuration // otherwise delay for difference

        // Add notification dismissal to timeout schedule + button clicks
        const dismissNotif = () => {
            notificationDiv.style.animation = `notif-zoom-fade-out ${ fadeDuration }s ease-out`;
            clearTimeout(dismissFuncTID)
        }
        const dismissFuncTID = setTimeout(dismissNotif, hideDelay * 1000) // maintain visibility for `hideDelay` secs, then dismiss
        closeSVG.onclick = dismissNotif // add to close button clicks

        // Destroy notification
        notificationDiv.onanimationend = () => {
            notificationDiv.remove() // remove from DOM
            notifyProps = JSON.parse(localStorage.notifyProps)
            notifyProps.queue[notificationDiv.quadrant].shift() // + memory
            localStorage.notifyProps = JSON.stringify(notifyProps) // + storage
        }

        return notificationDiv
    },

    randomFloat() {
    // * Generates a random, cryptographically secure value between 0 (inclusive) & 1 (exclusive)
        const crypto = window.crypto || window.msCrypto
        return crypto?.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF || Math.random()
    },

    renderHTML(node) {
        const reTags = /<([a-z\d]+)\b([^>]*)>([\s\S]*?)<\/\1>/g,
              reAttrs = /(\S+)=['"]?((?:.(?!['"]?\s+\S+=|[>']))+.)['"]?/g, // eslint-disable-line
              nodeContent = node.childNodes

        // Preserve consecutive spaces + line breaks
        if (!chatgpt.renderHTML.preWrapSet) {
            node.style.whiteSpace = 'pre-wrap' ; chatgpt.renderHTML.preWrapSet = true
            setTimeout(() => chatgpt.renderHTML.preWrapSet = false, 100)
        }

        // Process child nodes
        for (const childNode of nodeContent) {

            // Process text node
            if (childNode.nodeType == Node.TEXT_NODE) {
                const text = childNode.nodeValue,
                      elems = [...text.matchAll(reTags)]

                // Process 1st element to render
                if (elems.length > 0) {
                    const elem = elems[0],
                          [tagContent, tagName, tagAttrs, tagText] = elem.slice(0, 4),
                          tagNode = document.createElement(tagName) ; tagNode.textContent = tagText

                    // Extract/set attributes
                    const attrs = [...tagAttrs.matchAll(reAttrs)]
                    attrs.forEach(attr => {
                        const name = attr[1], value = attr[2].replace(/['"]/g, '')
                        tagNode.setAttribute(name, value)
                    })

                    const renderedNode = chatgpt.renderHTML(tagNode) // render child elems of newly created node

                    // Insert newly rendered node
                    const beforeTextNode = document.createTextNode(text.substring(0, elem.index)),
                          afterTextNode = document.createTextNode(text.substring(elem.index + tagContent.length))

                    // Replace text node with processed nodes
                    node.replaceChild(beforeTextNode, childNode)
                    node.insertBefore(renderedNode, beforeTextNode.nextSibling)
                    node.insertBefore(afterTextNode, renderedNode.nextSibling)
                }

            // Process element nodes recursively
            } else if (childNode.nodeType == Node.ELEMENT_NODE) chatgpt.renderHTML(childNode)
        }

        return node // if assignment used
    },

    response: { stopGenerating() { try { chatgpt.getStopBtn().click() } catch (err) { console.error(err.message) }}},

    sidebar: {
        exists() { return !!chatgpt.getNewChatLink(); },
        hide() { this.isOn() ? this.toggle() : console.info('Sidebar already hidden!') },
        show() { this.isOff() ? this.toggle() : console.info('Sidebar already shown!') },
        isOff() { return !this.isOn() },

        isOn() {
            const sidebar = (() => {
                return chatgpt.sidebar.exists() ? document.querySelector(chatgpt.selectors.sidebar) : null })()
            if (!sidebar) { return console.error('Sidebar element not found!') || false }
            else return chatgpt.browser.isMobile() ?
                document.documentElement.style.overflow == 'hidden'
              : sidebar.style.visibility != 'hidden' && sidebar.style.width != '0px'
        },

        toggle() {
            const sidebarToggle = document.querySelector(chatgpt.selectors.btns.sidebar)
            if (!sidebarToggle) console.error('Sidebar toggle not found!')
            sidebarToggle.click()
        }
    },

    startNewChat() { try { chatgpt.getNewChatBtn().click() } catch (err) { console.error(err.message) }},
    stop() { chatgpt.response.stopGenerating(); }
}

// Create ALIAS functions
const cjsFuncAliases = [
    ['actAs', 'act', 'become', 'persona', 'premadePrompt', 'preMadePrompt', 'prePrompt', 'rolePlay', 'rp'],
    ['activateAutoRefresh', 'activateAutoRefresher', 'activateRefresher', 'activateSessionRefresher',
        'autoRefresh', 'autoRefresher', 'autoRefreshSession', 'refresher', 'sessionRefresher'],
    ['continue', 'continueChat', 'continueGenerating', 'continueResponse'],
    ['deactivateAutoRefresh', 'deactivateAutoRefresher', 'deactivateRefresher', 'deactivateSessionRefresher'],
    ['detectLanguage', 'getLanguage'],
    ['executeCode', 'codeExecute'],
    ['exists', 'isAvailable', 'isExistent', 'isPresent'],
    ['exportChat', 'chatExport', 'export'],
    ['getFooterDiv', 'getFooter'],
    ['getHeaderDiv', 'getHeader'],
    ['getLastPrompt', 'getLastQuery', 'getMyLastMessage', 'getMyLastQuery'],
    ['getContinueButton', 'getContinueGeneratingButton'],
    ['getScrollToBottomButton', 'getScrollButton'],
    ['getStopButton', 'getStopGeneratingButton'],
    ['getTextarea', 'getTextArea', 'getChatbar', 'getChatBar', 'getChatbox', 'getChatBox'],
    ['getVoiceButton', 'getVoiceModeButton'],
    ['isFullScreen', 'isFullscreen'],
    ['isTempChat', 'isIncognito', 'isIncognitoMode', 'isTempChatMode'],
    ['minify', 'codeMinify', 'minifyCode'],
    ['new', 'newChat', 'startNewChat'],
    ['obfuscate', 'codeObfuscate', 'obfuscateCode'],
    ['printAllFunctions', 'showAllFunctions'],
    ['refactor', 'codeRefactor', 'refactorCode'],
    ['refreshReply', 'regenerate', 'regenerateReply'],
    ['refreshSession', 'sessionRefresh'],
    ['renderHTML', 'renderHtml', 'renderLinks', 'renderTags'],
    ['reviewCode', 'codeReview'],
    ['send', 'sendChat', 'sendMessage'],
    ['sendInNewChat', 'sendNewChat'],
    ['sentiment', 'analyzeSentiment', 'sentimentAnalysis'],
    ['startNewChat', 'new', 'newChat'],
    ['stop', 'stopChat', 'stopGenerating', 'stopResponse'],
    ['suggest', 'suggestion', 'recommend'],
    ['toggleAutoRefresh', 'toggleAutoRefresher', 'toggleRefresher', 'toggleSessionRefresher'],
    ['toggleScheme', 'toggleMode'],
    ['translate', 'translation', 'translator'],
    ['unminify', 'unminifyCode', 'codeUnminify'],
    ['writeCode', 'codeWrite']
]
const cjsFuncSynonyms = [
    ['account', 'acct'],
    ['activate', 'turnOn'],
    ['analyze', 'check', 'evaluate', 'review'],
    ['ask', 'send', 'submit'],
    ['button', 'btn'],
    ['continue', 'resume'],
    ['chats', 'history'],
    ['chat', 'conversation', 'convo'],
    ['clear', 'delete', 'remove'],
    ['data', 'details'],
    ['deactivate', 'deActivate', 'turnOff'],
    ['execute', 'interpret', 'interpreter', 'run'],
    ['firefox', 'ff'],
    ['generating', 'generation'],
    ['login', 'logIn', 'logOn', 'signIn', 'signOn'],
    ['logout', 'logOut', 'logOff', 'signOff', 'signOut'],
    ['message', 'msg'],
    ['minify', 'uglify'],
    ['refactor', 'rewrite'],
    ['regenerate', 'regen'],
    ['render', 'parse'],
    ['reply', 'response'],
    ['sentiment', 'attitude', 'emotion', 'feeling', 'opinion', 'perception'],
    ['speak', 'play', 'say', 'speech', 'talk', 'tts'],
    ['summarize', 'tldr'],
    ['temp', 'temporary'],
    ['typing', 'generating'],
    ['unminify', 'beautify', 'prettify', 'prettyPrint']
];
(function createCJSaliasFuncs(obj = chatgpt) {
    for (const prop in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, prop)) continue // skip inherited props
        if (typeof obj[prop] == 'object') createCJSaliasFuncs(obj[prop]) // recurse thru objs to find deeper functions
    }
    let aliasFuncCreated
    do {
        aliasFuncCreated = false
        for (const prop in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, prop)) continue // skip inherited props
            if (typeof obj[prop] == 'function') {
                obj[prop.toLowerCase()] = obj[prop]  // create lowercase variant
                cjsFuncAliases.forEach(aliasArr => { // create alias function per alias to use
                    if (!aliasArr.includes(prop)) return
                    aliasArr.forEach(alias => { if (!obj[alias]) {
                        obj[alias] = obj[alias.toLowerCase()] = obj[prop] ; aliasFuncCreated = true }})
                })
                const funcWords = prop.split(/(?=[A-Z])/) // split function name into constituent words
                funcWords.forEach(funcWord => { // create alias function per function word per synonym
                    const synonymsToUse = cjsFuncSynonyms
                        .filter(arr => arr.includes(funcWord.toLowerCase())) // filter in relevant synonym sub-arrays
                        .flat().filter(synonym => synonym != funcWord.toLowerCase()) // filter out matching word
                    synonymsToUse.forEach(synonym => { // create alias function per synonym to use
                        const newFuncName = toCamelCase(funcWords.map(word => word == funcWord ? synonym : word))
                        if (!obj[newFuncName]) {
                            obj[newFuncName] = obj[newFuncName.toLowerCase()] = obj[prop] ; aliasFuncCreated = true }
                    })
                })
            }
        }
    } while (aliasFuncCreated) // loop over new functions to encompass all variations
})()

// Define HELPER functions

function toCamelCase(words) {
    return words.map((word, idx) => idx == 0 ? word : word[0].toUpperCase() + word.slice(1)).join('') }

// Prefix console logs w/ '🤖 chatgpt.js >> '
const consolePrefix = '🤖 chatgpt.js >> ', ogError = console.error, ogInfo = console.info
console.error = (...args) => {
    if (!args[0].startsWith(consolePrefix)) ogError(consolePrefix + args[0], ...args.slice(1))
    else ogError(...args)
}
console.info = (msg) => {
    if (!msg.startsWith(consolePrefix)) ogInfo(consolePrefix + msg);
    else ogInfo(msg)
}

// Export chatgpt object
try { window.chatgpt = chatgpt } catch (err) {} // for Greasemonkey
try { module.exports = chatgpt } catch (err) {} // for CommonJS
