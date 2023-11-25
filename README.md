# Summary

This program is a combination of https://github.com/JuliaLind/TripGenerator and https://github.com/JuliaLind/TokenGenerator. 

It uses https://openrouteservice.org API for auto-generating a number of consequent routes (end point for route n = start point for route n+1) for electric bikes, which takes into consideration obstacles and any polygons to avoid defined by yourself. See file /cities/1.json as where city.coords and city.forbidden are required.

Your generated routes will be saved to /bike-routes with one .json file per bike and also a csv file with the intial starting point of each bike. 

Besides the route coordinates each route also contains a unique user id and a JWT token with expirey period of 365 days. The default payload consist of userid which is an integer and a role attribute "user", but it can easily be set to anything.

This is useful for simulation where each trip initiation requires user authentication.

The repo also contains a simple web application where you can view the generated routes on a map. Select or unselect the routes to view using checkboxes in the menu on the left. Note that if zoomed out a lot it may look like the markers are overlapping the restricted zones, zoom in for more precise view.


# Getting started

```npm install``` to install all neccessary dependencies

Create a .env file in the root of your directory.

Register on and login to https://openrouteservice.org to get a token. 

Add your token to the .env like so:
```TOKEN = "yourtoken" ``` where you replace ```yourtoken```with the actual token you get from OpenRouteService.


Add a "jwt-secret" to your .env file, it could be any string and can look like this:

```JWT_SECRET = "5d9e0b327c674d279771aed90ad876165d9e0b327c674d279771aed90ad87616"``` This is also the secret used for the example data that is currently in the ./bike-routes/ directory

In order to generate mock trips stand in the root directory and run the script with ```node main.js```.

The token is automatically renewed after 24 h which means that the first time you start the script after 24hours may not work, in which case just run it again :)

In order to start the web application where you can see the generated routes on the map, stand in the root directory and enter ```python3 -m http.server 9000``` and then visit localhost:9000 in your browser.

The following attributes are variable and can be set by yourself in the src/tripgenerator.js model:
- cityid: the id of the document with geometrydata you want to use for city zones and forbidden zones within the city
- number of bikes to generate routes for
- number of routes to generate per bike
- minimum distance between start point and end point of each route in meters (birdway)
- maximum distance between start point and end point of each route in meters (birdway)
- if the end point of the last route should be the same as start point of first route (for each bike, comes in handy if you want to loop through same sequence several times), default is 'false'

Values for cityid and number of bikes can also be passed via commandline in the following order ```node main.js <cityid> <bikes>```, where ```cityid``` it the id of the document with geometrydata you want to use for city zones and forbidden zones within the city, and  ```bikes``` is the number of bikes you want to generate routes for. 

The bike-routes folder is prefilled with dummy-data. In the directory reset/ you can find a bash script that removes all previously generated routes and resets counters for userid and bikeid to zero. When starting the script with ```./reset.bash``` you will be prompted to confirm if you really wish to reset. You can confirm with any of Y | y | Yes | yes

# Good to know

Make sure to include the area(s) right outside of city borders into the list of forbidden zones, otherwise the routes may go outside of the zone.

Note that OpenRoutService has a request limitation on free of charge account which currently is limited at 40 requests per minute (2000 requests per day).



