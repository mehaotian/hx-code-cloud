const url = 'https://29263ec1-3b5b-4700-a7a0-e83ec2afc5bb.bspapp.com/http/'
var app = new Vue({
	el: '#app',
	vuetify: new Vuetify(),
	data() {
		return {
			imgUrl: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-aliyun-tbvysmx8bbof5d5640/243136a0-51a9-11eb-b997-9918a5dda011.gif',
			searchValue: '',
			dialog: false,
			loading: true,
			selectLoading: false,
			benched: 20,
			items: [],
			lastId: '',
			loadType: 'loadmore',
			detailData: {},
			formData: {
				name: '',
				password: '',
				verify_password: '',
				nickname: '',
				desc: '',
				avatar: ''
			},
			lists: [{
					text: '来自网络',
					icon: 'mdi-clock'
				},
				{
					text: '来自本地',
					icon: 'mdi-account'
				}
			],
			rulus: {
				name: [v => !!v || '账号不能为空'],
				password: [v => (v && v.length >= 6) || '密码不能少于6位'],
				reg_name: [
					v => !!v || '账号不能为空',
					v => (v && v.length >= 5) || '账号不能少于5位',
				],
				verify_password: [
					v => !!v || '账号不能为空',
					v => (v === this.formData.password) || '两次输入的密码不一致'
				]
			},
			listsIndex: 0,
			selectedItem: 0,
			drawer: false,
			userinfo: {
				nickname: '',
				username: ''
			},
			setting: {},
			is_login: false,
			is_no_login_type: 0,
			message: '',
			loginLoading: false,
			fixLoading: false,
			webLoading: false,
			syncLoading: false,
			loginTypeIndex: 0
		}
	},
	computed: {},
	watch: {
		'formData.name'() {
			this.message = ''
		},
		'formData.password'() {
			this.message = ''
		},
		'formData.verify_password'() {
			this.message = ''
		}
	},
	created() {
		document.getElementById('app').style.display = 'block'
		this.page = 1
		this.allData = []
		this.isOverdue()

		this.diffHeight = 100
	},
	mounted() {
		window.addEventListener("hbuilderxReady", this.initReceive);
	},
	methods: {

		/**
		 * 与webview 同步数据
		 */
		initReceive() {
			hbuilderx.onDidReceiveMessage((data) => {
				if (data.command === 'localdata') {
					this.selectLoading = false
					this.items = data.data
				}
				if (data.command === "copycode") {
					if (this.listsIndex === 1) {
						const itemIndex = this.items.findIndex(v => v.title === data.data.title)
						if (itemIndex !== -1) {
							this.items[itemIndex] = data.data
						} else {
							this.items.unshift(data.data)
						}
					}
					if (this.setting.is_sync_web) {
						this.updateWeb(data.data, true)
					}
				}
			});
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
				if (this.lists.length === 2) {
					this.lists.push({
						text: '我的收藏',
						icon: 'mdi-account'
					})
				}
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
		 * 搜索
		 */
		search() {
			// if(!value){
			const value = this.searchValue
			// }
			console.log('搜索', value);
			this.items = []
			if (this.listsIndex === 0) {
				this.items = []
				this.getList({
					search: value
				})
			}
			if (this.listsIndex === 1) {
				hbuilderx.postMessage({
					command: 'local',
					data: value
				});
			}

			if (this.listsIndex === 2) {
				this.items = []
				this.getList({
					search: value,
					type: 'collection'
				})
			}
		},
		
		/**
		 * 清空搜索
		 */
		clickClear() {
			this.searchValue = ''
			this.search()
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
					hbuilderx.postMessage({
						command: "success",
						msg: '更新用户信息成功'
					});
					this.getUserinfo(this.uni_id_token)
				} else {
					this.loginLoading = false
					hbuilderx.postMessage({
						command: "error",
						msg: (res.data.msg || res.data.message || '更新用户信息失败') + ',如果一直失败请尝试重新登录'
					});
				}
			}).catch((error) => {
				console.error(error)
				this.loginLoading = false
				hbuilderx.postMessage({
					command: "error",
					msg: '配置更新失败'
				});
			});
		},
		
		/**
		 * 编辑用户信息
		 * @param {Object} type
		 */
		openEdit(type) {
			this.loginTypeIndex = type
			this.formData = {
				name: '',
				password: '',
				verify_password: '',
				nickname: '',
				desc: '',
				avatar: ''
			}
			if (type === 1) {
				this.formData.nickname = this.userinfo.nickname
				this.formData.desc = this.userinfo.desc
				this.formData.avatar = this.userinfo.avatar
			}

		},
		
		/**
		 * 打开登录注册窗口
		 * @param {Object} type
		 */
		openLogin(type) {
			this.is_no_login_type = type
			if (type === 0) {
				this.formData = {
					name: '',
					password: '',
					verify_password: '',
					nickname: '',
					desc: '',
					avatar: ''
				}
			}
		},

		/**
		 * 登录校验
		 */
		validate() {
			const rules = this.$refs.form.validate()
			if (rules) {
				this.loginLoading = true
				this.login(this.formData)
			}
		},

		/**
		 * 打开抽屉
		 */
		openDrawer() {
			this.drawer = true
		},

		/**
		 * 切换列表显示
		 * @param {Object} index
		 */
		typeFn(index) {
			console.log(index);
			this.listsIndex = index
			if (index === 0) {
				// this.items = Object.assign([], this.allData)
				this.items = []
				this.getList()
			}
			if (index === 1) {
				this.allData = Object.assign([], this.items)
				hbuilderx.postMessage({
					command: 'local'
				});
			}

			if (index === 2) {
				this.items = []
				this.getList({
					page: 1,
					type: 'collection'
				})
			}

		},

		/**
		 * 使用代码
		 * @param {Object} item
		 */
		insert(item) {
			hbuilderx.postMessage({
				command: "insert",
				content: item.content
			});

			if (this.listsIndex === 1) return

			const {
				_id
			} = item
			const index = this.items.findIndex(v => v._id === _id)
			this.items[index].view_count += 1
			axios.post(url + 'set_code', {
				type: 'use',
				data: {
					id: _id
				}
			}).then((response) => {
				const {
					data
				} = response
				if (data.code !== 200) {
					this.items[index].view_count -= 1
				}
			}).catch((error) => {
				console.log(error);
				this.items[index].view_count -= 1
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
			const index = this.items.findIndex(v => v._id === _id)

			this.items[index].is_like = !this.items[index].is_like
			if (is_like) {
				this.items[index].like_count -= 1
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
				if (data.code === 200) {
					hbuilderx.postMessage({
						command: "success",
						msg: !is_like ? '收藏成功' : '取消收藏'
					});
				} else {
					hbuilderx.postMessage({
						command: "error",
						msg: '收藏失败，请重试'
					});
					this.items[index].is_like = !this.items[index].is_like
					if (is_like) {
						this.items[index].like_count += 1
					} else {
						this.items[index].like_count -= 1
					}
				}

			}).catch((error) => {
				console.log(error);
				hbuilderx.postMessage({
					command: "error",
					msg: '收藏失败，请重试'
				});
				this.items[index].is_like = !this.items[index].is_like
				if (is_like) {
					this.items[index].like_count += 1
				} else {
					this.items[index].like_count -= 1
				}
			});
		},

		/**
		 * 修改首页固定
		 */
		fixedHome(e) {
			this.fixLoading = true
			this.setting.home_is_mine = e
			axios.post(url + 'user-center', {
				action: 'fixhome',
				params: {
					token: this.uni_id_token,
					home_is_mine: e
				}
			}).then((res) => {
				if (res.data.code === 0) {
					this.fixLoading = false
					hbuilderx.postMessage({
						command: "success",
						msg: '更新配置成功'
					});
				} else {
					this.fixLoading = false
					this.setting.home_is_mine = !this.setting.home_is_mine
					hbuilderx.postMessage({
						command: "error",
						msg: (res.data.msg || res.data.message || '配置更新失败') + ',如果一直失败请尝试重新登录'
					});
				}
			}).catch((error) => {
				console.error(error)
				this.setting.home_is_mine = !this.setting.home_is_mine
				this.fixLoading = false
				this.setting.home_is_mine = false
				hbuilderx.postMessage({
					command: "error",
					msg: '配置更新失败'
				});
			});
		},

		/**
		 * 自动同步到线上
		 * @param {Object} e
		 */
		syncWeb(e) {
			this.webLoading = true
			this.setting.is_sync_web = e
			axios.post(url + 'user-center', {
				action: 'syncweb',
				params: {
					token: this.uni_id_token,
					is_sync_web: e
				}
			}).then((res) => {
				if (res.data.code === 0) {
					this.webLoading = false
					hbuilderx.postMessage({
						command: "success",
						msg: '更新配置成功'
					});
				} else {
					this.webLoading = false
					this.setting.is_sync_web = !this.setting.is_sync_web
					hbuilderx.postMessage({
						command: "error",
						msg: (res.data.msg || res.data.message || '配置更新失败') + ',如果一直失败请尝试重新登录'
					});
				}
			}).catch((error) => {
				console.error(error)
				this.setting.is_sync_web = !this.setting.is_sync_web
				this.webLoading = false
				this.setting.is_sync_web = false
				hbuilderx.postMessage({
					command: "error",
					msg: '配置更新失败'
				});
			});
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
				console.log('登录成功', res.result);
				// alert(JSON.stringify(res.data))
				// this.loginLoading = false
				if (res.data.code === 0) {
					// self.userinfo = res.data.userInfo
					// this.is_login = true
					this.listsIndex = 0
					if (this.lists.length === 2) {
						this.lists.push({
							text: '我的收藏',
							icon: 'mdi-account'
						})
					}
					window.localStorage.setItem('uni_id_token', res.data.token)
					window.localStorage.setItem('uni_id_token_expired', res.data.tokenExpired)
					this.uni_id_token = res.data.token
					this.getUserinfo(res.data.token)

				} else {
					this.message = res.data.msg
				}

			}).catch((error) => {
				this.loginLoading = false
				console.error(error)
				alert('登录失败')
			});
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
					this.loginTypeIndex = 0;

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
		 * 注册
		 */
		register() {
			const rules = this.$refs.form.validate()
			if (!rules) return
			this.loginLoading = true
			axios.post(url + 'user-center', {
				action: 'register',
				params: {
					username: this.formData.name,
					password: this.formData.password,
					nickname: '',
					setting: {
						home_is_mine: false,
						is_sync_web: false
					}
				}
			}).then((res) => {
				this.loginLoading = false
				if (res.data.code === 0) {
					if (this.lists.length === 2) {
						this.lists.push({
							text: '我的收藏',
							icon: 'mdi-account'
						})
					}
					window.localStorage.setItem('uni_id_token', res.data.token)
					window.localStorage.setItem('uni_id_token_expired', res.data.tokenExpired)
					this.uni_id_token = res.data.token
					this.getUserinfo(res.data.token)
				} else {
					this.message = res.data.msg
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
			axios.post(url + 'user-center', {
				action: 'logout'
			}).then((res) => {
				window.localStorage.removeItem('uni_id_token')
				window.localStorage.removeItem('uni_id_token_expired')
				this.clearData()
			}).catch((error) => {
				this.loginLoading = false
				console.error(error)
				alert('退出登录失败')
			});
		},

		/**
		 * 发布到线上
		 * f
		 * @param {Object} item
		 */
		updateWeb(item, is_add) {
			this.syncLoading = true
			hbuilderx.postMessage({
				command: 'upload'
			});
			const article_status = item.article_status === 1 ? 0 : 1;
			let content = {
				id: item._id || '',
				user_id: this.userinfo._id || '',
				article_status: article_status,
				title: item.title,
				excerpt: item.excerpt,
				content: item.content
			}
			axios.post(url + 'set_code', {
				type: 'add',
				data: content
			}).then((res) => {
				data = res.data
				// console.log(res, obj.content);
				this.syncLoading = false
				if (data.code === 200) {
					const docsId = (data.data && data.data.id) || item._id || ''
					hbuilderx.postMessage({
						command: 'syncSuccess',
						msg: '代码同步完成',
						data: {
							title: item.title,
							id: docsId,
							article_status: article_status,
							user_id: this.userinfo._id
						}
					});

					if (is_add) {
						content._id = docsId
						content.article_status = article_status
						content.is_like = false
						content.view_count = 0
						content.like_count = 0
						content.nickname = ''
						content.is_me = true
						content.userinfo = {
							username: this.userinfo.username || '',
							nickname: this.userinfo.username || ''
						}

						const itemIndex = this.items.findIndex(v => v.title === content.title)
						if (this.listsIndex === 0) {
							this.items.unshift(content)
						}

						if (this.listsIndex === 1) {
							if (itemIndex !== -1) {
								this.items[itemIndex] = content
							} else {
								this.items.unshift(content)
							}
						}
					} else {
						let index = this.items.findIndex(v => v.title === item.title)
						this.items[index].article_status = article_status
						this.items[index]._id = docsId
					}
				} else {
					hbuilderx.postMessage({
						command: 'error',
						msg: '代码同步失败'
					});
				}
			}).catch((err) => {
				this.syncLoading = false
				hbuilderx.postMessage({
					command: 'error',
					msg: '代码同步失败'
				});
				console.log(err);
			})
		},

		/**
		 * 获取网络列表数据
		 */
		getList({
			page = 1,
			pageSize = 20,
			type = '',
			search = ''
		} = {}) {

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
				if (page === 1) {
					this.items = []
				}
				this.items.push(...data.data)
				if (data.data.length > 0) {
					this.page++
				} else {
					this.isEnd = true
					this.loadType = 'noMore'
				}
				console.log('列表', this.items);
				// this.lastId = this.items[this.items.length - 1]._id
				this.loading = false
				this.selectLoading = false
			}).catch((error) => {
				console.log(error);
				this.loading = false
				this.selectLoading = false
			});
		},

		/**
		 * 恢复数据
		 */
		clearData() {
			this.loginLoading = false
			this.is_login = false
			this.is_no_login_type = 0
			if (this.lists.length === 3) {
				this.lists.splice(-1, 1)
			}
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
		},

		/**
		 * 加载更多
		 */
		loadMore() {
			if (this.isEnd) return
			this.loadType = 'loading'
			this.getList({
				page: this.page
			})
		},

		/**
		 * 坚听滚动
		 * @param {Object} e
		 */
		onScroll(e) {
			const scrollTop = e.target.scrollTop
			const scrollHeight = this.$refs.scroll.$el.scrollHeight
			const docHeight = this.$refs.scroll.$el.clientHeight
			const loadHeight = scrollHeight - docHeight - this.diffHeight

			if (scrollTop > loadHeight) {
				if (!this.isTrigger) {
					this.isTrigger = true
					this.loadMore()
				}
			} else {
				this.isTrigger = false
			}
		},

		/**
		 * 打开详情
		 * @param {Object} item
		 */
		openDetail(item) {
			this.dialog = true
			this.detailData = item
		},
	}
})
