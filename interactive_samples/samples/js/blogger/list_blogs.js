/* 
* Retrieve a list of blogs 
*/

// Obtain a reference to the 'content' div
var content = document.getElementById('content');

// Create the blogger service object
var bloggerService =
    new google.gdata.blogger.BloggerService('com.appspot.interactivesampler');

// The default "metafeed" feed is used to retrieve a list of blogs for a 
// particular logged-in user.
//
// The ID included in this URI can be retrieved from the <link rel="me">
// element in the Blog's HTML source
var feedUri = 'http://www.blogger.com/feeds/17839063281282724568/blogs';

// The callback method invoked when getBlogFeed() returns feed data
var handleBlogFeed = function(blogFeedRoot) {

  // Display Blogger Profile data
  var author = blogFeedRoot.feed.getAuthors();
  var authorName = author[0].getName().getValue();
  var authorUri = author[0].getUri().getValue();

  // This variable will buffer HTML output until execution is complete
  var html = '<h1>Blogger User</h1>'
       + '<h2>Profile Information</h2>'
       + '<dl>'
       + '<dt>Profile Name:</dt>'
       + '<dd>' + authorName + '</dd>'
       + '<dt>Profile Name:</dt>'
       + '<dd><a href="' + authorUri + '">' + authorUri + '</a></dd>';

  // Fetch blogs associated with this Blogger Profile
  html += '<h2>Blog List</h2>'
  var blogEntries = blogFeedRoot.feed.getEntries();

  // Has the user created any blogs?
  if(!blogEntries.length) {
    html += '<p>First <a href="http://www.blogger.com" '
          + 'target="_blank">create a blog</a>.</p>';
  } else {
    // Print list of blogs
    html += '<table rules="groups">'
          + '<thead><tr>'
          + '<th>Blog Name/Link</th><th>Last Updated</th>'
          + '</tr></thead>'
          + '<tbody>';

    for (var i = 0, blogEntry; blogEntry = blogEntries[i]; i++) {
      var blogTitle = blogEntry.getTitle().getText();
      var blogURL = blogEntry.getHtmlLink().getHref();
      var blogUpdated = blogEntry.getUpdated().getValue().getDate();
      html += '<tr>'
            + '<td><a href="' + blogURL + '" target="_blank">'
            + blogTitle
            + '</a></td>'
            + '<td>' + blogUpdated + '</td>'
            + '</tr>';
    }

    html += '</tbody>'
          + '</table>';
  };

  // Output buffered HTML and clear 'Loading...' message
  content.innerHTML = html;
};

// Error handler called when getBlogFeed() produces an error
var handleError = function(error) {
  content.innerHTML = '<pre>' + error + '</pre>';
};

// Submit the request using the blogger service object
bloggerService.getBlogFeed(feedUri, handleBlogFeed, handleError);
