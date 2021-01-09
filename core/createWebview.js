const hx = require("hbuilderx");
const tools = require('../utils/tools.js')
const http = require('../utils/http.js')
const db = require('../utils/savelocal.js')
/**
 * @description 显示webview
 */
function showWebView(webviewPanel) {
	let webview = webviewPanel.webView;
	let html = tools.html({
		css: [
			'html/css/base.css',
			'html/css/index.css',
		],
		js: [
			'html/js/index.js',
		]
	}, 'html/index.html');

	webview.html = html

	webview.onDidReceiveMessage((item) => {

		if (item.command === 'local') {
			db.read().then(data => {
				if(item.data){
					data = data.filter((v)=v.title === item.data)
				}
				
				webview.postMessage({
					command: "localdata",
					data: data
				});
			}).catch(err => {
				console.log(err);
			})
		}

		if (item.command == 'insert') {
			let editorPromise = hx.window.getActiveTextEditor();
			editorPromise.then(function(editor) {
				const selection = editor.selection
				editor.edit(editBuilder => {
					editBuilder.replace(selection, `\n${item.content}\n`);
				});
			});
		}
		
		if(item.command === 'upload'){
			hx.window.clearStatusBarMessage();
			hx.window.setStatusBarMessage('代码块同步中...', 0, 'info');
		}
		
		if (item.command === 'syncSuccess') {
			hx.window.clearStatusBarMessage();
			hx.window.setStatusBarMessage(item.msg, 2000, 'success');
			
			db.eidt(item.data)
			
		}
		
		if (item.command === 'success') {
			// hx.window.showInformationMessage(item.msg);
			hx.window.clearStatusBarMessage();
			hx.window.setStatusBarMessage(item.msg, 2000, 'success');
		}

		if (item.command === 'error') {
			hx.window.clearStatusBarMessage();
			hx.window.showErrorMessage(item.msg);
		}
	});
	return webview
};


module.exports = showWebView
