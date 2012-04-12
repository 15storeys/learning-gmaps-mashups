var map, geocoder, marker, ey, my, mouseDown = false;
var o = {
	init: function(){
		// in this place we call all needed functions
		this.map.init();
		this.northdowns.addDayMarkers();
		this.northdowns.addRoutes();
	}, // end o.init
	
/*	twitter: {
		getTwitterUser: function() {
			var users = o.twitter.getEnteredUser();
			o.twitter.rate_limit_status_callback(function(remaining) {
				if (remaining > 10) {
					o.twitter.show(users);
				}
				else {
					alert ('Twitter request limited exceeded');
				}
			});
			
		},
		
		getTwitterUserFriends: function() {
			var user = $('.enteruser').find('input').val();
			if (user != ""){
				o.twitter.rate_limit_status_callback(function(remaining) {
					if (remaining > 10) {
						var friendsurl = 'http://api.twitter.com/1/friends/ids.json?&screen_name='+encodeURIComponent(user)+'&callback=?';
						$.getJSON(friendsurl, function(data) {
							//use data.ids to call users function to then retrieve more data
							var usersurl = 'http://api.twitter.com/1/users/lookup.json?user_id='+data.ids+'&include_entities=true&callback=?';
							$.getJSON(usersurl, function(data) {
								// create markers and do other stuff with these objects
								console.log ('user follows '+data.length+' people');
								// TODO add paging for retriving blocks of 100 accounts
								if (data.length < 100) {
									for (i in data) {
										var user = data[i];
										o.twitter.addMarker(user);
									}
								}
								
							});
						});
					}
					else {
						alert ('Twitter request limited exceeded');
					}
				});
			}
		},
		

		addMarker: function(user)
		{
			var img = user.profile_image_url,
			    screen_name = user.screen_name;
			geocoder.geocode({ address: user.location }, function(response, status){
				if (status == google.maps.GeocoderStatus.OK) {
					var x = response[0].geometry.location.lat(),
					    y = response[0].geometry.location.lng();
					console.log('geocode ok ' + screen_name + ' '  + user.location);    
					// Create marker on map, with twitter photo
					marker = new google.maps.Marker({
						icon: img,
						map: map,
						title: screen_name,
						position: new google.maps.LatLng(x,y)
					}); // end of marker
					
					google.maps.event.addListener(marker, 'click', function(){
						// when marker is clicked, call our twitter.open
						o.twitter.open(this.title);
					});// end of marker click listener
				}	
				else
				{
					console.log('geocode bad ' + screen_name + ' '  + user.location);    
				}
		    	}); // end of geocode function
		},
		
		getEnteredUser: function() {
			var arr = new Array();
			arr[0] = $('.enteruser').find('input').val();
			return arr;
		},
		
		rate_limit_status_callback: function(callback){
			// called by functions before they run
			$.getJSON('http://api.twitter.com/1/account/rate_limit_status.json?callback=?', function(data) {
				remaining = data.remaining_hits;
				callback(remaining);
			});
		},
		
		rate_limit_status: function() {
			// called directly from link on webpage
			var remamining;
			$.getJSON('http://api.twitter.com/1/account/rate_limit_status.json?callback=?', function(data) {
				remaining = data.remaining_hits;
				alert('remaining = ' + remaining);
			});
		},
		
		show: function(users) {
			for (i in users){
				var user = users[i];
				$.getJSON('http://twitter.com/users/show/'+user+'.json?callback=?', function(data) {
					var img = data.profile_image_url,
					    screen_name = data.screen_name;
					// TODO refactor this to use the addMarker function to avoid repeating code
					geocoder.geocode({ address: data.location }, function(response, status){
						if (status == google.maps.GeocoderStatus.OK) {
							var x = response[0].geometry.location.lat(),
							    y = response[0].geometry.location.lng();

							// Create marker on map, with twitter photo
							marker = new google.maps.Marker({
								icon: img,
								map: map,
								title: screen_name,
								position: new google.maps.LatLng(x,y)
							}); // end of marker
						
							google.maps.event.addListener(marker, 'click', function(){
								// when marker is clicked, call our twitter.open
								o.twitter.open(this.title);
							});// end of marker click listener
						} // end of geocode success block
					}); // end of geocode function
				}); // end of getJSON function		
			} // iterate users
			
		}, // end of twitter.show function
		
		click: function() {
			$('.twitter').find('.open').live('click', function() {
				var t = $(this), rel= t.attr('rel');
				o.twitter.open(rel);
			});
		}, // end of twitter.click function
		
		open: function(user) {
			var posts =$('.posts'), arr = new Array;
			$.getJSON('http://twitter.com/status/user_timeline/'+user+'.json?count=5&callback=?', function(data) {
				$.each(data, function(i, post) {
					arr.push('<div class="post">');
					arr.push(post.text);
					arr.push('</div>');					
				}); // end each post loop
				var html = arr.join('');
				posts.html(html).fadeIn();
			});// end of getJSON function
		} // end of twitter.open function
		
	}, // end of o.twitter

*/
	
	map: {
		size: function(){
			var w =$(window).width(),
			    h =$(window).height();
			return { width: w, height: h}
		},
		
		data: {
			zoom: 9,
			center: new google.maps.LatLng(51.263216,-0.078143),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		},
		
		init: function(){
			var size = o.map.size();
			$('#map').css({ width: size.width, height: size.height-100 });
			map = new google.maps.Map(document.getElementById('map'), o.map.data),
			geocoder = new google.maps.Geocoder();
			google.maps.event.addListener(map, 'dragstart', function(){
				$('.posts').hide(); 
			});
			
			
		} 
	}, //end o.map

	northdowns: {
		addDayMarkers: function (){
		
			var dayMarkers = [
				[51.211742,-0.79241, 0, 'Farnham', 'visited'],
				[51.224528,-0.577244, 1, 'Guildford','visited'],
				[51.248925,-0.324515, 2, 'Dorking','visited'],
				[51.263216,-0.078143, 3, 'Caterham','visited'],
				[51.313125,0.19666, 4, 'Otford','visited'],
				[51.373836,0.462005, 5, 'Cuxton', 'notvisited'],
				[51.265057,0.627851, 6, 'Hollingbourne', 'notvisited'],
				[51.185288,0.929246, 7, 'Wye', 'notvisited'],
				[51.081397,1.169456, 8, 'Folkestone', 'notvisited'],
				[51.126371,1.316198, 9, 'Dover', 'notvisited'],
				[51.280233,1.078909, 10, 'Canterbury','notvisited'],
				[51.186392,1.229855, 11, 'Shepherdswell','notvisited']
			];
			

			for (i = 0; i < dayMarkers.length; i++) {
				var dayMarker = dayMarkers [i]
				var myLatlng = new google.maps.LatLng(dayMarker[0], dayMarker[1]);
				// red marker if visited, blue if yet to visit
				if (dayMarker[4] == 'visited'){
					var marker = new google.maps.Marker({
						position: myLatlng, 
						map: map, 
						title: dayMarker[3]});	
				}
				else {
					var marker = new google.maps.Marker({
						position: myLatlng, 
						map: map, 
						title: dayMarker[3],
						icon: "http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png"});	
				}
			} 
			
		}, // end o.northdowns.addDayMarkers
		
		addRoutes: function() {
			var gpxRoutes = ["data/RK_gpx _2011-11-26_1039.gpx",
					"data/RK_gpx _2012-03-24_0955.gpx",
					"data/RK_gpx _2012-03-31_0921.gpx",
					"data/RK_gpx _2012-04-08_0905.gpx"];
		
			for (i = 0; i < gpxRoutes.length; i++) {
				this.addRoute(gpxRoutes[i]);
			}
		},
		
		addRoute: function(filename) {
			 $.ajax({
			    type: "GET",
			    url: filename,
			    dataType: "xml",
			    success: this.plotRouteFromGpx,
			    error: function(xmlReq, status, errorMsg){
				console.log("Error Message: "+ errorMsg);
				console.log("Status: "+ status);
				console.log(xmlReq.responseText);

				throw(errorMsg);
			    }
  			}); 
  			
			
		}, // end o.northdowns.addRoute
		
		plotRouteFromGpx: function(xml) {

			var coordinates = [];

			// Loop through co-ords in GPX and plot onto map
			$(xml).find("trkpt").each(function()
			{
				coordinates.push(new google.maps.LatLng($(this).attr("lat"), $(this).attr("lon")));
			});
		
			  var route = new google.maps.Polyline({
			    path: coordinates,
			    strokeColor: "#FF0000",
			    strokeOpacity: 1.0,
			    strokeWeight: 3
			  });

			  route.setMap(map);
		} // end o.northdowns.plotRouteFromGpx
		
	}  // end o.northdowns
	
} // end o

$(document).ready(function () {
  o.init();
});
