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
var ytdl = require('ytdl-core');
var path = require('path');
var querystring = require('querystring');

var token

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

	download: function(req, res) {

		ytdl('https://www.youtube.com/watch?v=DK_0jXPuIr0')
  			.pipe(fs.createWriteStream('video.flv'));
	},

	upload: function(req, res) {
		var postData = querystring.stringify({
		  "snippet": {
		    "title": "My video title",
		    "description": "This is a description of my video",
		    "tags": ["cool", "video", "more keywords"],
		    "categoryId": 22
		  },
		  "status": {
		    "privacyStatus": "public",
		    "embeddable": 'True',
		    "license": "youtube"
		  }
		});

		var url = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadtype=resumable&part=snippet,status,contentDetails';

		request.post({
			url: url,
			headers: {
				'Authorization': 'Bearer ' + token,
				'Content-Type': 'application/json; charset=UTF-8',
	    		'Content-Length': postData.length
			},
			form: postData

		}, function(error, response, body){
			var json = JSON.parse(body);
			
			console.log(json)
			if (json.error != undefined && json.error.code == '401') {
				
				res.redirect('/authenticate');
			} 
		});
	},

	authenticate: function(req, res) {
		var clientId = '428722945070-ufq77f6bll8b225lvqd1t56fb5u83jtn.apps.googleusercontent.com';
		var params = "client_id="+ clientId +"&redirect_uri=http://localhost:1337/callback&scope=https://www.googleapis.com/auth/youtube&response_type=code&access_type=offline"
		
		var url = "https://accounts.google.com/o/oauth2/auth"

		return res.redirect(url + '?' + params);
	},

	callback: function(req, res) {
		var clientId = '428722945070-ufq77f6bll8b225lvqd1t56fb5u83jtn.apps.googleusercontent.com';

		var params = req.params.all();

		if (params.code != undefined) {

			var postData = querystring.stringify({
				code: params.code,
				client_id: clientId,
				client_secret: 'GCPxRVLGfNk0MAUpEptb7-aG',
				redirect_uri: 'http://localhost:1337/callback',
				grant_type: 'authorization_code'
			});

			request.post({
				url: 'https://accounts.google.com/o/oauth2/token',
				form: postData
			}, function(error, response, body){
				var json = JSON.parse(body);

				token = json.access_token;
				
				return res.redirect('/crawler/upload');
				
			});
		}
	}


};

