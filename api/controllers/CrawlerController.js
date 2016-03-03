/**
 * CrawlerController
 *
 * @description :: Server-side logic for managing crawlers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var config = sails.config.mainConfig;

var url = 'https://www.googleapis.com/youtube/v3/';
var async = require('async');

var fs = require('fs');
var moment  = require('moment');
var ytdl = require('ytdl-core');
var token;
var querystring = require('querystring');
var request = require('request')

module.exports = {

	getVideos: function(req, res) {
		var params = req.params.all();
		var getParam = {
			part: 'snippet', 
			maxResults: 10, 
			order: 'viewCount', 
			type: 'video', 
			// videoDuration: 'short',
			key: config.api_key
		};

		if (params.pageToken != undefined) {
			getParam.pageToken = params.pageToken;
		}

		if (params.searchKey != undefined) {
			getParam.q = params.searchKey;
		}

		if (params.startDate != undefined && params.startDate.trim() != '') {
			var date = params.startDate + 'T00:00:00Z';
			getParam.publishedAfter = date;
		}

		if (params.videoDuration != undefined && params.videoDuration.trim() != '') {
			getParam.videoDuration = params.videoDuration;
		}

		Crawler.request('search', getParam)
			.then(function(result) {

				var items = result.items;
				var collection = [];

				for (var index in items) {
					collection.push({
						videoId: items[index].id.videoId, 
						channelId : items[index].snippet.channelId, 
						thumbnail: items[index].snippet.thumbnails.default.url,
						published_at: moment(items[index].snippet.publishedAt).format('YYYY-MM-DD')
					});
				}

				Video.addInformation(collection)
					.then(function (collection) {
						
						return res.json({status: 1, data: collection, nextPage: result.nextPageToken, prevPage: result.prevPageToken});
					})
					.catch (function (err) {
						console.log(err)
						return res.json({status: 0, message: 'Server error'});
					})				
			})
			.catch(function (err) {
				console.log(err);
				return res.json({status: 0, message: 'Server error'});
			})
	},

	upload: function(req, res) {
		var params = req.params.all();
		var videoId = params.id;

		var stream = Video.download(videoId);

		Video.getVideoInfo(videoId)
			.then(function(info) {
				
				stream.on('close', function() {
					console.log('start uploading....');
					Video.upload(videoId, info, function(err, data) {
						if (err) {
							return res.json({status: 0, message: 'Cannot upload'});
						}

						return res.json({status: 1, message: 'Upload successfully'});
					});
				})
			})
			.catch(function (err) {
				return res.json({status: 0, message: 'Api error'});
			});
	}	













	// upload: function(req, res) {
	// 	var postData = querystring.stringify({
	// 	  "snippet": {
	// 	    "title": "My video title",
	// 	    "description": "This is a description of my video",
	// 	    "tags": ["cool", "video", "more keywords"],
	// 	    "categoryId": 22
	// 	  },
	// 	  "status": {
	// 	    "privacyStatus": "public",
	// 	    "embeddable": 'True',
	// 	    "license": "youtube"
	// 	  }
	// 	});

	// 	var url = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadtype=resumable&part=snippet,status,contentDetails';
	// 	if (token != undefined) return res.json(token)
	// 	request.post({
	// 		url: url,
	// 		headers: {
	// 			'Authorization': 'Bearer ' + token,
	// 			'Content-Type': 'application/json; charset=UTF-8',
	//     		'Content-Length': postData.length,
	//     		'X-Upload-Content-Length': '3000000',
	// 			'X-Upload-Content-Type': 'video/*'
	// 		},
	// 		form: postData

	// 	}, function(error, response, body){
	// 		var json = JSON.parse(body);
			
	// 		console.log(json)
	// 		if (json.error != undefined && json.error.code == '401') {
				
	// 			res.redirect('/authenticate');
	// 		} 
	// 	});
	// },

	// authenticate: function(req, res) {
	// 	var clientId = '428722945070-ufq77f6bll8b225lvqd1t56fb5u83jtn.apps.googleusercontent.com';
	// 	var params = "client_id="+ clientId +"&redirect_uri=http://localhost:1337/callback&scope=https://www.googleapis.com/auth/youtube&response_type=code&access_type=offline"
		
	// 	var url = "https://accounts.google.com/o/oauth2/auth"

	// 	return res.redirect(url + '?' + params);
	// },

	// callback: function(req, res) {
	// 	var clientId = '428722945070-ufq77f6bll8b225lvqd1t56fb5u83jtn.apps.googleusercontent.com';

	// 	var params = req.params.all();

	// 	if (params.code != undefined) {

	// 		var postData = querystring.stringify({
	// 			code: params.code,
	// 			client_id: clientId,
	// 			client_secret: 'GCPxRVLGfNk0MAUpEptb7-aG',
	// 			redirect_uri: 'http://localhost:1337/callback',
	// 			grant_type: 'authorization_code'
	// 		});

	// 		request.post({
	// 			url: 'https://accounts.google.com/o/oauth2/token',
	// 			form: postData
	// 		}, function(error, response, body){
	// 			var json = JSON.parse(body);
	// 			console.log(json)
	// 			token = json;
				
	// 			return res.redirect('/crawler/upload');
				
	// 		});
	// 	}
	// }



	


};

