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
              relatedQueries = app.div.querySelector(`.${app.slug}-related-queries`),
              offsets = { bravegpt: [304, 278], duckduckgpt: [245, 255], googlegpt: [328, 309] }
        const heights = {
            shorter: innerHeight - relatedQueries?.offsetHeight -( offsets[app.slug]?.[0] || 0 ),
            longer: innerHeight -( offsets[app.slug]?.[1] || 0 )
        }
        if (replyPre) replyPre.style.maxHeight = (
            config.stickySidebar ? (
                relatedQueries?.offsetHeight > 0 ? `${heights.shorter}px` : `${heights.longer}px` )
          : config.anchored ? `${ heights.longer -( config.expanded ? 115 : 365 )}px` : 'none'
        )
    }
};
