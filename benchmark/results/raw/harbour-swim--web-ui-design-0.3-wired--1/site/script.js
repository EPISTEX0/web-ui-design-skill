// Harbour Swim Club website scripts

// ---------- timetable day filter ----------
// Reads the Day column of each timetable row, so adding a session needs
// no change here. Opens on today's sessions; "All week" shows everything.
(function () {
  var table = document.querySelector("#timetable table");
  var filter = document.getElementById("dayfilter");
  var summary = document.getElementById("daysummary");
  if (!table || !filter) return;

  var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
  var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var today = weekdays[new Date().getDay()];
  var buttons = {};

  function show(day) {
    var count = 0;
    rows.forEach(function (row) {
      var match = day === "All" || row.cells[0].textContent.trim() === day;
      row.hidden = !match;
      if (match) count++;
    });
    Object.keys(buttons).forEach(function (key) {
      buttons[key].setAttribute("aria-pressed", key === day ? "true" : "false");
    });
    table.classList.toggle("single-day", day !== "All");

    var label = day === "All" ? "All week" : day + (day === today ? " (today)" : "");
    summary.textContent = label + ": " + count + (count === 1 ? " session" : " sessions");

    if (window.history && history.replaceState) {
      history.replaceState(null, "", day === "All" ? location.pathname + location.hash : "?day=" + day + location.hash);
    }
  }

  order.concat("All").forEach(function (day) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = day === "All" ? "All week" : day.slice(0, 3);
    if (day !== "All") b.setAttribute("aria-label", day + (day === today ? " (today)" : ""));
    if (day === today) b.className = "is-today";
    b.addEventListener("click", function () { show(day); });
    buttons[day] = b;
    filter.appendChild(b);
  });

  var wanted = (location.search.match(/[?&]day=(\w+)/) || [])[1];
  show(buttons[wanted] ? wanted : today);
})();

// ---------- membership buttons pre-select the join form ----------
Array.prototype.forEach.call(document.querySelectorAll("a[data-type]"), function (link) {
  link.addEventListener("click", function () {
    document.getElementById("mtype").value = link.getAttribute("data-type");
  });
});

// ---------- join form ----------
(function () {
  var form = document.getElementById("joinform");
  if (!form) return;

  // Each check returns an error message, or "" when the field is fine.
  var checks = {
    fullname: function (v) {
      return v.replace(/^\s+|\s+$/g, "").length < 2 ? "Please enter your full name" : "";
    },
    email: function (v) {
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? "" : "Please enter a valid email address, like name@example.com";
    },
    phone: function (v) {
      return v.replace(/[^0-9]/g, "").length < 7 ? "Please enter your phone number" : "";
    },
    mtype: function (v) {
      return v === "" ? "Please choose a membership type" : "";
    },
    consent: function (v, field) {
      return field.checked ? "" : "Please tick the box so we can contact you";
    }
  };

  function validate(id) {
    var field = document.getElementById(id);
    var message = checks[id](field.value, field);
    var error = document.getElementById(id + "-error");
    error.textContent = message;
    error.hidden = !message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    field.closest(".field").classList.toggle("invalid", !!message);
    return !message;
  }

  Object.keys(checks).forEach(function (id) {
    var field = document.getElementById(id);
    field.addEventListener(field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "blur", function () {
      validate(id);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var firstBad = null;
    Object.keys(checks).forEach(function (id) {
      if (!validate(id) && !firstBad) firstBad = document.getElementById(id);
    });
    if (firstBad) {
      firstBad.focus();
      return;
    }

    var first = document.getElementById("fullname").value.replace(/^\s+|\s+$/g, "").split(" ")[0];
    var box = document.getElementById("joinbox");
    box.innerHTML = "";
    var h = document.createElement("h2");
    h.appendChild(document.createTextNode("Join the club"));
    var p = document.createElement("p");
    p.className = "thanks";
    p.setAttribute("role", "status");
    p.appendChild(document.createTextNode("Thanks, " + first + "! We will email you within two days."));
    box.appendChild(h);
    box.appendChild(p);
  });
})();
