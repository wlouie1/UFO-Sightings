# A4-UFO-Sightings
Explore over 80K reports of UFO sightings around the world, collected from 1906 - 2014! The underlying dataset was scraped, geolocated, and time standardized from the National UFO Reporting Center (NUFORC) database, and hosted [here](https://github.com/planetsig/ufo-reports) by Sigmond Axel. I performed further cleaning and web scraping from the [NUFORC database](http://www.nuforc.org/webreports.html) to enhance the final dataset; see [Dataset](#dataset) section, and [process_data.py](resources/data/process_data.py) and [process_data_part2.py](resources/data/process_data_part2.py) for details.

The interactive map is [here](https://github.mit.edu/pages/6894-sp20/A4-UFO-Sightings/). I've only tested it on Desktop Chrome with mouse interaction.

## Design Rationale
### Layout
This is a dataset of UFO sighting reports, so the basic components are time, location, and report details. As such, these can be presented visually by a timeline, a map, and interactive markers respectively. I feel a natural progression of exploration would be for one to zero in on a region of interest first, and then to go through the details of each sighting reported in the region, so I decided to build a giant interactive map, with subsequent user interactions revealing the details of the sighting reports. The timeline, map, and reports panel components are always synced up.

### Visual Encodings

#### Map Markers
There are over 80K number of reports in the dataset, each with a specific geographical location. My choices are to either have each report be represented as a single point on the map, or to employ some form of clustering strategy. I tried clustering by distance, but the clusters seemed random and uninterpretable (a cluster would consist of points from many different cities). I also tried clustering by city, but that's very difficult because the city designation as supplied by the dataset is very noisy (e.g. even though two reports are from New York City, they're labeled as "NYC" and "New York, Brooklyn", and it's very hard to programmatically tell that they're referring to the same city). Since I want the exploratory interaction to be report centric, I ultimately decided to represent each report as a point on the map. Due to the large density of points, I did not encode any information in the marker size as that would induce more overlaps and confusion. To help the user get a sense of the density and overlap, I set a low opacity to each of the points, such that if points do overlap, the opacity appears to be higher. I also chose the color yellow to contrast the dark map theme.

Upon mouse hover (described in [Mouse Hover over Map Reports](#mouse-hover-over-map-reports) section), I colored the report markers within the hover circle green to distinguish them from the yellow ones. Once selected, I render a pink marker on the currently viewed report (the marker's icon shows the reported UFO shape). The specific choice of colors 'green' and 'pink' to represent 'focused' and 'selected' states respectively is purely due to personal aesthetic preferences. I made sure to use the same color encoding in the Timeline area, where  the selected reports' dates are represented by vertical lines, colored green or pink accordingly.

#### Timeline Chart
Rather than just showing a time axis, I chose to render an area chart in the timeline, with the x-axis representing dates, and the y-axis representing the number of reports. This gives the user an extra view of the volume of reports over time. Again, the colors are chosen based on what looks good to me.

### Interaction

#### Initial Load
Due to the large dataset size, the initial data load may take some time, depending on internet speed (it takes ~30 seconds for me). As such, I implemented a loading screen to let the user know.

#### Mouse Hover over Map Reports
Each yellow marker on the map represents a single sightings report. Due to the density and overlap of the markers, it's difficult to hover/select an exact report. My solution is to give the user a hover region--a circle that allows them to select all reports within that circle. The circle's radius is fixed at all zoom levels, to give the user control on the density of reports they want to include in the hover region. A tooltip is also shown above the circle to give the user information on the timespan, number of reports, and the circle's geo-distance span (i.e. what the circle's radius cover in earth distance; note that the earth distance is position dependent and only approximate despite the fixed circle radius, due to distortions from the map projection).

#### Mouse Click to Select and Navigate Reports
Once the user hovers over a set of reports they're interested in exploring more, the user can click to select them. A panel is then revealed to allow the user to dig deeper--the panel shows a particular report's detail, and the user can navigate to other reports chronologically using the navigation buttons at the bottom of the panel. Note that both the Map and Timeline components update with the selection information--a pink marker (with the reported UFO shape) is shown on the map to pinpoint the current report (the others in selection are green), and the corresponding report dates are reflected on the Timeline via vertical lines, colored by the same pink (the current report) or green (other reports in selection).

#### Map Zoom and Pan
One can either use the mouse scroll wheel/trackpad, or the zoom controls on the top right of the map to zoom in and out of the map. One can also drag the map to pan. As alluded to above in the [Mouse Hover over Map Reports](#mouse-hover-over-map-reports) section, zooming and panning interactions are useful to the user to limit the number of reports selectable by the hover circle.

#### Timeline Play and Pause
One can also get a feel of the number of reports around the world over time, by hitting the play button above the timeline. When the play button is pressed, a red vertical line moves along the timeline to indicate the current date, and points are populated on the map in real time. The visualization title's time range at the top left corner is also updated. Because there are so many days in the range, and the speed can't be too slow for adequate user experience, it's not feasible to show the tooltip information at the day resolution. Instead, I chose to have the tooltip show the number of reports at the year resolution--a transparent rectangular reference area is also shown to make this clearer.

### Animation
#### Loading Screen to Visualization Transition
I initially implemented a simple loading screen with just the static text "Loading...". However I find that adding a loading indicator makes the user experience better. After the background load and initial rendering is complete, I fade out the loading screen and fade in the visualization.

#### Reports Panel Reveal Animation
As described in [Mouse Click to Select and Navigate Reports](#mouse-click-to-select-and-navigate-reports), when the user selects a region of interest, the reports panel shows up to show the details of the selected reports. I tried several animation strategies (e.g. combinations of either sliding in or fading in the reports panel, and either keeping the map in place or panning the map to make room for the panel, or no animation at all). No matter what, the reports panel takes up space and may block the selected region, and I find it least disruptive if the map pans to keep the selected region in view. Animation is necessary to mitigate this disruptive view transition. I ultimately went with sliding in + fading in the panel + panning the map, and the inverse for when the panel is closed.

#### Timeline Play Animation
Another place where animation is used is the timeline play. The animation is described in the [Timeline Play and Pause](#timeline-play-and-pause) section. The animation speed is experimentally chosen to be moderate enough for users to be able to glance at the time indicator tooltip and map. I experimented with applying fade in animations to the markers as they appear on the map, but I ultimately eliminated animations entirely due to performance issues and because the animation doesn't add much.

## Development Process
### Work Distribution
As the sole member of this project, every aspect was completed by yours truly.

### Schedule Breakdown
The task and time breakdown is roughly as follows (total time spent is ~148 hours):

1. Data processing (~2 hours): This involves date sanitation, location sanitation, and writing scripts to perform web scraping (using Python) from the NUFORC database to obtain full report text (refer to the [Dataset](#dataset) section for more details).
2. Exploratory data analysis (~6 hours): This involves plotting in Jupyter notebook + Python.
3. Visual design (~5 hours): This overlaps with Interaction design and Development below, and involves playing with various layouts on paper, and trying them out in code.
4. Interaction design (~10 hours): This overlaps with Visual design and Development, and involves a lot of brainstorming and trying things out in code. Oftentimes, ideas end up being janky, too complicated to implement, or not performant when implemented in code.
5. Development (~125 hours): Around 20% the time is spent trying out and throwing out visual/interaction ideas in code, 40% of the time is spent debugging, and the remaining 40% of the time is spent on solid development that made it to the final product. Development also includes time spent on trying to optimize the page for better performance--due to the large number of points present when zoomed out, the hover (especially searching for points underneath the hover circle and coloring them green) and pan interactions become sluggish. To mitigate this, I employed several techniques, including using D3's quadtree implementation to perform efficient search for points within the hover circle (one particular challenge was with correctly mixing geo latitude and longitude values with screen cartesian values), and making the Leaflet map use HTML5 Canvas rather than SVG to render the markers.

## Resources
Any code and resources borrowed are cited throughout the codebase in comments. In addition to third-party tools and data used, they're explicitly outlined below:

### Dataset
* [Geocoded NUFORC Data 1906 - 2014](resources/data/ufo_sightings_original.csv): This is the basis for the final data used in this visualization. This dataset was scraped, geolocated, and time standardized from NUFORC data, and hosted [here](https://github.com/planetsig/ufo-reports) by Sigmond Axel. However, this dataset does not contain the full text of the sighting reports.

* [nuforc_events.csv](https://github.com/khturner/nuforc_data/blob/master/): This is the result of another attempt at NUFORC database scraping by Keith Turner. The data is available [here](https://data.world/khturner/national-ufo-reporting-center-reports), and the code he used to generate the data is [here](https://github.com/khturner/nuforc_data/blob/master/). This dataset not only does not contain the full text of the sighting reports, but also does not contain geo location data. However, unlike the dataset above, this one contains the web links to the reference NUFORC database for each report, which contains the full report texts.

* [nuforc_reports.csv](https://data.world/timothyrenner/ufo-sightings): This data is the result of yet another attempt at NUFORC database scraping by Timothy Renner. The data is available [here](https://data.world/timothyrenner/ufo-sightings), and the code he used to generate the data is [here](https://github.com/timothyrenner/nuforc_sightings_data). This dataset contains almost all the fields desired (full report text, original report links, and geo location data), but the data is much more limited than the first dataset, and consists of reports mostly just from the United States and Canada.

In short, I want a dataset consisting of all the information from the first dataset, plus the full text of the sighting reports. To this end, I wrote and executed [process_data.py](resources/data/process_data.py) and [process_data_part2.py](resources/data/process_data_part2.py) to combine the three datasets, and web scraped the [NUFORC database](http://www.nuforc.org/webreports.html) for the remaining unresolved reports for full text.

The final cleaned and processed dataset used is [ufo_sightings_final.csv](resources/data/ufo_sightings_final.csv).

### Third Party Tools
* [D3 (version 5)](https://github.com/d3/d3): For the data loading, quadtree implementation for efficient nearest neighbor search (for identifying reports on the map within a certain radius from the mouse position), and everything SVG related (i.e. the timeline chart component rendering).
* [Leaflet (version 1.6.0)](https://leafletjs.com/): For the map markers rendering, and map interactions such as panning and zooming.
* [Leaflet Providers](https://github.com/leaflet-extras/leaflet-providers) via [CartoDB](https://carto.com/attribution/): For the dark themed map tiles.
* [Leaflet Extra Markers](https://github.com/coryasilva/Leaflet.ExtraMarkers): For rendering custom markers showing the corresponding UFO shape as reported in the selected report.

### Miscellaneous Resources
* [Inconsolata Font](https://fonts.google.com/specimen/Inconsolata): For the monospace font used throughout the visualization.
* [Alien Favicon](https://favicon.io/emoji-favicons/alien-monster/): For the page's favicon (browser tab icon).
* [Icons8 Icons](https://icons8.com/icons): For showing the UFO shape on map markers upon selection. The specific attributions are displayed on the bottom of the visualization reports panel upon selection of map markers.
* [Loading Indicator](https://loading.io/css/): For the HTML and CSS ripple animation for the indicator in the loading screen.
* [Stars Background Images](https://dellsystem.me/posts/night-sky-css): For the background star images in the loading screen.
* [Thematic Break CSS](https://css-tricks.com/examples/hrs/): The CSS was not used directly verbatim, but served as a starting point for the thematic break shown in the reports panel of the visualization.
* [StackOverflow Solution](https://stackoverflow.com/a/52112155): This solution from a StackOverflow user is used to determine the locale of the user's browser, used for date formatting.