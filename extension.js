const hx = require("hbuilderx");
const Core = require('./core/index.js')
const createWebview = require('./core/createWebview.js')

let webviewPanel = hx.window.createWebView("ht.code.mycodeview", {
	enableScripts: true
});
let webview = createWebview(webviewPanel)
module.exports = {
	activate: (context) => {
		context.subscriptions.push(Core.getInstance().register(webview));
	},
	// 销毁时触发
	deactivate: () => {}
}
