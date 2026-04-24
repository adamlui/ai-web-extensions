<a id="top"></a>

<div align="right">
    <h6>
        <picture>
            <source type="image/svg+xml" media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@d11d2ee/assets/images/icons/earth/white/icon32.svg">
            <img height=14 src="https://cdn.jsdelivr.net/gh/adamlui/ai-web-extensions@d11d2ee/assets/images/icons/earth/black/icon32.svg">
        </picture>
        &nbsp;日本語 |
        <a href="../../#readme">English</a> |
        <a href="../zh-cn/#readme">简体中文</a> |
        <a href="../hi/#readme">हिंदी</a>
    </h6>
</div>

# <picture><source type="image/png" media="(prefers-color-scheme: dark)" srcset="https://assets.chatgptautorefresh.com/images/icons/openai/white/icon32.png"><img width=23 src="https://assets.chatgptautorefresh.com/images/icons/openai/black/icon32.png"></picture> ChatGPT 自動更新 ↻

<a href="LICENSE.md">
    <img alt="[ライセンス: MIT]" src="https://img.shields.io/badge/%E3%83%A9%E3%82%A4%E3%82%BB%E3%83%B3%E3%82%B9-MIT-orange.svg?logo=internetarchive&logoColor=white&labelColor=464646&style=for-the-badge"></a>
<a href="https://github.com/adamlui/chatgpt-auto-refresh/blob/main/greasemonkey/chatgpt-auto-refresh.user.js">
    <img height=32 src="https://img.shields.io/github/size/adamlui/chatgpt-auto-refresh/greasemonkey/chatgpt-auto-refresh.user.js?label=%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%B5%E3%82%A4%E3%82%BA&logo=databricks&logoColor=white&labelColor=464646&color=ff69b4&style=for-the-badge"></a>
<a href="https://www.codefactor.io/repository/github/adamlui/chatgpt-auto-refresh">
    <img alt="[コードの品質]" src="https://img.shields.io/codefactor/grade/github/adamlui/chatgpt-auto-refresh?label=%E3%82%B3%E3%83%BC%E3%83%89%E3%81%AE%E5%93%81%E8%B3%AA&logo=codefactor&logoColor=white&labelColor=464646&color=b3ff68&style=for-the-badge"></a>
<a href="https://github.com/KudoAI/chatgpt.js?utm_source=chatgpt_auto_refresh&utm_content=github_shield">
    <img alt="[搭載 chatgpt.js]" src="https://img.shields.io/badge/%E6%90%AD%E8%BC%89-chatgpt.js-black?logo=gamejolt&logoColor=white&labelColor=464646&style=for-the-badge"></a>
<a href="https://sonarcloud.io/component_measures?metric=vulnerabilities&id=adamlui_chatgpt-auto-refresh">
    <img alt="[SonarCloud 脆弱性]" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fsonarcloud.io%2Fapi%2Fmeasures%2Fcomponent%3Fcomponent%3Dadamlui_chatgpt-auto-refresh%26metricKeys%3Dvulnerabilities&query=%24.component.measures.0.value&style=for-the-badge&logo=sonar&logoColor=white&labelColor=464646&label=%E8%84%86%E5%BC%B1%E6%80%A7&color=ffef00"></a>
<a href="https://github.com/awesome-scripts/awesome-userscripts#-chatgpt">
    <img alt="[言及されている Awesome]" src="https://img.shields.io/badge/%E8%A8%80%E5%8F%8A%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%82%8B-Awesome-cb48dc?logo=awesomelists&logoColor=white&labelColor=464646&style=for-the-badge"></a>
<a href="https://www.jsdelivr.com/package/gh/adamlui/chatgpt-auto-refresh?tab=stats">
    <img alt="[jsDelivr 統計]" src="https://img.shields.io/jsdelivr/gh/hm/adamlui/chatgpt-auto-refresh?style=for-the-badge&logo=jsdelivr&logoColor=white&label=jsDelivr%20%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88&labelColor=464646&color=2bbbd8"></a>

### 背景リクエストを介して ChatGPT セッションを最新の状態に保ち、ネットワーク エラーと Cloudflare チェックを排除します。

