import hx from "hbuilderx"
import fs from "fs"
import path from "path"
import tools from '../util/tools.js'

const log = (channel, line) => {
	let log = hx.window.createOutputChannel(channel);
	log.show()
	log.appendLine(line);
}

class Core {
	static getInstance() {
		if (!this.instance) {
			this.instance = new Core();
		}
		return this.instance;
	}

	constructor() {
		this.instance = null
		let webviewPanel = hx.window.createWebView("ht.code.mycodeview", {
			enableScripts: true
		});
		this.webview = webviewPanel.webView
		this.init(this.webview)
	}
	init(webview){
		let html = tools.html({
			css:['public/css/index.css'],
			js:['public/index.js']
		})
		webview.html = html
	}
	createdWebview(){
		hx.window.showView({
			viewId: 'ht.code.mycodeview',
			containerId: 'ht.code.webview'
		});
	}
	/**
	 * 注册命令
	 */
	register() {
		return [
			hx.commands.registerCommand('ht.code.mycode', this.createdWebview.bind(this))
		]
	}

}

export default Core
