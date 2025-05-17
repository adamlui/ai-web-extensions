// Copyright © 2025 Adam Lui (https://github.com/adamlui) under the MIT license
// Source: https://github.com/adamlui/ai-web-extensions/blob/main/assets/js/lib/crypto-utils.js/src/crypto-utils.js
// Requires: CryptoJS (https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js)

window.cryptoUtils = {
    digestMessage(msg) { return CryptoJS.SHA256(msg).toString(CryptoJS.enc.Hex) },
    generateSignature({ time, msg, pkey }) { return this.digestMessage(`${time}:${msg}:${pkey}`) }
};
