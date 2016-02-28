/**
* Video.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var Q = require('q');
module.exports = {

	attributes: {

		search: function(req, res) {
		
			var searchUrl = url + 'search?part=snippet&maxResults=50&order=viewCount&type=video&videoDuration=short&fields=items&key=' + apiKey;
			
			Youtube.search(searchUrl, function(err, result) {
				if (err) console.log(err);

			
				var videoIds = [];
				var items = result.items;

				for (var index in items) {
					videoIds.push(items[index].id.videoId);
				}
				
				res.json({status: 1, videoIds: videoIds});
			});
			
		}
	}
};

