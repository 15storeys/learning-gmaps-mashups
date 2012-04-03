var map, geocoder, marker, ey, my, mouseDown = false;
var o = {
	init: function(){
		// in this place we call all needed functions
		this.map.init();
	}, // end o.init
	
	twitter: {
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


	
	map: {
		size: function(){
			var w =$(window).width(),
			    h =$(window).height();
			return { width: w, height: h}
		},
		
		data: {
			zoom: 3,
			center: new google.maps.LatLng(52, 23),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		},
		
		init: function(){
			var size = o.map.size();
			$('#map').css({ width: size.width, height: size.height-100 });
			map = new google.maps.Map(document.getElementById('map'), o.map.data),
			geocoder = new google.maps.Geocoder();
			google.maps.event.addListener(map, 'dragstart', function(){
				$('.posts').hide();
			o.northdowns.addDayMarkers();
			});
			
			
		} 
	}, //end o.map

	northdowns: {
		addDayMarkers: function (){
			var myLatlng0 = new google.maps.LatLng(51.211742,-0.79241);
			var myLatlng1 = new google.maps.LatLng(51.224528,-0.577244);
			var myLatlng2 = new google.maps.LatLng(51.248925,-0.324515);
			var marker0 = new google.maps.Marker({
				position: myLatlng0, map: map, title:"Hello World!"
			});
			var marker1 = new google.maps.Marker({
				position: myLatlng1, map: map, title:"Hello World!"
			});
			var marker2 = new google.maps.Marker({
							position: myLatlng2, map: map, title:"Hello World!"
			});
		} // end o.northdowns.addDayMarkers
	}  // end o.northdowns
	
} // end o
$(function(){ o.init(); });

