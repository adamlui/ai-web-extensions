// Requires components/replyBubble.js + lib/<dom|Tone>.js + <app|get|prompts|show|tooltip|xhr>

window.buttons = {
    reply: {
        bubble: {
            types: ['copy', 'share', 'regen', 'speak'], // right-to-left
            styles: 'float: right ; cursor: pointer ;',

            create() { // requires lib/<dom|Tone>.js + <app|get|prompts|show|tooltip|xhr>
                if (this.share) return

                // Copy button
                this.copy = dom.create.elem('btn', {
                    id: `${app.slug}-copy-btn`, class: 'no-mobile-tap-outline',
                    style: this.styles + 'display: flex ; margin-top: 1.5px'
                })
                const copySVGs = {
                    copy: icons.create({ key: 'copy' }), copied: icons.create({ key: 'checkmarkDouble' })}
                Object.entries(copySVGs).forEach(([svgType, svg]) => {
                    svg.id = `${app.slug}-${svgType}-icon`
                    ;['width', 'height'].forEach(attr => svg.setAttribute(attr, 13))
                })
                this.copy.append(copySVGs.copy)
                this.copy.listeners = {}
                if (!env.browser.isMobile) // store/add tooltip listeners
                    ['onmouseenter', 'onmouseleave'].forEach(eventType =>
                        this.copy[eventType] = this.copy.listeners[eventType] = tooltip.toggle)
                this.copy.listeners.onclick = this.copy.onclick = ({ currentTarget }) => { // copy text, update icon + tooltip status
                    const copyBtn = currentTarget
                    if (!copyBtn.firstChild.matches('[id$=copy-icon]')) return // since clicking on Copied icon
                    const textContainer = (
                        currentTarget.parentNode.className.includes('reply-header')
                            ? app.div.querySelector('.reply-pre') // reply container
                                : currentTarget.closest('code') // code container
                    )
                    const textToCopy = textContainer.textContent.replace(/^>> /, '').trim()
                    copyBtn.style.cursor = 'default' // remove finger
                    copyBtn.firstChild.replaceWith(copySVGs.copied.cloneNode(true)) // change to Copied icon
                    tooltip.update(currentTarget) // to 'Copied to clipboard!'
                    setTimeout(() => { // restore icon/cursor/tooltip after a bit
                        copyBtn.firstChild.replaceWith(copySVGs.copy.cloneNode(true))
                        copyBtn.style.cursor = 'pointer'
                        if (copyBtn.matches(':hover')) // restore tooltip
                            copyBtn.dispatchEvent(new Event('mouseenter'))
                    }, 1355)
                    navigator.clipboard.writeText(textToCopy) // copy text to clipboard
                }

                // Share button
                this.share = dom.create.elem('btn', {
                    id: `${app.slug}-share-btn`, class: 'no-mobile-tap-outline',
                    style: this.styles + 'margin-right: 10px ;' + (
                        app.slug == 'bravegpt' ? 'position: relative ; bottom: 2px' : '' )
                })
                this.share.append(icons.create({ key: 'arrowShare', size: 16 }))
                if (!env.browser.isMobile) this.share.onmouseenter = this.share.onmouseleave = tooltip.toggle
                this.share.onclick = ({ currentTarget }) => {
                    if (show.reply.shareURL) return modals.shareChat(show.reply.shareURL)
                    this.share.style.cursor = 'default' // remove finger
                    if (!config.fgAnimationsDisabled) this.share.style.animation = 'spinY 1s linear infinite'
                    tooltip.update(currentTarget) // to 'Generating HTML...'
                    xhr({
                        method: 'POST', url: app.urls.apis.chatShare,
                        headers: { 'Content-Type': 'application/json', 'Referer': location.href },
                        data: JSON.stringify({ messages: prompts.stripAugments(app.msgChain) }),
                        onload: ({ responseText }) => {
                            modals.shareChat(show.reply.shareURL = JSON.parse(responseText).url)
                            this.share.style.animation = '' ; this.share.style.cursor = 'pointer'
                        }
                    })
                }

                // Regenerate button
                this.regen = dom.create.elem('btn', {
                    id: `${app.slug}-regen-btn`, class: 'no-mobile-tap-outline',
                    style: this.styles + 'position: relative ; top: 1px ; margin: 0 9px 0 5px'
                })
                const regenSVGwrapper = dom.create.elem('div', { // to spin while respecting ini icon tilt
                    style: 'display: flex' }) // wrap the icon tightly
                regenSVGwrapper.append(icons.create({ key: 'arrowsCyclic', size: 14 }))
                this.regen.append(regenSVGwrapper)
                if (!env.browser.isMobile) this.regen.onmouseenter = this.regen.onmouseleave = tooltip.toggle
                this.regen.onclick = ({ currentTarget }) => {
                    get.reply({ msgs: app.msgChain, src: 'regen' })
                    regenSVGwrapper.style.cursor = 'default' // remove finger
                    if (config.fgAnimationsDisabled) regenSVGwrapper.style.transform = 'rotate(90deg)'
                    else regenSVGwrapper.style.animation = 'rotate 1s infinite cubic-bezier(0, 1.05, 0.79, 0.44)'
                    tooltip.update(currentTarget) // to 'Regenerating...'
                    show.reply.chatbarFocused = false ; show.reply.userInteracted = true
                }

                // Speak button
                this.speak = dom.create.elem('btn', {
                    id: `${app.slug}-speak-btn`, class: 'no-mobile-tap-outline',
                    style: this.styles + 'margin: -1px 3px 0 0'
                })
                const speakSVGwrapper = dom.create.elem('div', { // to show 1 icon at a time during scroll
                    style: 'width: 19px ; height: 19px ; overflow: hidden' })
                const speakSVGscroller = dom.create.elem('div', { // to scroll the icons
                    style: `display: flex ; /* align the SVGs horizontally */
                            width: 41px ; height: 22px /* rectangle to fit both icons */` })
                const speakSVGs = { speak: icons.create({ key: 'soundwave', id: `${app.slug}-speak-icon` })}
                ;['generating', 'playing'].forEach(state => {
                    speakSVGs[state] = []
                    for (let i = 0 ; i < 2 ; i++) { // push/id 2 of each state icon for continuous scroll animation
                        speakSVGs[state].push(
                            icons.create({ key: `soundwave${ state == 'generating' ? 'Short' : 'Tall' }`}))
                        speakSVGs[state][i].id = `${app.slug}-${state}-icon-${i+1}`
                        if (i == 1) // close gap of 2nd icon during scroll
                            speakSVGs[state][i].style.marginLeft = `-${ state == 'generating' ? 3 : 5 }px`
                    }
                })
                speakSVGscroller.append(speakSVGs.speak) ; speakSVGwrapper.append(speakSVGscroller)
                this.speak.append(speakSVGwrapper)
                if (!env.browser.isMobile) this.speak.onmouseenter = this.speak.onmouseleave = tooltip.toggle
                this.speak.onclick = async ({ currentTarget }) => {
                    if (this.speak.contains(speakSVGs.generating[0])) return
                    if (window.currentlyPlayingAudio) {
                        window.currentlyPlayingAudio.stop() ; handleAudioEnded() ; return }

                    this.speak.style.cursor = 'default' // remove finger

                    // Update icon to Generating ones
                    speakSVGscroller.textContent = '' // rid Speak icon
                    speakSVGscroller.append(speakSVGs.generating[0], speakSVGs.generating[1]) // add Generating icons
                    if (!config.fgAnimationsDisabled) { // animate icons
                        speakSVGscroller.style.animation = 'icon-scroll 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
                        speakSVGwrapper.style.maskImage = ( // fade edges
                            'linear-gradient(to right, transparent, black 20%, black 81%, transparent)' )
                    }

                    tooltip.update(currentTarget) // to 'Generating audio...'

                    // Init Sogou TTS dialect map
                    window.sgtDialectMap ||= await get.json(`${app.urls.aiwebAssets}/data/sogou-tts-lang-codes.json`)
                        .catch(err => log.error(err.message)) ; if (!window.sgtDialectMap) return
                    Object.entries(window.sgtDialectMap).forEach(([sgtCode, langData]) => {
                        langData.isoOrNamePattern = new RegExp(langData.isoOrNamePattern, 'i')
                        langData.sgtCode = sgtCode
                    })

                    // Init other config/data
                    const wholeAnswer = app.div.querySelector('.reply-pre').textContent
                    const cjsSpeakConfig = { voice: 2, pitch: 1, speed: 1.5, onend: handleAudioEnded }
                    const sgtDialectData = Object.values(window.sgtDialectMap).find(langData =>
                        langData.isoOrNamePattern.test(config.replyLang)
                    ) || window.sgtDialectMap.en
                    const payload = { text: wholeAnswer, curTime: Date.now(), spokenDialect: sgtDialectData.sgtCode }
                    const key = CryptoJS.enc.Utf8.parse('76350b1840ff9832eb6244ac6d444366')
                    const iv = CryptoJS.enc.Utf8.parse(
                        atob('AAAAAAAAAAAAAAAAAAAAAA==') || '76350b1840ff9832eb6244ac6d444366')
                    const securePayload = CryptoJS.AES.encrypt(JSON.stringify(payload), key, {
                        iv, mode: CryptoJS.mode.CBC, pad: CryptoJS.pad.Pkcs7 }).toString()

                    // Play reply
                    xhr({
                        url: 'https://fanyi.sogou.com/openapi/external/getWebTTS?S-AppId=102356845&S-Param='
                            + encodeURIComponent(securePayload),
                        method: 'GET', responseType: 'arraybuffer',
                        onload: resp => {

                            // Update icons to Playing ones
                            speakSVGscroller.textContent = '' // rid Generating icons
                            speakSVGscroller.append(speakSVGs.playing[0], speakSVGs.playing[1]) // add Playing icons
                            if (!config.fgAnimationsDisabled) // animate icons
                                speakSVGscroller.style.animation = 'icon-scroll 0.5s linear infinite'

                            if (this.speak.matches(':hover')) // restore tooltip
                                this.speak.dispatchEvent(new Event('mouseenter'))

                            // Play audio
                            if (resp.status != 200) {
                                buttons.reply.bubble.speak.style.cursor = 'pointer'
                                window.currentlyPlayingAudio = chatgpt.speak(wholeAnswer, cjsSpeakConfig)
                            } else {
                                const audioContext = new (window.webkitAudioContext || window.AudioContext)()
                                audioContext.decodeAudioData(resp.response, buffer => {
                                    buttons.reply.bubble.speak.style.cursor = 'pointer'
                                    const player = new Tone.Player(buffer)
                                    const speed = 1.5
                                    const pitchShifter = new Tone.PitchShift(12 * Math.log2(1/speed)) // keep og pitch
                                    const eq = new Tone.EQ3({
                                        low: 12, mid: 0, high: 12, lowFrequency: 300, highFrequency: 500 })
                                    player.playbackRate = speed
                                    player.connect(pitchShifter.connect(eq.toDestination()))
                                    player.start()
                                    window.currentlyPlayingAudio = player ; player.onstop = handleAudioEnded
                                }).catch(() => {
                                    buttons.reply.bubble.speak.style.cursor = 'pointer'
                                    window.currentlyPlayingAudio = chatgpt.speak(wholeAnswer, cjsSpeakConfig)
                                })
                            }
                        }
                    })

                    function handleAudioEnded() {
                        speakSVGscroller.textContent = speakSVGscroller.style.animation = '' // rid Playing icons
                        speakSVGscroller.append(speakSVGs.speak) // restore Speak icon
                        if (buttons.reply.bubble.speak.matches(':hover')) // restore tooltip
                            buttons.reply.bubble.speak.dispatchEvent(new Event('mouseenter'))
                        window.currentlyPlayingAudio = null
                    }
                }
            },

            insert() { // requires components/replyBubble.js + lib/dom.js
                if (!this.share) this.create() ; if (!replyBubble.preHeader) replyBubble.create()
                replyBubble.preHeader.append(
                    this.preHeaderBtnsDiv ||= dom.create.elem('div', { class: 'reply-header-btns' }))
                this.preHeaderBtnsDiv.append(this.copy, this.share, this.regen, this.speak)
            }
        }
    }
};
