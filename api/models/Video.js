/**
* Video.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var Q = require('q');
var url = 'https://www.googleapis.com/youtube/v3/';
var apiKey = 'AIzaSyBWYb1hZluSQ6oBq1XSigNASqYMOC1KAHg';
var moment = require('moment');
var fs = require('fs');
var path = require('path');
var ytdl = require('ytdl-core');


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
					collection.push({videoId: items[index].id.videoId, 
						channelId : items[index].snippet.channelId, 
						thumbnail: items[index].snippet.thumbnails.default.url,
						published_at: moment(items[index].snippet.publishedAt).format('YYYY-MM-DD')
					});
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
		
	},

	 upload: function(videoId) {
		var google = require("googleapis"),
        yt = google.youtube('v3');

        var clientId = '428722945070-ufq77f6bll8b225lvqd1t56fb5u83jtn.apps.googleusercontent.com';
        var appSecret = 'GCPxRVLGfNk0MAUpEptb7-aG';
        var redirectUrl = 'http://localhost:1337/callback';
        var tokens = 'ya29.mAITORyiuZQqgXHIAKrFohUhAsds79pmaPfQ42TPOg05JoGEprFtVKyaNS8KQoMUwg';
        var refresh_token = '1/zsidMKIGtJ8k5AYnhyUwoHPffv4h4CHv8Qoa5d2pvpl90RDknAdJa_sgfheVM0XT'

	    var oauth2Client = new google.auth.OAuth2(clientId, appSecret, redirectUrl);
	    oauth2Client.setCredentials({
	    	access_token: tokens,
  			refresh_token: refresh_token
	    });
	    google.options({auth: oauth2Client});

	    yt.videos.insert({
	        part: 'status,snippet',
	        resource: {
	            snippet: {
	                title: 'title',
	                description: 'description'
	            },
	            status: { 
	                privacyStatus: 'private' //if you want the video to be private
	            }
	        },
	        media: {
	            body: fs.createReadStream('assets/video/'+ videoId +'.mp4')
	        }
	    }, function(error, data){
	        if(error){
	            console.log(error)
	        } else {
	            console.log(data);
	        }
	    });
	},

	download: function(videoId) {
		
		ytdl('https://www.youtube.com/watch?v=' + videoId)
  			.pipe(fs.createWriteStream('assets/video/'+ videoId +'.mp4'));
	}
	
};

