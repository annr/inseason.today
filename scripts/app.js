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
    isLoading: true,
    //spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.container'),
    toggleInfoOn: function(elem) {
        elem.setAttribute('class', 'item-info reveal');
    },
    toggleInfoOff: function(elem) {
      elem.setAttribute('class', 'item-info hide');
    },
    //dateLastUpdated: new Date(),
    months: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sept',
      'Oct',
      'Nov',
      'Dec', 
    ],
  };

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Shows seasonal produce 
  app.updateSeasonal = function() {
    let today = new Date();
    let items = app.produce;
    let selectedItems = [];
    items.forEach(function(item) {
      if (item.months.includes(today.getMonth())) {
        item.sortValue = app.getSortValue(item)
        selectedItems.push(item);
      }
    });

    var itemsSorted = selectedItems.sort(function(item1, item2) {
      // sort the list descending
      if (item1.sortValue > item2.sortValue) {
        return -1;
      } else if (item2.sortValue > item1.sortValue) {
        return 1;
      }
      return 0;
    });

    // create cards and add them to DOM
    itemsSorted.forEach(function(item) {
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

  app.getCard = function(item) {
    // add card to UI
    let card = app.cardTemplate.cloneNode(true);
    let backgroundImageStyleValue = 'background-image: url(images/produce/'+ item.label + '.jpg);'
    card.classList.remove('cardTemplate');
    card.querySelector('.item-name').textContent = item.name;
    card.querySelector('.item-description').textContent = item.description;
    card.querySelector('.item-image').setAttribute('alt', app.getName(item));
    card.querySelector('.item-image').setAttribute('style', backgroundImageStyleValue);
    card.querySelector('.item-info-title').textContent = app.getName(item);
    card.querySelector('.item-info-how-to-choose-details').textContent = item.choose;
    if (item.choose) {
      card.querySelector('.item-info-how-to-choose-details').textContent = item.choose;
      card.querySelector('.item-info-how-to-choose').removeAttribute('hidden');
    }
    if (item.store) {
      card.querySelector('.item-info-how-to-store-details').textContent = item.store;
      card.querySelector('.item-info-how-to-store').removeAttribute('hidden');
    }
    card.removeAttribute('hidden');
    card.setAttribute('data-sort', item.sortValue);
    return card;
  }

  app.getSortValue = function(item) {
    let sortValue = app.getPopularityScore(item);
    sortValue  += app.getSeasonLengthScore(item);
    sortValue += app.getProximityToPeakScore(item);
    return Math.floor(sortValue/3);
  }

  app.getPopularityScore = function(item) {
    if (!item.popularity) {
      return 50;
    }
    return item.popularity * 10;
  }

  app.getSeasonLengthScore = function(item) {
    // if the produce is only seasonal for one month, make the score a perfect 100. 
    return 110 - (item.months.length * 10);
  }

  app.getProximityToPeakScore = function(item) {
    let peakAvg = app.getPeakAverage(item.peakMonths);
    // absolute best day for this produce
    let today = new Date();

    // this logic is a little complicated:
    // we use coarse month values to store peak range
    // if months 8 and 9 are the peak months (Sept-Oct.)
    // then the very middle of the peak is Oct. 1st,
    // but averaging those numbers returns 8.5

    // assume whole number for defaults:
    // 8 would be Sept 15th. Not intuitive!
    let day = 15;
    let month = peakAvg;

    // if avg is between two whole numbers as described above:
    if (Number.isInteger(peakAvg)) {
      if (month === 11) {
        month = 1;
      } else {
        month++;
      }
      day = 1;
    }

    let peakDate = new Date(today.getFullYear(), Math.floor(peakAvg), day);
    // days peak is from today:
    let diff = Math.abs(peakDate - today);
    let score = 100 - (Math.floor(diff/ (24*60*60*1000)));
    if (score < 0) {
      score = 0;
    }
    return score;
  }

  app.getPeakAverage = function(peakMonths) {
    let sum = 0;
    for( let i = 0; i < peakMonths.length; i++ ){
        sum += parseInt( peakMonths[i], 10 ); //don't forget to add the base
    }
    return sum/peakMonths.length;
  }

  //NEEDS WORK. CURRENTLY WON'T WORK FOR PRODUCE THAT IS SEASONAL OVER WINTER. 11-3, for example.
  // also handle cases where it's annual -- goes all the way around the year for any month.
  app.betweenStartAndEndMonths = function(item, thisMonth) {
    if (item.startMonth > item.endMonth) {
      // season must start in the winter
      // throw new Error("this does not work yet.");
      // cop-out and don't show that item for now.
      return false;
    } else {
      return thisMonth >= item.startMonth && thisMonth <= item.endMonth
    }
  }

  app.getName = function(item) {
    let labelWithProperCase = item.label.charAt(0).toUpperCase() + item.label.substr(1);
    return item.optionalDisplayName || labelWithProperCase;
  }

  app.isOverPeak = function(item) {
    let today = new Date();
    return app.peakAverage(item.peakMonths) < today.getMonth();
  }

  app.isUnderPeak = function(item) {
    let today = new Date();
    return app.peakAverage(item.peakMonths) > today.getMonth();
  }

  app.prependList = function(card) {
    app.container.prepend(card);
    // add listener to activators and close link:
    app.prepareHandlers(card);
  }

  app.placeSortedInList = function(card, sort) {
    // figure out where to put the item:

    // loop through cards:

    app.container.childNodes.forEach(function(child) {
      // find node to append
      if (Number.parseInt(child.getAttribute('data-sort')) < sortValue) {
        // put it before this node:
        
      }

    });
  }

  app.prepareHandlers = function(card) {
    // add listener to activators and close link:
    card.querySelector('.close').addEventListener('click', function() {
      app.toggleInfoOff(card.querySelector('.item-info'));
    });
    let openers = card.querySelectorAll('.activator');
    for (let i = 0; i < openers.length; i++) {
      openers[i].addEventListener('click', function(event) {
        app.toggleInfoOn(card.querySelector('.item-info'));
      });
    }
  }

  app.addCard = function(card) {
  //app.addCard = function(card, item) {
    //let missedPeakText = 'Best in ' + app.months[item.peakMonths];
    //let bestIn = card.querySelector('.item-best');
    //bestIn.textContent = missedPeakText;
    //bestIn.removeAttribute('hidden');
    // if (app.isOverPeak(item)) {
    //   bestIn.classList.add('item-overripe');
    // }
    // if (app.isUnderPeak(item)) {  
    //   bestIn.classList.add('item-underripe');
    // }
    app.container.appendChild(card);
    app.prepareHandlers(card);
  }

  app.produce = [
    {
       "name":"Apples",
       "includes":"",
       "label":"apples",
       "months":[
          7,
          8,
          9,
          10
       ],
       "months_display":"August — November",
       "description":"Apples are to fall what peaches and nectarines are to summer -- somehow the entire season is summed up in a crisp, sweet bite.",
       "choose":"Select apples that are smooth-skinned, deeply colored and glossy.",
       "store":"Apples should be stored as cold as possible. Keep them in the bottom drawer of the refrigerator. A perforated plastic bag works best, as it allows some of the moisture to escape while keeping the apples crisp.",
       "tips":"While varietal distinctions in most fruit have been smoothed over, they're still terribly important with apples. There are apples that are terrific early, but don't store (such as Galas), and some that are harvested later and will taste good for months (such as Honeycrisp). Taste before you buy.",
       "peakMonths":[
          8,
          9
       ],
       "popularity":5
    },
    {
       "name":"Apricots",
       "includes":"",
       "label":"apricots",
       "months":[
          4,
          5,
          6
       ],
       "months_display":"May — July",
       "description":"Apricots came from ancient China and were dispersed on The Silk Road, finding roots in Persia. A cute fruit, the poet John Ruskin said the apricot is \"shining in sweet brightness of golden velvet.\"",
       "choose":"Choose soft but not mushy apricots with a nice deep golden color. The pink blush does not provide useful information.",
       "store":"Stored at cool room temperature or refridgerate in a sealed plastic bag.",
       "tips":"In Southern California we are fortunate to have some orchards that still produce the lovely old-fashioned variety Blenheim. These are troublesome to grow, but their flavor and texture is unrivaled.",
       "peakMonths":[
          5
       ],
       "popularity":7
    },
    {
       "name":"Artichokes",
       "includes":"",
       "label":"artichokes",
       "months":[
          9,
          10,
          2,
          3,
          4,
          5
       ],
       "months_display":"March — June and October — November",
       "description":"Most people eat artichokes only one way -- the biggest ones, served whole with drawn butter or mayonnaise. But smaller artichokes are terrific as ingredients in risottos, stews or pastas and they cost a lot less.",
       "choose":"Really fresh artichokes will squeak when squeezed.",
       "store":"Artichokes are hardy enough to last at cool room temperature for a couple of days. Any longer than that and you should refrigerate them in a tightly closed plastic bag.",
       "tips":"When you're trimming artichokes, don't throw away the stems. They have the same flavor as the heart and are just as tender if you peel the hard green skin.",
       "peakMonths":[
          3,
          4,
          9,
          10
       ],
       "popularity":5
    },
    {
       "name":"Asian pears",
       "includes":"",
       "label":"asian-pears",
       "months":[
          7,
          8,
          9
       ],
       "months_display":"August — October",
       "description":"Asian pear varieties can differ quite remarkably. Shinseiki has a very crisp texture and a flavor like honey, walnuts and flowers; 20th Century is crisp with a flavor like a sparkling combination of apples and citrus; Kosui has a vanilla undertone; and Chojuro is buttery with a caramel sweetness.",
       "choose":"Asian pears feel hard as rocks, but they actually bruise quite easily. Russet varieties should be deep golden brown; smooth-skinned round fruit should be yellow, not green, and smooth-skinned pear-shaped fruit will be pale green.",
       "store":"Asian pears need to be refrigerated.",
       "tips":"If you're unfamiliar with Asian pears, know that they are sometimes referred to as “apple-pears,” which is a perfectly good summation of their qualities.",
       "peakMonths":[
          8
       ],
       "popularity":5
    },
    {
       "name":"Asparagus",
       "includes":"",
       "label":"asparagus",
       "months":[
          2,
          3
       ],
       "months_display":"March & April",
       "description":"The most reliable harbinger of spring in the vegetable world, when asparagus peeks through the dirt, you can bet warmer weather is coming.",
       "choose":"The tips should be tightly furled and closed; the stems should be smooth and firm with no wrinkles; the bases should be moist.",
       "store":"You can store asparagus tightly wrapped in the refrigerator for a day or so. Any longer, store them in the refrigerator like cut flowers – with the bases in a bowl of water and the tops loosely covered with a plastic bag.",
       "tips":"Use thin asparagus as an ingredient in pastas and risottos. Serve thick asparagus on its own, dressed as simply as you dare. Medium asparagus can be prepared however you like.",
       "peakMonths":[
          2,
          3
       ],
       "popularity":8
    },
    {
       "name":"Avocados",
       "includes":"",
       "label":"avocados",
       "months":[
          1,
          2,
          3,
          4,
          5,
          6,
          7
       ],
       "months_display":"February — July",
       "description":"Alligator pear or the Nahuatl word for \"testicle\" -- whatever you want to call them -- avocados are a one of the best reasons to be in California.",
       "choose":"Avocados ONLY ripen after picked, and ripening takes a week or more. Really ripe avocados will give when they are squeezed gently. Buying firm or hard avocados and waiting for them to ripen at home is a safe bet. Many get bruised in the store.",
       "store":"Keep avocados at room temperature until they are fully ripe.",
       "tips":"The flesh of avocados will begin to blacken as soon as the fruit is cut, so don't try to prepare them in advance.",
       "peakMonths":[
          4
       ],
       "popularity":7
    },
    {
       "name":"Beets",
       "includes":"",
       "label":"beets",
       "months":[
          10,
          11,
          0,
          1,
          2
       ],
       "months_display":"November — March",
       "description":"Not only are beets physically beautiful -- they have a deep, rich saturated red color that shines like nothing else -- but they are also a wonderful combination of sweet and earthy. So why do so many people hate them?",
       "choose":"Select beets that are heavy for their size and show no surface nicks or cuts. If they're sold with their tops on, the greens are always a good indicator of freshness as they show wilting very quickly (they're also delicious – don't discard them).",
       "store":"Refrigerate in a tightly sealed plastic bag.",
       "tips":"Prepare beets by wrapping them in aluminum foil and baking at 400 degrees until they are tender enough to pierce with a knife. Cool them and the peels will slip right off.",
       "peakMonths":[
          4,
          5
       ],
       "popularity":5
    },
    {
       "name":"Bell peppers",
       "includes":"",
       "label":"bell-peppers",
       "months":[
          8,
          9
       ],
       "months_display":"September & October",
       "description":"There is nothing at the farmers market that sums up the late summer-early fall season like the mounds of brightly colored peppers that seem to be everywhere. Their colors – red and yellow, even purple and brown – are so saturated they seem to have been designed for the painterly golden light at this time of year. And they taste as good as they look.",
       "choose":"Look for peppers that are firm, deeply colored and glossy. Peppers that have the straightest sides will be the easiest to peel.",
       "store":"Keep peppers in the refrigerator, tightly wrapped in a plastic bag.",
       "tips":"To peel peppers, place them whole on the grill, turning as the skin begins to blacken. Transfer them to a bowl and cover with plastic wrap, the peel will slip right off.",
       "peakMonths":[
          8,
          9
       ],
       "popularity":5
    },
    {
       "name":"Blood oranges",
       "includes":"",
       "label":"blood-oranges",
       "months":[
          1,
          2
       ],
       "months_display":"February — March",
       "description":"Blood oranges get their color from the same anthocyanin pigment that gives raspberries theirs. And though the chemical compound itself has no flavor, there is a shared berry taste between blood oranges and raspberries.",
       "choose":"Select oranges that are heaviest for their size. Color is not a reliable indicator of flavor. Some varieties such as Tarocco, which are usually less “bloody” than others, have the best flavor.",
       "store":"Because oranges have relatively thick peels, they can be stored at room temperature for up to a couple of weeks. Refrigerating doesn't hurt oranges, though, so that's fine if that's what you prefer.",
       "tips":"Blood oranges pair beautifully with many of the best cool-weather vegetables -- fennel and beets in particular.",
       "peakMonths":[
          1,
          2
       ],
       "popularity":5
    },
    {
       "name":"Broccoli",
       "includes":"",
       "label":"broccoli",
       "months":[
          11,
          0,
          1,
          2,
          3,
          4
       ],
       "months_display":"December — May",
       "description":"Like cauliflower, to which it's closely related, broccoli is a vegetable with two faces. Cook it quickly and the flavor is bold and assertive. Push it a little longer and it becomes sweet and complex.",
       "choose":"Choose broccoli with flower heads that are tightly closed and blue-green, rather than pale green or even yellow. Feel the stock with your fingernail – overgrown broccoli will be too tough to dent and will be stringy when cooked.",
       "store":"For a staple vegetable, broccoli spoils rather quickly. Treat it as you would a lettuce – tightly wrapped in the crisper drawer of the refrigerator. And use it as soon as you can.",
       "tips":"Besides the familiar “tree” broccoli, also look for broccolini (sometimes called “baby broccoli”), broccoli rabe and Chinese broccoli (gai lan). These have more stem than flower head, so they lend themselves to different dishes.",
       "peakMonths":[
          3,
          4
       ],
       "popularity":5
    },
    {
       "name":"Brussels sprouts",
       "includes":"",
       "label":"brussels-sprouts",
       "months":[
          10,
          11,
          0,
          1
       ],
       "months_display":"November — February",
       "description":"Like tiny little cabbages, Brussels sprouts depend on accurate cooking to be at their best – cook them long enough to bring out the sweetness, but not so long as to bring out the sulfur-y smell.",
       "choose":"Choose Brussels sprouts that are vivid green and are tightly closed. As they sit, the leaves will begin to separate and the edges will yellow. Squeeze the head, it should be hard enough that there is very little give.",
       "store":"Brussels sprouts should be refrigerated in a tightly sealed bag.",
       "tips":"My favorite way to cook Brussels sprouts: steam them whole until just tender enough to pierce with a knife. Then cut them into lengthwise quarters and finish cooking as you wish to impart flavor. This helps keep them from overcooking.",
       "peakMonths":[
          5,
          6
       ],
       "popularity":5
    },
    {
       "name":"Carrots",
       "includes":"",
       "label":"carrots",
       "months":[
          1,
          2,
          3,
          4,
          5
       ],
       "months_display":"February — June",
       "description":"Once carrots came in one model — fat and orange. Today you can find them in a wide variety of shapes, sizes and colors. And they're more than just ornamental: well-grown carrots are among the sweetest of the root vegetables.",
       "choose":"The best way to choose carrots is by the greens — they should be fresh and crisp looking. After that, make sure the roots are deeply colored (whatever the color) and vibrant and make sure there are no cracks or deep dings.",
       "store":"Store carrots tightly wrapped in the crisper drawer. Be sure to remove the tops before storing as they will draw moisture from the roots, wilting them faster.",
       "tips":"Want to look like a genius cook? Slice trimmed carrots in 1/2-inch rounds; place them in a wide skillet with a good knob of butter and just enough water to cover the bottom of the pan; cover and cook over medium heat until the carrots are just tender; remove the lid, turn the heat up to high and cook, stirring constantly, until the liquid has evaporated, leaving a golden glaze.",
       "peakMonths":[
          3
       ],
       "popularity":5
    },
    {
       "name":"Cauliflower",
       "includes":"",
       "label":"cauliflower",
       "months":[
          11,
          0,
          1,
          2,
          3,
          4
       ],
       "months_display":"December — May",
       "description":"For cooks, cauliflower has two distinctive personalities. Blanch it briefly and it has an aggressive, grassy quality that pairs well with big flavors like olives and garlic. Cook it until it's soft and cauliflower becomes sweet and earthy.",
       "choose":"Cauliflower heads should be firm and tightly closed. White varieties should be very pale, with no dark \"sunburned\" spots. Reject any heads that show signs of softness, that's the start of spoilage.",
       "store":"Though it seems durable, cauliflower is extremely perishable. Keep it tightly wrapped in the crisper drawer of the refrigerator.",
       "tips":"Unlike other vegetables, the color of cauliflower lasts through cooking, particularly if you add a little acidity, either vinegar or lemon juice.",
       "peakMonths":[
          3,
          4
       ],
       "popularity":5
    },
    {
       "name":"Chard",
       "includes":"",
       "label":"chard",
       "months":[
          0,
          1,
          2,
          3
       ],
       "months_display":"January — April",
       "description":"You'll usually find chard in three variations: green, which has white stems and a fairly mild flavor; red, which closely resembles beet greens in look and taste; and rainbow, which is not really a genetic variety but a mix of types that includes both red and white, plus shades of pink and gold (sadly, beautiful as they are raw, the color dulls with cooking). The term “Swiss chard” generally refers to any of those three. All of them have fairly crisp, ridged stems and thick, fleshy leaves that are, frankly, unpleasant raw but become absolutely wonderful when cooked.",
       "choose":"Don't worry so much about the leaves – you'll get a lot more clues about the freshness of the chard by looking at the stems (they seem to wilt before the leaves do). The stems should be firm and crisp. Examine the cut end – it should be somewhat moist and fresh-looking, with minimal darkening.",
       "store":"Keep chard tightly wrapped in a plastic bag in the crisper drawer of the refrigerator. Properly stored, it'll last a week or so.",
       "tips":"Chard often seems to be sandier than some other greens, so clean it thoroughly by covering it with water in the sink and then giving it a good shake. It's important that you do this right before cooking rather than before you stick the chard in the fridge – excess moisture is the great enemy of almost all fruits and vegetables.",
       "peakMonths":[
          1,
          2
       ],
       "popularity":5
    },
    {
       "name":"Cherries",
       "includes":"",
       "label":"cherries",
       "months":[
          4,
          5,
          6
       ],
       "months_display":"May — July",
       "description":"The perfect, snack-sized fruit. Also, seasonal cherries are super delicious.",
       "choose":"Cherries should have taut, shiny, smooth skins. For the most common varieties (Bing, for instance), the darker the color the more ripe and sweet. Stems should be green and springy.",
       "store":"Refrigerate cherries in a tightly sealed plastic bag; they should last at least a week.",
       "tips":"Cherries are also closely related to almonds; if you want to beef up the flavor of cherries in a dish, add just a drop or two of almond extract.",
       "peakMonths":[
          5
       ],
       "popularity":7
    },
    {
       "name":"Corn",
       "includes":"",
       "label":"corn",
       "months":[
          5,
          6,
          7,
          8
       ],
       "months_display":"June — September",
       "description":"Mayan deities made our ancestors out of corn, and we eat so much of it we are still made of it. Of course fresh is best, and eating corn on the cob is quintessential summer.",
       "choose":"Ears should be well filled out (check the top for kernels), and make sure the silk is soft, not dried out.",
       "store":"Refrigerate, tightly wrapped.",
       "tips":"White corn is not necessarily sweeter than yellow; which color you prefer has more to do with where you were raised than the actual flavor of the corn.",
       "peakMonths":[
          6,
          7
       ],
       "popularity":9
    },
    {
       "name":"Cucumbers",
       "includes":"",
       "label":"cucumbers",
       "months":[
          4,
          5,
          6,
          7,
          8
       ],
       "months_display":"May — September",
       "description":"It's wonderful that cucumbers arrive right when we need them. Eat cucumbers in the summer to stay cool. If you want to stay, that is, cool as a cucumber.",
       "choose":"Choose firm, deep green cucumbers without soft spots or shrivelling.",
       "store":"Store tightly wrapped in the refrigerator or in the crisper drawer.",
       "tips":"Most cucumbers don't need to be peeled, but if the skin feels particularly thick, or if they've been waxed, then you should. Also, take a bite — if the cucumber is excessively bitter, peel them because the compounds that cause bitterness are usually located right under the skin.",
       "peakMonths":[
          6
       ],
       "popularity":8
    },
    {
       "name":"Eggplant",
       "includes":"",
       "label":"eggplants",
       "months":[
          6,
          7,
          8,
          9
       ],
       "months_display":"July — October",
       "description":"Eggplant is a strange, special fruit. It's related to another fruit we don't think of as a fruit: tomatoes. It's also related to the potato, which is totallly not a fruit.",
       "choose":"Eggplants should be firm, otherwise they could be bitter. The stem should be green and not dried out or brown.",
       "store":"Refrigerate if you don't use them within a day or so, but not for too long. Eggplants suffer from chill damage maybe like their cousin, tomato.",
       "tips":"Eggplant is one of the best vegetables on the grill – cut it into thick slices, brush with garlic-flavored olive oil and cook over a medium fire until soft. Then brush with more olive oil and sprinkle with vinegar and salt.",
       "peakMonths":[
          7,
          8
       ],
       "popularity":7
    },
    {
       "name":"English peas",
       "includes":"",
       "label":"english peas",
       "months":[
          2,
          3
       ],
       "months_display":"March & April",
       "description":"There are few spring flavors that rival that of a really sweet English pea, but there are also few flavors more transitory. Peas begin converting sugar to starch as soon as they're picked. Within a couple of days, they're bland. Taste before you buy.",
       "choose":"Look for pods that are firm and crisp. They shouldn't bend at all but should snap. The color in general should be a saturated pale green. Some peas will show a little white scarring on the pod; that's not a problem.",
       "store":"Refrigerate in a tightly sealed plastic bag. They'll last four or five days.",
       "tips":"Shucking peas is one of the most communal of cooking activities. It's unbelievably tedious, so it's always a good idea to enlist a friend to help. If nothing else, you can talk about how boring it is.",
       "peakMonths":[
          2,
          3
       ],
       "popularity":5
    },
    {
       "name":"Fava beans",
       "includes":"",
       "label":"fava beans",
       "months":[
          2,
          3,
          4,
          5
       ],
       "months_display":"March — June",
       "description":"One of the most popular of all farmers market vegetables, favas have ascended to culinary stardom contrary to all reason. They're expensive. And you have to buy a mountain to wind up with a molehill. (It takes more than 3 pounds of pods to make enough for two respectable servings of beans.) And then you have to peel them a second time to remove that fine pale skin that surrounds each bean. But still, is there any taste that promises spring as much as that bright flash of green you get from a fava bean?",
       "choose":"Select pods that are firm and filled out along the entire length. If you choose the pods with the smallest bumps, you'll get the youngest beans and they won't need to go through the second peeling. (Further hint: If the secondary peels covering the individual beans are not white, they don't need to be removed.)",
       "store":"Store favas in the refrigerator in a tightly sealed plastic bag. They'll last at least a week.",
       "tips":"The easiest way to peel that second skin from favas is to collect the shucked beans in a work bowl and pour over boiling water just to cover. Let them stand for a few minutes, and you can split the skin with your thumbnail and press with your fingers to “squirt” the favas from their skin.",
       "peakMonths":[
          3,
          4
       ],
       "popularity":5
    },
    {
       "name":"Fennel",
       "includes":"",
       "label":"fennel",
       "months":[
          0,
          1,
          2
       ],
       "months_display":"January — March",
       "description":"One of the most versatile of the cool-weather vegetables, you can shave fennel thin and use it crisp in salads, or you can braise it until it's soft and use it as a side dish. Either way, its licorice flavor is a perfect fit.",
       "choose":"Look for fennel with fresh-looking greens on long branches. (As the fennel sits, the greens wilt and grocery managers trim them.) The bulbs should be bright white with no discolorations or soft spots.",
       "store":"Keep in the refrigerator in a tightly sealed plastic bag. You may need to double-bag in order to cover the fronds.",
       "tips":"If you're serving fennel raw, it's a good idea to quarter it lengthwise first, and cut away the solid core.",
       "peakMonths":[
          1
       ],
       "popularity":5
    },
    {
       "name":"Figs",
       "includes":"",
       "label":"figs",
       "months":[
          5,
          6,
          7
       ],
       "months_display":"June — August",
       "description":"When nicely ripe, figs are truly nature's candy. If you don't have a fig tree, you should find someone who does. We all need someone with a fig tree.",
       "choose":"Figs do not continue to ripen after harvest, and sweet, ripe figs are fragile; therefore, good figs are hard to get. They can be wrinkly and soft as long as they don't smell overripe.",
       "store":"Consume quickly and refrigerate.",
       "tips":"Some green fig varieties are grown primarily to be dried – they have thick skins and the flavors are unremarkable. But if you see Adriatic figs, snap them up, they're among the best you'll ever taste.",
       "peakMonths":[
          6
       ],
       "popularity":5
    },
    {
       "name":"Cherry tomatoes",
       "includes":"",
       "label":"cherry-tomatoes",
       "months":[
          3,
          4,
          5,
          6
       ],
       "months_display":"April — July",
       "description":"Hunt for these in the gardens of friends and eat them straight off the plant if you can. They arrive earlier than bigger tomatoes.",
       "choose":"Choose tomatoes that are vibrantly colored and without soft spots or wrinkling and use your nose. ",
       "store":"Just as you do other tomatoes: at room temperature.",
       "tips":"There are so many ways to use these little tomatoes, but one of the best is in a pasta sauce: Cut them in half; warm butter, garlic and the tomatoes in a skillet over medium heat; add a splash of white wine and cook just until the tomatoes have softened and released their juices.",
       "peakMonths":[
          4,
          5
       ],
       "popularity":7
    },
    {
       "name":"Grapefruit",
       "includes":"",
       "label":"grapefruit",
       "months":[
          2,
          3,
          4,
          5,
          6
       ],
       "months_display":"March — July",
       "description":"Grapefruits are the newest and the biggest in the citrus family, making them the \"big baby\".",
       "choose":"Like all citrus, they should be heavy for their size; they are full of juice. Also use your nose.",
       "store":"Refrigerating or store at room temperature.",
       "tips":"Though grapefruit aren't nearly as trendy as blood oranges, their complex flavor lends itself to just as many – if not more – different uses. Try making a beet salad with grapefruit.",
       "peakMonths":[
          4
       ],
       "popularity":2
    },
    {
       "name":"Grapes",
       "includes":"",
       "label":"grapes",
       "months":[
          6,
          7,
          8,
          9
       ],
       "months_display":"July — October",
       "description":"Wine drinkers aren't the only people who get the nutritional values of grapes ;) There are many wonderful eating grapes, so vine out on varieties. Grapeseed oil is high in omega-6 fatty acids (ie. magical).",
       "choose":"Grapes should be heavy for their size with taut skins.",
       "store":"Store tightly wrapped in the refrigerator. After washing, have a paper towel beneath them to absorb the moisture.",
       "tips":"For a real treat, late in the season look for Thompson Seedless – the predominant California variety – that have begun to turn golden. The flavor is terrific.",
       "peakMonths":[
          7,
          8
       ],
       "popularity":5
    },
    {
       "name":"Green beans",
       "includes":"",
       "label":"green-beans",
       "months":[
          4,
          5,
          6,
          7
       ],
       "months_display":"May — August",
       "description":"Chinese dry fried and sweet, or quickly blanched and acid dressed for a tangy crunch: I love these! Eat your green beans.",
       "choose":"Choose crisp and firm green beans without spots or signs of discoloring.",
       "store":"Refrigerate in a plastic bag.",
       "tips":"Though these are sometimes still called “string” beans, in most modern varieties that filament that runs the length of the pod has been bred out. Still, it's worth checking.",
       "peakMonths":[
          5,
          6
       ],
       "popularity":7
    },
    {
       "name":"Green garlic",
       "includes":"",
       "label":"green-garlic",
       "months":[
          2,
          3,
          4
       ],
       "months_display":"March — May",
       "description":"How do you know winter is finally closing out and spring is coming? Green garlic in the farmers market is about as reliable an indicator as any. Originally the thinnings from garlic plantings, it became so popular farmers are growing it on purpose.",
       "choose":"Green garlic comes in a range of sizes, from slim as a green onion to almost fully formed heads. Whatever the size, choose garlic that's firm with no soft spots. If a hard papery skin has formed, it will have to be removed.",
       "store":"Store green garlic in the refrigerator, but keep it tightly sealed. It's flavor may be mild, but its aroma is pungent and will permeate everything if you're not careful.",
       "tips":"Green garlic is simply immature garlic. It has the perfume of the grown-up version, but is milder in flavor. Cook it slowly in butter and it makes a wonderful pasta sauce.",
       "peakMonths":[
          3
       ],
       "popularity":5
    },
    {
       "name":"Hardy herbs",
       "includes":"rosemary,thyme,oregano",
       "label":"hardy-herbs",
       "months":[
          9,
          10,
          11,
          0,
          1
       ],
       "months_display":"October — February ",
       "description":"Once the province of gardeners only, even modest supermarkets now stock rosemary, thyme and oregano. They're wonderful for adding perfume to a dish.",
       "choose":"Choose hardy herbs that show no signs of wilting or browning.",
       "store":"Keep hardy herbs in the refrigerator, tightly wrapped in plastic. Better yet, grow them in a pot on a sunny windowsill.",
       "tips":"Be careful cooking with hardy herbs. While you can throw around soft herbs such as basil and mint with relative abandon, most hardy herbs have a much more assertive flavor and can become bitter when used incautiously.",
       "peakMonths":[
          11
       ],
       "popularity":5
    },
    {
       "name":"Kale",
       "includes":"",
       "label":"kale",
       "months":[
          11,
          0
       ],
       "months_display":"December & January",
       "description":"Of all of winter's hardy greens, none are more popular than the many members of the kale family.",
       "choose":"Kale is remarkably durable, which is why it has become such a popular wintertime garnish. But still, it will wilt eventually, so look for leaves that are thick, fleshy and crisp.",
       "store":"Refrigerate in a tightly sealed plastic bag.",
       "tips":"The trick to cooking kale is to take your time. The lower and slower the cooking, the sweeter and nuttier the final result. For the suddenly popular kale salads, be sure either to shred the leaves very finely, or to massage them roughly with a little oil and salt until they soften.",
       "peakMonths":[
          11,
          0
       ],
       "popularity":5
    },
    {
       "name":"Lima beans",
       "includes":"",
       "label":"lima beans",
       "months":[
          9,
          10
       ],
       "months_display":"October & November",
       "description":"Childhood trauma from eating canned lima beans? Get over it. There are few vegetables as delicious as a properly cooked, fresh lima bean, and there are few easier to prepare.",
       "choose":"Though shucking beans takes some time, the pods are really the best indicator of freshness. Look for pods that are firm and crisp. If you're buying shucked beans, make sure none have soft spots or discoloration.",
       "store":"Lima beans should be refrigerated in a tightly closed plastic bag.",
       "tips":"Render some bacon or prosciutto, soften shallots, add the lima beans and cream just to cover. You're on your way to heaven.",
       "peakMonths":[
          9,
          10
       ],
       "popularity":5
    },
    {
       "name":"Mandarins",
       "includes":"tangerine,satsuma,clementine",
       "label":"mandarins",
       "months":[
          10,
          11,
          0,
          1,
          2
       ],
       "months_display":"November — March",
       "description":"These small, easy-peeling citrus fruits come in a wide variety, and the season extends well into spring.",
       "choose":"Look for mandarins that are deeply colored and firm. If they are sold with the leaves attached, make sure the leaves are fresh and flexible.",
       "store":"Because the skin is so thin, mandarin is one citrus fruit that needs to be refrigerated, tightly sealed in a plastic bag.",
       "tips":"Many popular mandarin varieties can be seedless, if they're grown in orchards isolated from other kinds of citrus. But that's always a gamble, and even with fruit that's advertised as being seedless you'll find the occasional pip.",
       "peakMonths":[
          0
       ],
       "popularity":5
    },
    {
       "name":"Melons",
       "includes":"cantaloupe,muskmelon,honeydew",
       "label":"melons",
       "months":[
          6,
          7,
          8
       ],
       "months_display":"July — September",
       "description":"You'll find a great variety of melons at farmer's markets, some with incredible perfumes. Branch out! You don't have to stick to canteloupes. Melons are sweet and pair well with salty.",
       "choose":"With the exception of honeydews, the best indicator of a delicious melon is smell. Good ones will have an intense perfume. Look for a creamy color and melons that feel heavy for their size.",
       "store":"Store them at room temperature and if you like to eat them cold, refrigerate them overnight.",
       "tips":"Melons are extremely sweet, so try pairing them with salty ingredients, such as thinly sliced prosciutto or country ham, or with blue cheese.",
       "peakMonths":[
          7
       ],
       "popularity":5
    },
    {
       "name":"Meyer lemon",
       "includes":"",
       "label":"meyer-lemons",
       "months":[
          0,
          1,
          2,
          3
       ],
       "months_display":"January — April",
       "description":"Where most lemons -- especially ones grown commercially -- offer little more than a jolt of acidity, the flavor of a Meyer is softer, rounder and more floral. Think of the taste of a lemon crossed with a tangerine.",
       "choose":"Meyer lemons should be firm and the peel should be soft and smooth. Rub the peel with your fingernail and you should get a strong whiff of that distinctive Meyer perfume. Watch out for fruit with soft spots or fruit that's been harvested haphazardly -- no holes where the stem was plucked.",
       "store":"While most lemons have thick rinds and can be left at room temperature for days without ill effect, the peel of a Meyer is thinner and more delicate. Refrigerate them, wrapped in a plastic bag. If you've got backyard trees and have too much fruit for one time, you can juice the lemons into ice cube trays and zest a little of the peel over the top. Freeze in an airtight bag and you've got Meyer flavor for months.",
       "tips":"The peel is soft and smooth and contains the oils that carry so much of the fragrance. To get the Meyer's full effect, be sure to use some of that zest as well.",
       "peakMonths":[
          1,
          2
       ],
       "popularity":5
    },
    {
       "name":"Berries",
       "includes":"berry,blueberry,blackberry,raspberry,loganberry,boysenberry,marionberry,olallieberry",
       "label":"mixed-berries",
       "months":[
          3,
          4,
          5,
          6,
          7,
          8,
          9
       ],
       "months_display":"April — October",
       "description":"Here is your heads-up to look for berries, all berries: red abnd golden raspberries, blackberries, olallieberries, boysenberries, loganberries, and local blueberries.",
       "choose":"Look for vibrantly colored berries that are not too soft. You can check the bottom of the container for bad berries that are hidden.",
       "store":"Refrigerated tightly sealed.",
       "tips":"Rinse berries in a strainer under gently running water just before serving.",
       "peakMonths":[
          6
       ],
       "popularity":5
    },
    {
       "name":"Mushrooms",
       "includes":"portobello,crimini,hen-of-the-woods,hon shimeji",
       "label":"mushrooms",
       "months":[
          10,
          11,
          0,
          1
       ],
       "months_display":"November — February",
       "description":"Though mushrooms are one of the last foods we eat from the wild, they also lend themselves to industrial production. Today at the market you can find brown button mushrooms, slightly larger cremini mushrooms and really big portobello mushrooms – all essentially the same mushroom at different stages of growth. And new growers are introducing Asian mushrooms to the produce market: shimeji, maitake (also called hen of the woods) and king trumpets (a large oyster mushroom). And then there are the greatest luxuries of all – the wild mushrooms.",
       "choose":"Mushrooms – whether wild or domestic – should be moist but not wet. They shouldn't be dry enough to crack; they should be moist enough to flex when you bend them.",
       "store":"Refrigerate mushrooms in a tightly sealed plastic bag, but slip in a paper towel to absorb any excess moisture.",
       "tips":"One trick with cooking mushrooms – start them in a very hot, dry pan, and add butter and minced shallots or garlic only once they've given up some moisture. Finish cooking until the moisture has been re-absorbed.",
       "peakMonths":[
          11,
          0
       ],
       "popularity":5
    },
    {
       "name":"Navel oranges",
       "includes":"",
       "label":"navel-oranges",
       "months":[
          11,
          0,
          1,
          2,
          3
       ],
       "months_display":"December — April",
       "description":"The navel orange, which is harvested in winter, has an exceptionally rich flavor, adaptable to all sorts of dishes.",
       "choose":"A deeply colored peel is pretty, but not necessarily the best indicator of quality. Indeed, later in the season, perfectly good oranges left on the tree sometimes experience “re-greening,” which affects the appearance but not the flavor. Instead, choose oranges that are firm to the touch and heavy for their size.",
       "store":"Oranges have relatively thick rinds and can store at room temperature for several days. To keep them longer, refrigerate them. If they came in plastic bags, it's a good idea to remove them to avoid trapped moisture.",
       "tips":"It makes excellent juice, but you do need to drink it fresh; a chemical compound called limonin turns it bitter after it sits. Also, because navels have oddly shaped segments, for serving in a dish it's better to slice them into wheels than try for separate sections.",
       "peakMonths":[
          1
       ],
       "popularity":5
    },
    {
       "name":"New potatoes",
       "includes":"",
       "label":"new potatoes",
       "months":[
          3,
          4
       ],
       "months_display":"April & May",
       "description":"Truly new potatoes are those that have been freshly dug and brought to market without curing. They have a distinctive flavor and creamy texture.",
       "choose":"The best way to tell truly new potatoes is to rub the skin with your thumb -- it should be delicate enough to scrape clean.",
       "store":"New potatoes can be stored at room temperature, but they won't last as long as regular potatoes -- several days instead of several weeks. When refrigerated, the starch will begin to convert to sugar, so if they're chilled for very long they'll taste sweet.",
       "tips":"When making a salad with new potatoes (or really, any potato), remember to sprinkle the potato with a little dressing while it is still hot so it will absorb the flavors.",
       "peakMonths":[
          3,
          4
       ],
       "popularity":5
    },
    {
       "name":"Okra",
       "includes":"",
       "label":"okra",
       "months":[
          5,
          6,
          7,
          8,
          9
       ],
       "months_display":"June — October",
       "description":"Some people think okra is slimy. But the fact is, okra is slimy AND delicious.",
       "choose":"Okra should have a deep green colored and be firm.",
       "store":"Store tightly wrapped in the refrigerator.",
       "tips":"Okra connoisseurs love it in part because the juice it gives off provides a delicate thickening to stews. If you're not among those, remember that cooking it quickly will reduce the sliminess.",
       "peakMonths":[
          7
       ],
       "popularity":3
    },
    {
       "name":"Passion fruit",
       "includes":"",
       "label":"passion-fruit",
       "months":[
          6,
          7,
          8
       ],
       "months_display":"July — September",
       "description":"Stereotypically tropical, we grow passion fruit in the Western United States, and is therefore local to us! Instead of transporting the fruit, the fruit can transport us -- to wonderful Maui.",
       "choose":"Ripe passion fruit are soft and wrinkled. Your nose will help you pick. They continue to ripen.",
       "store":"Store passion fruit in the fridge, tightly wrapped, but use it quickly.",
       "tips":"Passion fruit's pulp is the thing — simply cut the fruit in half and spoon it out. Try serving it over a fruit sorbet.",
       "peakMonths":[
          7
       ],
       "popularity":3
    },
    {
       "name":"Peaches and Nectarines",
       "includes":"",
       "label":"peaches-nectarines",
       "months":[
          5,
          6,
          7,
          8
       ],
       "months_display":"July — September",
       "description":"There's nothing peachier than perfectly seasonal peaches. Well, except for nectarines, which are an option for people who are put off by fuzzy fruit.",
       "choose":"Look for good, deep orange-golden color but most importantly, smell them -- they should be strongly fragrant.",
       "store":"Ripe peaches and nectarines will give a little bit when held in the hand with pressure. They will continue to ripen a little bit, so you don't have to pick perfectly ripe stone fruits.",
       "tips":"Peaches should be peeled before cooking – cut an “X” in the flower end and blanch them in boiling water until the peel starts to come away. Stop the cooking in an ice water bath and peel with your fingers. Nectarines don't need to be peeled.",
       "peakMonths":[
          6,
          7
       ],
       "popularity":8
    },
    {
       "name":"Pears",
       "includes":"",
       "label":"pears",
       "months":[
          7,
          8,
          9
       ],
       "months_display":"August — October",
       "description":"Bartletts are the predominate pear grown in California, and there are two growing sites with very different fruit. The earliest pears are harvested starting in August around the Sacramento delta area. They are fine, but the ones picked in September and October from the hilly orchards of Lake and Mendocino counties are much better.",
       "choose":"The best perfectly ripened Bartlett pears will be golden and fragrant and will have a slight softness at the neck. Don't worry if the fruit shows some russeting – that's only skin-deep and doesn't affect the flavor.",
       "store":"Pears will continue to ripen off the tree (indeed, they really have to ripen off the tree to avoid a woody texture). So if your pears are a little green and firm, just leave them at room temperature and they'll finish up nicely. Then you can refrigerate them.",
       "tips":"Almost all of the pears you'll find even at supermarkets are actually antique varieties, grown for hundreds of years. California's Bartletts, for example, are the same as the old Williams pear that was grown in England in the 1700s (and where the name of the liqueur Poire William comes from).",
       "peakMonths":[
          8
       ],
       "popularity":5
    },
    {
       "name":"Persimmons",
       "includes":"fuyu,hachiya",
       "label":"persimmons",
       "months":[
          8,
          9,
          10
       ],
       "months_display":"September — November",
       "description":"The persimmon world is cleanly divided between two families. Acorn-shaped Hachiya-type persimmons need to be softened before eating; Fuyus, shaped like slightly flattened apples, can be eaten crisp.",
       "choose":"Choose fruit that is deeply colored and heavy for its size. With Hachiyas, don't worry about black streaking and softness -- that goes hand in hand with ripeness. Fuyus, though, should always be firm.",
       "store":"Persimmons should be kept at room temperature until they are fully ripe. Then they can be refrigerated for as long as a couple of weeks.",
       "tips":"Hachiya persimmons are almost jelly-like when they're ripe. Fuyus are crisp enough that they can be sliced into salads.",
       "peakMonths":[
          9
       ],
       "popularity":5
    },
    {
       "name":"Plums",
       "includes":"",
       "label":"plums",
       "months":[
          4,
          5,
          6,
          7
       ],
       "months_display":"May — August",
       "description":"We can do a lot of different things with plums, and there are a lot of types of plum. Brined, dried, made into wine, jams, dumplings... Plums are the meat of onigiri, the salt vehicle of saladitos. We don't quite understand its potential. ",
       "choose":"Choose",
       "store":"Plums will continue to ripen after they've been harvested. If your fruit feels a little too hard, leave it at room temperature for a day or two and it will soften. Then, and only then, should you refrigerate it.",
       "tips":"Split a plum along the cleft that runs from stem to flower end and the seed will pop right out.",
       "peakMonths":[
          5,
          6
       ],
       "popularity":5
    },
    {
       "name":"Pomegranates",
       "includes":"",
       "label":"pomegranates",
       "months":[
          8,
          9,
          10,
          11
       ],
       "months_display":"September — December",
       "description":"Pomegranates are a lot of work (and a fair bit of mess), but the sweet-tart jewels you wind up with are worth it.",
       "choose":"Select pomegranates that are heavy for their size -- they'll be the juiciest. Don't worry too much about the color of the rind: that can vary from completely red to reddish-brown without it affecting the quality. Do look for deep color though.",
       "store":"Pomegranates should be refrigerated; they'll last at least three to four weeks. Once they've been seeded, the seeds can be frozen in a tightly sealed bag.",
       "tips":"To seed pomegranates without making a mess, score the peel in quarters, then submerge the fruit in a bowl of water and separate the peel and the pith. These will float while the seeds will sink.",
       "peakMonths":[
          9,
          10
       ],
       "popularity":5
    },
    {
       "name":"Radishes",
       "includes":"",
       "label":"radishes",
       "months":[
          0,
          1,
          2,
          3,
          4
       ],
       "months_display":"January — May",
       "description":"Radishes are among the fastest growing of all of the vegetables (as any veteran of elementary school science fairs can surely attest).",
       "choose":"Check the tops first; they should be bright green and not at all wilted. The roots should be brightly colored and free from cracks and nicks. Give them a squeeze to make sure there's no hollow or soft center.",
       "store":"Store radishes in a plastic bag in the refrigerator, removing the tops if you're not going to use them right away.",
       "tips":"Radish varieties differ in how pungent they are, and the same radish variety can differ depending on growing conditions -- irrigation tends to cool them, sulfurous soils tend to heat them. If you're sensitive, taste before you buy.",
       "peakMonths":[
          2
       ],
       "popularity":5
    },
    {
       "name":"Root vegetables",
       "includes":"parsnips,turnips,rutabagas",
       "label":"root-vegetables",
       "months":[
          10,
          11,
          0
       ],
       "months_display":"November — January",
       "description":"Why is it that people go crazy for carrots but ignore other root vegetables? They're among the sweetest things you can eat, particularly after they've gone through the first frost.",
       "choose":"Select root vegetables that are firm, with no soft spots or discoloration. If there are tops attached, make sure they're fresh and green. Avoid roots that have lots of hairy secondary roots.",
       "store":"Refrigerate in a tightly sealed plastic bag.",
       "tips":"Each root has a slightly different character. Parsnips are sweet; turnips have a slight horseradish edge. Rutabagas are somewhere in between.",
       "peakMonths":[
          7
       ],
       "popularity":5
    },
    {
       "name":"Shelling beans",
       "includes":"",
       "label":"shelling-beans",
       "months":[
          7,
          8
       ],
       "months_display":"August & September",
       "description":"If you're at the farmers market and see what looks like a wilting mound of what must once have been beautiful string beans tinted with patterns of cream and crimson, don't pass them by. These are shelling beans: varieties that are normally grown for drying but which can be sold (and cooked) fresh. They have a sweet, subtle flavor that's somewhere between the earthy complexity of dried and the green, vegetal taste of fresh. The season lasts for only two or three weeks, so get them while you can.",
       "choose":"Look for pods that have begun to shrivel and dry, with full-sized beans inside. These will be the most mature and have the best flavor.",
       "store":"If you're going to use the beans within a couple of days, simply refrigerate them in the pods. If you're going to store them for a little longer, shuck them first.",
       "tips":"Simmer shelling beans in just enough water to cover, just long enough until they're tender. And a little bit of ham or bacon will never hurt.",
       "peakMonths":[
          7,
          8
       ],
       "popularity":5
    },
    {
       "name":"Fresh herbs",
       "includes":"basil,cilantro,parsley,mint",
       "label":"soft-herbs",
       "months":[
          4,
          5,
          6,
          7,
          8,
          9
       ],
       "months_display":"May — October",
       "description":"Splurge on fresh herbs. For Mexican and Vietnamese food, cilantro is key. Basil is summer pesto, and summer salads. Chopped fine and sprinkled, Parsley is a level-up dish finisher. Mint is weird, but can be right.",
       "choose":"Choose herbs that are fresh, deeply green and not wilted. Parsley is the hardiest.",
       "store":"Treat them like cut flowers — stick them upright in a glass of water, drape a plastic bag over top, and keep cool.",
       "tips":"One of the easiest things to do with soft herbs is make a pureed sauce, like pesto. Puree herbs with minced garlic and salt and with the blender running, add olive oil until you have a sauce-y consistency. Adjust seasoning with a little lemon juice and you're there. It's almost impossible to go wrong.",
       "peakMonths":[
          6,
          7
       ],
       "popularity":5
    },
    {
       "name":"Specialty lettuces",
       "includes":"",
       "label":"specialty-lettuces",
       "months":[
          1,
          2,
          3,
          4
       ],
       "months_display":"February — May",
       "description":"Almost anything with a leaf can be considered a candidate for salad these days. The array of colors, textures and flavors is one of the real pleasures for the springtime cook.",
       "choose":"Crisp is everything when it comes to choosing types of lettuce, which begin wilting as soon as they're picked and this is especially critical with some of the softer varieties. Reject any lettuce that appear soft, and certainly if there are signs of darkening.",
       "store":"Keep lettuce in a tightly sealed plastic bag in the refrigerator crisper drawer.",
       "tips":"A great salad is made of many textures and flavors. Build upon a mix of lettuce varieties rather than a single one.",
       "peakMonths":[
          2,
          3
       ],
       "popularity":5
    },
    {
       "name":"Strawberries",
       "includes":"",
       "label":"strawberries",
       "months":[
          2,
          3,
          4
       ],
       "months_display":"March — May",
       "description":"We can get strawberries any time of year now, but I still think of them as a springtime treat. They're the bridge between winter's citrus and summer's stone fruit.",
       "choose":"Choosing good ones is pretty simple: your nose will know. Sniff around until you find a stand where the berries smell so good you can't resist. That's all there is to it, though you should also check the bottom of the basket to make sure the berries haven't gone over the hill and started leaking.",
       "store":"You can refrigerate berries, but the flavor is best if you leave them at room temperature and eat them the same day. Just before serving, wash gently in cool running water, pat dry and then hull them, removing the green top (removing it before washing will cause the berries to absorb more water).",
       "tips":"Strawberries are one of the most vexing of fruits because their quality varies on a weekly basis. Even the best varieties from the best farmers can be off if the plant is putting its energy into producing foliage rather than fruit. So you really need to taste before you buy.",
       "peakMonths":[
          3
       ],
       "popularity":5
    },
    {
       "name":"Sugar snap and snow peas",
       "includes":"",
       "label":"sugar-snap-and-snow-peas",
       "months":[
          1,
          2,
          3,
          4,
          5
       ],
       "months_display":"February — June",
       "description":"Want the flavor of an English pea without the hassle of shucking, and with a more reliably sweet flavor? Then go for the sugar snap pea. The snow pea, so popular in the ‘70s and ‘80s, is still found and offers almost as much flavor.",
       "choose":"Look for edible pod peas with crisp pods that show no dark blemishes or soft spots. Traces of white streaking are often found on sugar snaps and are nothing to worry about.",
       "store":"Refrigerate in a tightly sealed plastic bag.",
       "tips":"Edible pod peas need to be cooked as briefly as possible to retain their crunch, color and flavor. Blanch them in boiling water for a minute or two or sauté them briefly over high heat.",
       "peakMonths":[
          3
       ],
       "popularity":5
    },
    {
       "name":"Sweet potatoes",
       "includes":"yam",
       "label":"sweet-potatoes",
       "months":[
          10,
          11,
          0,
          1,
          2
       ],
       "months_display":"November — March",
       "description":"Whether they're the pale gold varieties or the dark orange ones that are mistakenly called yams, sweet potatoes are one of the most traditional highlights of the table at this time of year. And despite the marked differences between the two types, they can be used almost interchangeably.",
       "choose":"Orange sweet potatoes are sweeter and moister than the golden ones, which are drier, starchier and nuttier in flavor. If you're making a puree, for example, think about whether you want the finished texture to be dense and buttery (in which case, choose the orange sweet potatoes) or light and creamy (the golden ones).",
       "store":"Sweet potatoes can be stored at cool room temperature.",
       "tips":"Want an easy side dish? Bake sweet potatoes, then peel and puree in a food processor with butter and a little orange juice. They won't get sticky and starchy the way regular potatoes do.",
       "peakMonths":[
          4,
          5
       ],
       "popularity":5
    },
    {
       "name":"Tomatillos",
       "includes":"",
       "label":"tomatillos",
       "months":[
          1,
          2,
          3,
          7,
          8,
          9
       ],
       "months_display":"February — April & August — October",
       "description":"The secret to that irresistible lemony tang in so many Mexican dishes? It's the tomatillo, which looks like a small tomato wrapped in a papery husk. It's definitely an ingredient that deserves a wider audience.",
       "choose":"Choose tomatillos that are deep green and firm and that have a husk that is definitely dried out and papery. Once tomatillo fruit has started to turn yellow, it loses some of that flavor.",
       "store":"You can keep tomatillos with their husks wrapped in a plastic bag in the refrigerator. They're relatively hardy and will last a couple of weeks.",
       "tips":"To prepare tomatillos for serving, remove the husk and rinse off any sticky residue. You can puree them raw for a very sharp flavor, or roast them or grill them until soft for a mellower taste.",
       "peakMonths":[
          5
       ],
       "popularity":5
    },
    {
       "name":"Tomatoes",
       "includes":"",
       "label":"tomatoes",
       "months":[
          6,
          7,
          8,
          9
       ],
       "months_display":"July — October",
       "description":"Some people wait for the best tomatoes each year, and feel real saddness when they are gone. But don't feel bad for tomato-heads; they have their priorities straight.",
       "choose":"Tomatoes should be vibrantly colored with taut, shiny skin. There should be no soft or wrinkly spots.",
       "store":"Avoid refrigerating tomatoes – it destroys fresh tomato flavor. Keep them at room temperature, covered if you like.",
       "tips":"For cooking, choose firm, elongated tomatoes. Peel them by cutting an “X” in the blossom end and blanching them in boiling water until the peel starts to lift away. Transfer them to ice water to stop the cooking and peel with your fingers. You can simply squeeze the seeds out with your hands.",
       "peakMonths":[
          7,
          8
       ],
       "popularity":10
    },
    {
       "name":"Walnuts, almonds, pistachios",
       "includes":"",
       "label":"walnuts-almonds-pistachios",
       "months":[
          7,
          8,
          9
       ],
       "months_display":"All year",
       "description":"Cooks tend to regard nuts as staples, like flour or butter. But they do have a season and when you get them right after harvest, they taste fresher and their texture is almost creamy.",
       "choose":"With whole nuts, choose examples that are heavy for their size. With shelled nuts, look for meat that's plump and pale and avoid any that are shrunken and shriveled.",
       "store":"Whole nuts can be stored at room temperature for several weeks. Shelled nuts must be refrigerated immediately. Even better: Freeze them in a tightly sealed bag and they'll last for up to a year.",
       "tips":"Toast nuts before cooking them. You can do this either on a cookie sheet in a 400-degree oven, or in a dry skillet on top of the stove. Either way, cook until the nuts have browned slightly and give off a frankly “nutty” perfume.",
       "peakMonths":[
          8
       ],
       "popularity":5
    },
    {
       "name":"Winter squash",
       "includes":"butternut,kabocha,pumpkin,acorn,spaghetti,delicata",
       "label":"squash",
       "months":[
          8,
          9,
          10,
          11
       ],
       "months_display":"September — December",
       "description":"Why are they called “winter” squash if you buy them in the fall? Before refrigeration, these squash with their hard shells were among the few vegetables that could be stored through the cold months.",
       "choose":"Look for squash with deep, saturated colors and no soft spots or cracks. The stem should be hard and corky too.",
       "store":"Keep winter squash in a cool, dark place. You don't need to refrigerate them.",
       "tips":"To prepare winter squash, cut them in half and remove the seeds. Place them cut-side down on a baking sheet lined with aluminum foil and bake at 400 degrees until they can be easily pierced with a knife. Cool, then spoon away the tender flesh.",
       "peakMonths":[
          9,
          10
       ],
       "popularity":5
    },
    {
       "name":"Zucchini",
       "includes":"",
       "label":"zucchini",
       "months":[
          6,
          7,
          8
       ],
       "months_display":"July — September",
       "description":"Great zukes! Like all sqaush, zuccini's origin is in the Americas. However, the Italians developed this type of squash -- perfecting it for saucy tomato-based comfort foods.",
       "choose":"Bigger is not better: look for zucchini that are no longer than 6 to 8 inches. They should be firm and free of nicks and cuts. Fresh zucchini has tiny hairs. Darker and thinner zucchinis are more tender but can have richer flavor.",
       "store":"Keep zucchini tightly wrapped in the refrigerator.",
       "tips":"Though smaller zucchini are best for cooking by themselves, larger zucchini are still good for stuffing and baking.",
       "peakMonths":[
          7
       ],
       "popularity":5
    }
 ];

  // test app with fake data
  app.updateSeasonal();

  // TODO add startup code here


  // TODO add service worker code here
})();
