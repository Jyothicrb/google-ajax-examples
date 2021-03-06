google.friendconnect.container.setParentUrl('/' /* location of rpc_relay.html and canvas.html */);
google.friendconnect.container.loadOpenSocialApi({
  site: '16213644786251996348', // Change this on your site
  onload: function() { initAllData(); }
});


function initAllData() {
  var req = opensocial.newDataRequest();
  req.add(req.newFetchPersonRequest("OWNER"), "owner_data");
  req.add(req.newFetchPersonRequest("VIEWER"), "viewer_data");
  var idspec = new opensocial.IdSpec({
      'userId' : 'OWNER',
      'groupId' : 'FRIENDS'
  });
  req.add(req.newFetchPeopleRequest(idspec), 'site_friends');
  req.send(onData);
};

function onData(data) {
  if (!data.get("owner_data").hadError()) {
    var owner_data = data.get("owner_data").getData();
    document.getElementById("site-name").innerHTML = owner_data.getDisplayName();
  }

  if (data.get("viewer_data").hadError()) {
    var options = {
      id: "viewer-info"
    }
    google.friendconnect.renderSignInButton(options);
  } else {
    var viewer_info = document.getElementById("viewer-info");
    var viewer = data.get("viewer_data").getData();
    viewer_info.innerHTML = "Hello, " + viewer.getDisplayName() + " " +
        "<a href='#' onclick='google.friendconnect.requestSettings()'>Settings</a> | " + 
        "<a href='#' onclick='google.friendconnect.requestInvite()'>Invite</a> | " +
        "<a href='#' onclick='google.friendconnect.requestSignOut()'>Sign out</a>";
  }
    
  if (!data.get("site_friends").hadError()) {
    var site_friends = data.get("site_friends").getData();
    var list = document.getElementById("friends-list");
    list.innerHTML = "";
    site_friends.each(function(friend) {
      list.innerHTML += "<li>" + friend.getDisplayName() + "</li>";
    });
  }
};