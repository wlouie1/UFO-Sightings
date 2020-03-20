'use strict';
// TODO: Use ES6 Classes instead

const DATA_PATH = 'resources/data/ufo_sightings.csv';

// ========== Data Utilities ==========

function DataManager(dataPath) {
    this.dataPath = dataPath;
}

DataManager.prototype._loadData = function() {
    let self = this;

    return d3.csv(this.dataPath, function(d) {
        d.datetime = new Date(d.datetime);
        d.duration_seconds = parseFloat(d.duration_seconds);
        d.latitude = parseFloat(d.latitude);
        d.longitude = parseFloat(d.longitude);
        d.date_documented = new Date(d.date_documented);
        return d;
    }).then(function(data) {
        self._data = data.sort(function(a, b) {
            return a.datetime - b.datetime;
        });
        return self._data;
    });
};

DataManager.prototype.loadAndProcessData = function () {
    return this._loadData();
};

DataManager.prototype.getData = function() {
    return this._data;
};


// ========== Render Utilities ==========

function LoadingRenderer(dataManager) {
    this._dataManager = dataManager;
    this._minLoadingTime = 1000; // milliseconds
}

LoadingRenderer.prototype.render = function(container) {
    let self = this;
    this._container = container;

    // Loading screen already defined in HTML and CSS
    // Ensure loading time is at least _minLoadingTime
    this._renderPromise = new Promise(function(resolve, _) {
        setTimeout(resolve, self._minLoadingTime);
    });

    return this._renderPromise;
};

LoadingRenderer.prototype.remove = function() {
    var whenReadyResolve;
    let whenReadyPromise = new Promise(function(resolve, _) {
        whenReadyResolve = resolve;
    });

    // Removal is complete after removal animation ends
    let loadingContainer = this._container;
    loadingContainer.addEventListener('transitionend', function() {
        loadingContainer.parentNode.removeChild(loadingContainer);
        whenReadyResolve();
    });

    // Make sure remove only happens after render complete
    return this._renderPromise.then(function() {
        loadingContainer.classList.remove('visible');
        loadingContainer.classList.add('invisible');
        return whenReadyPromise;
    });
};

// ==================================================

function MapRenderer(dataManager) {
    this._dataManager = dataManager;
}

MapRenderer.prototype.render = function(container) {
    var whenReadyResolve;
    let whenReadyPromise = new Promise(function(resolve, _) {
        whenReadyResolve = resolve;
    });

    let map = L.map(container, {
        zoomControl: false,
        maxBounds: [[-90,-180], [90, 180]],
        maxBoundsViscosity: 1.0,
        zoomSnap: 0.1
    }).on('load', whenReadyResolve)
    
    let urlTemplate = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
    let options = {
        attribution: '&copy; ' + 
                    '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' +
                    ' contributors &copy; ' +
                    '<a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        noWrap: true,
        bounds: [[-90,-180], [90,180]]
    };

    let CartoDB_DarkMatterNoLabels = L.tileLayer(urlTemplate, options);
    CartoDB_DarkMatterNoLabels.addTo(map);

    map.setView([24, 0], 2.8);
    // map.setView([0, 0], 2);

    this._map = map;

    return whenReadyPromise;
};

// ==================================================

function TimelineRenderer(dataManager) {
    this._dataManager = dataManager;
}

TimelineRenderer.prototype.render = function(container) {
    return Promise.resolve();
};

// ==================================================

function VisualizationManager(dataManager) {
    this._dataManager = dataManager;
    this._mapRenderer = new MapRenderer(dataManager);
    this._timelineRenderer = new TimelineRenderer(dataManager);
}

VisualizationManager.prototype.render = function(container, mapContainer, timelineContainer) {
    this._container = container;

    this._renderPromise = Promise.all([
        this._mapRenderer.render(mapContainer),
        this._timelineRenderer.render(timelineContainer)
    ]);

    return this._renderPromise;
};

VisualizationManager.prototype.show = function() {
    var whenReadyResolve;
    let whenReadyPromise = new Promise(function(resolve, _) {
        whenReadyResolve = resolve;
    });

    let vizContainer = this._container;
    vizContainer.addEventListener('transitionend', whenReadyResolve);

    // Make sure show only happens after render complete
    return this._renderPromise.then(function() {
        vizContainer.classList.remove('invisible');
        vizContainer.classList.add('visible');
        return whenReadyPromise;
    });
};

// ==================================================

