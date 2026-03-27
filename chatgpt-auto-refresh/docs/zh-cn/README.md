<a id="top"></a>

<div align="right">
    <h6>
        <picture>
            <source type="image/svg+xml" media="(prefers-color-scheme: dark)" srcset="https://assets.chatgptautorefresh.com/images/icons/earth/white/icon32.svg">
            <img height=14 src="https://assets.chatgptautorefresh.com/images/icons/earth/black/icon32.svg">
        </picture>
        &nbsp;简体中文 |
        <a href="../../#readme">English</a> |
        <a href="../ja/#readme">日本語</a>
    </h6>
</div>

# <picture><source type="image/png" media="(prefers-color-scheme: dark)" srcset="https://assets.chatgptautorefresh.com/images/icons/openai/white/icon32.png"><img width=23 src="https://assets.chatgptautorefresh.com/images/icons/openai/black/icon32.png"></picture> ChatGPT 自动刷新 ↻

<a href="LICENSE.md">
    <img height=31 alt="[许可证: MIT]" src="https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF%E8%AF%81-MIT-orange.svg?logo=internetarchive&logoColor=white&labelColor=464646&style=for-the-badge"></a>
<a href="https://github.com/adamlui/chatgpt-auto-refresh/blob/main/greasemonkey/chatgpt-auto-refresh.user.js">
    <img height=32 src="https://img.shields.io/github/size/adamlui/chatgpt-auto-refresh/greasemonkey/chatgpt-auto-refresh.user.js?label=%E6%96%87%E4%BB%B6%E5%A4%A7%E5%B0%8F&logo=databricks&logoColor=white&labelColor=464646&color=ff69b4&style=for-the-badge"></a>
<a href="https://www.codefactor.io/repository/github/adamlui/chatgpt-auto-refresh">
    <img height=31 alt="[CodeFactor 等级]" src="https://img.shields.io/codefactor/grade/github/adamlui/chatgpt-auto-refresh?label=%E4%BB%A3%E7%A0%81%E8%B4%A8%E9%87%8F&logo=codefactor&logoColor=white&labelColor=464646&color=b3ff68&style=for-the-badge"></a>
<a href="https://github.com/KudoAI/chatgpt.js?utm_source=chatgpt_auto_refresh&utm_content=github_shield">
    <img height=31 alt="[由 chatgpt.js 提供支持]" src="https://img.shields.io/badge/%E4%BE%9B%E7%94%B5-chatgpt.js-black?logo=gamejolt&logoColor=white&labelColor=464646&style=for-the-badge"></a>
<a href="https://sonarcloud.io/component_measures?metric=vulnerabilities&id=adamlui_chatgpt-auto-refresh">
    <img height=31 alt="[SonarCloud 漏洞]" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fsonarcloud.io%2Fapi%2Fmeasures%2Fcomponent%3Fcomponent%3Dadamlui_chatgpt-auto-refresh%26metricKeys%3Dvulnerabilities&query=%24.component.measures.0.value&style=for-the-badge&logo=sonar&logoColor=white&labelColor=464646&label=%E6%BC%8F%E6%B4%9E&color=gold"></a>
<a href="https://github.com/awesome-scripts/awesome-userscripts#-chatgpt">
    <img height=31 alt="[提及于 Awesome]" src="https://img.shields.io/badge/%E6%8F%90%E5%8F%8A%E4%BA%8E-Awesome-cb48dc?logo=awesomelists&logoColor=white&labelColor=464646&style=for-the-badge"></a>
<a href="https://www.jsdelivr.com/package/gh/adamlui/chatgpt-auto-refresh?tab=stats">
    <img height=31 alt="[jsDelivr 统计数据]" src="https://img.shields.io/jsdelivr/gh/hm/adamlui/chatgpt-auto-refresh?style=for-the-badge&logo=jsdelivr&logoColor=white&label=jsDelivr%20%E8%AF%B7%E6%B1%82&labelColor=464646&color=2bbbd8"></a>

### 通过后台请求保持 ChatGPT 会话新鲜，以消除网络错误 + Cloudflare 检查。

