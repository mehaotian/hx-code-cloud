const path = require('path')
const fs = require('fs')
const color = require('./color.js')
let homepage = 'index.html'
class Tools {
	constructor(arg) {}

	html({
		css = [],
		js = []
	} = {}, html) {
		let data = ''
		let content = ''
		let cssData = '<style>:root{\n'
		let jsData = ''

		let colorData = color()

		for (let i in colorData) {
			cssData += '--' + i + ':' + colorData[i] + ';\n'
		}

		cssData += '}</style>\n'
		// console.log(cssData);
		css.forEach(item => {
			// cssData += this._getContent(item) + '\n'
			cssData += `<style>${this._getContent(item)}</style>\n`
		})
		js.forEach(item => {
			let jsContent = `<script>${this._getContent(item)}</script>\n`
			jsData += jsContent
		})

		data = this._getContent(homepage)

		content = this._getContent(html)

		data = data.replace(/\/\* css \*\//ig, cssData)
			.replace(/\<\!-- app --\>/ig, content)
			.replace(/\<\!-- js --\>/ig, jsData)
		// console.log(data)
		return data
	}

	_getContent(url) {
		url = url.split('/')
		let contentPath = path.join(__dirname, '..', ...url)
		let content = fs.readFileSync(contentPath, 'utf8')
		return content
	}

}

module.exports = new Tools()
