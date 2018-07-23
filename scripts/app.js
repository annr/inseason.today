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

  var app = {
    isLoading: true,
    produce: [],
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
    var today = new Date();

    app.produce.forEach(function(item) {
      if (item.peakMonths.includes(today.getMonth()) && item.months.length < 5) { // if peak, add to top of list.
        // to get to the top of the list, it has to also not be available for that many months.
        // We assume that the peak is going to be between start and end months, 
        // but there could be bad data.
        app.prependList(app.getCard(item));
      } else if (item.months.includes(today.getMonth())) {
        app.appendList(item, app.getCard(item));
      }
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
    var card = app.cardTemplate.cloneNode(true);
    card.classList.remove('cardTemplate');
    card.querySelector('.item-name').textContent = item.name;
    card.querySelector('.item-description').textContent = item.description;
    card.querySelector('.item-image').setAttribute('alt', app.getName(item));
    card.querySelector('.item-image').setAttribute('style', 'background-image: url(images/produce/'+ item.label + '.jpg);');
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
    return card;
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
    var labelWithProperCase = item.label.charAt(0).toUpperCase() + item.label.substr(1);
    return item.optionalDisplayName || labelWithProperCase;
  }

  app.isOverPeak = function(item) {
    var today = new Date();
    return app.peakAverage(item.peakMonths) < today.getMonth();
  }

  app.isUnderPeak = function(item) {
    var today = new Date();
    return app.peakAverage(item.peakMonths) > today.getMonth();
  }

  app.prependList = function(card) {
    app.container.prepend(card);
    // add listener to activators and close link:
    app.prepareHandlers(card);
  }

  app.peakAverage = function(peakMonths) {
    var sum = 0;
    for( var i = 0; i < newMonths.length; i++ ){
        sum += parseInt( newMonths[i], 10 ); //don't forget to add the base
    }
    return sum/newMonths.length;
  }

  app.prepareHandlers = function(card) {
    // add listener to activators and close link:
    card.querySelector('.close').addEventListener('click', function() {
      app.toggleInfoOff(card.querySelector('.item-info'));
    });
    var openers = card.querySelectorAll('.activator');
    for (var i = 0; i < openers.length; i++) {
      openers[i].addEventListener('click', function(event) {
        app.toggleInfoOn(card.querySelector('.item-info'));
      });
    }
  }

  app.appendList = function(item, card) {
    //var missedPeakText = 'Best in ' + app.months[item.peakMonths];
    //var bestIn = card.querySelector('.item-best');
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
       "tips":"While varietal distinctions in most fruit have been smoothed over, they’re still terribly important with apples. There are apples that are terrific early, but don’t store (such as Galas), and some that are harvested later and will taste good for months (such as Honeycrisp). Taste before you buy.",
       "peakMonths":[
          8,
          9
       ]
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
       "description":"Because so much of the apricot harvest has gone to drying and canning, most lacked flavor when sold fresh. But newly introduced apriums – crosses between apricots and plums – offer taste and texture that hearkens back to the good old days.",
       "choose":"Apricots and apriums, like all stone fruit, will continue to ripen after they’ve been harvested. Look for golden background color and pay no attention to the red blush.",
       "store":"Apricots can be stored at cool room temperature for a few days, particularly if they are underripe. After that, refrigerate in a tightly sealed plastic bag.",
       "tips":"In Southern California we are fortunate to have some orchards that still produce the lovely old-fashioned variety Blenheim. These are troublesome to grow, but their flavor and texture is unrivaled.",
       "peakMonths":[
          5
       ]
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
       "tips":"When you’re trimming artichokes, don’t throw away the stems. They have the same flavor as the heart and are just as tender if you peel the hard green skin.",
       "peakMonths":[
          3,
          4,
          9,
          10
       ]
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
       "tips":"If you’re unfamiliar with Asian pears, know that they are sometimes referred to as “apple-pears,” which is a perfectly good summation of their qualities.",
       "peakMonths":[
          8
       ]
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
       ]
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
          6
       ],
       "months_display":"February — July",
       "description":"There are many reasons to love living in California, but ranking high among them are the variety of avocados we can try; as wonderful as Hass avocados are, try a Reed or a Gwen.",
       "choose":"Remember that avocados will only ripen after they’ve been picked, and that that process can take as long as a week. Really ripe avocados will give when they are squeezed gently (use your palm, not your fingers). But usually, you're better off buying avocados that are quite firm, even hard, and ripening them at home. It'll take only a couple of days, and it will keep you from getting stuck with fruit that's been badly bruised by overenthusiastic shoppers.",
       "store":"Keep avocados at room temperature until they are fully ripe.",
       "tips":"The flesh of avocados will begin to blacken as soon as the fruit is cut, so don’t try to prepare them in advance.",
       "peakMonths":[
          3,
          4
       ]
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
       "choose":"Select beets that are heavy for their size and show no surface nicks or cuts. If they're sold with their tops on, the greens are always a good indicator of freshness as they show wilting very quickly (they're also delicious – don’t discard them).",
       "store":"Refrigerate in a tightly sealed plastic bag.",
       "tips":"Prepare beets by wrapping them in aluminum foil and baking at 400 degrees until they are tender enough to pierce with a knife. Cool them and the peels will slip right off.",
       "peakMonths":[
          4,
          5
       ]
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
       ]
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
       ]
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
       "description":"Like cauliflower, to which it’s closely related, broccoli is a vegetable with two faces. Cook it quickly and the flavor is bold and assertive. Push it a little longer and it becomes sweet and complex.",
       "choose":"Choose broccoli with flower heads that are tightly closed and blue-green, rather than pale green or even yellow. Feel the stock with your fingernail – overgrown broccoli will be too tough to dent and will be stringy when cooked.",
       "store":"For a staple vegetable, broccoli spoils rather quickly. Treat it as you would a lettuce – tightly wrapped in the crisper drawer of the refrigerator. And use it as soon as you can.",
       "tips":"Besides the familiar “tree” broccoli, also look for broccolini (sometimes called “baby broccoli”), broccoli rabe and Chinese broccoli (gai lan). These have more stem than flower head, so they lend themselves to different dishes.",
       "peakMonths":[
          3,
          4
       ]
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
       ]
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
       "description":"Once carrots came in one model — fat and orange. Today you can find them in a wide variety of shapes, sizes and colors. And they’re more than just ornamental: well-grown carrots are among the sweetest of the root vegetables.",
       "choose":"The best way to choose carrots is by the greens — they should be fresh and crisp looking. After that, make sure the roots are deeply colored (whatever the color) and vibrant and make sure there are no cracks or deep dings.",
       "store":"Store carrots tightly wrapped in the crisper drawer. Be sure to remove the tops before storing as they will draw moisture from the roots, wilting them faster.",
       "tips":"Want to look like a genius cook? Slice trimmed carrots in 1/2-inch rounds; place them in a wide skillet with a good knob of butter and just enough water to cover the bottom of the pan; cover and cook over medium heat until the carrots are just tender; remove the lid, turn the heat up to high and cook, stirring constantly, until the liquid has evaporated, leaving a golden glaze.",
       "peakMonths":[
          3
       ]
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
       "description":"For cooks, cauliflower has two distinctive personalities. Blanch it briefly and it has an aggressive, grassy quality that pairs well with big flavors like olives and garlic. Cook it until it’s soft and cauliflower becomes sweet and earthy.",
       "choose":"Cauliflower heads should be firm and tightly closed. White varieties should be very pale, with no dark \"sunburned\" spots. Reject any heads that show signs of softness, that's the start of spoilage.",
       "store":"Though it seems durable, cauliflower is extremely perishable. Keep it tightly wrapped in the crisper drawer of the refrigerator.",
       "tips":"Unlike other vegetables, the color of cauliflower lasts through cooking, particularly if you add a little acidity, either vinegar or lemon juice.",
       "peakMonths":[
          3,
          4
       ]
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
       "description":"You’ll usually find chard in three variations: green, which has white stems and a fairly mild flavor; red, which closely resembles beet greens in look and taste; and rainbow, which is not really a genetic variety but a mix of types that includes both red and white, plus shades of pink and gold (sadly, beautiful as they are raw, the color dulls with cooking). The term “Swiss chard” generally refers to any of those three. All of them have fairly crisp, ridged stems and thick, fleshy leaves that are, frankly, unpleasant raw but become absolutely wonderful when cooked.",
       "choose":"Don’t worry so much about the leaves – you’ll get a lot more clues about the freshness of the chard by looking at the stems (they seem to wilt before the leaves do). The stems should be firm and crisp. Examine the cut end – it should be somewhat moist and fresh-looking, with minimal darkening.",
       "store":"Keep chard tightly wrapped in a plastic bag in the crisper drawer of the refrigerator. Properly stored, it’ll last a week or so.",
       "tips":"Chard often seems to be sandier than some other greens, so clean it thoroughly by covering it with water in the sink and then giving it a good shake. It’s important that you do this right before cooking rather than before you stick the chard in the fridge – excess moisture is the great enemy of almost all fruits and vegetables.",
       "peakMonths":[
          1,
          2
       ]
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
       "description":"There is no surer, happier sign that summer is coming than the appearance of the first cherries at the market. The smallest and earliest of the stone fruit, they’re a harbinger of the peaches, plums and nectarines shortly to come.",
       "choose":"Look for cherries with firm, shiny, smooth skins. Usually the darker the red, the better (with the most common varieties, this is a sign of ripeness). Also check the stems, they should be green and flexible; they turn brown and woody in storage.",
       "store":"Refrigerate cherries in a tightly sealed plastic bag. They'll last a couple of weeks, at least theoretically (you'll probably eat them by then).",
       "tips":"Cherries are also closely related to almonds; if you want to beef up the flavor of cherries in a dish, add just a drop or two of almond extract.",
       "peakMonths":[
          5
       ]
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
       "description":"Corn is frustrating. Old varieties had terrific flavor, but the sugar started converting to starch sometimes within hours. Modern varieties stay sweeter longer, but some corn lovers complain that they don’t have the same flavor. Still, is there anything sweeter than that first bite of corn on the cob?",
       "choose":"Ears should be well filled out (check the tips of the ears to make sure there are kernels), and make sure the silk is still soft, not dried out. Don't shuck the whole ear before buying, though; it makes the farmers really cranky.",
       "store":"Corn should be refrigerated, tightly wrapped.",
       "tips":"White corn is not necessarily sweeter than yellow; which color you prefer has more to do with where you were raised than the actual flavor of the corn.",
       "peakMonths":[
          6,
          7
       ]
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
       "description":"Cool and crisp, incredibly refreshing in salads, cucumbers — along with tomatoes — are the stars of summer. They’re particularly good when served with seafood. And these days you can find so many different kinds.",
       "choose":"Choose cucumbers that are firm, vibrantly colored and without any soft or shriveled spots.",
       "store":"Keep cucumbers in a tightly sealed bag in the crisper drawer of the refrigerator.",
       "tips":"Most cucumbers don’t need to be peeled, but if the skin feels particularly thick, or if they’ve been waxed, then you should. Also, take a bite — if the cucumber is excessively bitter, peel them because the compounds that cause bitterness are usually located right under the skin.",
       "peakMonths":[
          6
       ]
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
       "description":"The sheer variety of eggplants in the market can be a bit overwhelming, but there is good news: For the most part, eggplant tastes like eggplant. Only the degree of bitterness varies somewhat. Other than that, the main difference among the varieties is texture. Eggplant can be firm, even slightly stringy, or it can be creamy. This can be hard to predict, although generally the familiar black globe eggplants are among the most fibrous.",
       "choose":"There are a lot of myths about eggplant and bitterness. Bitterness doesn't come from too many seeds or from a certain shape or type; it comes from being over-mature. So be sure to choose eggplant that is firm, even hard to the touch. There should be no shriveling or soft spots. Also check the calyx (the green leaves at the stem end); it should be fresh and green, not dried out and brown.",
       "store":"You can leave eggplants at room temperature for a day or two with no ill effects. After that, refrigerate them, but not for too long. Odd as it may seem, eggplant is a tropical fruit and suffers chill damage very quickly.",
       "tips":"Eggplant is one of the best vegetables on the grill – cut it into thick slices, brush with garlic-flavored olive oil and cook over a medium fire until soft. Then brush with more olive oil and sprinkle with vinegar and salt.",
       "peakMonths":[
          7,
          8
       ]
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
       "description":"There are few spring flavors that rival that of a really sweet English pea, but there are also few flavors more transitory. Peas begin converting sugar to starch as soon as they’re picked. Within a couple of days, they’re bland. Taste before you buy.",
       "choose":"Look for pods that are firm and crisp. They shouldn't bend at all but should snap. The color in general should be a saturated pale green. Some peas will show a little white scarring on the pod; that's not a problem.",
       "store":"Refrigerate in a tightly sealed plastic bag. They'll last four or five days.",
       "tips":"Shucking peas is one of the most communal of cooking activities. It’s unbelievably tedious, so it’s always a good idea to enlist a friend to help. If nothing else, you can talk about how boring it is.",
       "peakMonths":[
          2,
          3
       ]
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
       ]
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
       "description":"One of the most versatile of the cool-weather vegetables, you can shave fennel thin and use it crisp in salads, or you can braise it until it’s soft and use it as a side dish. Either way, its licorice flavor is a perfect fit.",
       "choose":"Look for fennel with fresh-looking greens on long branches. (As the fennel sits, the greens wilt and grocery managers trim them.) The bulbs should be bright white with no discolorations or soft spots.",
       "store":"Keep in the refrigerator in a tightly sealed plastic bag. You may need to double-bag in order to cover the fronds.",
       "tips":"If you’re serving fennel raw, it’s a good idea to quarter it lengthwise first, and cut away the solid core.",
       "peakMonths":[
          1
       ]
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
       "description":"Figs are among the most sensuous of fruits, almost melting in texture and with a sweet, jam-like center. Considered rarities not so long ago, fresh figs have become more and more available in the last five years as cooks have discovered their magic.",
       "choose":"Figs are quite fragile, and because they don't continue ripening after harvest, choosing them is a balancing act. You want them soft and ripe but not smashed. A few tears in the skin will be just fine, though. Real fig lovers say to look for a drip of moisture in the little hole at the bottom of the fruit. Smell is important, too. There shouldn't be any whiff of fermentation.",
       "store":"Figs are so delicate that they have to be refrigerated; they can start to spoil within a few hours of being harvested.",
       "tips":"Some green fig varieties are grown primarily to be dried – they have thick skins and the flavors are unremarkable. But if you see Adriatic figs, snap them up, they’re among the best you’ll ever taste.",
       "peakMonths":[
          6
       ]
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
       "description":"The stars of deep summer are big juicy tomatoes. But unfortunately those take a while to ripen. Rather than jump the gun and settle for less-than-great fruit, choose these little tomatoes, which are bred to ripen early.",
       "choose":"Choose tomatoes that are vibrantly colored and without soft spots or wrinkling.",
       "store":"Store tiny tomatoes as you would the big ones — at room temperature. Chilling kills tomato flavor and it won’t come back.",
       "tips":"There are so many ways to use these little tomatoes, but one of the best is in a pasta sauce: Cut them in half; warm butter, garlic and the tomatoes in a skillet over medium heat; add a splash of white wine and cook just until the tomatoes have softened and released their juices.",
       "peakMonths":[
          4,
          5
       ]
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
       "description":"The largest and latest of the citrus fruits, grapefruit need some heat to sweeten up. This is especially true of the large pummelos and the crosses that come from them, such as Oroblanco.",
       "choose":"Choose grapefruit that are heavy for their size; they are full of juice. Rub the peel with your thumbnail; the fruit with the most perfume will be the most flavorful.",
       "store":"Because their peels are so thick, grapefruit can be stored at cool room temperature for a week or so. But refrigerating does them no harm.",
       "tips":"Though grapefruit aren’t nearly as trendy as blood oranges, their complex flavor lends itself to just as many – if not more – different uses. Try making a beet salad with grapefruit.",
       "peakMonths":[
          4
       ]
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
       "description":"Most grapes you’ll find at supermarkets are grown to be snack food – they’re sweet but little else. But you can find grapes with real flavor at farmers markets.",
       "choose":"Choose grapes that are heavy for their size with taut skins.",
       "store":"Store grapes tightly wrapped in the refrigerator. Don't wash them until just before serving them. If the grapes are moist when you buy them, slip a paper towel into the bag to absorb the extra moisture.",
       "tips":"For a real treat, late in the season look for Thompson Seedless – the predominant California variety – that have begun to turn golden. The flavor is terrific.",
       "peakMonths":[
          7,
          8
       ]
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
       "description":"The world of green beans is split pretty neatly in two: the round and the flat. The round beans and even thinner haricots verts need to be cooked quickly in order to preserve their delicate crispness. Flat beans repay extensive cooking as their thick hulls take a while to tenderize.",
       "choose":"Green beans should be crisp and firm. There should be no soft spots or signs of discoloring. It makes for easier cooking and much nicer presentation if you sort while you're shopping and make sure you're only keeping the straightest beans (they can be extremely kinky).",
       "store":"Keep beans refrigerated in a plastic bag. If you're going to store them for very long, slip in a piece of paper towel to absorb any extra moisture.",
       "tips":"Though these are sometimes still called “string” beans, in most modern varieties that filament that runs the length of the pod has been bred out. Still, it’s worth checking.",
       "peakMonths":[
          5,
          6
       ]
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
       "choose":"Green garlic comes in a range of sizes, from slim as a green onion to almost fully formed heads. Whatever the size, choose garlic that’s firm with no soft spots. If a hard papery skin has formed, it will have to be removed.",
       "store":"Store green garlic in the refrigerator, but keep it tightly sealed. It’s flavor may be mild, but its aroma is pungent and will permeate everything if you’re not careful.",
       "tips":"Green garlic is simply immature garlic. It has the perfume of the grown-up version, but is milder in flavor. Cook it slowly in butter and it makes a wonderful pasta sauce.",
       "peakMonths":[
          3
       ]
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
       "description":"Once the province of gardeners only, even modest supermarkets now stock rosemary, thyme and oregano. They’re wonderful for adding perfume to a dish.",
       "choose":"Choose hardy herbs that show no signs of wilting or browning.",
       "store":"Keep hardy herbs in the refrigerator, tightly wrapped in plastic. Better yet, grow them in a pot on a sunny windowsill.",
       "tips":"Be careful cooking with hardy herbs. While you can throw around soft herbs such as basil and mint with relative abandon, most hardy herbs have a much more assertive flavor and can become bitter when used incautiously.",
       "peakMonths":[
          11
       ]
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
       ]
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
       "tips":"Render some bacon or prosciutto, soften shallots, add the lima beans and cream just to cover. You’re on your way to heaven.",
       "peakMonths":[
          9,
          10
       ]
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
       "tips":"Many popular mandarin varieties can be seedless, if they’re grown in orchards isolated from other kinds of citrus. But that’s always a gamble, and even with fruit that’s advertised as being seedless you’ll find the occasional pip.",
       "peakMonths":[
          4,
          5
       ]
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
       "description":"If any fruit captures the sweet, dripping heart of summer, it's a good melon. There are two main families of melons: those with rough, netted or reticulated rinds (muskmelons, cantaloupes, etc.) and those whose rinds are baby-smooth (such as honeydew). The difference has nothing to do with color: There are orange-fleshed honeydews and green-fleshed cantaloupes (such as the Galia variety). Netted melons tend to have a slightly buttery texture and a flavor that tends much more toward the musky (hence the name). Smooth melons such as honeydew will have crisp texture and a very floral flavor.",
       "choose":"With netted melons, the best indicator is smell; they should have intense perfume. Also, the net should be raised and the rind underneath it should be tan to golden, not green. These melons \"slip\" from their stems when they are ripe, so their bellybuttons will be clean. The honeydew family is harder to choose (it is called \"inodorous\" for its lack of perfume). The best clue is color -- it should be rich and creamy. The rind will also feel almost waxy. If you find a melon that has freckles, buy it -- those are sugar spots.",
       "store":"Reticulated melons will continue to ripen after they've been harvested as long as you store them at room temperature. If you like melons chilled, refrigerate them overnight. Much longer than that and they can start to develop soft spots and pitting.",
       "tips":"Melons are extremely sweet, so try pairing them with salty ingredients, such as thinly sliced prosciutto or country ham, or with blue cheese.",
       "peakMonths":[
          7
       ]
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
       "choose":"Meyer lemons should be firm and the peel should be soft and smooth. Rub the peel with your fingernail and you should get a strong whiff of that distinctive Meyer perfume. Watch out for fruit with soft spots or fruit that’s been harvested haphazardly -- no holes where the stem was plucked.",
       "store":"While most lemons have thick rinds and can be left at room temperature for days without ill effect, the peel of a Meyer is thinner and more delicate. Refrigerate them, wrapped in a plastic bag. If you’ve got backyard trees and have too much fruit for one time, you can juice the lemons into ice cube trays and zest a little of the peel over the top. Freeze in an airtight bag and you’ve got Meyer flavor for months.",
       "tips":"The peel is soft and smooth and contains the oils that carry so much of the fragrance. To get the Meyer's full effect, be sure to use some of that zest as well.",
       "peakMonths":[
          1,
          2
       ]
    },
    {
       "name":"Mixed berries",
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
       "description":"Locally grown berries are everywhere now: raspberries (both red and golden), blackberries, olallieberries, boysenberries, loganberries, marionberries and even locally grown blueberries.",
       "choose":"Look for berries that are vibrantly colored, taut and shiny. Dull or wrinkled skin can be a sign that berries are over the hill. Check the bottom of the basket as well to make sure there isn't leakage from damaged berries that may be hidden.",
       "store":"Berries are very delicate and should be refrigerated tightly sealed.",
       "tips":"Rinse berries in a strainer under gently running water just before serving.",
       "peakMonths":[
          6
       ]
    },
    {
       "name":"Mulberries",
       "includes":"",
       "label":"mulberries",
       "months":[
          5,
          6
       ],
       "months_display":"June & July",
       "description":"Not so long ago, these little gems (think of what you can only dream of a blackberry tasting like) were so scarce that they were sold like contraband. Celebrity pastry chefs practically stalked the few farmers who had them. Mulberries have been a little more plentiful recently, though if you want them you certainly have to get to the farmers market early and know whom to ask. But with mulberries, the hunt is part of the savor.",
       "choose":"Mulberries should be slightly firm, deeply colored and fragrant.",
       "store":"Because they are so fragile, mulberries should be refrigerated as soon as possible.",
       "tips":"Because mulberries are so rare, serve them as plainly as possible – just a little lightly sweetened whipped cream or yogurt is perfect.",
       "peakMonths":[
          5,
          6
       ]
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
       "tips":"One trick with cooking mushrooms – start them in a very hot, dry pan, and add butter and minced shallots or garlic only once they’ve given up some moisture. Finish cooking until the moisture has been re-absorbed.",
       "peakMonths":[
          11,
          0,
       ]
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
       "store":"Oranges have relatively thick rinds and can store at room temperature for several days. To keep them longer, refrigerate them. If they came in plastic bags, it’s a good idea to remove them to avoid trapped moisture.",
       "tips":"It makes excellent juice, but you do need to drink it fresh; a chemical compound called limonin turns it bitter after it sits. Also, because navels have oddly shaped segments, for serving in a dish it’s better to slice them into wheels than try for separate sections.",
       "peakMonths":[
          3,
          4
       ]
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
       ]
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
       "description":"Either you love okra’s slightly viscous texture or you hate it and call it slimy. Count a good portion of the world’s population among the first group.",
       "choose":"Choose okra that is deeply colored and firm. Avoid okra that is oversized or too ripe — it will be even more slimy.",
       "store":"Refrigerate okra tightly wrapped in a plastic bag; if there is much surface moisture, slip a sheet of paper towel in the bag to absorb it.",
       "tips":"Okra connoisseurs love it in part because the juice it gives off provides a delicate thickening to stews. If you’re not among those, remember that cooking it quickly will reduce the sliminess.",
       "peakMonths":[
          7
       ]
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
       "description":"Take a look at passion fruit and you wonder who could have thought up that name? It’s purple and wrinkled. But when you taste the pulp that’s inside, you’ll understand. It has a profound tropical fruit flavor.",
       "choose":"Choosing ripe passion fruit couldn’t be simpler. Look for fruit that is deeply dimpled (even wrinkled, as long as it’s not dried out) and take a whiff — the perfume tells all. And remember, passion fruit will continue to ripen if left at room temperature.",
       "store":"Store ripe passion fruit in the refrigerator tightly sealed in a plastic bag. But remember that it’s delicate and should be used quickly.",
       "tips":"Passion fruit’s pulp is the thing — simply cut the fruit in half and spoon it out. Try serving it over a fruit sorbet.",
       "peakMonths":[
          7
       ]
    },
    {
       "name":"Stone fruits",
       "includes":"",
       "label":"peaches-nectarines",
       "months":[
          6,
          7,
          8
       ],
       "months_display":"July — September",
       "description":"Kissing cousins, these fruit are the queens of the summer harvest. The main difference between them is that peaches are fuzzy while nectarines are smooth. Connoisseurs may argue that the peach flavor is a little more musky, while nectarines are slightly more lemony.",
       "choose":"The trick to choosing peaches and nectarines is to look at the background color, not the red overlay. The background should be golden, with the best fruits having almost an orange tint. And always, above all, trust your nose. Great ripe peaches and nectarines have an irresistible perfume.",
       "store":"Perfectly ripe peaches and nectarines will have a slight give to their texture, but both will continue to ripen after they’ve been picked, so don’t worry if your fruit is a little firm. But don’t refrigerate them until they’ve softened and become fragrant.",
       "tips":"Peaches should be peeled before cooking – cut an “X” in the flower end and blanch them in boiling water until the peel starts to come away. Stop the cooking in an ice water bath and peel with your fingers. Nectarines don’t need to be peeled.",
       "peakMonths":[
          7
       ]
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
       "tips":"Almost all of the pears you’ll find even at supermarkets are actually antique varieties, grown for hundreds of years. California’s Bartletts, for example, are the same as the old Williams pear that was grown in England in the 1700s (and where the name of the liqueur Poire William comes from).",
       "peakMonths":[
          8
       ]
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
       "tips":"Hachiya persimmons are almost jelly-like when they’re ripe. Fuyus are crisp enough that they can be sliced into salads.",
       "peakMonths":[
          9
       ]
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
       "description":"There may be more different varieties of plums than of any other single fruit. But as if that wasn’t enough, modern plant breeders have been working at crossing plums with apricots to come up with even more varieties.",
       "choose":"Choose plums that are deeply colored, shiny and firm but not hard. If the plum looks like it’s lightly covered in white dust, that’s a good thing – that’s a natural “bloom” that indicates that the fruit hasn’t been overhandled.",
       "store":"Plums will continue to ripen after they’ve been harvested. If your fruit feels a little too hard, leave it at room temperature for a day or two and it will soften. Then, and only then, should you refrigerate it.",
       "tips":"Split a plum along the cleft that runs from stem to flower end and the seed will pop right out.",
       "peakMonths":[
          5,
          6
       ]
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
       ]
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
       ]
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
       ]
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
       "tips":"Simmer shelling beans in just enough water to cover, just long enough until they’re tender. And a little bit of ham or bacon will never hurt.",
       "peakMonths":[
          7,
          8
       ]
    },
    {
       "name":"Soft herbs",
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
       "description":"What’s the quickest and easiest way to add punch to a dish that seems lifeless? Add some chopped soft herbs, such as fresh basil, parsley, cilantro or mint just before serving. It will perk up almost anything.",
       "choose":"When choosing soft herbs, freshness is of the utmost importance. Basil, cilantro and mint will start to wilt and lose perfume almost as soon as they’re picked. Parsley is a little hardier, but you still don’t want to push it too far.",
       "store":"Particularly with basil, cilantro and mint, the best way to make them last is to treat them like cut flowers — stick them upright in a glass of water, drape a plastic bag over top, and refrigerate.",
       "tips":"One of the easiest things to do with soft herbs is make a pureed sauce, like pesto. Puree herbs with minced garlic and salt and with the blender running, add olive oil until you have a sauce-y consistency. Adjust seasoning with a little lemon juice and you’re there. It’s almost impossible to go wrong.",
       "peakMonths":[
          6,
          7
       ]
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
       "choose":"Crisp is everything when it comes to choosing types of lettuce, which begin wilting as soon as they’re picked and this is especially critical with some of the softer varieties. Reject any lettuce that appear soft, and certainly if there are signs of darkening.",
       "store":"Keep lettuce in a tightly sealed plastic bag in the refrigerator crisper drawer.",
       "tips":"A great salad is made of many textures and flavors. Build upon a mix of lettuce varieties rather than a single one.",
       "peakMonths":[
          2,
          3
       ]
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
       "description":"We can get strawberries any time of year now, but I still think of them as a springtime treat. They’re the bridge between winter’s citrus and summer’s stone fruit.",
       "choose":"Choosing good ones is pretty simple: your nose will know. Sniff around until you find a stand where the berries smell so good you can't resist. That's all there is to it, though you should also check the bottom of the basket to make sure the berries haven't gone over the hill and started leaking.",
       "store":"You can refrigerate berries, but the flavor is best if you leave them at room temperature and eat them the same day. Just before serving, wash gently in cool running water, pat dry and then hull them, removing the green top (removing it before washing will cause the berries to absorb more water).",
       "tips":"Strawberries are one of the most vexing of fruits because their quality varies on a weekly basis. Even the best varieties from the best farmers can be off if the plant is putting its energy into producing foliage rather than fruit. So you really need to taste before you buy.",
       "peakMonths":[
          3
       ]
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
       ]
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
       "tips":"Want an easy side dish? Bake sweet potatoes, then peel and puree in a food processor with butter and a little orange juice. They won’t get sticky and starchy the way regular potatoes do.",
       "peakMonths":[
          4,
          5
       ]
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
       "description":"The secret to that irresistible lemony tang in so many Mexican dishes? It’s the tomatillo, which looks like a small tomato wrapped in a papery husk. It’s definitely an ingredient that deserves a wider audience.",
       "choose":"Choose tomatillos that are deep green and firm and that have a husk that is definitely dried out and papery. Once tomatillo fruit has started to turn yellow, it loses some of that flavor.",
       "store":"You can keep tomatillos with their husks wrapped in a plastic bag in the refrigerator. They’re relatively hardy and will last a couple of weeks.",
       "tips":"To prepare tomatillos for serving, remove the husk and rinse off any sticky residue. You can puree them raw for a very sharp flavor, or roast them or grill them until soft for a mellower taste.",
       "peakMonths":[
          5
       ]
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
       "description":"If any item is emblematic of the pleasures of the farmers market, it’s the tomato. While the quality of supermarket tomatoes has improved, the farmers market is still the only place you can hope to find fruit with anything approaching true backyard flavor.",
       "choose":"Tomatoes should be vibrantly colored with taut, shiny skin. There should be no soft or wrinkly spots.",
       "store":"Never refrigerate tomatoes – it kills the flavor. Keep them at room temperature, lightly wrapped if you prefer.",
       "tips":"For cooking, choose firm, elongated tomatoes. Peel them by cutting an “X” in the blossom end and blanching them in boiling water until the peel starts to lift away. Transfer them to ice water to stop the cooking and peel with your fingers. You can simply squeeze the seeds out with your hands.",
       "peakMonths":[
          7,
          8
       ]
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
       "choose":"With whole nuts, choose examples that are heavy for their size. With shelled nuts, look for meat that’s plump and pale and avoid any that are shrunken and shriveled.",
       "store":"Whole nuts can be stored at room temperature for several weeks. Shelled nuts must be refrigerated immediately. Even better: Freeze them in a tightly sealed bag and they'll last for up to a year.",
       "tips":"Toast nuts before cooking them. You can do this either on a cookie sheet in a 400-degree oven, or in a dry skillet on top of the stove. Either way, cook until the nuts have browned slightly and give off a frankly “nutty” perfume.",
       "peakMonths":[
          8
       ]
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
       ]
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
       "description":"There are more than 100 varieties of zucchini grown today, ranging in color from gray-green to almost black and in shape from long and thin as a hot dog to bulbous (and that's not including the round zucchinis, which are technically summer pumpkins).",
       "choose":"Look for zucchini that are small to medium-sized (no longer than 6 to 8 inches). They should be firm and free of nicks and cuts. Really fresh zucchini will bristle with tiny hairs. Generally speaking, the more gray and bulbous a zucchini is, the firmer and milder the flesh will be -- good for soups. The darker and thinner zucchinis are more tender but usually have richer flavor.",
       "store":"Keep zucchini tightly wrapped in the refrigerator.",
       "tips":"Though smaller zucchini are best for cooking by themselves, larger zucchini are still good for stuffing and baking.",
       "peakMonths":[
          7
       ]
    }
 ];

  // test app with fake data
  app.updateSeasonal();

  // TODO add startup code here


  // TODO add service worker code here
})();
