// Copyright 2018 Ann Robson
// MIT

(function () {
  'use strict';

  let urlParams = new URLSearchParams(window.location.search);
  let testDateParam = urlParams.get('testDate');
  // Example: https://inseason.today/?testDate=10/31/2018
  // for each of the months you can use open-all-views.sh
  let testDate = new Date();
  if (testDateParam !== null) {
    testDate = new Date(testDateParam);
  }

  let app = {
    //isLoading: true,
    //spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.container'),
    toggleInfo: function (card) {
      let info = card.getElementsByClassName('item-info')[0];
      if (info.classList.contains('reveal')) {
        info.setAttribute('class', 'item-info hide');
      } else {
        info.setAttribute('class', 'item-info reveal');
      }
    },
    testDate: testDate,
    //dateLastUpdated: new Date(),
  };

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Shows seasonal produce 
  app.updateSeasonal = function () {
    //let today = new Date();
    let today = app.testDate;
    let items = app.produce;
    let selectedItems = [];
    items.forEach(function (item) {
      if (item.months.includes(today.getMonth())) {
        item.sortValue = app.getSortValue(item);
        selectedItems.push(item);
      }
    });

    var itemsSorted = selectedItems.sort(function (item1, item2) {
      // sort the list descending
      if (item1.sortValue > item2.sortValue) {
        return -1;
      } else if (item2.sortValue > item1.sortValue) {
        return 1;
      }
      return 0;
    });

    // create cards and add them to DOM
    itemsSorted.forEach(function (item) {
      // let st = item.name + ': pop: ' + app.getPopularityScore(item);
      // st += ': sea: ' + app.getSeasonLengthScore(item)+ ': peak: ' + app.getProximityToPeakScore(item);
      // st += ': score ' + app.getSortValue(item);
      // console.log(st);
      app.addCard(app.getCard(item));
    });

    // Update happens so fast, spinner will never show. Uncomment here and 
    // in HTML to enable if there is ever a reason to have a spinner.
    // (We might want to add a spinner artifically to indicate that something changed.)
    // if (app.isLoading) {
    //   app.spinner.setAttribute('hidden', true);
    //   app.container.removeAttribute('hidden');
    //   app.isLoading = false;
    // }
  };

  app.getCard = function (item) {
    // add card to UI
    let card = app.cardTemplate.cloneNode(true);
    //let backgroundImageStyleValue = 'background-image: url(images/produce/'+ item.label + '.jpg);'
    card.classList.remove('cardTemplate');
    card.querySelector('.item-name').textContent = item.name;
    card.querySelector('.item-description').textContent = item.description;
    card.querySelector('.item-image').setAttribute('alt', item.name);
    card.querySelector('.item-image').setAttribute('src', 'images/produce/' + item.label + '.jpg');
    card.querySelector('.item-info-name').textContent = item.name;
    if (item.choose) {
      card.querySelector('.item-info-choose-text').textContent = item.choose;
      card.querySelector('.item-info-choose').removeAttribute('hidden');
    }
    if (item.store) {
      card.querySelector('.item-info-store-text').textContent = item.store;
      card.querySelector('.item-info-store').removeAttribute('hidden');
    }
    card.removeAttribute('hidden');
    card.setAttribute('data-sort', item.sortValue);
    return card;
  };

  app.getSortValue = function (item) {
    let sortValue = app.getPopularityScore(item);
    sortValue += app.getSeasonLengthScore(item);
    sortValue += app.getProximityToPeakScore(item);
    return Math.floor(sortValue / 3);
  };

  app.getPopularityScore = function (item) {
    if (!item.popularity) {
      return 50;
    }
    return item.popularity * 10;
  };

  app.getSeasonLengthScore = function (item) {
    // if the produce is only seasonal for one month, make the score a perfect 100. 
    return 110 - (item.months.length * 10);
  };

  app.getProximityToPeakScore = function (item) {
    let peakAvg = app.getPeakAverage(item.peakMonths);
    // absolute best day for this produce

    // this logic is a little complicated:
    // we use coarse month values to store peak range
    // if months 8 and 9 are the peak months (Sept-Oct.)
    // then the very middle of the peak is Oct. 1st,
    // but averaging those numbers returns 8.5

    // assume whole number for defaults:
    // 8 would be Sept 15th. Not intuitive!
    let day = 1;
    let month = peakAvg;

    if (Number.isInteger(peakAvg)) {
      day = 15;
    } else {
      month = Math.ceil(peakAvg);
    }
    let peakDate = new Date(app.testDate.getFullYear(), month, day);
    // days peak is from testDate (usu today):
    let diff = Math.abs(peakDate - app.testDate);
    let score = 100 - (Math.floor(diff / (24 * 60 * 60 * 1000)));
    if (score < 0) {
      score = 0;
    }
    return score;
  };

  app.getPeakAverage = function (peakMonths) {
    let sum = 0;
    for (let i = 0; i < peakMonths.length; i++) {
      sum += parseInt(peakMonths[i], 10); //don't forget to add the base
    }
    return sum / peakMonths.length;
  };

  //NEEDS WORK. CURRENTLY WON'T WORK FOR PRODUCE THAT IS SEASONAL OVER WINTER. 11-3, for example.
  // also handle cases where it's annual -- goes all the way around the year for any month.
  app.betweenStartAndEndMonths = function (item, thisMonth) {
    if (item.startMonth > item.endMonth) {
      // season must start in the winter
      // throw new Error("this does not work yet.");
      // cop-out and don't show that item for now.
      return false;
    } else {
      return thisMonth >= item.startMonth && thisMonth <= item.endMonth;
    }
  };

  // app.isOverPeak = function(item) {
  //   let today = new Date();
  //   return app.peakAverage(item.peakMonths) < today.getMonth();
  // }

  // app.isUnderPeak = function(item) {
  //   let today = new Date();
  //   return app.peakAverage(item.peakMonths) > today.getMonth();
  // }

  app.prepareHandlers = function (card) {
    // add card toggle handler
    card.addEventListener('click', function () {
      app.toggleInfo(this);
    });
  };

  app.addCard = function (card) {
    app.container.appendChild(card);
    app.prepareHandlers(card);
  };

  // TODO add startup code here

  // TODO add service worker code here

  loadJSON('data/produce.json',
    function (data) {
      app.produce = data;
      app.updateSeasonal();
    },
    function (xhr) { throw new Error(xhr); }
  );

  function loadJSON(path, success, error) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          if (success)
            success(JSON.parse(xhr.responseText));
        } else {
          if (error)
            error(xhr);
        }
      }
    };
    xhr.open('GET', path, true);
    xhr.send();
  }
})();