async function render() {
    let dataManager = new DataManager(DATA_PATH);
    let loadingRenderer = new LoadingRenderer(dataManager);

    // Show loading screen
    let loadingContainer = document.querySelector('.loading-container');
    loadingRenderer.render(loadingContainer);

    // Fetch and process data
    await dataManager.loadAndProcessData();

    // Render visualization behind loading screen
    let vizContainer = document.querySelector('.viz-container');
    let mapContainer = document.querySelector('#map');
    let timelineContainer = document.querySelector('timeline-container');
    let vizManager = new VisualizationManager(dataManager);
    await vizManager.render(vizContainer, mapContainer, timelineContainer);

    // Fade out/remove loading screen and fade in visualization
    await loadingRenderer.remove();
    await vizManager.show();

    // Start playing the map through time
    console.log(dataManager.getData());
}








// function loadData() {
//     return d3.csv(DATA_PATH, function(d) {
//         d.datetime = new Date(d.datetime);
//         d.duration_seconds = parseFloat(d.duration_seconds);
//         d.latitude = parseFloat(d.latitude);
//         d.longitude = parseFloat(d.longitude);
//         d.date_documented = new Date(d.date_documented);
//         return d;
//     }).then(function(data) {
//         return data.sort(function(a, b) {
//             return a.datetime - b.datetime;
//         });
//     });
// }


// function groupByDay(data) {
//     let dayMap = {};
//     let days = [];

//     for (let i = 0; i < data.length; i++) {
//         let day = new Date(data[i].datetime.toDateString());
//         if (dayMap[day] != null) {
//             dayMap[day].reports.push(data[i]);
//         } else {
//             dayMap[day] = { day: day, reports: [ data[i] ] };
//             days.push(day);
//         }
//     }

//     let groupedData = days.map(function(day) {
//         return dayMap[day];
//     });

//     return { data: groupedData, map: dayMap };
// }


// function getReports(day, dayMap) {
//     if (dayMap[day] == null) {
//         return [];
//     }
//     return dayMap[day].reports;
// }

// // ========== Render Utilities ==========

// function getLoadingContainerElem() {
//     return document.querySelector('.loading-container');
// }


// function getVizContainerElem() {
//     return document.querySelector('.viz-container');
// }


// function renderLoading() {
//     // Should already be set up in HTML and CSS
//     return new Promise(function(resolve, _) {
//         setTimeout(resolve, MIN_LOADING_MS);
//     });
// }


// function removeLoading() {
//     var whenReadyResolve;
//     let whenReadyPromise = new Promise(function(resolve, _) {
//         whenReadyResolve = resolve;
//     });

//     let loadingContainer = getLoadingContainerElem();
//     loadingContainer.addEventListener('transitionend', function() {
//         loadingContainer.parentNode.removeChild(loadingContainer);
//         whenReadyResolve();
//     });

//     loadingContainer.classList.remove('visible');
//     loadingContainer.classList.add('invisible');

//     return whenReadyPromise;
// }


// function getMapInstance() {
//     return document.querySelector('#map')._leaflet_map;
// }


// function renderMap(data) {
//     var whenReadyResolve;
//     let whenReadyPromise = new Promise(function(resolve, _) {
//         whenReadyResolve = resolve;
//     });

//     let map = L.map('map', {
//         zoomControl: false,
//         maxBounds: [[-90,-180], [90, 180]],
//         maxBoundsViscosity: 1.0,
//         zoomSnap: 0.1
//     }).on('load', whenReadyResolve)

//     document.querySelector('#map')._leaflet_map = map;
    
//     let urlTemplate = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
//     let options = {
//         attribution: '&copy; ' + 
//                     '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' +
//                     ' contributors &copy; ' +
//                     '<a href="https://carto.com/attributions">CARTO</a>',
//         subdomains: 'abcd',
//         maxZoom: 19,
//         noWrap: true,
//         bounds: [[-90,-180], [90,180]]
//     };

//     let CartoDB_DarkMatterNoLabels = L.tileLayer(urlTemplate, options);
//     CartoDB_DarkMatterNoLabels.addTo(map);

//     map.setView([24, 0], 2.8);
//     // map.setView([0, 0], 2);
    
//     return whenReadyPromise;
// }


// function renderTimeline(dayGroup) {
//     let dayData = dayGroup.data;
//     let dayMap = dayGroup.map;

//     let container = document.querySelector('.timeline-container');
//     let containerWidth = container.clientWidth;
//     let containerHeight = container.clientHeight;

//     let xScale = d3.scaleTime()
//         .domain(d3.extent(dayData, d => d.day))
//         .range([0, containerWidth]);

//     let yScale = d3.scaleLinear()
//         .domain([0, d3.max(dayData, d => d.reports.length)])
//         .range([containerHeight, 0]);
    
