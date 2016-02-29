/**
* Video.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var Q = require('q');
var url = 'https://www.googleapis.com/youtube/v3/';
var apiKey = 'AIzaSyBWYb1hZluSQ6oBq1XSigNASqYMOC1KAHg';

module.exports = {

	attributes: {

	},

	search: function(searchUrl) {
			
		var Promise = Q.promise( function(resolve, reject) {
			Youtube.request(searchUrl, function(err, data) {
				if (err) reject(err);

				var result = {};
				var collection = [];
				var items = data.items;
				var nextPage = data.nextPageToken;
				var prevPage = data.prevPageToken;

				for (var index in items) {
					collection.push({videoId: items[index].id.videoId, channelId : items[index].snippet.channelId});
				}

				result.collection = collection;
				result.nextPage = nextPage;
				result.prevPage = prevPage;
				
				resolve(result);
			});
		});

		return Promise;
	},

	getViewCount: function(url) {
		var Promise = Q.promise( function (resolve, reject) {
			Youtube.request(url, function (err, result) {
				if (err) reject(err);
				
				resolve(result.items[0].statistics.viewCount);
			})
		})

		return Promise;
	},

	getSubscriberCount: function(url) {
		var Promise = Q.promise( function (resolve, reject) {
			Youtube.request(url, function (err, result) {
				if (err) reject(err);
			
				resolve(result.items[0].statistics.subscriberCount);
			})
		})

		return Promise;
	},

	addInformation: function(result) {
		var Promise = Q.promise( function (resolve, reject) {
			async.each(result, function (item, callback) {
				var getViewUrl = url + 'videos?part=statistics&id=' + item.videoId + '&fields=items&key=' + apiKey;
				var getSubscriberUrl = url + 'channels?part=statistics&id=' + item.channelId + '&fields=items&key=' + apiKey;

				Q.all([
					Video.getViewCount(getViewUrl),
					Video.getSubscriberCount(getSubscriberUrl)		
				]) 
				.spread(function(view, subscriber) {
					item.viewCount = view;
					item.subscriberCount = subscriber;

					callback();
				})
				.catch(function (err) {
					callback(err);
				});

			}, function (err) {

				if (err) {
					reject(err);
				}
				// console.log(result)
				resolve(result);
			});	
		})

		return Promise;
		
	}
};

