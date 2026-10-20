// Harbour Swim Club website scripts

// mobile menu
var menuBtn = document.getElementById("menubtn");
var nav = document.getElementById("nav");

function setMenu(open) {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  menuBtn.textContent = open ? "Close" : "Menu";
}
menuBtn.addEventListener("click", function () {
  setMenu(!nav.classList.contains("open"));
});
nav.addEventListener("click", function (e) {
  if (e.target.tagName === "A") setMenu(false);
});

// timetable day filter
// Reads the day from the first cell of each row, so rows can be edited or added in index.html
// without touching this file. The chosen day is kept in the address as ?day=Thursday.
var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var rows = document.querySelectorAll("#ttable tbody tr");
var chips = document.querySelectorAll("#dayfilter button");
var ttStatus = document.getElementById("ttstatus");

// mark the first row of each day so the full week reads in groups
var previousDay = "";
for (var i = 0; i < rows.length; i++) {
  var rowDay = rows[i].cells[0].textContent.trim();
  if (rowDay !== previousDay) rows[i].classList.add("newday");
  previousDay = rowDay;
}

function showDay(day, updateUrl) {
  var shown = 0;
  for (var i = 0; i < rows.length; i++) {
    var match = day === "all" || rows[i].cells[0].textContent.trim() === day;
    rows[i].hidden = !match;
    if (match) shown++;
  }
  for (var j = 0; j < chips.length; j++) {
    chips[j].setAttribute("aria-pressed", chips[j].getAttribute("data-day") === day ? "true" : "false");
  }
  if (day === "all") {
    ttStatus.textContent = "Showing all " + shown + " weekly sessions.";
  } else {
    var label = day === dayNames[new Date().getDay()] ? day + " (today)" : day;
    ttStatus.textContent = label + ": " + shown + (shown === 1 ? " session." : " sessions.");
  }
  if (updateUrl && window.history.replaceState) {
    var url = window.location.pathname + (day === "all" ? "" : "?day=" + day) + window.location.hash;
    window.history.replaceState(null, "", url);
  }
}

if (rows.length && chips.length) {
  document.getElementById("dayfilter").hidden = false;
  for (var k = 0; k < chips.length; k++) {
    chips[k].addEventListener("click", function () {
      showDay(this.getAttribute("data-day"), true);
    });
  }
  // start on the day in the address, otherwise today
  var wanted = /[?&]day=([A-Za-z]+)/.exec(window.location.search);
  var start = wanted && dayNames.indexOf(wanted[1]) !== -1 ? wanted[1] : dayNames[new Date().getDay()];
  showDay(start, false);
}

// membership cards pre-select the type in the join form
var typeLinks = document.querySelectorAll(".plan a[data-type]");
for (var m = 0; m < typeLinks.length; m++) {
  typeLinks[m].addEventListener("click", function () {
    document.getElementById("mtype").value = this.getAttribute("data-type");
    showError("mtype", "");
  });
}

// join form
var form = document.getElementById("joinform");

function showError(id, message) {
  var field = document.getElementById(id);
  var error = document.getElementById(id + "-error");
  error.textContent = message;
  error.hidden = message === "";
  if (message) {
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", id + "-error");
  } else {
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  }
  return message !== "";
}

// each check returns an error message, or "" when the field is fine
var checks = {
  fullname: function (v) { return v.replace(/^\s+|\s+$/g, "").length < 2 ? "Enter your full name." : ""; },
  email: function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? "" : "Enter a valid email address, like name@example.com."; },
  phone: function (v) { return v.replace(/[^0-9]/g, "").length < 7 ? "Enter your phone number, at least 7 digits." : ""; },
  mtype: function (v) { return v === "" ? "Choose a membership type." : ""; },
  consent: function (v, el) { return el.checked ? "" : "Tick the box so we can contact you."; }
};

function checkField(id) {
  var el = document.getElementById(id);
  return showError(id, checks[id](el.value, el));
}

for (var id in checks) {
  (function (fieldId) {
    var el = document.getElementById(fieldId);
    el.addEventListener("blur", function () {
      // do not nag on a field the visitor only tabbed through
      if (el.value !== "" || el.getAttribute("aria-invalid")) checkField(fieldId);
    });
    el.addEventListener("input", function () {
      if (el.getAttribute("aria-invalid")) checkField(fieldId);
    });
    el.addEventListener("change", function () {
      if (el.getAttribute("aria-invalid")) checkField(fieldId);
    });
  })(id);
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  var firstBad = null;
  for (var fieldId in checks) {
    if (checkField(fieldId) && !firstBad) firstBad = document.getElementById(fieldId);
  }
  if (firstBad) {
    firstBad.focus();
    return;
  }

  var first = document.getElementById("fullname").value.replace(/^\s+|\s+$/g, "").split(/\s+/)[0];
  var box = document.getElementById("joinbox");
  box.innerHTML = "";
  var h = document.createElement("h2");
  h.appendChild(document.createTextNode("Join the club"));
  var p = document.createElement("p");
  p.className = "thanks";
  p.tabIndex = -1;
  p.setAttribute("role", "status");
  p.appendChild(document.createTextNode("Thanks, " + first + "! We will email you within two days."));
  box.appendChild(h);
  box.appendChild(p);
  p.focus();
});
