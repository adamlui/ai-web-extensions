// Requires components/buttons.js + lib/dom.js + <app|config>

window.replyBubble = {

    create() { // requires components/buttons.js + lib/dom.js
        if (this.bubbleDiv) return
        this.replyTip = dom.create.elem('span', { class: 'reply-tip' })
        this.bubbleDiv = dom.create.elem('div', { class: 'reply-bubble bubble-elem' })
        this.preHeader = dom.create.elem('div', { class: 'reply-header bubble-elem' })
        this.preHeader.append(dom.create.elem('span', { class: 'reply-header-txt no-user-select' }))
        buttons.reply.bubble.insert()
        this.replyPre = dom.create.elem('pre', { class: 'reply-pre bubble-elem' })
        this.bubbleDiv.append(this.preHeader, this.replyPre)
    },

    insert() { // requires app.div
        if (!this.bubbleDiv) this.create()
        app.div.append(this.replyTip, this.bubbleDiv) ; this.updateMaxHeight()
    },

    updateMaxHeight() { // requires <app|config>
        const replyPre = app.div.querySelector('.reply-pre'),
              relatedQueries = app.div.querySelector(`.${app.slug}-related-queries`)
        const heights = {
            shorter: innerHeight - relatedQueries?.offsetHeight -(
                app.slug == 'bravegpt' ? 304 : app.slug == 'duckduckgpt' ? 245 : /* googlegpt */ 328 ),
            longer: innerHeight -(
                app.slug == 'bravegpt' ? 278 : app.slug == 'duckduckgpt' ? 255 : /* googlegpt */ 309 )
        }
        if (replyPre) replyPre.style.maxHeight = (
            config.stickySidebar ? (
                relatedQueries?.offsetHeight > 0 ? `${heights.shorter}px` : `${heights.longer}px` )
            : config.anchored ? `${ heights.longer - ( config.expanded ? 115 : 365 ) }px` : 'none'
        )
    }
};
