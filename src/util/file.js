import fs from 'fs'
import path from 'path'

export function readFile(fsPath) {
	let content = fs.readFileSync(fsPath).toString()
	if(content){
		try {
			// TODO 不确认是否会有问题 ，待测试
			// content = content.replace(/\\\\u/, '\\u')
			content = JSON.parse(content)
		} catch (e) {
			content = false
		}
		return content
	}
	return false
}
