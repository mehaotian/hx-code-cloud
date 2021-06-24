import path from 'path'
import fs from 'fs'
import color from './color.js'

let homepage = 'public/index.html'
class Tools {
	constructor(arg) {
		console.log('---');
		console.log(this);
	}

	html({
		css = [],
		js = []
	} = {}) {
		let html = 'view/index.html'
		let data = ''
		let content = ''
		let cssData = '<style>\n:root{\n'
		let jsData = ''
		console.log(this);
		let colorData = color()

		for (let i in colorData) {
			cssData += '--' + i + ':' + colorData[i] + ';\n'
		}

		cssData += '}\n</style>'

		css.forEach(item => {
			let url = item.split('/')
			let contentPath = path.join(__dirname, ...url)
			cssData += `<link rel="stylesheet" type="text/css" href="${contentPath}">\n`
		})

		js.forEach(item => {
			let url = item.split('/')
			let contentPath = path.join(__dirname, ...url)
			jsData += `<script type="text/javascript" src="${contentPath}"></script>\n`
		})
		
		data = this._getContent(homepage)
		content = this._getContent(html)
		data = data.replace(/\<\!-- css --\>/ig, cssData).replace(/\<\!-- app --\>/ig, content).replace(
			/\<\!-- js --\>/ig, jsData)
		return data
	}

	_getContent(url) {
		url = url.split('/')
		let contentPath = path.join(__dirname, ...url)
		let content = fs.readFileSync(contentPath, 'utf8')
		return content
	}
}
const tools = new Tools()
export default tools