<a href="https://gm.chatgptautorefresh.com"><img height=45 alt="[このスクリプトをインストール]" src="https://assets.chatgptautorefresh.com/images/buttons/greasy-fork/install-button.svg"></a><a href="#-インストール"><img height=45 alt="[インストール方法]" title="インストール方法" src="https://assets.chatgptautorefresh.com/images/buttons/greasy-fork/help-button.svg"></a>
<br>
[ディスカッション](https://github.com/adamlui/chatgpt-auto-refresh/discussions) /
[サポートを受ける](https://support.chatgptautorefresh.com) /
[作者に連絡する](https://github.com/adamlui)

#

<div align="center">

![](https://user-images.githubusercontent.com/10906554/234756105-cf367acc-644a-49ee-8586-43c51d43e359.png)
<img width=355 src="https://assets.chatgptautorefresh.com/images/screenshots/mode-notification-on.png">

</div>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 💡 それが何をするか

- 会話から **10 分間の制限** を削除します (一時チャット モードの場合)

- 迷惑な **Cloudflare チェック** を取り除きます:

<div align="center">
    
![](https://assets.chatgptautorefresh.com/images/alerts/cloudflare-stand-by.png)

</div>

- 迷惑な **ChatGPT ネットワーク エラー** を取り除きます:

<div align="center">

![](https://assets.chatgptautorefresh.com/images/alerts/chatgpt-something-went-wrong.png)
![](https://assets.chatgptautorefresh.com/images/alerts/chatgpt-network-error.png)
<img width=333 src="https://assets.chatgptautorefresh.com/images/alerts/chatgpt-error-generating-response.png">
    
</div>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 💊 利点

&nbsp;&nbsp;&nbsp;🛡️ <strong>安全</strong> — 不要なアカウント関連のリクエストは送信されません

&nbsp;&nbsp;&nbsp;🪶 <strong>軽量</strong> — 使用されるコードは非常に少なく、必要なコード (セッションを維持) のみでメモリを節約します

&nbsp;&nbsp;&nbsp;⌛ <strong>時間の節約</strong> — 数分間の非アクティブ状態だけで、もうコピー/貼り付け/更新を繰り返す必要はありません!

&nbsp;&nbsp;&nbsp;🤯 <mark>***バックグラウンド タブでも動作します!***</mark>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 🗨️ ユーザーのフィードバック

<img width=535 src="https://assets.chatgptautorefresh.com/images/reviews/greasy-fork.png">

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 🚀 インストール

1. 次のようなユーザースクリプト マネージャーをインストールします：
    - ScriptCat 用 [Chrome](https://chromewebstore.google.com/detail/scriptcat/ndcooeababalnlpkfedmmbbbgkljhpjf), [Firefox](https://addons.mozilla.org/firefox/addon/scriptcat/) または [Edge](https://microsoftedge.microsoft.com/addons/detail/scriptcat/liilgpjgabokdklappibcjfablkpcekh)
    - Violentmonkey 用 [Firefox](https://addons.mozilla.org/firefox/addon/violentmonkey/) または [Edge](https://microsoftedge.microsoft.com/addons/detail/eeagobfjdenkkddmbclomhiblgggliao)
    - OrangeMonkey 用 [Chrome](https://chromewebstore.google.com/detail/orangemonkey/ekmeppjgajofkpiofbebgcbohbmfldaf)
    - または Tampermonkey 用 [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/) または [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
    - [Stay](https://apps.apple.com/app/stay-for-safari/id1591620171) または [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) 用 Safari

2. [ChatGPT 自動更新](https://gm.chatgptautorefresh.com) をインストールします (上記でインストールしたユーザースクリプト マネージャーに読み込まれます)

3. 通常どおり [chatgpt.com](https://chatgpt.com) にアクセスすると、セッションが定期的に自動更新されます!

<div align="center">
    
![](https://assets.chatgptautorefresh.com/images/screenshots/sidebar-toggle-on.png)

</div>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## ⚡ 依存関係

<h6>
<div align="center">

<a href="https://chatgpt.js.org/#/ja/">
    <picture>
        <source type="image/png" media="(prefers-color-scheme: dark)" srcset="https://assets.chatgptjs.org/images/logos/chatgpt.js/with-reflection/darkmode/logo-6014x1334.png?v=8169c77">
        <img width=546 src="https://assets.chatgptjs.org/images/logos/chatgpt.js/with-reflection/lightmode/logo-6014x1334.png?v=8169c77">
    </picture>
</a>
<br><br>

ChatGPT 自動更新 は強力な <a href="https://github.com/KudoAI/chatgpt.js">chatgpt.js</a> ライブラリのコードに依存しています
<br>© 2023–2026 <a href="https://www.kudoai.com">KudoAI</a> & MIT ライセンスの下での貢献者。

</div>
</h6>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 🌐 互換性

ChatGPT 自動更新 は、[ScriptCat](https://docs.scriptcat.org)、[Violentmonkey](https://violentmonkey.github.io)、[OrangeMonkey](https://chromewebstore.google.com/detail/orangemonkey/ekmeppjgajofkpiofbebgcbohbmfldaf)、[OrangeMonkey Pro](https://chromewebstore.google.com/detail/orangemonkey-pro/ggdmdoodcfamjggeigifpjfnnjfbland) または [Tampermonkey](https://www.tampermonkey.net) を使用して、次のブラウザと互換性があります:

- [Google Chrome](https://www.chrome.com)
- [Mozilla Firefox](https://www.firefox.com)
- [Microsoft Edge](https://www.microsoft.com/edge)
- [Opera](https://www.opera.com)
- [Brave](https://brave.com)
- [Vivaldi](https://vivaldi.com)
- [Waterfox](https://www.waterfox.net)
- [LibreWolf](https://librewolf.net)
- [Ghost](https://ghostbrowser.com)
- [QQ](https://browser.qq.com)

<br>

<a href="https://gm.chatgptautorefresh.com"><img height=45 alt="[このスクリプトをインストール]" src="https://assets.chatgptautorefresh.com/images/buttons/greasy-fork/install-button.svg"></a><a href="#-インストール"><img height=45 alt="[インストール方法]" title="インストール方法" src="https://assets.chatgptautorefresh.com/images/buttons/greasy-fork/help-button.svg"></a>
<br>
[ディスカッション](https://github.com/adamlui/chatgpt-auto-refresh/discussions) / 
[サポートを受ける](https://support.chatgptautorefresh.com) /
[その他の ChatGPT ユーザースクリプト](https://github.com/adamlui/userscripts/tree/master/chatgpt)

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

<!-- CONTRIBUTORS -->

## 🧠 貢献者

<a href="https://github.com/adamlui/chatgpt-auto-refresh/graphs/contributors">
    <img height=45 width="auto" src="https://contrib.rocks/image?repo=adamlui/chatgpt-auto-refresh" /></a>
<br><br>

どのような貢献も大歓迎です！

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

<div id="sponsors" align="center">
<br>

### サポート対象:

<div id="warp">
    <br><br>
    <a href="https://www.warp.dev/chatgptjs">
        <img width="600" src="https://assets.chatgptjs.org/images/banners/warp/banner-1500x500.png?v=476e837">
    </a>
    <h3><a href="https://www.warp.dev/chatgptjs">
        ターミナルで使える AI 開発ツール Warp</a></h3>
    <i><a href="https://www.warp.dev/chatgptjs">
        MacOS、Linux、Windows で利用可能</a></i>
</div>
<br><br>

</div>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 🤖 その他の ChatGPT アプリ

さらに多くの素晴らしい ChatGPT アプリについては、https://github.com/adamlui/ai-web-extensions をご覧ください。
<br><br>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 📜 関連スクリプト

### <img width=17 src="https://assets.chatgptwidescreen.com/images/icons/widescreen-robot-emoji/icon32.png"> [ChatGPT ワイドスクリーン モード](https://chatgptwidescreen.com) &nbsp;<img src="https://assets.chatgptwidescreen.com/images/badges/product-hunt/product-of-the-week-2-larger-centered-rounded-light.svg?v=02d9942" width="auto" height="24">
> ワイド/フル/トールスクリーン+スパンブロックモードで ChatGPT を強化します。poe.com でも動作します！
<br>[インストール](https://docs.chatgptwidescreen.com/#-greasemonkey-userscript) /
[Readme](https://docs.chatgptwidescreen.com/#readme) /
[ディスカッション](https://github.com/adamlui/chatgpt-widescreen/discussions)

### <picture><source type="image/png" media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/adamlui/chatgpt-auto-continue@7e2c739/assets/images/icons/app/white/icon32.png"><img height=16 src="https://cdn.jsdelivr.net/gh/adamlui/chatgpt-auto-continue@7e2c739/assets/images/icons/app/black/icon32.png"></picture> [ChatGPT 自動継続](https://chatgptautocontinue.com) &nbsp;<a href="https://github.com/awesome-scripts/awesome-userscripts#-chatgpt"><img src="https://assets.chatgptautocontinue.com/images/badges/awesome/badge.svg"></a>
> ChatGPT の応答が中断されたときに、自動的に回答の生成を継続します。<br>
[インストール](https://docs.chatgptautocontinue.com/#-インストール) /
[Readme](https://docs.chatgptautocontinue.com/#readme) /
[ディスカッション](https://github.com/adamlui/chatgpt-auto-continue/discussions)

### <img width=16 src="https://cdn.jsdelivr.net/gh/adamlui/chatgpt-infinity@c587927/assets/images/icons/infinity-symbol/circled/icon32.png"> [ChatGPT Infinity](https://chatgptinfinity.com) &nbsp;<a href="https://chrome.chatgptinfinity.com/?utm_source=github&utm_medium=referral&utm_content=featured-by-google-badge"><img height=20 src="https://assets.chatgptinfinity.com/images/badges/chrome-web-store/featured-by-google/badge500x91.png"></a>
> 全知の ChatGPT から無限の回答を生成します (どの言語でも!)
<br>[インストール](https://docs.chatgptinfinity.com/#-greasemonkey-userscript) / 
[Readme](https://docs.chatgptinfinity.com/#readme) / 
[ディスカッション](https://github.com/adamlui/chatgpt-infinity/discussions)

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">
  
<a href="https://github.com/adamlui/userscripts">**その他のユーザースクリプト**</a> /
<a href="#top">トップに戻る ↑</a>
