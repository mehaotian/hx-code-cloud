const path = require('path')
const fs = require('fs')
const hx = require("hbuilderx");

class Database {
	static getInstance() {
		if (!this.instance) {
			this.instance = new Database();
		}
		return this.instance;
	}
	constructor(arg) {
		const appDataCachePath = path.join(hx.env.appData)
		console.log('缓存地址', hx.env.appData)
		this.instance = null
		this.filePath = path.join(appDataCachePath, 'cacheByhxCodeCloud')
		this.fileName = 'data.json'
		// this.localpath = '../database/data.json'
	}

	insert(content = []) {
		return new Promise((resolve, reject) => {
			fs.exists(path.join(this.filePath, this.fileName), (exists) => {
				if (exists) {
					console.log("该文件存在！");
					if(!content || content.length === 0) return
					this.add(content)
				} else {
					console.log("该文件不存在！");
					this._createFile().then(res => {
						this.add(content)
					}).catch(err => {
						console.log(err);
					})
				}
			});
		})
	}

	add(content) {
		this.read().then(data => {
			data.unshift(content)
			this._write(JSON.stringify(data))
		}).catch(err => {
			console.log(err);
		})
	}

	_createFile() {
		return new Promise((resolve, reject) => {
			fs.mkdir(this.filePath, (error) => {
				if (error) {
					console.log('创建目录失败', error);
					reject(error)
					return false;
				}
				this._write()
			})
		})
	}

	eidt(obj) {
		this.read().then((data) => {
			data.map(v => {
				if (v.title === obj.title) {
					v._id = obj.id
					v.article_status = obj.article_status
					v.user_id = obj.user_id
				}
				return v
			})
			this._write(JSON.stringify(data))
		}).catch(() => {
			console.log('错误');
		})

	}

	read() {
		return new Promise((resolve, reject) => {
			fs.readFile(path.join(this.filePath, this.fileName), 'utf8', (error, data) => {
				if (error) {
					console.log('读取文件失败', error);
					reject(error)
					return false;
				}
				resolve(JSON.parse(data))
			})
		})
	}

	_write(content = '[]') {
		return new Promise((resolve, reject) => {
			fs.writeFile(path.join(this.filePath, this.fileName), content, 'utf8', (error) => {
				if (error) {
					console.log('创建文件失败', error);
					reject(error)
					return false;
				}
				console.log('写入成功');
				resolve()
			})
		})
	}
}

module.exports = Database.getInstance()
