// Requires lib/dom.js + <app|env|config>

window.styles = {
    toast: {
        update() { // auto-appends to <head>
            if (!this.node?.isConnected) document.head.append(this.node ||= dom.create.style())
            this.node.textContent = `        
                ${ !config.toastMode ? '' : // flatten notifs into toast alerts
                    `div.${app.slug}.chatgpt-notif {
                        position: absolute ; left: 50% ; right: 21% !important ; text-align: center ;
                        ${ env.ui.scheme == 'dark' ? 'border: 2px solid white ;' : '' }
                        transform: translate(-50%, -50%) scale(0.6) !important }
                    div.${app.slug}.chatgpt-notif > div.notif-close-btn {
                        top: 18px ; right: 7px ; transform: scale(2) }` }`
        }
    }
};
