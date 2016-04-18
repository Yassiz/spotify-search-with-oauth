$(document).ready(function(){
	// Get access token
	var tokenMatches = window.location.hash.match(/access_token=(.*)&token_type=*/);
	if (tokenMatches) {
		var access_token = tokenMatches[1];
		//console.log(access_token);
		window.sessionStorage.setItem("spotify_access_token", access_token);
	}
	var source = $("#track-template").html();
	var trackTemplate = Handlebars.compile(source);
	
	//index.html page actions
	if ($("#page_id").val() === "index") {
		//Get all tracks based on search title
		$("#search_track").on("submit", function(event){
			event.preventDefault();
			var track_title = encodeURIComponent($("#search").val());
			$.ajax({
				url: "https://api.spotify.com/v1/search?q="+track_title+"&type=track",
				type: "GET",
				success: function(results) {
					$("#song-container").html('');
					console.log(results.tracks.items[0].name);
					if(results.tracks.items){
						var result_arr = results.tracks.items;
						result_arr.forEach(function (element) {
							//console.log(element.name);
							var element = {
								name: element.name,
								artist: element.artists[0].name,
								image: element.album.images[0].url,
								preview_url: element.preview_url,
								album_name: element.album.name,
								id: element.id
							};
							$("#song-container").append(trackTemplate(element));
						});
						
					}
					else {
						alert('Please enter a valid title!');
						$("#search_track")[0].reset();
					}
				},
				error: function() {
					alert("Error!");
				}
			});
		});

		//Save tracks
		$(document).on("click", "#save_track", function(e) {
			e.preventDefault();
			var ids = $(this).val();
			$.ajax({
				url: "https://api.spotify.com/v1/me/tracks?ids=" +ids,
				headers: {
					"Content-Type" : "application/json",
					"Authorization": "Bearer " + 
					window.sessionStorage.getItem("spotify_access_token")
				},
				type: "PUT",
				success: function(results) {
					console.log('Track was saved');
					$("."+ids+"").html('Track Saved!');
					$("."+ids+"").prop("disabled",true);
				},
				error: function() {
					alert("Error Saving!");
				}
			});
		});
	}

	//saved.html page actions
	if ($("#page_id").val() === "saved") {
		$.ajax({
			type: "GET",
			url: "https://api.spotify.com/v1/me/tracks",
			headers: {
				"Authorization": "Bearer " + 
				window.sessionStorage.getItem("spotify_access_token")
			},
			success: function (results) {
				if(results.items){
					var saved_arr = results.items;
					saved_arr.forEach(function (element) {
						//console.log(element.name);
						var element = {
							name: element.track.name,
							artist: element.track.artists[0].name,
							image: element.track.album.images[0].url,
							preview_url: element.track.preview_url,
							album_name: element.track.album.name,
							id: element.track.id
						};
						$("#song-container").append(trackTemplate(element));
					});
				}
				else {
					alert('Looks like you do not have any saved tracks yet!');
				}
			},
			error: function () {
				alert('cannot get tracks!');
			}
		});

		//remove track
		$(document).on("click", "#remove_track", function(e) {
			e.preventDefault();
			var ids = $(this).val();
			console.log(ids);
			$.ajax({
				url: "https://api.spotify.com/v1/me/tracks?ids=" +ids,
				headers: {
					"Content-Type" : "application/json",
					"Authorization": "Bearer " + 
					window.sessionStorage.getItem("spotify_access_token")
				},
				type: "DELETE",
				success: function(results) {
					console.log('Track was removed');
					//hide it!
					$("#"+ids+"").hide('slow');
				},
				error: function() {
					alert("Error removing!");
				}
			});
		});
	}
	//if one song plays, pause the others  ?? fix
	
	//$('audio').each(function() {
	//	var song = $(this);
	//	if(song.paused){
	//		song.play();
	//	} else {
	//	song.pause();
	//	}
	//});
});
