

var request = require('request');

module.exports = {


	// request: function(url, callback) {
	// 	request(url, function(error, response, body) {
	// 		if (error) {
	// 			callback(error);
	// 		}
	// 		else {
	// 			var data = JSON.parse(body);
	// 			if (response.statusCode == 200) {
	// 			  callback(null, data);
	// 			}
	// 			else {
	// 			  callback(data.error);
	// 			}
	// 		}
	// 	});
	// },

	search: function(url, callback) {
		request(url, function(error, response, body) {
			if (error) console.log(error);

			var data = JSON.parse(body);

			if (response.statusCode == 200) {
				callback(null, data);
			} else {
				callback(data.error);
			}
		});
	}
}