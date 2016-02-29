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
	}


};

