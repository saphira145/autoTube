/**
* Video.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var Q = require('q');
var config = sails.config.mainConfig;
var url = 'https://www.googleapis.com/youtube/v3/';
var moment = require('moment');
var fs = require('fs');
var ytdl = require('ytdl-core');


module.exports = {

	attributes: {

	},

	getViewCount: function(videoId) {
		var getParams = {
			part: 'statistics',
			id: videoId,
			fields: 'items',
			key: config.api_key
		}

		var Promise = Q.promise( function (resolve, reject) {
			Crawler.request('videos', getParams)
				.then(function(result) {
					resolve(result.items[0].statistics.viewCount);
				})
				.catch(function (err) {
					reject(err);
				})
		})

		return Promise;
	},

	getSubscriberCount: function(channelId) {
		var getParams = {
			part: 'statistics',
			id: channelId,
			fields: 'items',
			key: config.api_key
		}

		var Promise = Q.promise( function (resolve, reject) {
			Crawler.request('channels', getParams)
				.then(function(result) {

					resolve(result.items[0].statistics.subscriberCount);
				})
				.catch(function (err) {
					reject(err);
				})
		})

		return Promise;
	},

	addInformation: function(result) {
		var Promise = Q.promise( function (resolve, reject) {
			async.each(result, function (item, callback) {

				Q.all([
					Video.getViewCount(item.videoId),
					Video.getSubscriberCount(item.channelId)		
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

	 upload: function(videoId, info, token, callback) {
	 	
		var google = require("googleapis");
        var yt = google.youtube('v3');

	    var oauth2Client = new google.auth.OAuth2(config.oath.client_id, config.oath.app_secret, config.oath.redirect_url);

	    oauth2Client.setCredentials({
	    	access_token: token.access_token,
  			refresh_token: token.refresh_token
	    });

	    google.options({auth: oauth2Client});

	    yt.videos.insert({
	        part: 'status,snippet',
	        resource: {
	            snippet: {
	                title: info.title,
	                description: info.description
	            },
	            status: { 
	                // privacyStatus: 'public' //if you want the video to be private
	            },
	            tags: info.tags,
	            category: info.category
	        },
	        media: {
	            body: fs.createReadStream('assets/video/'+ videoId +'.mp4')
	        }
	    }, function(error, data){
	        if(error){
	        	console.log(error)
	            callback(error, null);
	        } else {
	            callback(null, data);
	        }
	    });
	},

	download: function(videoId) {
		
		var stream = ytdl('https://www.youtube.com/watch?v=' + videoId)
  			.pipe(fs.createWriteStream('assets/video/'+ videoId +'.mp4'));

		return stream;
	},

	getVideoInfo: function(id) {
		
		var getParams = {
			part: 'snippet',
			id: id,
			fields: 'items',
			key: config.api_key
		};

		var Promise = Q.promise( function (resolve, reject) {
			Crawler.request('videos', getParams)
				.then(function(result) {
					resolve(result.items[0].snippet);
				})
				.catch(function (err) {
					reject(err);
				})
		});

		return Promise;
	},

	editVideo: function(videoId, cb) {
		var ffmpeg = require('fluent-ffmpeg');
		var videoPath = sails.config.appPath + '/assets/video/' + videoId + '.mp4';
		var savePath = sails.config.appPath + '/assets/video/edited/'+ videoId + '.mp4';
		var watermark = sails.config.appPath + '/assets/images/watermark.png';

		var process = new ffmpeg(videoPath);

		var process = ffmpeg(videoPath)
			// set video bitrate
			.videoBitrate(1124)
			// set target codec
			// .videoCodec('divx')
			// set aspect ratio
			.aspect('4:3')
			// set size in percent
			.size('640x480')
			.autopad()
			// set fps
			.fps(24)
			// set audio bitrate
			.audioBitrate('122k')
			.audioFilters('volume=1.2')
			// set audio codec
			// .audioCodec('libmp3lame')
			// set number of audio channels
			// .audioChannels(2)
			// set custom option
			// .addOption('-vtag', 'DIVX')
			// set output format to force
			.format('mp4')
			// setup event handlers
			.on('end', function() {
				console.log('file has been converted succesfully');
				cb();
			})
			.on('error', function(err) {
			console.log('an error happened: ' + err.message);
			})
			// save to file
			.save(savePath);
		

	}
	
};

