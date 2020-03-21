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

DataManager.prototype._groupBy = function(dateComponent) {
    let dMap = {};
    let ds = [];

    for (let i = 0; i < this._data.length; i++) {
        let month = this._data[i].datetime.getMonth();
        let day = this._data[i].datetime.getDate();
        let year = this._data[i].datetime.getFullYear();

        let d;
        switch (dateComponent) {
            case 'year':
                d = new Date(year, 0);
                break;
            case 'day':
                d = new Date(year, month, day);
                break;
        }
        // let d = new Date(this._data[i].datetime.toDateString());
        if (dMap[d] != null) {
            dMap[d].reports.push(this._data[i]);
        } else {
            dMap[d] = { date: d, reports: [ this._data[i] ] };
            ds.push(d);
        }
    }

    let groupedData = ds.map(function(d) {
        return dMap[d];
    });

    return { data: groupedData, map: dMap };
};

DataManager.prototype.loadAndProcessData = function () {
    let self = this;

    return this._loadData().then(function() {
        let dayGroup = self._groupBy('day');
        self._dayData = dayGroup.data;
        self._dayMap = dayGroup.map;

        let yearGroup = self._groupBy('year');
        self._yearData = yearGroup.data;
        self._yearMap = yearGroup.map;
    });
};

DataManager.prototype.getData = function() {
    return this._data;
};

DataManager.prototype.getDayData = function() {
    return this._dayData;
};

DataManager.prototype.getDayMap = function() {
    return this._dayMap;
};

DataManager.prototype.getYearData = function() {
    return this._yearData;
};

DataManager.prototype.getYearMap = function() {
    return this._yearMap;
};

DataManager.prototype.getReports = function(dateComponent, dateCompMap) {
    if (dateCompMap[dateComponent] == null) {
        return [];
    }
    return dateCompMap[dateComponent].reports;
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
    this._intervalsPerSecond = 12;

    let data = this._dataManager.getData();
    this._startDate = this._getSnapToInterval(data[0].datetime, 'ceil');
    this._endDate = this._getSnapToInterval(data[data.length - 1].datetime, 'floor');
    this._timeInterval = 1000 * 60 * 60 * 24 * 30; // month
    this._currentDate = this._startDate;
}

TimelineRenderer.prototype._renderChart = function(container) {
    this._container = container;

    let dayData = this._dataManager.getDayData();
    // let dayMap = this._dataManager.getDayMap();

    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;

    this._xScale = d3.scaleTime()
        .domain(d3.extent(dayData, d => d.date))
        .range([0, containerWidth])
        .clamp(true);

    this._yScale = d3.scaleLinear()
        .domain([0, d3.max(dayData, d => d.reports.length)])
        .range([containerHeight, 0]);
    
    this._svg = d3.select(container)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight);

    let chartG = this._svg.append('g');

    let line = d3.line()
        .x(d => this._xScale(d.date))
        .y(d => this._yScale(d.reports.length));
    
    chartG.append('path')
        .attr('class', 'timeline-chart-line')
        .attr('d', line(dayData));

    let timeAxisG = chartG.append('g');

    let timeAxis = d3.axisBottom(this._xScale).ticks(10);
    timeAxisG.attr('class', 'timeline-chart-axis')
        .call(timeAxis);
};

TimelineRenderer.prototype._renderPlayer = function(container) {

};

