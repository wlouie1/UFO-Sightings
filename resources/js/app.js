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

DataManager.prototype.getReportsInRange = function(startDate, endDate) {
    let startTime = startDate.getTime();
    let endTime = endDate.getTime();

    return this._data.filter(function(d) {
        let time = d.datetime.getTime();
        return time > startTime && time < endTime;
    });
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

MapRenderer.prototype._renderMap = function(container) {
    var whenReadyResolve;
    let whenReadyPromise = new Promise(function(resolve, _) {
        whenReadyResolve = resolve;
    });

    let map = L.map(container.querySelector('.map'), {
        preferCanvas: true,
        zoomControl: false,
        maxBounds: [[-90,-180], [90, 180]],
        maxBoundsViscosity: 1.0,
        zoomSnap: 0.1,
        attributionControl: false
    }).on('load', whenReadyResolve);

    L.control.attribution({ position: 'topright' }).addTo(map);
    L.control.scale({ position: 'topright', maxWidth: 100 }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    
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
    this._reportsLayer = L.layerGroup().addTo(map);
    // this._reportsLayer = L.markerClusterGroup().addTo(map);
    // this._cityLayerMap = {};
    // this._heatLayer = L.heatLayer([], {radius: 25, blur: 15, gradient: {0: 'yellow', 1: 'red'}}).addTo(map);

    return whenReadyPromise;
};

MapRenderer.prototype._renderSelectionOverlay = function(container) {
    let self = this;
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;

    if (this._container == container) {
        this._svg.attr('width', containerWidth)
            .attr('height', containerHeight);
        return;
    }

    this._container = container;

    let overlay = container.querySelector('.map-overlay');

    this._svg = d3.select(overlay)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight);

    let selectionRadius = this._svg.append("ellipse")
        .attr('class', 'map-selection-radius');

    self._map.on('mouseover', function() {
        selectionRadius.classed('invisible', false);
        selectionRadius.classed('visible', true);
    });
    self._map.on('mousemove', function(event) {
        let xPos = event.containerPoint.x;
        let yPos = event.containerPoint.y;

        selectionRadius.attr('cx', xPos)
            .attr('cy', yPos)
            .attr('rx', 50)
            .attr('ry', 50);

    });
    self._map.on('mouseout', function() {
        selectionRadius.classed('visible', false);
        selectionRadius.classed('invisible', true);
    });
    self._map.on('click', function(event) {
        console.log(event);
    });

    return Promise.resolve();
};

MapRenderer.prototype.render = function(container) {
    let self =  this;

    // On window resize, rerender the svgs
    window.addEventListener('resize', function() {
        self._renderSelectionOverlay(container);
    });

    return Promise.all([
        this._renderMap(container),
        this._renderSelectionOverlay(container)
    ]);
};

MapRenderer.prototype.handleCurrentDateChange = function(event) {
    let self = this;

    let prevRenderDate = this._prevRenderDate != null ? this._prevRenderDate : this._dataManager.getData()[0].datetime;
    let currRenderDate = event.detail.value;

    if (currRenderDate.getTime() <= prevRenderDate.getTime()) {
        this._reportsLayer.clearLayers();
        prevRenderDate = this._dataManager.getData()[0].datetime;
    }
    let reports = this._dataManager.getReportsInRange(prevRenderDate, currRenderDate);

    this._prevRenderDate = currRenderDate;

    reports.forEach(function(report) {
        let marker = L.circleMarker([report.latitude, report.longitude], {
            radius: 4,
            stroke: false,
            fill: true,
            fillColor: '#d7ba7d',
            fillOpacity: 0.3,
            interactive: false
        });
        marker.addTo(self._reportsLayer);
    });
};

// ==================================================

function TimelineRenderer(dataManager) {
    this._dataManager = dataManager;
    this._intervalsPerSecond = 24;

    let data = this._dataManager.getData();
    this._startDate = this._getSnapToInterval(data[0].datetime, 'ceil');
    this._endDate = this._getSnapToInterval(data[data.length - 1].datetime, 'floor');
    this._timeInterval = 1000 * 60 * 60 * 24 * 30; // month
    this._currentDate = this._startDate;
}

TimelineRenderer.prototype._renderChart = function(container) {
    if (this._container == container) {
        this._svg.remove();
        this._verticalSeekLine = null;
        this._rangeSeekIndicator = null;
    }

    this._container = container;

    let dayData = this._dataManager.getDayData();

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

    this._svg.append('text')
        .attr('x', 10)
        .attr('y', containerHeight - 5)
        .attr('alignment-baseline', 'baseline')
        .text('Number of Reports by Day')
        .attr('class', 'timeline-desc-text');
};

TimelineRenderer.prototype._renderPlayer = function() {
    let self = this;

    this._controlBtn = this._container.querySelector('.timeline-control-btn');
    this._controlBtnIcon = this._container.querySelector('.timeline-control-icon');

    this._controlBtn.addEventListener('click', function() {
        if (self._playInterval) {
            self.stop();
        } else {
            self.play();
        }
    });
};

TimelineRenderer.prototype._renderTooltip = function(date) {
    let xPos = this._xScale(date);

    let year = date.getFullYear();
    let yearMap = this._dataManager.getYearMap();
    let containerWidth = this._container.clientWidth;

    let seekTooltip = this._container.querySelector('.seek-tooltip');
    if (seekTooltip.classList.contains('invisible')) {
        seekTooltip.classList.remove('invisible');
        seekTooltip.classList.add('visible');
    }

    let seekTooltipContent = this._container.querySelector('.seek-tooltip .tooltip-content-container');
    let seekTooltipArrow = this._container.querySelector('.seek-tooltip .tooltip-arrow');
    let seekTooltipl1 = this._container.querySelector('.seek-tooltip-l1');
    let seekTooltipl2 = this._container.querySelector('.seek-tooltip-l2');
    seekTooltipl1.innerHTML = 'Year: ' + year;
    seekTooltipl2.innerHTML = 'Reports: ' + this._dataManager.getReports(new Date(year, 0), yearMap).length;
    // CUMULATIVE REPORTS?

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

TimelineRenderer.prototype.setCurrentDate = function(date, forceFireEvent) {
    let self = this;
    let prevDate = this._currentDate;
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

    if (prevDate == this._currentDate) {
        return clipped;
    }

    this._renderTimeIndicator(this._currentDate);

    let shouldFireEvent = prevDate.getFullYear() != this._currentDate.getFullYear();

    if (forceFireEvent || shouldFireEvent) {
        let currentDateChangeEvent = new CustomEvent("currentDateChange", {
            bubbles: true,
            detail: {
                previousValue: prevDate,
                value: self._currentDate
            }
        });
    
        this._container.dispatchEvent(currentDateChangeEvent);
    }

    return clipped;
};

TimelineRenderer.prototype.setToEndDate = function() {
    this.setCurrentDate(this._endDate, true);
};

TimelineRenderer.prototype.play = function() {
    let self = this;

    this._controlBtnIcon.classList.remove('fa-play');
    this._controlBtnIcon.classList.add('fa-pause');

    if (this._currentDate.getTime() == this._endDate.getTime()) {
        this._currentDate = this._startDate;
    }

    // this._playInterval = requestInterval(function() {
    this._playInterval = setInterval(function() {
        let clipped = self.setCurrentDate(new Date(self._currentDate.getTime() + self._timeInterval));
        if (clipped) {
            self.stop();
        }
    }, 1000 / this._intervalsPerSecond);
};

TimelineRenderer.prototype.stop = function() {
    this._controlBtnIcon.classList.remove('fa-pause');
    this._controlBtnIcon.classList.add('fa-play');

    if (this._playInterval != null) {
        // clearRequestInterval(this._playInterval);
        clearInterval(this._playInterval);
    }
    this._playInterval = null;
};

TimelineRenderer.prototype.render = function(container) {
    let self = this;

    this._renderChart(container);
    this._renderPlayer();

    // On window resize, rerender the svgs
    window.addEventListener('resize', function() {
        self._renderChart(container);
        self.setCurrentDate(self._currentDate);
    });

    return Promise.resolve();
};

// ==================================================

function VisualizationManager(dataManager) {
    this._dataManager = dataManager;
    this._mapRenderer = new MapRenderer(dataManager);
    this._timelineRenderer = new TimelineRenderer(dataManager);
}

VisualizationManager.prototype.render = function(container, mapContainer, timelineContainer) {
    let self = this;
    this._container = container;

    this._renderPromise = Promise.all([
        this._mapRenderer.render(mapContainer),
        this._timelineRenderer.render(timelineContainer)
    ]).then(function() {
        self._timelineRenderer.setToEndDate();
    });

    timelineContainer.addEventListener('currentDateChange', this._mapRenderer.handleCurrentDateChange.bind(this._mapRenderer));
    // timelineContainer.addEventListener('currentDateChange', function (event) {
    //     let mapDrawUpdate = function () {
    //         self._mapRenderer.handleCurrentDateChange.bind(self._mapRenderer)(event);
    //     };
    //     window.requestAnimationFrame(mapDrawUpdate);
    // });

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
    let mapContainer = document.querySelector('.map-container');
    let timelineContainer = document.querySelector('.timeline-container');
    let vizManager = new VisualizationManager(dataManager);
    await vizManager.render(vizContainer, mapContainer, timelineContainer);

    // Fade out/remove loading screen and fade in visualization
    await loadingRenderer.remove();
    await vizManager.show();

    // Start playing the map through time
    // vizManager.play();
}


// ========== Main ==========

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
} else {
    render();
}