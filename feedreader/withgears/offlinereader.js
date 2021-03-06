var feeds = {};
var storeName = 'offlinereader';
var db;
var currentFeedLink;

if (google && google.load) {
  google.load('feeds', '1');
}

function load() {
  setupStore();
  setupDb();
  var rs = db.execute('select * from Feeds');
  while (rs.isValidRow()) {
    addFeedLinkToSidebar(rs.fieldByName('link'));
    rs.next();
  }
  rs.close();
  update();
  window.setInterval(update, 10*60*1000);
  window.setInterval(checkScroll, 1000);
}

function update() {
  var rs = db.execute('select * from Feeds');
  while (rs.isValidRow()) {
    loadUpdatedFeed(rs.fieldByName('link'));
    rs.next();
  }
  rs.close();
}

function setupStore() {
  var pageFiles = [ location.pathname, 'capture.gif', '../../scripts/gears_init.js', 'offlinereader.js', 'style.css'];
  var localServer;
      
  try {
    localServer = google.gears.factory.create('beta.localserver', '1.0');
  } catch (e) {
    alert('Could not create local server: ' + e.message);
    return;
  }
  
  // Load in the offline resources (js/css/etc)
  var store = localServer.openStore(storeName) || localServer.createStore(storeName);
  store.capture(pageFiles, function() {});
}

function clearStore() {
  google.gears.factory.create('beta.localserver', '1.0').removeStore(storeName);
}

function clearDb() {
  if (db) {
    db.execute('delete from Feeds');
    db.execute('delete from Entries');
    db.execute('drop table Feeds');
    db.execute('drop table Entries');
  }
}

function setupDb() {
  db = google.gears.factory.create('beta.database', '1.0');
  db.open('offlinereader');

  if (db) {
    db.execute('create table if not exists Feeds (title varchar(255), link varchar(255))');
    db.execute('create table if not exists Entries (feedLink varchar(255), title varchar(255), link varchar(255), content text, lat real, lng real, isRead int, entryNum int)');
  }
}

function loadFeed() {
  var feedUrl = document.getElementById('submitValue').value;
  var feed = new google.feeds.Feed(feedUrl);
  feed.setResultFormat(google.feeds.Feed.MIXED_FORMAT);
  feed.setNumEntries(8);
  feed.load(function(result) {
    addFeed(result.feed);
  });
}

function addFeed(feed) {
  // check if already exists
  var rs = db.execute('select * from Feeds where link = "' + feed.link + '"');
  if (rs.isValidRow()) return;

  db.execute('insert into Feeds (title, link) values (?, ?)', [ feed.title, feed.link]);
  for (var i = 0; i < feed.entries.length; i++) {
    var entry = feed.entries[i];
    var latlng = getLatLng(entry.xmlNode);
    db.execute('insert into Entries (feedLink, title, link, content, lat, lng, isRead, entryNum) values (?, ?, ?, ?, ?, ?, ?, ?)', [ feed.link, entry.title, entry.link, entry.content, latlng.lat, latlng.lng, 0, i]);
  }
  addFeedLinkToSidebar(feed.link);
  rs.close();
}

function loadUpdatedFeed(feedUrl) {
  var feed = new google.feeds.Feed(feedUrl);
  feed.setResultFormat(google.feeds.Feed.MIXED_FORMAT);
  feed.setNumEntries(8);
  feed.load(function(result) {
    updateFeed(result.feed);
  });
}

function updateFeed(feed) {
  for (var i = 0; i < feed.entries.length; i++) {
    var entry = feed.entries[i];
    var rs = db.execute('select * from Entries where link = "' + entry.link + '"');
    if (rs.isValidRow()) { 
      rs.close();
      continue;
    }
    rs.close();
    var latlng = getLatLng(entry.xmlNode);
    db.execute('insert into Entries (feedLink, title, link, content, lat, lng, isRead, entryNum) values (?, ?, ?, ?, ?, ?, ?, ?)', [ feed.link, entry.title, entry.link, entry.content, latlng.lat, latlng.lng, 0, i]);
  }
}

function addFeedLinkToSidebar(feedLink) {
  var rs = db.execute('select * from Feeds where link = "' + feedLink + '"');
  if (!rs.isValidRow()) return;
  var searchLink = document.createElement('a');
  searchLink.id = 'feedLink' + rs.fieldByName('link');
  searchLink.setAttribute("href", "javascript:displayFeed('" + rs.fieldByName('link') + "')");
  searchLink.innerHTML = rs.fieldByName('title') + ' (<span id="urC' + rs.fieldByName('link') + '">' + getNumUnRead(feedLink) + '</span>)';
  var status = document.getElementById('status');
  status.appendChild(searchLink);
  status.appendChild(document.createElement('br'));
  status.appendChild(document.createElement('br'));
  rs.close();
}

