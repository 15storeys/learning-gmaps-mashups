<?php
   	$routeid = htmlspecialchars($_GET["routeid"]);
	switch ($routeid) {
	    case 1:
	       $routes = array(
			array('filename' => "data/1/RK_gpx _2011-11-26_1039.gpx"),
			array('filename' => "data/1/RK_gpx _2012-03-24_0955.gpx"),
			array('filename' => "data/1/RK_gpx _2012-03-31_0921.gpx"),
			array('filename' => "data/1/RK_gpx _2012-04-08_0905.gpx"),
			array('filename' => "data/1/RK_gpx _2012-05-06_0931.gpx"),
			array('filename' => "data/1/RK_gpx _2012-06-02_0947.gpx"),
			array('filename' => "data/1/RK_gpx _2012-06-05_0910.gpx")
			);
		break;
	    case 2:
 		$routes = array(
			array('filename' => "data/2/RK_gpx _2011-08-20_1133.gpx"),
			array('filename' => "data/2/RK_gpx _2011-08-21_0954.gpx"),
			array('filename' => "data/2/RK_gpx _2011-08-22_0914.gpx"),
			array('filename' => "data/2/RK_gpx _2011-08-23_0903.gpx"),
			array('filename' => "data/2/RK_gpx _2011-08-24_0915.gpx"),
			array('filename' => "data/2/RK_gpx _2011-08-25_0914.gpx"),
			array('filename' => "data/2/RK_gpx _2011-08-26_0922.gpx"),
			array('filename' => "data/2/RK_gpx _2011-08-27_0950.gpx")
			);
		break;
	    default:
		break;
	}
 	
	echo json_encode($routes);

?>