//     let svg = d3.select(container)
//         .append('svg')
//         .attr('width', containerWidth)
//         .attr('height', containerHeight);

//     let chartG = svg.append('g');

//     let line = d3.line()
//         .x(d => xScale(d.day))
//         .y(d => yScale(d.reports.length));
    
//     chartG.append('path')
//         .attr('class', 'timeline-chart-line')
//         .attr('d', line(dayData));

//     let timeAxisG = chartG.append('g');

//     let timeAxis = d3.axisBottom(xScale).ticks(10);
//     timeAxisG.attr('class', 'timeline-chart-axis')
//         .call(timeAxis);

//     // let glassPane = svg.append("rect")
//     //     .attr('x', 0)
//     //     .attr('y', 0)
//     //     .attr('width', containerWidth)
//     //     .attr('height', containerHeight)
//     //     .attr('class', 'timeline-chart-glasspane');
    
//     // let verticalSeekLine = svg.append('line')
//     //     .attr('x1', 0)
//     //     .attr('y1', 0)
//     //     .attr('x2', 0)
//     //     .attr('y2', containerHeight)
//     //     .attr('class', 'timeline-chart-seekline invisible');

//     // let seekTooltip = document.querySelector('.seek-tooltip');
//     // let seekTooltipContent = document.querySelector('.seek-tooltip .tooltip-content-container');
//     // let seekTooltipArrow = document.querySelector('.seek-tooltip .tooltip-arrow');
//     // let seekTooltipl1 = document.querySelector('.seek-tooltip-l1');
//     // let seekTooltipl2 = document.querySelector('.seek-tooltip-l2');

//     // glassPane.on('mouseenter', function() {
//     //     verticalSeekLine.attr('class', 'timeline-chart-seekline visible');
//     //     seekTooltip.classList.remove('invisible');
//     //     seekTooltip.classList.add('visible');
//     // }).on('mousemove', function() {
//     //     var xPos = d3.mouse(this)[0];
//     //     // console.log(d3.mouse(this))
//     //     // console.log(xScale.invert(xPos));
//     //     verticalSeekLine.attr("x1", xPos)
//     //         .attr('x2', xPos);

//     //     let dayString = xScale.invert(xPos).toDateString();
//     //     seekTooltipl1.innerHTML = dayString;
//     //     seekTooltipl2.innerHTML = getReports(new Date(dayString), dayMap).length + ' Reports';

//     //     let tooltipHalfWidth = seekTooltipContent.clientWidth / 2;
//     //     if (xPos < tooltipHalfWidth) {
//     //         seekTooltipContent.style.left = '0px';
//     //     } else if (xPos > containerWidth - tooltipHalfWidth) {
//     //         seekTooltipContent.style.left = (containerWidth - seekTooltipContent.clientWidth) + 'px'
//     //     } else {
//     //         seekTooltipContent.style.left = (xPos - tooltipHalfWidth) + 'px';
//     //     }
//     //     seekTooltipArrow.style.left = (xPos - 8) + 'px';
//     // }).on('mouseleave', function() {
//     //     verticalSeekLine.attr('class', 'timeline-chart-seekline invisible');
//     //     seekTooltip.classList.remove('visible');
//     //     seekTooltip.classList.add('invisible');
//     // });
// }


// // function renderControls(data) {
// //     return renderTimeline(data);
// // }


// function renderViz(data) {
//     let dayGroup = groupByDay(data);
//     return Promise.all([
//         renderMap(data),
//         renderTimeline(dayGroup)
//     ]);
// }


// function showViz() {
//     var whenReadyResolve;
//     let whenReadyPromise = new Promise(function(resolve, _) {
//         whenReadyResolve = resolve;
//     });

//     let vizContainer = getVizContainerElem();
//     vizContainer.addEventListener('transitionend', whenReadyResolve);

//     vizContainer.classList.remove('invisible');
//     vizContainer.classList.add('visible');

//     return whenReadyPromise;
// }


// async function render() {
//     // In parallel:
//     // Show loading screen, fetch the data and make sure it's date sorted
//     let [_, data] = await Promise.all([renderLoading(), loadData()]);
//     data.sort(function(a, b) {
//         return a.datetime - b.datetime;
//     });

//     // Render visualization behind the loading screen
//     _ = await renderViz(data);

//     // Once everything is rendered,
//     // fade out/remove the loading screen
//     // fade in visualization
//     _ = await removeLoading();
//     _ = await showViz();

//     // Start playing the map through time
//     console.log(data);
// }


// ========== Main ==========

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
} else {
    render();
}