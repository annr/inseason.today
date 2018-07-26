// Copyright 2018 Ann Robson
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function() {
  'use strict';

  let app = {
    //isLoading: true,
    //spinner: document.querySelector('.loader'),
    container: document.querySelector('#chart-body'),
    produceRow: document.querySelector('.produceRow'),
    //dateLastUpdated: new Date(),
  };

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Shows seasonal produce 
  app.buildTable = function() {
    let items = app.produce;

    var itemsSorted = items.sort(function(item1, item2) {
      // sort the list descending
      if (item1.name > item2.name) {
        return 1;
      } else if (item2.name > item1.name) {
        return -1;
      }
      return 0;
    });

    // create cards and add them to DOM
    itemsSorted.forEach(function(item) {
      app.addRecord(app.getRecord(item));
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

  app.getRecord = function(item) {
    //let row = app.produceRow.cloneNode(true);
    let row = document.createElement('tr');
    let nameCol = document.createElement('td');
    nameCol.setAttribute('class', 'name-cell');
    nameCol.textContent = item.name;
    row.appendChild(nameCol);
    [...Array(12).keys()].forEach(function(month) {
      let col = document.createElement('td');
      if (item.peakMonths.includes(month)) {
        col.textContent = '👍';
        col.setAttribute('class', 'excellent');
      } else if (item.months.includes(month)) {
        col.textContent = '';
        col.setAttribute('class', 'seasonal');
      } else {
        col.setAttribute('class', 'not-in-season');
        col.textContent = '';
      }
      row.appendChild(col);
    });
    return row;
  }

  app.addRecord = function(record) {
    app.container.appendChild(record);
  }

  // TODO add startup code here
  // TODO add service worker code here

  loadJSON('data/produce.json',
    function(data) {
      app.produce = data;
      app.buildTable();
    },
    function(xhr) { console.error(xhr); }
  );

  function loadJSON(path, success, error)
  {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function()
      {
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
      xhr.open("GET", path, true);
      xhr.send();
  }
})();
