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
    }
};
