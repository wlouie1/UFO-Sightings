const DATA_PATH = 'resources/data/ufo_sightings.csv';
const MIN_LOADING_MS = 1000;

// ========== Data Utilities ==========

function loadData() {
    return d3.csv(DATA_PATH);
}


// ========== Render Utilities ==========

function getLoadingContainerElem() {
    return document.querySelector('.loading-container');
}


function getVizContainerElem() {
    return document.querySelector('.viz-container');
}


function renderLoading() {
    // Should already be set up in HTML and CSS
    return new Promise(function(resolve, _) {
        setTimeout(resolve, MIN_LOADING_MS);
    });
}


function removeLoading() {
    var whenReadyResolve;
    let whenReadyPromise = new Promise(function(resolve, _) {
        whenReadyResolve = resolve;
    });

    let loadingContainer = getLoadingContainerElem();
    loadingContainer.addEventListener('transitionend', function() {
        loadingContainer.parentNode.removeChild(loadingContainer);
        whenReadyResolve();
    });

    loadingContainer.classList.remove('visible');
    loadingContainer.classList.add('invisible');

    return whenReadyPromise;
}


function renderMap(data) {
    return new Promise(function(resolve, _) {
        setTimeout(resolve, 2000);
    });
}


function renderViz(data) {
    return Promise.all([
        renderMap(data)
    ]);
}


function showViz() {
    var whenReadyResolve;
    let whenReadyPromise = new Promise(function(resolve, _) {
        whenReadyResolve = resolve;
    });

    let vizContainer = getVizContainerElem();
    vizContainer.addEventListener('transitionend', whenReadyResolve);

    // vizContainer.classList.remove('hidden');
    vizContainer.classList.remove('invisible');
    vizContainer.classList.add('visible');

    return whenReadyPromise;
}


async function render() {
    // Show loading screen, and fetch the data
    let [_, data] = await Promise.all([renderLoading(), loadData()]);

    // Render visualization behind the loading screen
    _ = await renderViz(data);

    // Once everything is rendered,
    // fade out/remove the loading screen
    // fade in visualization
    _ = await removeLoading();
    _ = await showViz();

    // Start playing the map through time
    console.log(data);
}


// ========== Main ==========

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
} else {
    render();
}