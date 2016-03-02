/**
* Crawler.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var request = require('request-promise');
var apiUrl = 'https://www.googleapis.com/youtube/v3/';
var Q = require('q');


module.exports = {

	attributes: {
	
	},


	request: function(type, params) {

		var Promise = Q.promise(function (resolve, reject) {
			var url = apiUrl + type;

			request({url: url, qs: params, json: true})
				.then(function(body) {
					resolve(body);
				})
				.catch(function (err) {
					reject(err);
				})
		})

		return Promise
	}
};

