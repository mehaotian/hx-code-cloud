const axios = require('axios')

class Http {
	constructor(arg) {}
	request(type,obj) {
		const url = 'https://29263ec1-3b5b-4700-a7a0-e83ec2afc5bb.bspapp.com/http/'+type
		return new Promise((resolve, reject) => {
			axios.post(url, obj).then((response) => {
				const {
					data
				} = response
				resolve(data)
			}).catch((error) => {
				reject(error)
			});
		})
	}
}


module.exports = new Http()