TimelineRenderer.prototype._renderTooltip = function(date) {
    let xPos = this._xScale(date);

    let year = date.getFullYear();
    let yearMap = this._dataManager.getYearMap();
    let containerWidth = this._container.clientWidth;

    let seekTooltip = document.querySelector('.seek-tooltip');
    if (seekTooltip.classList.contains('invisible')) {
        seekTooltip.classList.remove('invisible');
        seekTooltip.classList.add('visible');
    }

    let seekTooltipContent = document.querySelector('.seek-tooltip .tooltip-content-container');
    let seekTooltipArrow = document.querySelector('.seek-tooltip .tooltip-arrow');
    let seekTooltipl1 = document.querySelector('.seek-tooltip-l1');
    let seekTooltipl2 = document.querySelector('.seek-tooltip-l2');
    seekTooltipl1.innerHTML = 'Year: ' + year;
    seekTooltipl2.innerHTML = 'Reports: ' + this._dataManager.getReports(new Date(year, 0), yearMap).length;

    let tooltipHalfWidth = seekTooltipContent.clientWidth / 2;
    if (xPos < tooltipHalfWidth) {
        seekTooltipContent.style.left = '0px';
    } else if (xPos > containerWidth - tooltipHalfWidth) {
        seekTooltipContent.style.left = (containerWidth - seekTooltipContent.clientWidth) + 'px'
    } else {
        seekTooltipContent.style.left = (xPos - tooltipHalfWidth) + 'px';
    }
    seekTooltipArrow.style.left = (xPos - 8) + 'px';
};

TimelineRenderer.prototype._renderTimeIndicator = function(date) {
    if (!this._rangeSeekIndicator) {
        let containerHeight = this._container.clientHeight;

        this._rangeSeekIndicator = this._svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this._xScale(new Date('Dec 31, 2000')) - this._xScale(new Date('Jan 01, 2000')))
            .attr('height', containerHeight)
            .attr('class', 'timeline-chart-seekrange');
    }
    if (!this._verticalSeekLine) {
        let containerHeight = this._container.clientHeight;
        
        this._verticalSeekLine = this._svg.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', containerHeight)
            .attr('class', 'timeline-chart-seekline');
    }

    let xYearPos = this._xScale(new Date('Jan 01,' + date.getFullYear()));
    this._rangeSeekIndicator.attr('x', xYearPos);

    let xPos = this._xScale(date);
    this._verticalSeekLine.attr("x1", xPos)
        .attr('x2', xPos);

    this._renderTooltip(date);
};

TimelineRenderer.prototype._getSnapToInterval = function(date, direction) {
    let dayStartTime = new Date(date.toDateString()).getTime();
    if (direction === 'floor' || date.getTime() === dayStartTime) {
        return new Date(dayStartTime);
    }
    return new Date(dayStartTime + this._timeInterval);
}

TimelineRenderer.prototype._setCurrentDate = function(date) {
    let clipped = false;
    if (date.getTime() < this._startDate.getTime()) {
        this._currentDate = this._startDate;
        clipped = true;
    } else if (date.getTime() > this._endDate.getTime()) {
        this._currentDate = this._endDate;
        clipped = true;
    } else {
        this._currentDate = this._getSnapToInterval(date, 'ceil');
    }

    this._renderTimeIndicator(this._currentDate);

    return clipped;
};

TimelineRenderer.prototype.play = function() {
    let self = this;

    this._playInterval = setInterval(function() {
        let clipped = self._setCurrentDate(new Date(self._currentDate.getTime() + self._timeInterval));
        if (clipped) {
            self.stop();
        }
    }, 1000 / this._intervalsPerSecond);
};

TimelineRenderer.prototype.stop = function() {
    if (this._playInterval != null) {
        clearInterval(this._playInterval);
    }
    this._playInterval = null;
};

TimelineRenderer.prototype.render = function(container) {
    this._renderChart(container);
    this._renderPlayer(container);

    return Promise.resolve();
};

// HANDLE WINDOW RESIZE

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

VisualizationManager.prototype.play = function() {
    this._timelineRenderer.play();
}

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
    let timelineContainer = document.querySelector('.timeline-container');
    let vizManager = new VisualizationManager(dataManager);
    await vizManager.render(vizContainer, mapContainer, timelineContainer);

    // Fade out/remove loading screen and fade in visualization
    await loadingRenderer.remove();
    await vizManager.show();

    // Start playing the map through time
    vizManager.play();
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