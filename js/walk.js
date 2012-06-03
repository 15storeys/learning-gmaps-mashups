var map, fullroute, geocoder, marker, ey, my, mouseDown = false;
var o = {
	init: function(){
		// in this place we call all needed functions
		this.map.init();
		this.northdowns.addDayMarkers();
		var route = this.northdowns.addRoutes();
		$.when(route).then(
		   // function(){ o.picasa.getAlbum('NorthDownsWay'); }
		);
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
			var albumUrl = 'https://picasaweb.google.com/data/feed/api/user/kris.coverdale@gmail.com/album/NorthDownsWay?imgmax=912&callback=?';
			$.getJSON(albumUrl, function(data) {
				
				var photos = [];
				$(data).find("entry").each(function()
				{
					var photo = [];
					
					// get image url
					photo[0] = $(this).children('content').attr("src");
					
					//get timedate taken
					photo[1] = $(this).children('gphoto\\:timestamp').html();
				
					// get caption
					photo[2] = $(this).children('summary').html();
					
					photos.push(photo);
					//get thumbnail urls
					//entry.media:group.thumbnail(s)
				});
		
				// Determine location on route for each photo that isn't geotagged
				var routePoint = 0;
				for(i = 0; i < photos.length; i++)
				{
					var photo = photos[i];
					photoTime = photo[1];

					photoTime = photoTime - 2000000 // TODO: camera time seems to be out.  Make this configurable later...
					
					// look for photo time value in full route array
					var latlong = [];
					latlong = o.picasa.binarySearch(photoTime);
					console.log('lat: ' + latlong[0]);
					console.log('lon: ' + latlong[1]);
				}
				
			});
			
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
	
	northdowns: {
		addDayMarkers: function (){
		
			var dayMarkers = [
				[51.211742,-0.79241, 0, 'Farnham', 'visited'],
				[51.224528,-0.577244, 1, 'Guildford','visited'],
				[51.248925,-0.324515, 2, 'Dorking','visited'],
				[51.263216,-0.078143, 3, 'Caterham','visited'],
				[51.313125,0.19666, 4, 'Otford','visited'],
				[51.373836,0.462005, 5, 'Cuxton', 'visited'],
				[51.29429,0.571461, 6, 'Detling', 'visited'],
				[51.213174,0.789814, 7, 'Charing', 'notvisited'],
				[51.185288,0.929246, 8, 'Wye', 'notvisited'],
				[51.081397,1.169456, 9, 'Folkestone', 'notvisited'],
				[51.126371,1.316198, 10, 'Dover', 'notvisited'],
				[51.280233,1.078909, 11, 'Canterbury','notvisited'],
				[51.186392,1.229855, 12, 'Shepherdswell','notvisited']
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
					"data/RK_gpx _2012-04-08_0905.gpx",
					"data/RK_gpx _2012-05-06_0931.gpx",
					"data/RK_gpx _2012-06-02_0947.gpx"];
			fullroute = [];
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
		} // end o.northdowns.plotRouteFromGpx
		
	}  // end o.northdowns
	
} // end o

$(document).ready(function () {
  o.init();
});
