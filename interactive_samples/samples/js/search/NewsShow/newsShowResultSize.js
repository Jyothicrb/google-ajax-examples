/*
 * The Google NewsShow embeds a news slideshow on your page, letting your users see headlines 
 * and previews of Google News Search results, based on queries that you've selected.
 *
 * This sample will show how to specify queries for the News Show.
 * http://code.google.com/apis/ajaxsearch/documentation/newsshow.html
*/

google.load("elements", "1", {packages : ["newsshow"]});

function onLoad() {
  // Set the size of the results of these queries to small.
  var options = {
    "queryList" : [
      {
        "title" : "Great Football",
        "q" : "USC Football",
        "rsz" : "small"
      },
      {
        "title" : "NHL Hockey",
        "q" : "NHL",
        "rsz" : "large"
      }
    ]
  }
  var content = document.getElementById('content');
  var newsShow = new google.elements.NewsShow(content, options);
}

google.setOnLoadCallback(onLoad);