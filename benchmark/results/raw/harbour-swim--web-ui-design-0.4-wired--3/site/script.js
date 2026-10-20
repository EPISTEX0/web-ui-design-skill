// Harbour Swim Club website scripts. Plain JavaScript, no build step.
// Without JavaScript the full timetable shows and the form still displays.

(function () {
  // ---------- timetable: show one day at a time ----------
  var table = document.getElementById("timetable-table");
  var picker = document.getElementById("daypicker");
  var status = document.getElementById("tt-status");

  if (table && picker) {
    var rows = Array.prototype.slice.call(table.tBodies[0].rows);
    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var days = [];
    rows.forEach(function (row) {
      var day = row.cells[0].textContent.trim();
      row.setAttribute("data-day", day);
      if (days.indexOf(day) === -1) days.push(day);
    });

    var today = dayNames[new Date().getDay()];
    var buttons = {};

    var makeButton = function (value, label, aria) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.setAttribute("aria-pressed", "false");
      if (aria) b.setAttribute("aria-label", aria);
      b.addEventListener("click", function () { showDay(value, true); });
      picker.appendChild(b);
      buttons[value] = b;
      return b;
    };

    days.forEach(function (day) {
      var isToday = day === today;
      var b = makeButton(day, day.slice(0, 3), isToday ? day + ", today" : day);
      if (isToday) b.setAttribute("data-today", "");
    });
    makeButton("all", "All", "All week");

    var showDay = function (value, updateUrl) {
      var count = 0;
      rows.forEach(function (row) {
        var match = value === "all" || row.getAttribute("data-day") === value;
        row.hidden = !match;
        if (match) count++;
      });
      table.className = value === "all" ? "" : "single";
      Object.keys(buttons).forEach(function (key) {
        buttons[key].setAttribute("aria-pressed", key === value ? "true" : "false");
      });

      var noun = count === 1 ? "session" : "sessions";
      if (value === "all") {
        status.textContent = "All week: " + count + " sessions";
      } else if (count === 0) {
        status.textContent = "No sessions on " + value + ". Choose another day or see the whole week.";
      } else {
        status.textContent = value + (value === today ? " (today)" : "") + ": " + count + " " + noun;
      }

      if (updateUrl) {
        try {
          history.replaceState(null, "", "?day=" + value.toLowerCase() + "#timetable");
        } catch (e) { /* some browsers block this on local files */ }
      }
    };

    var fromUrl = (/[?&]day=([a-z]+)/i.exec(location.search) || [])[1];
    var start = today;
    if (fromUrl) {
      fromUrl = fromUrl.toLowerCase();
      days.concat("all").forEach(function (v) {
        if (v.toLowerCase() === fromUrl) start = v;
      });
    }
    if (days.indexOf(start) === -1 && start !== "all") start = "all";

    picker.hidden = false;
    showDay(start, false);
  }

  // ---------- join form ----------
  var form = document.getElementById("joinform");
  if (!form) return;

  var checks = {
    fullname: function (el) {
      return el.value.trim().length < 2 ? "Please enter your full name" : "";
    },
    email: function (el) {
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim())
        ? "" : "Please enter a valid email address, like name@example.com";
    },
    phone: function (el) {
      return el.value.replace(/[^0-9]/g, "").length < 7 ? "Please enter your phone number" : "";
    },
    mtype: function (el) {
      return el.value === "" ? "Please choose a membership type" : "";
    },
    consent: function (el) {
      return el.checked ? "" : "Please tick the box so we can contact you";
    }
  };

  var validate = function (el) {
    var message = checks[el.id](el);
    var out = document.getElementById(el.id + "-error");
    out.textContent = message;
    out.hidden = message === "";
    if (message) {
      el.setAttribute("aria-invalid", "true");
    } else {
      el.removeAttribute("aria-invalid");
    }
    return message === "";
  };

  Object.keys(checks).forEach(function (id) {
    var el = document.getElementById(id);
    // check a field when the person leaves it, and clear the error as they fix it
    el.addEventListener("blur", function () { validate(el); });
    el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input", function () {
      if (el.getAttribute("aria-invalid")) validate(el);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var firstBad = null;
    Object.keys(checks).forEach(function (id) {
      var el = document.getElementById(id);
      if (!validate(el) && !firstBad) firstBad = el;
    });
    if (firstBad) {
      firstBad.focus();
      return;
    }

    // Nothing is sent anywhere yet: this only shows the thank-you message.
    var first = document.getElementById("fullname").value.trim().split(" ")[0];
    var box = document.getElementById("joinbox");
    box.innerHTML = "";
    var h = document.createElement("h2");
    h.textContent = "Join the club";
    var p = document.createElement("p");
    p.className = "thanks";
    p.setAttribute("tabindex", "-1");
    p.textContent = "Thanks, " + first + "! We will email you within two days.";
    box.appendChild(h);
    box.appendChild(p);
    p.focus();
  });
})();
