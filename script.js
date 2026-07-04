/* NARCISSISMUS — script.js
   no frameworks. old fashioned fetch + string building. */

var CONTACT_EMAIL = "narcissismus@example.com"; // <-- change to your real email

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadJSON(path, callback) {
  fetch(path)
    .then(function (res) {
      if (!res.ok) throw new Error("failed to load " + path);
      return res.json();
    })
    .then(callback)
    .catch(function (err) {
      console.error(err);
    });
}

/* ---------- NEWS ---------- */
function renderNews(list, targetId, limit) {
  var target = document.getElementById(targetId);
  if (!target) return;
  var items = list.slice();
  items.sort(function (a, b) { return b.date.localeCompare(a.date); });
  if (limit) items = items.slice(0, limit);

  var html = "";
  items.forEach(function (item) {
    html += '<div class="entry">';
    html += '<div class="date">[' + escapeHtml(item.date) + ']</div>';
    html += '<div class="title">' + escapeHtml(item.title);
    if (item.new) html += '<span class="tag-new">NEW</span>';
    html += '</div>';
    html += '<div class="text">' + escapeHtml(item.text) + '</div>';
    if (item.image) {
      html += '<img class="entry-photo" src="' + escapeHtml(item.image) + '" alt="">';
    }
    html += '</div>';
  });
  if (items.length === 0) {
    html = '<div class="entry"><div class="text">nothing here yet.</div></div>';
  }
  target.innerHTML = html;
}

/* ---------- RELEASES ---------- */
function renderReleases(list, targetId) {
  var target = document.getElementById(targetId);
  if (!target) return;
  var items = list.slice();
  items.sort(function (a, b) { return b.date.localeCompare(a.date); });

  var html = "";
  items.forEach(function (item) {
    html += '<div class="release-item">';
    html += '<div class="release-info">';

    html += '<div class="release-title">' + escapeHtml(item.title);
    if (item.new) html += '<span class="tag-new">NEW</span>';
    html += '</div>';

    html += '<div class="release-meta">';
    if (item.type) html += '<div>' + escapeHtml(item.type) + '</div>';
    if (item.release_date) html += '<div>Release date: ' + escapeHtml(item.release_date) + '</div>';
    if (item.duration) html += '<div>Duration: ' + escapeHtml(item.duration) + '</div>';
    if (item.copies) html += '<div>' + escapeHtml(item.copies) + '</div>';
    html += '</div>';

    if (item.tracks && item.tracks.length) {
      html += '<ol class="release-tracklist">';
      item.tracks.forEach(function (track) {
        html += '<li>' + escapeHtml(track) + '</li>';
      });
      html += '</ol>';
    }

    if (item.description) {
      html += '<div class="text">' + escapeHtml(item.description) + '</div>';
    }

    if (item.download) {
      html += '<a class="download-link" href="' + escapeHtml(item.download) + '">Download</a>';
    }

    html += '</div>'; // release-info

    if (item.cover) {
      html += '<div class="release-cover"><img src="' + escapeHtml(item.cover) + '" alt=""></div>';
    }

    html += '</div>'; // release-item
  });
  if (items.length === 0) {
    html = '<div class="entry"><div class="text">no releases yet.</div></div>';
  }
  target.innerHTML = html;
}

/* ---------- LINKS ---------- */
function renderLinks(list, targetId) {
  var target = document.getElementById(targetId);
  if (!target) return;

  var html = "";
  if (!list || list.length === 0) {
    html = '<div class="text">no links yet.</div>';
  } else {
    html += '<ul class="links-list">';
    list.forEach(function (item) {
      html += '<li><a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' + escapeHtml(item.label) + '</a></li>';
    });
    html += '</ul>';
  }
  target.innerHTML = html;
}

/* ---------- LYRICS ---------- */
function renderLyrics(list, targetId) {
  var target = document.getElementById(targetId);
  if (!target) return;

  var html = "";
  list.forEach(function (item) {
    html += '<div class="entry">';
    html += '<div class="title">' + escapeHtml(item.title);
    if (item.release) html += ' <span class="date">(' + escapeHtml(item.release) + ')</span>';
    html += '</div>';
    html += '<pre class="lyrics-text">' + escapeHtml(item.text) + '</pre>';
    html += '</div>';
  });
  if (list.length === 0) {
    html = '<div class="entry"><div class="text">no lyrics posted yet.</div></div>';
  }
  target.innerHTML = html;
}

/* ---------- ETC (reuses the news-style entry layout) ---------- */
function renderEtc(list, targetId) {
  renderNews(list, targetId);
}
function statusLabel(status, note) {
  if (status === "instock") {
    return '<span class="status-instock">IN STOCK' + (note ? " — " + escapeHtml(note) : "") + '</span>';
  }
  if (status === "low") {
    return '<span class="status-low">LOW STOCK' + (note ? " — " + escapeHtml(note) : "") + '</span>';
  }
  return '<span class="status-soldout">SOLD OUT' + (note ? " — " + escapeHtml(note) : "") + '</span>';
}

function renderStore(list, targetId) {
  var target = document.getElementById(targetId);
  if (!target) return;

  var html = "";
  list.forEach(function (item) {
    var subject = encodeURIComponent("order: " + item.title);
    var body = encodeURIComponent(
      "Hello,\n\nI would like to order: " + item.title + " (" + item.format + ")\nPrice: " + item.price +
      "\n\nName:\nShipping address:\nQuantity:\n"
    );
    var mailLink = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    var soldOut = item.status === "soldout";

    html += '<div class="cd-item">';
    if (item.cover) {
      html += '<img src="' + escapeHtml(item.cover) + '" alt="">';
    }
    html += '<div class="cd-info">';
    html += '<div class="cd-title">' + escapeHtml(item.title) + '</div>';
    html += '<div>' + escapeHtml(item.format) + '</div>';
    html += '<div class="price">' + escapeHtml(item.price) + '</div>';
    html += '<div>' + statusLabel(item.status, item.note) + '</div>';
    if (!soldOut) {
      html += '<a class="buy-button" href="' + mailLink + '">[ order by email ]</a>';
    } else {
      html += '<span class="buy-button disabled">[ unavailable ]</span>';
    }
    html += '</div>'; // cd-info
    html += '<div style="clear:both;"></div>';
    html += '</div>'; // cd-item
  });
  if (list.length === 0) {
    html = '<div class="entry"><div class="text">the store is empty for now.</div></div>';
  }
  target.innerHTML = html;
}
