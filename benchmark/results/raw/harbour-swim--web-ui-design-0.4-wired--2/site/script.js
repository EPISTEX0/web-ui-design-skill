// Harbour Swim Club website scripts

// timetable day filter: opens on today, all rows stay visible without JavaScript
(function () {
  var group = document.getElementById("dayfilter");
  var rows = document.querySelectorAll("#timetable tbody tr");
  if (!group || !rows.length) return;

  var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var today = days[(new Date().getDay() + 6) % 7];

  function show(day) {
    for (var i = 0; i < rows.length; i++) {
      var match = day === "All" || rows[i].cells[0].textContent.replace(/\s+/g, "") === day;
      rows[i].hidden = !match;
    }
    var buttons = group.querySelectorAll("button");
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].setAttribute("aria-pressed", buttons[j].getAttribute("data-day") === day ? "true" : "false");
    }
  }

  function add(label, day) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("data-day", day);
    if (day !== "All") b.setAttribute("aria-label", day);
    b.addEventListener("click", function () { show(day); });
    group.appendChild(b);
  }

  add("All", "All");
  for (var i = 0; i < days.length; i++) add(days[i].slice(0, 3), days[i]);
  group.hidden = false;
  show(today);
})();

// join form
(function () {
  var form = document.getElementById("joinform");
  if (!form) return;

  var checks = {
    fullname: function (v) { return v.replace(/^\s+|\s+$/g, "").length >= 2 ? "" : "Enter your full name."; },
    email: function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? "" : "Enter an email address like name@example.com."; },
    phone: function (v) { return v.replace(/[^0-9]/g, "").length >= 7 ? "" : "Enter a phone number with at least 7 digits."; },
    mtype: function (v) { return v !== "" ? "" : "Choose a membership type."; },
    consent: function (v, el) { return el.checked ? "" : "Tick the box so we can contact you."; }
  };

  function validate(id) {
    var el = document.getElementById(id);
    var msg = checks[id](el.value, el);
    var out = document.getElementById("err-" + id);
    out.textContent = msg;
    out.hidden = msg === "";
    if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    return msg === "";
  }

  for (var id in checks) {
    (function (id) {
      var el = document.getElementById(id);
      el.addEventListener(id === "mtype" || id === "consent" ? "change" : "blur", function () { validate(id); });
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid")) validate(id); });
    })(id);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstBad = null;
    for (var id in checks) {
      if (!validate(id) && !firstBad) firstBad = document.getElementById(id);
    }
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
})();
