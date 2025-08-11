// Requires <app|modals|log>

window.userscript = {
    updateCheck() { // requires <app|modals|log>
        log.caller = 'updateCheck()'
        log.debug(`currentVer = ${app.version}`)

        // Fetch latest meta
        log.debug('Fetching latest userscript metadata...')
        xhr({
            method: 'GET', url: `${app.urls.update.gm}?t=${Date.now()}`, headers: { 'Cache-Control': 'no-cache' },
            onload: resp => {
                log.debug('Success! Response received')

                // Compare versions, alert if update found
                log.debug('Comparing versions...')
                app.latestVer = /@version +(.*)/.exec(resp.responseText)?.[1]
                if (app.latestVer) for (let i = 0 ; i < 4 ; i++) { // loop thru subver's
                    const currentSubVer = parseInt(app.version.split('.')[i], 10) || 0,
                          latestSubVer = parseInt(app.latestVer.split('.')[i], 10) || 0
                    if (currentSubVer > latestSubVer) break // out of comparison since not outdated
                    else if (latestSubVer > currentSubVer) // if outdated
                        return modals.open('update', 'available')
                }

                // Alert to no update found, nav back to About
                modals.open('update', 'unavailable')
            }
        })
    }
};
