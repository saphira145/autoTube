/**
 * CrawlerController
 *
 * @description :: Server-side logic for managing crawlers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var apiKey = 'AIzaSyBWYb1hZluSQ6oBq1XSigNASqYMOC1KAHg';
var url = 'https://www.googleapis.com/youtube/v3/';
var async = require('async');
var ejs = require('ejs');
var fs = require('fs');
var moment  = require('moment');
var request = require('request');

var path = require('path');
var querystring = require('querystring');
var ytdl = require('ytdl-core');

module.exports = {

	getVideos: function(req, res) {
		var params = req.params.all();

		var searchUrl = url + 'search?part=snippet&maxResults=10&order=viewCount&type=video&videoDuration=short&key=' + apiKey;

		if (params.pageToken != undefined) {
			searchUrl += '&pageToken=' + params.pageToken;
		}

		if (params.searchKey != undefined) {
			searchUrl += '&q=' + params.searchKey;
		}

		if (params.startDate != undefined && params.startDate.trim() != '') {
		
			var date = params.startDate + 'T00:00:00Z';
			searchUrl += '&publishedAfter=' + date;
		}
		var result = [];

		Video.search(searchUrl)
			.then(function (data) {
				result = data;

				Video.addInformation(result.collection)
					.then(function (collection) {
						
						return res.json({status: 1, data: collection, nextPage: result.nextPage, prevPage: result.prevPage});
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

		var fs = require('fs');
		var youtubedl = require('youtube-dl');

		var output = videoId + '.mp4';

		var downloaded = 0;
		if (fs.existsSync(output)) {
	  		downloaded = fs.statSync(output).size;
		}

		var video = youtubedl('http://www.youtube.com/watch?v='+ videoId,
		  // Optional arguments passed to youtube-dl.
		  ['--format=18'],
		  // Additional options can be given for calling `child_process.execFile()`.
		  { start: downloaded, cwd: __dirname });

		// Will be called when the download starts.
		video.on('info', function(info) {
		  	console.log('downloading')
		});

		video.pipe(fs.createWriteStream(videoId + '.mp4', { flags: 'a' }));

		video.on('complete', function complete(info) {
		  	console.log('filename: ' + info._filename + ' already downloaded.');
	   		Video.upload(videoId);

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

