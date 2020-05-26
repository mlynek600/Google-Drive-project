const CLIENT_ID = "YOUR_CLIENT_ID";
const API_KEY = "YOUR_API_KEY";

const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
];

const SCOPES = "https://www.googleapis.com/auth/drive";

const authorizeButton = document.getElementById("authorize_button");
const signoutButton = document.getElementById("signout_button");

const pre = document.getElementById("content");

const input = document.getElementById("input");
const searchContainer = document.getElementById("search-container");

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    })
    .then(
      function() {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      function(error) {
        appendPre(JSON.stringify(error, null, 2));
      }
    );
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    listFiles();
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function appendPre(message) {
  const textContent = document.createTextNode(message + "\n");
  pre.appendChild(textContent);
}

function appendSearch(message) {
  const textContent = document.createTextNode(message + "\n");
  searchContainer.appendChild(textContent);
}

function clearFilesList() {
  [...pre.childNodes].forEach(
    file => file.nodeType != 1 && file.parentNode.removeChild(file)
  );
}

function clearSearchList() {
  [...searchContainer.childNodes].forEach(
    file => file.nodeType != 1 && file.parentNode.removeChild(file)
  );
}

function listFiles() {
  gapi.client.drive.files
    .list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name)"
    })
    .then(function(response) {
      clearFilesList();
      appendPre("10 pierwszych plików z mojego dysku Google Drive:");
      const files = response.result.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          appendPre(file.name + " (" + file.id + ")");
        }
      } else {
        appendPre("No files found.");
      }
    });
}

function search() {
  gapi.client.drive.files
    .list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name)",
      q: `name contains "${input.value}"`
    })
    .then(function(response) {
      clearSearchList();
      const files = response.result.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          appendSearch(file.name);
        }
      } else {
        appendSearch("No files found.");
      }
    });
}
