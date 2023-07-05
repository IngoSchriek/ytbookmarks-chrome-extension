import { getCurrentTab } from "./utils.js";

const addNewBookmark = (bookmarksEl, bookmark) => {
  const newBookmarkTitle = document.createElement("input");
  const newBookmarkEl = document.createElement("div");
  const controlsEl = document.createElement("div");

  newBookmarkTitle.value = bookmark.desc;
  newBookmarkTitle.className = "bookmark-title";
  newBookmarkTitle.maxLength = "21";
  newBookmarkTitle.addEventListener("keydown", onRename);

  controlsEl.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsEl);
  setBookmarkAttributes("delete", onDelete, controlsEl); 

  newBookmarkEl.id = "bookmark-" + bookmark.time;
  newBookmarkEl.className = "bookmark";
  newBookmarkEl.setAttribute("timestamp", bookmark.time);

  newBookmarkEl.appendChild(newBookmarkTitle);
  newBookmarkEl.appendChild(controlsEl);
  bookmarksEl.appendChild(newBookmarkEl);
};

const viewBookmarks = (currentVideoBookmarks = []) => {
  const bookmarksEl = document.getElementsByClassName("bookmarks")[0];
  bookmarksEl.innerHTML = "";

  if (currentVideoBookmarks.length > 0) {
    for (let i = 0; i < currentVideoBookmarks.length; i++) {
      const bookmark = currentVideoBookmarks[i];
      addNewBookmark(bookmarksEl, bookmark);
    }
  } else {
    const containerEl = document.getElementsByClassName("container")[0];
    containerEl.innerHTML = '<div class="title">There are no bookmarks.</div>';
  }

  return;
};

const onPlay = async (e) => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getCurrentTab();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async (e) => {
  const activeTab = await getCurrentTab(); 
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  console.dir(e.target.parentNode.parentNode)
  const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "DELETE",
      value: bookmarkTime,
    },
    viewBookmarks
  );
};

const onRename = async (e) => {
  if (e.key !== "Enter") return;
  const activeTab = await getCurrentTab();
  const bookmarkTime = e.target.parentNode.getAttribute("timestamp");
  const bookmarkValue = e.target.value

  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "RENAME",
      desc: bookmarkValue,
      value: bookmarkTime,
    },
    viewBookmarks
  );
};

const setBookmarkAttributes = (src, eventListener, controlsParentEl) => {
  const controlEl = document.createElement("img");

  controlEl.src = `assets/${src}.png`;
  controlEl.addEventListener("click", eventListener);
  controlsParentEl.appendChild(controlEl);
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getCurrentTab();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo]
        ? JSON.parse(data[currentVideo])
        : [];

      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    const containerEl = document.getElementsByClassName("container")[0];
    containerEl.innerHTML =
      '<div class="title">Go to <a href="https://www.youtube.com" target="_blank" class="youtube">Youtube</a> and pick a video.</div>';
  }
});
