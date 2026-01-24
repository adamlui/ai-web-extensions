// Requires lib/chatgpt.min.js

window.infinity = {

    async activate() {
        const activatePrompt = 'Generate a single random question'
            +( app.config.replyLanguage ? ( ' in ' + app.config.replyLanguage ) : '' )
            +( ' on ' + ( app.config.replyTopic == 'ALL' ? 'ALL topics' : 'the topic of ' + app.config.replyTopic ))
            + ' then answer it. Don\'t type anything else.'
        if (env.browser.isMobile && chatgpt.sidebar.isOn()) chatgpt.sidebar.hide()
        if (!new URL(location).pathname.startsWith('/g/')) // not on GPT page
            try { chatgpt.startNewChat() } catch (err) { return } // start new chat
        await new Promise(resolve => setTimeout(resolve, 500)) // sleep 500ms
        chatgpt.send(activatePrompt)
        await new Promise(resolve => setTimeout(resolve, 3000)) // sleep 3s
        if (!document.querySelector('[data-message-author-role]') // new chat reset due to OpenAI bug
            && app.config.infinityMode // ...and toggle still active
        ) chatgpt.send(activatePrompt) // ...so prompt again
        await chatgpt.isIdle()
        if (app.config.infinityMode && !infinity.isActive) // double-check in case de-activated before scheduled
            infinity.isActive = setTimeout(infinity.continue, parseInt(app.config.replyInterval, 10) * 1000)
    },

    async continue() {
        if (!app.config.autoScrollDisabled) try { chatgpt.scrollToBottom() } catch(err) {}
        chatgpt.send('Do it again.')
        await chatgpt.isIdle() // before starting delay till next iteration
        if (infinity.isActive) // replace timer
            infinity.isActive = setTimeout(infinity.continue, parseInt(app.config.replyInterval, 10) * 1000)
    },

    deactivate() {
        if (chatgpt.getStopBtn()) chatgpt.stop()
        clearTimeout(infinity.isActive) ; infinity.isActive = null
    },

    async restart(options = { target: 'new' }) {
        if (options.target == 'new') {
            infinity.deactivate() ; setTimeout(() => infinity.activate(), 750)
        } else {
            clearTimeout(infinity.isActive) ; infinity.isActive = null ; await chatgpt.isIdle()
            if (app.config.infinityMode && !infinity.isActive) // double-check in case de-activated before scheduled
                infinity.isActive = setTimeout(infinity.continue, parseInt(app.config.replyInterval, 10) * 1000)
        }
    }
};
