const hx = require("hbuilderx");
const http = require('../utils/http.js')
const windowBox = require('./windowBox.js')
const db = require('../utils/savelocal.js')
class Core {
	static getInstance() {
		if (!this.instance) {
			this.instance = new Core();
		}
		return this.instance;
	}

	constructor() {
		this.instance = null
		this.webview = null
	}

	copycode(e) {
		let editorPromise = hx.window.getActiveTextEditor();
		editorPromise.then((editor) => {
			const selection = editor.selection
			let document = editor.document;
			console.log(selection);
			if (selection.start === selection.end) {
				// 选择行
				document.lineFromPosition(selection.active).then(line => {
					this._model(line.text)
				})
			} else {
				// 选择范围
				let word = document.getText(selection);
				this._model(word)
			}

		});
	}

	insertcode(e) {
		let editorPromise = hx.window.getActiveTextEditor();
		editorPromise.then(function(editor) {
			const selection = editor.selection
			editor.edit(editBuilder => {
				editBuilder.replace(selection, `export default {data(){name:1}}`);
			});
		});
	}

	createdWebview(e) {
		hx.window.showView({
			viewId: 'ht.code.mycodeview',
			containerId: 'ht.code.webview'
		});
	}
	_model(word) {

		let self = this

		let webviewDialog = hx.window.createWebViewDialog({
			modal: false,
			title: "是否确认收藏代码块？",
			description: "填写一些必要信息，让你更好的分清它们！稍后可以到我发布的代码块里填写更详细的信息",
			dialogButtons: [
				"取消", "确定"
			],
			size: {
				width: 400,
				height: 500
			}
		}, {
			enableScripts: true
		});

		let webview = webviewDialog.webView;

		webview.html = windowBox

		webview.onDidReceiveMessage((msg) => {
			console.log(msg)
			if (msg.command === 'cancel') {
				webviewDialog.close();
			}
			if (msg.command === 'ok') {
				console.log('title', msg.title)
				if (!msg.title) {
					hx.window.showErrorMessage('标题万万不可空着啊！');
					return
				}
				if (!msg.excerpt) {
					hx.window.showErrorMessage('描述万万不可空着啊！');
					return
				}
				
				db.read().then(data => {
					
					let valueData = data.find(v=>v.title === msg.title)
					
					if(valueData) {
						hx.window.showErrorMessage('可不敢起一样的名字啊，换一个试一试呗');
						return
					}
					
					const content = {
						view_count: 0,
						like_count: 0,
						is_like: false,
						title: msg.title,
						excerpt: msg.excerpt,
						content: word,
						article_status: 0,
						user_id: ''
					}
					db.insert(content)
					
					self.webview.postMessage({
						command: "copycode",
						data: content
					});
				
					webviewDialog.close();
				}).catch(err => {
					console.log(err);
				})
				// TODO 只有登录才会执行这个操作
				// self._save({
				// 	title: msg.title,
				// 	excerpt: msg.excerpt,
				// 	content: word
				// })
				
			}
		});
		let promi = webviewDialog.show();
		promi.then(function(data) {
			// 处理错误信息
		});

	}

	_save(obj) {
		const self = this
		hx.window.setStatusBarMessage('上传中...', 0, 'info');
		http.request('set_code', {
			type: 'add',
			data: obj
		}).then((res) => {
			console.log(res, obj.content);
			hx.window.clearStatusBarMessage();
			hx.window.showInformationMessage(res.msg);
			self.webview.postMessage({
				command: "copycode",
				data: {
					...obj,
					_id: res.data.id,
					view_count: 0,
					like_count: 0,
					is_like: false,
					content: obj.content
				}
			});
		}).catch((err) => {
			hx.window.clearStatusBarMessage();
			hx.window.setStatusBarMessage('上传失败', 500, 'error');
			console.log(err);
		})
	}

	/**
	 * 注册命令
	 */
	register(webview) {
		this.webview = webview
		return [
			hx.commands.registerCommand('ht.code.copycode', this.copycode.bind(this)),
			hx.commands.registerCommand('ht.code.insertcode', this.insertcode.bind(this)),
			hx.commands.registerCommand('ht.code.mycode', this.createdWebview.bind(this))
		]
	}

}

module.exports = Core
