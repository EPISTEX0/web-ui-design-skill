// Harbour Swim Club website scripts
document.documentElement.classList.add("js");

// mobile menu
var navToggle = document.getElementById("navtoggle");
var nav = document.getElementById("nav");
navToggle.addEventListener("click", function () {
  var open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  navToggle.textContent = open ? "Close" : "Menu";
});
nav.addEventListener("click", function (e) {
  if (e.target.tagName === "A") {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.textContent = "Menu";
  }
});

// timetable day filter (the table still shows every session without scripts)
var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var weekOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var today = dayNames[new Date().getDay()];
var filter = document.getElementById("dayfilter");
var rows = document.querySelectorAll("#timetable tbody tr");

function showDay(day) {
  for (var i = 0; i < rows.length; i++) {
    rows[i].hidden = day !== "All" && rows[i].cells[0].textContent !== day;
  }
  var buttons = filter.querySelectorAll("button");
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].setAttribute("aria-pressed", buttons[j].getAttribute("data-day") === day ? "true" : "false");
  }
}

function addDayButton(day, label, note) {
  var b = document.createElement("button");
  b.type = "button";
  b.setAttribute("data-day", day);
  b.appendChild(document.createTextNode(label));
  var small = document.createElement("small");
  small.appendChild(document.createTextNode(note));
  b.appendChild(small);
  b.addEventListener("click", function () { showDay(day); });
  filter.appendChild(b);
}

addDayButton("All", "All", "days");
for (var d = 0; d < weekOrder.length; d++) {
  addDayButton(weekOrder[d], weekOrder[d].slice(0, 3), weekOrder[d] === today ? "Today" : "");
}
filter.hidden = false;
showDay("All");

// join form
var fields = {
  fullname: function (v) { return v.replace(/^\s+|\s+$/g, "").length < 2 ? "Enter your full name" : ""; },
  email: function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? "" : "Enter a valid email address, like name@example.com"; },
  phone: function (v) { return v.replace(/[^0-9]/g, "").length < 7 ? "Enter your phone number" : ""; },
  mtype: function (v) { return v === "" ? "Choose a membership type" : ""; },
  consent: function (v, el) { return el.checked ? "" : "Tick the box so we can contact you"; }
};

function checkField(id) {
  var el = document.getElementById(id);
  var msg = fields[id](el.value, el);
  var err = document.getElementById("err-" + id);
  var wrap = el.closest(".field");
  err.textContent = msg;
  err.hidden = msg === "";
  wrap.classList.toggle("invalid", msg !== "");
  if (msg) { el.setAttribute("aria-invalid", "true"); } else { el.removeAttribute("aria-invalid"); }
  return msg === "";
}

var form = document.getElementById("joinform");
Object.keys(fields).forEach(function (id) {
  var el = document.getElementById(id);
  el.addEventListener(id === "mtype" || id === "consent" ? "change" : "blur", function () { checkField(id); });
  el.addEventListener("input", function () {
    if (el.closest(".field").classList.contains("invalid")) { checkField(id); }
  });
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  var firstBad = null;
  Object.keys(fields).forEach(function (id) {
    if (!checkField(id) && !firstBad) { firstBad = document.getElementById(id); }
  });
  if (firstBad) { firstBad.focus(); return; }

  var first = document.getElementById("fullname").value.replace(/^\s+|\s+$/g, "").split(" ")[0];
  var box = document.getElementById("joinbox");
  box.innerHTML = "";
  var h = document.createElement("h2");
  h.appendChild(document.createTextNode("Join the club"));
  var p = document.createElement("p");
  p.className = "thanks";
  p.setAttribute("role", "status");
  p.setAttribute("tabindex", "-1");
  p.appendChild(document.createTextNode("Thanks, " + first + "! We will email you within two days."));
  box.appendChild(h);
  box.appendChild(p);
  p.focus();
});

// hide the phone join bar while the join form is on screen
var sticky = document.getElementById("stickyjoin");
if ("IntersectionObserver" in window) {
  new IntersectionObserver(function (entries) {
    sticky.classList.toggle("away", entries[0].isIntersecting);
  }).observe(document.getElementById("join"));
}