<a href="https://gm.chatgptautorefresh.com"><img height=45 alt="[安装这个脚本]" src="https://assets.chatgptautorefresh.com/images/buttons/greasy-fork/zh-cn/install-button.svg"></a><a href="#-如何安装"><img height=45 alt="[如何安装]" title="如何安装" src="https://assets.chatgptautorefresh.com/images/buttons/greasy-fork/help-button.svg"></a>
<br>
[讨论](https://github.com/adamlui/chatgpt-auto-refresh/discussions) /
[获取支持](https://support.chatgptautorefresh.com) /
[联系作者](https://github.com/adamlui)

#

<div align="center">

![](https://assets.chatgptautorefresh.com/images/screenshots/zh-cn/tm-menu-toggle.png)
![](https://assets.chatgptautorefresh.com/images/screenshots/zh-cn/mode-notification-on.png)

</div>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 💡 它能做什么

- 取消对话 **10 分钟的时间限制**（临时聊天模式时）

- 摆脱烦人的 **Cloudflare 检查**:

<div align="center">
    
![](https://assets.chatgptautorefresh.com/images/alerts/cloudflare-stand-by.png)

</div>

- 摆脱烦人的 **ChatGPT 网络错误**:

<div align="center">

![](https://assets.chatgptautorefresh.com/images/alerts/chatgpt-something-went-wrong.png)
![](https://assets.chatgptautorefresh.com/images/alerts/chatgpt-network-error.png)
<img width=333 src="https://assets.chatgptautorefresh.com/images/alerts/chatgpt-error-generating-response.png">
    
</div>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 💊 好处

&nbsp;&nbsp;&nbsp;🛡️ <strong>安全的</strong> — 没有发送不必要的帐户相关请求

&nbsp;&nbsp;&nbsp;🪶 <strong>轻的</strong> — 使用的代码很少，只有必要的代码（保持会话活动）节省内存

&nbsp;&nbsp;&nbsp;⌛ <strong>省时间</strong> — 不再仅仅因为几分钟的不活动而不断复制/粘贴/刷新！

&nbsp;&nbsp;&nbsp;🤯 作品 <mark>***即使在背景选项卡中！***</mark>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 🗨️ 用户反馈

<img width=535 src="https://assets.chatgptautorefresh.com/images/reviews/greasy-fork.png">

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 🚀 如何安装

1. 安装用户脚本管理器，例如：
    - ScriptCat 为了 [Chrome](https://chromewebstore.google.com/detail/scriptcat/ndcooeababalnlpkfedmmbbbgkljhpjf), [Firefox](https://addons.mozilla.org/firefox/addon/scriptcat/) 或 [Edge](https://microsoftedge.microsoft.com/addons/detail/scriptcat/liilgpjgabokdklappibcjfablkpcekh)
    - Violentmonkey 为了 [Firefox](https://addons.mozilla.org/firefox/addon/violentmonkey/) 或 [Edge](https://microsoftedge.microsoft.com/addons/detail/eeagobfjdenkkddmbclomhiblgggliao)
    - OrangeMonkey 为了 [Chrome](https://chromewebstore.google.com/detail/orangemonkey/ekmeppjgajofkpiofbebgcbohbmfldaf)
    - Tampermonkey 为了 [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/) 或 [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
    - [Stay](https://apps.apple.com/app/stay-for-safari/id1591620171) 或 [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) 为了 Safari

2. 安装 [ChatGPT 自动刷新](https://gm.chatgptautorefresh.com) 用户脚本（将在上面安装的管理器中加载）

3. 正常访问 [chatgpt.com](https://chatgpt.com)，会话将定期自动刷新 (在后台)!

<div align="center">

![自动刷新 启用](https://assets.chatgptautorefresh.com/images/screenshots/zh-cn/sidebar-toggle-on.png)

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

</div>

## ⚡ 依赖关系

<h6>
<div align="center">

<a href="https://chatgpt.js.org/#/zh-cn/">
    <picture>
        <source type="image/png" media="(prefers-color-scheme: dark)" srcset="https://assets.chatgptjs.org/images/logos/chatgpt.js/with-reflection/darkmode/logo-6014x1334.png?v=8169c77">
        <img width=546 src="https://assets.chatgptjs.org/images/logos/chatgpt.js/with-reflection/lightmode/logo-6014x1334.png?v=8169c77">
    </picture>
</a>
<br><br>

ChatGPT 自動刷新 依賴於強大的 <a href="https://github.com/KudoAI/chatgpt.js">chatgpt.js</a> 庫 © 2023–2026 <a href="https://www.kudoai.com">KudoAI</a> 和 MIT 許可下的貢獻者。

</div>
</h6>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 🌐 兼容性

ChatGPT 自动刷新 与使用 [ScriptCat](https://docs.scriptcat.org)、[Violentmonkey](https://violentmonkey.github.io)、[OrangeMonkey](https://chromewebstore.google.com/detail/orangemonkey/ekmeppjgajofkpiofbebgcbohbmfldaf)、[OrangeMonkey Pro](https://chromewebstore.google.com/detail/orangemonkey-pro/ggdmdoodcfamjggeigifpjfnnjfbland) 或 [Tampermonkey](https://www.tampermonkey.net) 的以下浏览器兼容:

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

<a href="https://gm.chatgptautorefresh.com"><img height=45 alt="[安装这个脚本]" src="https://assets.chatgptautorefresh.com/images/buttons/greasy-fork/zh-cn/install-button.svg"></a><a href="#-如何安装"><img height=45 alt="[如何安装]" title="如何安装" src="https://assets.chatgptautorefresh.com/images/buttons/greasy-fork/help-button.svg"></a>
<br>
[讨论](https://github.com/adamlui/chatgpt-auto-refresh/discussions) / 
[获取支持](https://support.chatgptautorefresh.com) /
[更多 ChatGPT 用户脚本](https://github.com/adamlui/userscripts/tree/master/chatgpt)

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 🧠 贡献者

该项目的存在得益于以下贡献者的代码、测试、问题、翻译和想法：
<br><br>

<div align="center">

<a href="https://github.com/adamlui">
    <img width=50 title="@adamlui" src="https://avatars.githubusercontent.com/u/10906554?first-contrib=2023.03.23"></a>
<a href="https://github.com/Camouflager">
    <img width=50 title="@Camouflager" src="https://avatars.githubusercontent.com/u/26111796?first-contrib=2023.04.02"></a>
<a href="https://github.com/ArtificialTruth">
    <img width=50 title="@ArtificialTruth" src="https://avatars.githubusercontent.com/u/3297866?first-contrib=2023.04.04"></a>
<a href="https://github.com/Liumeng404">
    <img width=50 title="@Liumeng404" src="https://avatars.githubusercontent.com/u/25640306?first-contrib=2023.04.05"></a>
<a href="https://github.com/mzvast">
    <img width=50 title="@mzvast" src="https://avatars.githubusercontent.com/u/8097465?first-contrib=2023.04.08"></a>
<a href="https://github.com/halvabner">
    <img width=50 title="@halvabner" src="https://avatars.githubusercontent.com/u/130675714?first-contrib=2023.04.13"></a>
<a href="https://github.com/Cupcc">
    <img width=50 title="@Cupcc" src="https://avatars.githubusercontent.com/u/53716543?first-contrib=2023.04.15"></a>
<a href="https://github.com/gydx6">
    <img width=50 title="@gydx6" src="https://avatars.githubusercontent.com/u/45654564?first-contrib=2023.04.16"></a>
<a href="https://github.com/NoahXcl">
    <img width=50 title="@NoahXcl" src="https://avatars.githubusercontent.com/u/81360639?first-contrib=2023.04.16"></a>
<a href="https://github.com/selfboot">
    <img width=50 title="@selfboot" src="https://avatars.githubusercontent.com/u/2769831?first-contrib=2023.04.17"></a>
<a href="#">
    <img width=50 title="@maplepicker" src="https://avatars.githubusercontent.com/u/116735067?first-contrib=2023.04.18"></a>
<a href="https://github.com/Cloudkkk">
    <img width=50 title="@Cloudkkk" src="https://avatars.githubusercontent.com/u/58101940?first-contrib=2023.04.19"></a>
<a href="#">
    <img width=50 title="@chenzhihao1040728129" src="https://avatars.githubusercontent.com/u/49114216?first-contrib=2023.04.23"></a>
<a href="https://greasyfork.org/users/1041317-dlzrncsb">
    <picture>
        <source type="image/png" media="(prefers-color-scheme: dark)" srcset="https://assets.chatgptautorefresh.com/images/icons/web-stores/greasy-fork/white/icon50.png">
        <img width=50 src="https://assets.chatgptautorefresh.com/images/icons/web-stores/greasy-fork/black/icon50.png?first-contrib=2023.4.24-short-interval-complaint-leading-to-custom-interval-idea" title="dlzrncsb">
    </picture></a>
<a href="https://github.com/Zin6969">
    <img width=50 title="@Zin6969" src="https://avatars.githubusercontent.com/u/131989355?first-contrib=2023.04.27"></a>
<a href="https://github.com/nabilfreeman">
    <img width=50 title="@nabilfreeman" src="https://avatars.githubusercontent.com/u/2470659?first-contrib=2023.08.03-chat-reset-issue"></a>
<a href="https://github.com/h-h-h-h">
    <img width=50 title="@h-h-h-h" src="https://avatars.githubusercontent.com/u/13482553?first-contrib=2023.10.05-chat-reset-fix"></a>
<a href="https://github.com/xspeed1989">
    <img width=50 title="@xspeed1989" src="https://avatars.githubusercontent.com/u/5162926?first-contrib=2023.11.27-ui-change-report"></a>
<a href="#">
    <img width=50 title="@Chipsum" src="https://avatars.githubusercontent.com/u/37517008?first-contrib=2023.12.05-first-button-bug-report"></a>
<a href="https://github.com/Yash-Singh1">
    <img width=50 title="@Yash-Singh1" src="https://avatars.githubusercontent.com/u/53054099?first-contrib=2023.2.3-added-eslint-plugin-userscripts"></a>
<a href="https://github.com/sanchomuzax">
    <img width=50 title="@sanchomuzax" src="https://avatars.githubusercontent.com/u/2911588?first-contrib=2023.2.26-shortened-hungarian-menu-label"></a>
<a href="https://greasyfork.org/users/670188-hacker09">
    <picture>
        <source type="image/png" media="(prefers-color-scheme: dark)" srcset="https://assets.chatgptautorefresh.com/images/icons/web-stores/greasy-fork/white/icon50.png">
        <img width=50 src="https://assets.chatgptautorefresh.com/images/icons/web-stores/greasy-fork/black/icon50.png?first-contrib=2024.6.27-portuguese-translation-corrections" title="hacker09">
    </picture></a>
<a href="https://github.com/eltociear">
    <img width=50 title="@eltociear" src="https://avatars.githubusercontent.com/u/22633385?first-contrib=2023.07.17-add-ja-doc-md"></a>
<a href="https://github.com/ChinaGodMan">
    <img width=50 title="@ChinaGodMan" src="https://avatars.githubusercontent.com/u/96548841?first-contrib=2024.9.7-improved-chinese-msgs"></a>
<a href="https://github.com/9romise">
    <img width=50 title="@9romise" src="https://avatars.githubusercontent.com/u/38204901?first-contrib=2024.12.13-revealed-unneeded-semicolons"></a>
<a href="https://github.com/zkisaboss">
    <img width=50 title="@zkisaboss" src="https://avatars.githubusercontent.com/u/51681731?first-contrib=2025.7.5-suggested-scheme-aware-icons"></a>
<a href="https://github.com/bvolpato" target="_blank" rel="noopener">
    <img width=50 title="@bvolpato" src="https://images.weserv.nl/?url=https://avatars.githubusercontent.com/u/3207647?first-contrib=2026.3.27-created-lychee-workflow&h=47&w=47&mask=circle&maxage=7d"></a>
<a href="https://github.com/ImgBotApp">
    <img width=50 title="@ImgBotApp" src="https://avatars.githubusercontent.com/u/31427850"></a>
<a href="https://github.com/dependabot">
    <img width=50 title="Dependabot" src="https://avatars.githubusercontent.com/in/29110"></a>
<a href="https://chatgpt.com">
    <picture>
        <source type="image/png" media="(prefers-color-scheme: dark)" srcset="https://assets.chatgptautorefresh.com/images/icons/chatgpt/black-on-white/icon50.png">
        <img title="ChatGPT" src="https://assets.chatgptautorefresh.com/images/icons/chatgpt/white-on-gray/icon50.png">
    </picture></a>
<a href="https://chat.deepseek.com/">
    <picture>
        <source type="image/png" media="(prefers-color-scheme: dark)" srcset="https://assets.aiwebextensions.com/images/icons/chatbots/deepseek/white/icon64.png">
        <img width=50 title="DeepSeek AI" src="https://assets.aiwebextensions.com/images/icons/chatbots/deepseek/black/icon64.png">
    </picture></a>

</div>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

<div id="sponsors" align="center">
<br>

### 支持：

<div id="warp">
    <br><br>
    <a href="https://www.warp.dev/chatgptjs">
        <img width="600" src="https://assets.chatgptjs.org/images/banners/warp/banner-1500x500.png?v=476e837">
    </a>
    <h3><a href="https://www.warp.dev/chatgptjs">
        Warp，存在于您的终端中的 AI Devtool</a></h3>
    <i><a href="https://www.warp.dev/chatgptjs">
        适用于 MacOS、Linux 和 Windows</a></i>
</div>
<br><br>

</div>

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 🤖 更多 ChatGPT 应用

如需更多精彩的 ChatGPT 应用程序，请访问：https://github.com/adamlui/ai-web-extensions

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">

## 📜 相关脚本

### <img width=17 src="https://assets.chatgptwidescreen.com/images/icons/widescreen-robot-emoji/icon32.png"> [ChatGPT 宽屏模式](https://chatgptwidescreen.com) &nbsp;<img src="https://assets.chatgptwidescreen.com/images/badges/product-hunt/product-of-the-week-2-larger-centered-rounded-light.svg?v=02d9942" width="auto" height="24">
> 通过宽屏/全屏/高屏+垃圾邮件块模式增强 ChatGPT。也可以在 poe.com 上使用！<br>
[安装](https://docs.chatgptwidescreen.com/zh-cn/#-如何安装) /
[自述文件](https://docs.chatgptwidescreen.com/zh-cn/#readme) /
[讨论](https://github.com/adamlui/chatgpt-widescreen/discussions)

### <picture><source type="image/png" media="(prefers-color-scheme: dark)" srcset="https://assets.chatgptautocontinue.com/images/icons/app/white/icon32.png?v=7e2c739"><img height=16 src="https://assets.chatgptautocontinue.com/images/icons/app/black/icon32.png?v=7e2c739"></picture> [ChatGPT 自动继续](https://chatgptautocontinue.com) &nbsp;<a href="https://github.com/awesome-scripts/awesome-userscripts#-chatgpt"><img src="https://assets.chatgptautocontinue.com/images/badges/awesome/badge.svg"></a>
> 当 ChatGPT 响应被切断时自动继续生成答案。<br>
[安装](https://docs.chatgptautocontinue.com/zh-cn/#-如何安装) /
[自述文件](https://docs.chatgptautocontinue.com/zh-cn/#readme) /
[讨论](https://github.com/adamlui/chatgpt-auto-continue/discussions)

### <img width=16 src="https://assets.chatgptinfinity.com/images/icons/infinity-symbol/circled/icon32.png?65fcf31"> [ChatGPT无限](https://chatgptinfinity.com) &nbsp;<a href="https://chrome.chatgptinfinity.com/?utm_source=github&utm_medium=referral&utm_content=featured-by-google-badge"><img height=20 src="https://assets.chatgptinfinity.com/images/badges/chrome-web-store/featured-by-google/badge500x91.png"></a>
> 从无所不知的 ChatGPT 生成无穷无尽的答案 (用任何语言!)
<br>[安装](https://docs.chatgptinfinity.com/zh-cn#-greasemonkey-用户脚本) /
[自述文件](https://docs.chatgptinfinity.com/zh-cn/#readme) /
[讨论](https://github.com/adamlui/chatgpt-infinity/discussions)

<img height=6px width="100%" src="https://assets.chatgptautorefresh.com/images/separators/gradient-aqua.png">
  
<a href="https://github.com/adamlui/userscripts">**更多用户脚本**</a> /
<a href="#top">回到顶部↑</a>
