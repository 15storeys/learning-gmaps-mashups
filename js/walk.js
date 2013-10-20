var map, fullroute, geocoder, marker, ey, my, mouseDown = false;
var o = {
	init: function(){
		// in this place we call all needed functions
		this.map.init();
		//this.picasa.getAlbum('NorthDownsWay');
	}, // end o.init
	
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

	picasa: {
		 getAlbum: function(albumName) {
			var albumUrl = 'https://picasaweb.google.com/data/feed/api/user/kris.coverdale@gmail.com/album/EffinghamJunctionToDorkingViaPolesdenLacey?imgmax=912&callback=?';
			$.getJSON(albumUrl, function(data) {
				
				var photos = [];
				var i = 1
				$(data).find("entry").each(function()
				{
					var photo = [];
					
					// get image url
					photo[0] = $(this).children('content').attr("src");
					console.log(photo[0]);
					console.log(i);
					i++;
					//get timedate taken
					photo[1] = $(this).children('gphoto\\:timestamp').html();
				    console.log(photo[1]);
					// get caption
					photo[2] = $(this).children('summary').html();
					console.log(photo[2]);
					photos.push(photo);
					//get thumbnail urls
					//entry.media:group.thumbnail(s)
				});
		
				// Determine location on route for each photo that isn't geotagged
				var routePoint = 0;
				for(i = 0; i < photos.length; i++)
				{
					var photo = photos[i];
					var img = photo[0];
					photoTime = photo[1];
					console.log('time from photo: ' + photoTime);
					photoTime = photoTime - 7220000 /*2000000 */ // TODO: camera time seems to be out.  Make this configurable later...
					
					// look for photo time value in full route array
					var latlong = [];
					latlong = o.picasa.binarySearch(photoTime);
					console.log('lat: ' + latlong[0]);
					console.log('lon: ' + latlong[1]);
					console.log('time: ' + photoTime);
					var myLatlng = new google.maps.LatLng(latlong[0], latlong[1]);
					marker = new google.maps.Marker({
						/*icon: img,*/
						icon: new google.maps.MarkerImage(img, null, null, null, new google.maps.Size(128, 128)),
						position: myLatlng, 
						map: map,
						title: photo[2]
						})
					google.maps.event.addListener(marker, 'click', function(){
						// when marker is clicked, call our twitter.open
						//alert(this.title);
						if (this.getAnimation() != null) {
							this.setAnimation(null);
						} 
						else {
							this.setAnimation(google.maps.Animation.BOUNCE);
						}
					});// end of marker click listener
						
					console.log(i);
				}
				
			});
			
			function toggleBounce() {
				if (marker.getAnimation() != null) {
					marker.setAnimation(null);
				} 
				else {
					marker.setAnimation(google.maps.Animation.BOUNCE);
				}
			}
			
		}, // end o.picasa.getAlbum 
		
		unixtime: function (timestamp) {
			var myDate = new Date(timestamp);
			return myDate.getTime();
		},
		
		binarySearch: function (value) {
			var latlong = [];
			var startIndex = 0;
			var stopIndex = fullroute.length - 1;
			var middle = Math.floor((stopIndex + startIndex)/2);
			
			while(!(o.picasa.unixtime(fullroute[middle][2]) < value && o.picasa.unixtime(fullroute[middle+1][2]) >= value) && startIndex < stopIndex){
			
				//adjust search area
				if (value < o.picasa.unixtime(fullroute[middle][2])){
				    stopIndex = middle - 1;
				} else if (value > o.picasa.unixtime(fullroute[middle][2])){
				    startIndex = middle + 1;
				}

				//recalculate middle
				middle = Math.floor((stopIndex + startIndex)/2);
			}
			
			    //make sure it's the right value
			//return (items[middle] != value) ? -1 : middle;
			latlong [0] = fullroute[middle][0];
			latlong [1] = fullroute[middle][1];
			return latlong;
		}
	},//end o.picasa 
	
	walk: {
		displayWalk: function (routeid) {
			this.addDayMarkers(routeid);
			var route = this.addRoutes(routeid);
			$.when(route).then(
			   function(){ o.picasa.getAlbum('NorthDownsWay'); }
			   //function() {alert ("route loaded");}
			);
		}, // end o.walk.displayWalk

		addDayMarkers: function (routeid) {
			$.ajax({
			    type: "GET",
			    url: "data/" + routeid + "/markers.xml",
			    dataType: "xml",
			    success: this.addDayMarkersFromXML,
			    error: function(xmlReq, status, errorMsg){
				console.log("Error Message: "+ errorMsg);
				console.log("Status: "+ status);
				console.log(xmlReq.responseText);

				throw(errorMsg);
			    }
  			}); 
		}, // end o.walk.addDayMarkers		
	
		addDayMarkersFromXML: function(xml) {
			$(xml).find("marker").each(function()
			{		
				var myLatlng = new google.maps.LatLng($(this).children('lat').text(), $(this).children('lng').text());
				// red marker if visited, blue if yet to visit
				
				if ($(this).children('visited').text() == 'visited'){
					var marker = new google.maps.Marker({
						position: myLatlng, 
						map: map, 
						title: $(this).children('label').text()});	
				}
				else {
					var marker = new google.maps.Marker({
						position: myLatlng, 
						map: map, 
						title: $(this).children('label').text(),
						icon: "http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png"});	
				}
			});
		}, // end o.walk.addDayMarkersFromXML	

		addRoutes: function(routeid) 
		{
			$.getJSON("getroutes.php?routeid="+routeid, function(data) {
				fullroute = [];
				$(data).each(function()
				{
					o.walk.addRoute(this.filename);	
				});
			});
			
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
  			
			
		}, // end o.walk.addRoute
		
		plotRouteFromGpx: function(xml) {

			var coordinates = [];

			// Loop through co-ords in GPX and plot onto map
			$(xml).find("trkpt").each(function()
			{
				// for polyline
				coordinates.push(new google.maps.LatLng($(this).attr("lat"), $(this).attr("lon")));
			
				// store in global variable to use for photo placement later
				var gpx = [$(this).attr("lat"), $(this).attr("lon"), $(this).children('time').text()];
				fullroute.push(gpx);
			});
		
			  var route = new google.maps.Polyline({
			    path: coordinates,
			    strokeColor: "#FF0000",
			    strokeOpacity: 1.0,
			    strokeWeight: 3
			  });

			  route.setMap(map);
		} // end o.walk.plotRouteFromGpx
		
	}  // end o.walk
	
} // end o

$(document).ready(function () {
  o.init();
});
