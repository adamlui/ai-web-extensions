// Requires components/buttons.js + lib/dom.js + <app|update>

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

    insert() { // requires <app|update>
        if (!this.bubbleDiv) this.create()
        app.div.append(this.replyTip, this.bubbleDiv) ; update.replyPreMaxHeight()
    },

    updateMaxHeight() { // requires <app|config>
        const replyPre = app.div.querySelector('.reply-pre'),
              relatedQueries = app.div.querySelector(`.${app.slug}-related-queries`),
              shorterPreHeight = innerHeight - relatedQueries?.offsetHeight - 245,
              longerPreHeight = innerHeight - 255
        if (replyPre) replyPre.style.maxHeight = (
            config.stickySidebar ? (
                relatedQueries?.offsetHeight > 0 ? `${shorterPreHeight}px` : `${longerPreHeight}px` )
            : config.anchored ? `${ longerPreHeight - ( config.expanded ? 115 : 365 ) }px` : 'none'
        )
    }
};