function displayFeed(feedLink) {
  currentFeedLink = feedLink;
  var rs = db.execute('select * from Feeds where link = "' + feedLink + '"');
  if (!rs.isValidRow()) return;
  var html = ['<h2>', rs.fieldByName('title'),'</h2>'];
  rs.close();

  var rs = db.execute('select * from Entries where feedLink = "' + feedLink + '"');
  if (!rs.isValidRow()) { 
    html.push('<h2>Nothing</h2>');
    document.getElementById("itemresults").innerHTML = html.join("");
    return;
  }
  while (rs.isValidRow()) {
    var title = rs.fieldByName('title');
    var link = rs.fieldByName('link');
    var content = rs.fieldByName('content');
    var isRead = rs.fieldByName('isRead');
    var entryNum = rs.fieldByName('entryNum');
    var lat = rs.fieldByName('lat');
    var lng = rs.fieldByName('lng');
    var className = (isRead == 1) ? 'item-read' : 'item-unread';
    html.push('<div class="' + className + '" id="feedItem' + entryNum + '">');
    html.push('<h3><a href="', link, '" target="_blank">', title, '</a></h3>', content, '<br>');
    if (lat) {
      html.push(getLinkedMap(lat, lng) + '<br>');
    }
    if (isRead == 0) {
      html.push('<input id="markAsRead' + entryNum + '" type="button" value="Mark this entry as read" onclick="markAsRead(\'' + feedLink + '\',\'' + entryNum + '\')"/>');
    }
    html.push('</div>');
    rs.next();
  }
  rs.close();
  document.getElementById("itemresults").innerHTML = html.join("");
}

function getLinkedMap(lat, lng) {
  var url = "http://maps.google.com/staticmap?center=" + lat + "," + lng + "&zoom=13&size=200x200&key=ABQIAAAA-O3c-Om9OcvXMOJXreXHAxQGj0PqsCtxKvarsoS-iqLdqZSKfxS27kJqGZajBjvuzOBLizi931BUow";
  var mapsUrl = "http://maps.google.com/?ll=" + lat + "," + lng + "&z=13";
  var html = '<a target="_blank" href="' + mapsUrl + '"><img src="' + url + '"></a>';
  return html;
}

function getLatLng(xmlNode) {
  var latlng = {};
  var georssNS = "http://www.georss.org/georss";
  var gmlNS = "http://www.opengis.net/gml";
  var pointnode = google.feeds.getElementsByTagNameNS(xmlNode, georssNS, "point");
  if (pointnode.length > 0) {
    latlng.lat = pointnode[0].firstChild.nodeValue.split(" ")[0];
    latlng.lng = pointnode[0].firstChild.nodeValue.split(" ")[1];
  } 
  var wherenode = google.feeds.getElementsByTagNameNS(xmlNode, georssNS, "where");
  if (wherenode.length > 0) {
    var pointnode = google.feeds.getElementsByTagNameNS(xmlNode, gmlNS, "Point");
    if (pointnode.length > 0) {
      var posnode = google.feeds.getElementsByTagNameNS(pointnode[0], gmlNS, "pos");
      latlng.lat = posnode[0].firstChild.nodeValue.split(" ")[0];
      latlng.lng = posnode[0].firstChild.nodeValue.split(" ")[1]; 
    } 
  }
  if (!latlng.lat) {
    latlng.lat = null;
    latlng.lng = null;
  }
  return latlng;
}

function markAsRead(feedLink, entryNum) {
  var rs = db.execute('update Entries set isRead = 1 where feedLink = "' + feedLink + '" and entryNum = ' + entryNum);
  rs.close(); 
  var numUnRead = getNumUnRead(feedLink);
  document.getElementById('urC' + feedLink).innerHTML = numUnRead;
  document.getElementById('feedItem' + entryNum).className = 'item-read';
  document.getElementById('markAsRead' + entryNum).style.display = 'none';
}

function getNumUnRead(feedLink) {
  var rs = db.execute('select * from Entries where feedLink = "' + feedLink + '" and isRead = 0');
  var numUnRead = 0;
  while (rs.isValidRow()) {
    numUnRead++;
    rs.next();
  }
  rs.close();
  return numUnRead;
}

function checkScroll() {
  var container = document.getElementById("itemresults");
  var containerBottom = container.scrollTop;
  var i = 0;
  while (el = document.getElementById("feedItem" + i)) {
    var elementBottom = el.offsetTop + el.clientHeight;
    if (containerBottom > elementBottom) {
      // todo: dont mark as read if its already read
      markAsRead(currentFeedLink, i);
    }
     i++;
  }
}
