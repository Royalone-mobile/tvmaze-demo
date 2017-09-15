;
let TVShowsModule = (function () {
  'use strict';
  
  let tvShows;
  
  /**
   * Renders blocks of all data.
   * @callback _cbShowAllData
   * @param {String} responseText
   * @returns void
   */
  let _cbShowAllData = function(responseText) {
    tvShows = JSON.parse(responseText) || [];
    
    let renderTVShows = renderBlockOfData(tvShows);
    renderTVShows();
    _scrollHandler(renderTVShows);
    
    let allGenres = _getAllGenres(tvShows);
    _renderListOfGenres(allGenres);
    
  };
  
  /**
   * Logs a message.
   * @callback _cbShowMessage
   * @param {String} message
   * @returns void
   */
  let _cbShowMessage = function(message) {
    let content = document.querySelector('.message');
    let p = document.createElement('p');
    let text = document.createTextNode(message);
    p.appendChild(text);
    content.appendChild(p);
  };
  
  /**
   * Renders blocks of data found.
   * @callback _cbShowDataFound
   * @param {String} responseText
   * @returns void
   */
  let _cbShowDataFound = function(responseText, searchStr) {
    tvShows = JSON.parse(responseText) || [];
    
    let allGenres = _getAllGenres(tvShows);
    _renderListOfGenres(allGenres);
    
    let tvShowsFound = [];
    
    if (/\w/.test(searchStr)) {
      let reg = new RegExp(searchStr.toLowerCase(), 'i');
      
      tvShowsFound = tvShows.filter(function(tvShow) {
        return !!(~tvShow.name.search(reg));
      });

    } else {
      _cbShowMessage('No match for the request');
    }
    
    if (tvShowsFound.length) {
      let renderTVShows = renderBlockOfData(tvShowsFound);
      renderTVShows();
      _scrollHandler(renderTVShows);
    } else {
      _cbShowMessage('No match for the request');
    }
  };
  
  /**
   * Renders blocks of filtered data.
   * @callback _cbShowFilteredData
   * @param {String} responseText
   * @returns void
   */
  let _cbShowFilteredData = function(responseText, filterStr) {
    tvShows = JSON.parse(responseText) || [];
    
    let allGenres = _getAllGenres(tvShows);
    _renderListOfGenres(allGenres);
    
    let tvShowFiltered = [];
    
    tvShowFiltered = tvShows.filter(function(tvShow) {
      return !!(~tvShow.genres.indexOf(filterStr));
    });
    
    if (tvShowFiltered.length) {
      let renderTVShows = renderBlockOfData(tvShowFiltered);
      renderTVShows();
      _scrollHandler(renderTVShows);
    } else {
      _cbShowMessage('No match for the request');
    }
  };
  
  /**
   * Initializes the module.
   * @returns void
   */
  let init = function () {
    const url = 'http://api.tvmaze.com/shows';
    
    let queryStr = window.location.search;
    
    if (queryStr === '') {
      getRestData(url, _cbShowAllData, _cbShowMessage);
      return;
    } else {
      let queryData = queryStr.substring(1).split('=');
      
      switch (queryData[0]) {
      case 'query':
        getRestData(url, _cbShowDataFound, _cbShowMessage, queryData[1]);
        break;
      case 'filter':
        getRestData(url, _cbShowFilteredData, _cbShowMessage, queryData[1]);
        break;
      default:
        _cbShowMessage('No match for the request');
        break;
      }
    }

  };
  
  //--------------------------------------------------------------
  // Utilities
  //--------------------------------------------------------------
  
  /**
   * Executes the callback.
   * @param {String} url
   * @param {Function} cbSuccess
   * @param {Function} cbShowMessage
   * @returns void
   */
  function getRestData(url, cbSuccess, cbShowMessage, cbParam='') {
    
    let xhr = new XMLHttpRequest();
    
    xhr.open('GET', url);

    xhr.timeout = 10000;

    xhr.addEventListener('readystatechange', function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        let type = xhr.getResponseHeader('Content-Type');
        
        if (type.match(/application\/json/)) {
          cbSuccess(xhr.responseText, cbParam);
        }
        
      } else if (xhr.status === 404) {
        cbShowMessage('Error status 404');
      }
    });

    xhr.addEventListener('timeout', function() {
      cbShowMessage('Sorry. The server is responding too long');
    });

    xhr.send();
  }
  
  /**
   * Returns a function for rendering block of data.
   * @param {Object} fullData
   * @returns {Function}
   */
  function renderBlockOfData(fullData) {
    let i = 0;
    let limit = 12;
    let length = fullData.length;
    let content = document.getElementById('main-content');

    return function () {
      
      for (let max = limit; (i < max) && (i < length); i++) {
        let data = getDataForItem(fullData[i]);
        
        let tvShowItem = new TVShowItem(data);
        let itemContainer = tvShowItem.createContainer();
        itemContainer.innerHTML = tvShowItem.createTemplate();
        content.appendChild(itemContainer);
      }
      
      i = limit;
      limit += limit;
    }
    
    /**
     * Returns an object with options.
     * @param {Object} fullDataItem
     * @returns {Object}
     */
    function getDataForItem(fullDataItem) {
      let data = {};
      
      data.id = fullDataItem.id || '';
      data.href = fullDataItem.url || '';
      data.name = fullDataItem.name || '';
      data.genres = fullDataItem.genres || [];
      data.premiered = fullDataItem.premiered.match(/\d{4}/)[0] || '';
      data.rating = fullDataItem.rating.average || '';
      data.studio = fullDataItem.network ? fullDataItem.network.name : 
                    fullDataItem.webChannel ? fullDataItem.webChannel.name : '';
      data.poster = fullDataItem.image.medium || '';
      data.summary = fullDataItem.summary || '';
      
      return data;
    }
  }
  
  /**
   * Creates a new TVShowItem.
   * @constructor TVShowItem
   * @param {Object} data
   * returns this
   */
  function TVShowItem(data) {
    for (let prop in data) {
      if (data.hasOwnProperty(prop)) {
        this[prop] = data[prop];
      }
    }
  }
  
  TVShowItem.prototype.createContainer = function () {
    let container = document.createElement('div');
    container.classList.add('tvshow-item');
    container.style.background = ` #aaa url(${this.poster}) no-repeat center center/cover`;

    return container;
  };
  
  TVShowItem.prototype.createTemplate = function () {
    let template = [
          `<a href="${this.href}" target="_blank" class="tvshow-item-ref">`,
            `<div class="on-tvshow-item-hover">`,
              `<div class="tvshow-item-info flex-container">`,
                `<div class="studio" class="info-elem">${this.studio}</div>`,
                `<div class="play" class="info-elem">`,
                  `<i class="fa fa-caret-right" aria-hidden="true"></i>`,
                `</div>`,
                `<div class="rating" class="info-elem">${this.rating}</div>`,
              `</div>`,
              `<div class="tvshow-item-content">`,
                `<div class="title">`,
                  `<span class="tvshow-item-name accent">${this.name}</span>`,
                `</div>`,
                `<div class="details">`,
                  `<div class="premiered">${this.premiered}</div>`,
                  `<div class="genres">${this.genres.join(', ')}</div>`,
                `</div>`,
                  `<div class="summary">${this.summary}</div>`,
              `</div>`,
            `</div>`,
          `</a>`
    ].join("\n");
    
    return template;
  };
  
  /**
   * Returns an object with fields of TV Shows genres.
   * @param {Object} fullData
   * @returns {Array}
   */
  let _getAllGenres = function (fullData) {
    let objOfGenres = {};
    let allGenres = [];
    
    fullData.forEach(function(fullDataItem) {

      fullDataItem.genres.forEach(function(genre) {
        objOfGenres[genre] = true;
      });
       
    });
    
    for (let genre in objOfGenres) {
      if (objOfGenres.hasOwnProperty(genre)) {
        allGenres.push(genre);
      }
    }
    
    allGenres.sort();
    
    return allGenres;
  };
  
  /**
   * Renders a list of TV Shows genres and adds an event handler for chosen genre.
   * @param {Array} allGenres
   * @returns void
   */
  let _renderListOfGenres = function (allGenres) {
    let browesNav = document.querySelector('.browes-nav-list');
    
    allGenres.forEach(function(genre) {
      let liItem = document.createElement('li');
      liItem.classList.add('browes-nav-item');
      let text = document.createTextNode(genre);
      liItem.appendChild(text);
      
      liItem.addEventListener('click', function(e) {
        let hiddenForm = document.forms.hidden;
        let hiddenInput = hiddenForm.filter;
        hiddenInput.value = this.innerHTML;
        hiddenForm.submit();
      });
      
      browesNav.appendChild(liItem);
    });

  };
  
  //--------------------------------------------------------------
  // Event handlers
  //--------------------------------------------------------------
  
  /**
   * Shows data as it scrolls.
   * @callback render
   * @returns void
   */
  let _scrollHandler = function (render) {
    let handler = function (e) {
      let content = document.getElementById('main-content');

      let contentHeight = content.offsetHeight;
      let yOffset = window.pageYOffset; 
      let y = yOffset + window.innerHeight;
      if (y >= contentHeight) {
        render();
      }
    };
    
    window.addEventListener('scroll', handler);
  };
  
  /**
   * Toggles the display of the target element.
   * @param {String} source
   * @param {String} target
   * @returns void
   */
  let browesToggleHandler = function (source, target) {
    let sourceNode = document.querySelector(source);
    let caretDown = document.querySelector('.fa-caret-down');
    let caretUp = document.querySelector('.fa-caret-up');
    let toggle = false;
    
    let handler = function (e) {
      let targetNode = document.querySelector(target);

      if (!toggle) {
        targetNode.style.display = 'block';
        caretDown.style.display = 'none';
        caretUp.style.display = 'inline-block';
      } else {
        targetNode.style.display = '';
        caretDown.style.display = '';
        caretUp.style.display = '';
      }
      
      toggle = !toggle;
    };
    
    sourceNode.addEventListener('click', handler);
  };
  
  let formSearch = document.querySelector('.search-form');
  let inputSearch = formSearch.query;
  
  /**
   * Toggles the display of the target element.
   * @param {String} source
   * @param {String} target
   * @param {Boolean} toggle
   * @returns void
   */
  let searchToogleHandler = function (source, target, toggle) {
    let sourceNode = document.querySelector(source);

    let handler = function (e) {
      let targetNode = document.querySelector(target);

      if (!toggle) {
        targetNode.style.transform = 'translateX(0)';
        targetNode.style.opacity = '1';
        inputSearch.value = '';
      } else {
        targetNode.style.transform = 'translateX(100%)';
        targetNode.style.opacity = '0';
      }
    };
    
    sourceNode.addEventListener('click', handler);
  };
  
  /**
   * Handles the event submit.
   * @returns void
   */
  let findHandler = function () {

    let handler = function (e) {
      let value = inputSearch.value;
      
      if (value === '') {
        e.preventDefault();
      }

    };
    
    formSearch.addEventListener('submit', handler);
  };
  
  
  return {
    init,
    browesToggleHandler,
    searchToogleHandler,
    findHandler
  }
  
})();