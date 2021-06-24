const url = 'https://29263ec1-3b5b-4700-a7a0-e83ec2afc5bb.bspapp.com/http/'

var app = new Vue({
	el: '#app',
	data() {
		return {
			imgUrl: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-29263ec1-3b5b-4700-a7a0-e83ec2afc5bb/8c41146a-5bb1-437a-8a4c-cb61b4ab1d36.jpg',
			text: '',
			// 数据
			items: [],
			// 滚动条样式
			thumbStyle: {
				right: '2px',
				borderRadius: '8px',
				backgroundColor: '#90a4ae',
				width: '8px',
				opacity: 0.75
			},
			barStyle: {
				right: '2px',
				borderRadius: '14px',
				backgroundColor: '#90a4ae',
				width: '8px',
				opacity: 0.1,
			},
			// 是否结束
			isEnd: false,
			// 表单信息
			formData: {
				name: '',
				password: '',
				verify_password: '',
				nickname: '',
				desc: '',
				avatar: ''
			},
			// 用户信息
			userinfo: {
				nickname: '',
				username: ''
			},
			setting: {},
			// 是否登录
			is_login: false,
			// 是否打开抽屉
			drawer: false,
			// 0-未登录 1-已经登录 2-登录 3-注册  4-修改密码  5-修改个人信息
			drawerStatus: 0,
			loginLoading: false,
			imageLoading:false,
			// 弹窗是否打开
			dialogShow: false,
			message: '',
			// 头像
			filemodel:''

		}
	},
	computed: {
		tags() {
			let tags = []
			return tags
		}
	},
	created() {
		// 模拟登录
		// this.login({
		// 	username: 'admin',
		// 	password: 'wuhaotian000'
		// })
		this.isOverdue()
	},
	mounted() {
		document.getElementById('app').style.display = 'block'
	},
	methods: {
		// 返回
		goto(page) {
			this.formData = {
				name: '',
				password: '',
				verify_password: '',
				nickname: '',
				desc: '',
				avatar: ''
			}
			if(page === 5){
				this.formData = {
					nickname: this.userinfo.nickname,
					desc: this.userinfo.desc,
					avatar: this.userinfo.avatar || this.imgUrl
				}
			}
			this.drawerStatus = page
		},
		
		// 执行登录操作
		loginSubmit() {
			this.$refs.loginForm.validate().then(success => {
				if (success) {
					this.loginLoading = true
					this.login(this.formData)
				}
			})
		},
		registerSubmit(){
			this.$refs.registerForm.validate().then(success => {
				if (success) {
					this.loginLoading = true
					this.register(this.formData)
				}
			})
		},
		updateSubmit(){
			
		},
		
		// 选择头像
		chooseImage(e) {
			this.getBase64(e,(res, File) => {
				this.imageLoading = true
				axios.post(url + 'upload', {
					imagePath: res,
					name: File.name
				}).then((res) => {
					this.imageLoading = false
					let fileID = res.data&&res.data.fileID
					this.formData.avatar = fileID
					this.imgUrl = fileID
				}).catch(err => {
					console.log(err)
					this.imageLoading = false
					this.formData.avatar = ''
				})
			})
		},
		// 获取头像 base64
		getBase64(File,callback) {
			let reader = new FileReader();
			let AllowImgFileSize = 1100000;
			// let File = document.getElementById('file').files[0]; //获取上传的文件对象
			// let File = this.$refs.file
			// console.log(File)
			// return 
			if (File) {
				reader.readAsDataURL(File);
				reader.onload = (e)=> {
					if (AllowImgFileSize != 0 && AllowImgFileSize < reader.result.length) {
						alert('上传失败，请上传不大于2M的图片！');
						return;
					} else {
						let base64Data = reader.result;
						// this.imgUrl = base64Data
						// document.getElementById('file').value = ''
						this.filemodel = ''
						console.log('选择成功')
						//返回base64编码
						callback(base64Data, File);
					}
				}
			}
		},
		// 加载数据
		onLoad(index, done) {
			if (!this.isEnd) {
				this.getList({
					page: this.page,
					done
				})
			}
		},
		/**
		 * 是否过期
		 */
		isOverdue() {
			const uni_id_token_expired = window.localStorage.getItem('uni_id_token_expired') || 0;
			this.uni_id_token = window.localStorage.getItem('uni_id_token') || '';
			const nowTime = new Date().getTime()

			if (uni_id_token_expired > nowTime) {
				this.is_login = true
				this.getUserinfo(this.uni_id_token)
			} else {
				this.is_login = false
				if (this.uni_id_token) {
					this.logout()
				}
				this.getList()
			}
		},
		/**
		 * 登录
		 */
		login(formData) {
			let self = this
			axios.post(url + 'user-center', {
				action: 'login',
				params: {
					username: formData.name,
					password: formData.password
				}
			}).then((res) => {
				console.log('登录成功', res);
				if (res.data.code === 0) {
					this.listsIndex = 0
					// if (this.lists.length === 2) {
					// 	this.lists.push({
					// 		text: '我的收藏',
					// 		icon: 'mdi-account'
					// 	})
					// }
					window.localStorage.setItem('uni_id_token', res.data.token)
					window.localStorage.setItem('uni_id_token_expired', res.data.tokenExpired)
					this.uni_id_token = res.data.token
					this.getUserinfo(res.data.token)

				} else {
					this.message = res.data.msg
					this.loginLoading = false
					this.dialogShow = true
				}

			}).catch((error) => {
				this.loginLoading = false
				console.error(error)
				alert('登录失败')
			});
		},
		/**
		 * 注册
		 */
		register(formData) {
			
			this.loginLoading = true
			axios.post(url + 'user-center', {
				action: 'register',
				params: {
					username: formData.name,
					password: formData.password,
					nickname: formData.nickname,
					desc: formData.desc,
					avatar:formData.avatar,
					setting: {
						home_is_mine: false,
						is_sync_web: false
					}
				}
			}).then((res) => {
				if (res.data.code === 0) {
					// if (this.lists.length === 2) {
					// 	this.lists.push({
					// 		text: '我的收藏',
					// 		icon: 'mdi-account'
					// 	})
					// }
					window.localStorage.setItem('uni_id_token', res.data.token)
					window.localStorage.setItem('uni_id_token_expired', res.data.tokenExpired)
					this.uni_id_token = res.data.token
					this.getUserinfo(res.data.token)
				} else {
					this.message = res.data.msg
					this.dialogShow = true
					this.loginLoading = false
				}
			}).catch((error) => {
				this.loginLoading = false
				console.error(error)
				alert('注册失败')
			});
		},
		/**
		 * 退出登录
		 */
		logout() {
			if (this.loginLoading) return
			this.loginLoading = true
			if (this.uni_id_token) {
				console.log(1)
				axios.post(url + 'user-center', {
					action: 'logout',
					params: {
						token: this.uni_id_token
					}
				}).then((res) => {
					window.localStorage.removeItem('uni_id_token')
					window.localStorage.removeItem('uni_id_token_expired')
					this.clearData()
				}).catch((error) => {
					this.loginLoading = false
				});
			}else{
				window.localStorage.removeItem('uni_id_token')
				window.localStorage.removeItem('uni_id_token_expired')
				this.clearData()
			}
		},
		/**
		 * 获取用户信息
		 * @param {Object} token
		 */
		getUserinfo(token) {
			let self = this
			axios.post(url + 'user-center', {
				action: 'getUserinfo',
				params: {
					token: token
				}
			}).then((res) => {
				console.log('获取用户信息成功', res);
				this.loginLoading = false
				if (res.data.code === 0) {
					this.userinfo = res.data.data
					this.setting = this.userinfo.setting
					this.is_login = true
					this.drawerStatus = 1

					if (this.setting && this.setting.home_is_mine) {
						this.listsIndex = 1;
						this.loading = false
						// this.allData = Object.assign([], this.items)
						hbuilderx.postMessage({
							command: 'local'
						});
					} else {
						this.listsIndex = 0
						this.getList()
					}

				} else {
					this.logout()
				}
			}).catch((error) => {
				this.loginLoading = false
				console.error(error)
				this.logout()
				alert('获取用户失败，请重新登录')
			});
		},
		
		/**
		 * 更新用户信息
		 */
		updateUser(e) {
			this.loginLoading = true
		
			axios.post(url + 'user-center', {
				action: 'update',
				params: {
					token: this.uni_id_token,
					nickname: this.formData.nickname || '',
					avatar: this.formData.avatar || '',
					desc: this.formData.desc || '',
				}
			}).then((res) => {
				if (res.data.code === 0) {
					// this.loginLoading = false
					// hbuilderx.postMessage({
					// 	command: "success",
					// 	msg: '更新用户信息成功'
					// });
					this.getUserinfo(this.uni_id_token)
				} else {
					this.loginLoading = false
					this.message = res.data.msg
					this.dialogShow = true
					// hbuilderx.postMessage({
					// 	command: "error",
					// 	msg: (res.data.msg || res.data.message || '更新用户信息失败') + ',如果一直失败请尝试重新登录'
					// });
				}
			}).catch((error) => {
				console.error(error)
				this.loginLoading = false
				// hbuilderx.postMessage({
				// 	command: "error",
				// 	msg: '配置更新失败'
				// });
			});
		},
		
		/**
		 * 收藏代码
		 * @param {Object} item
		 */
		heart(item) {
			const {
				is_like,
				_id
			} = item

			if (this.heartUpdate) {
				hbuilderx.postMessage({
					command: "success",
					msg: '操作太快了，客官慢一点啊！'
				});
				return
			}
			this.heartUpdate = true
			const index = this.items.findIndex(v => v._id === _id)

			this.items[index].is_like = !this.items[index].is_like
			if (is_like) {
				this.items[index].like_count -= 1
				if (this.items[index].like_count < 0) {
					this.items[index].like_count = 0
				}
			} else {
				this.items[index].like_count += 1
			}

			axios.post(url + 'set_code', {
				type: 'collection',
				data: {
					id: _id,
					user_id: this.userinfo._id || ''
				}
			}).then((response) => {
				const {
					data
				} = response
				console.log(data);
				this.heartUpdate = false
				if (data.code === 200) {
					if (hbuilderx) {
						hbuilderx.postMessage({
							command: "success",
							msg: !is_like ? '收藏成功' : '取消收藏'
						});
					}

				} else {
					if (hbuilderx) {
						hbuilderx.postMessage({
							command: "error",
							msg: '收藏失败，请重试'
						});
					}

					this.items[index].is_like = !this.items[index].is_like
					if (is_like) {
						this.items[index].like_count += 1
					} else {
						this.items[index].like_count -= 1
						if (this.items[index].like_count < 0) {
							this.items[index].like_count = 0
						}
					}
				}

			}).catch((error) => {
				console.log(error);
				this.heartUpdate = false
				if (hbuilderx) {
					hbuilderx.postMessage({
						command: "error",
						msg: '收藏失败，请重试'
					});
				}

				this.items[index].is_like = !this.items[index].is_like
				if (is_like) {
					this.items[index].like_count += 1
				} else {
					this.items[index].like_count -= 1
					if (this.items[index].like_count < 0) {
						this.items[index].like_count = 0
					}
				}
			});
		},
		/**
		 * 获取网络列表数据
		 */
		getList({
			page = 1,
			pageSize = 100,
			type = '',
			search = '',
			loaclData = [],
			done = () => {}
		} = {}, ) {

			this.selectLoading = true
			const token = this.is_login ? (this.uni_id_token || '') : ''
			axios.post(url + 'get_code_list', {
				page,
				pageSize,
				token: token,
				type: type,
				search: search
			}).then((response) => {
				const {
					data
				} = response
				console.log(data);
				if (!data.data) {
					data.data = []
				}
				if (data.data.length > 0) {
					this.page++
					console.log('继续');
					done()
				} else {
					console.log('停止');
					this.isEnd = true
					return
				}
				if (page === 1) {
					this.items = []
				}
				if (type === 'mycode') {
					this.items.push(...loaclData)
				}
				this.items.push(...data.data)

				console.log('列表', this.items);
				this.loading = false
				// this.selectLoading = false
			}).catch((error) => {
				console.log(error);
				this.loading = false
				// this.selectLoading = false
			});
		},
		/**
		 * 恢复数据
		 */
		clearData() {
			this.loginLoading = false
			this.is_login = false
			this.drawerStatus = 0
			// if (this.lists.length === 3) {
			// 	this.lists.splice(-1, 1)
			// }
			this.listsIndex = 0
			this.formData = {
				name: '',
				password: '',
				verify_password: '',
				nickname: '',
				desc: '',
				avatar: ''
			}
			this.items = []
			this.getList()
		}
	}
})
