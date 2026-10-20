// Harbour Swim Club website scripts

// timetable day filter (the full table shows if scripts are off)
(function () {
  var rows = document.querySelectorAll("#timetable tbody tr");
  var box = document.querySelector(".day-filter");
  if (!rows.length || !box) return;

  var days = [];
  for (var i = 0; i < rows.length; i++) {
    var d = rows[i].getAttribute("data-day");
    if (days.indexOf(d) === -1) days.push(d);
  }

  function show(day) {
    for (var i = 0; i < rows.length; i++) {
      rows[i].hidden = day !== "All" && rows[i].getAttribute("data-day") !== day;
    }
    var btns = box.querySelectorAll("button");
    for (var j = 0; j < btns.length; j++) {
      btns[j].setAttribute("aria-pressed", btns[j].getAttribute("data-day") === day ? "true" : "false");
    }
  }

  ["All"].concat(days).forEach(function (day) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("data-day", day);
    b.textContent = day === "All" ? "All days" : day.slice(0, 3);
    b.setAttribute("aria-label", day === "All" ? "All days" : day);
    b.addEventListener("click", function () { show(day); });
    box.appendChild(b);
  });
  box.hidden = false;
  show("All");
})();

// join form
(function () {
  var form = document.getElementById("joinform");
  if (!form) return;

  var checks = {
    fullname: function (f) { return f.fullname.value.replace(/^\s+|\s+$/g, "").length < 2 ? "Enter your full name" : ""; },
    email: function (f) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value) ? "" : "Enter a valid email address, like name@example.com"; },
    phone: function (f) { return f.phone.value.replace(/[^0-9]/g, "").length < 7 ? "Enter your phone number" : ""; },
    mtype: function (f) { return f.mtype.value === "" ? "Choose a membership type" : ""; },
    consent: function (f) { return f.consent.checked ? "" : "Tick the box so we can contact you"; }
  };

  function validate(name) {
    var msg = checks[name](form);
    var err = document.getElementById(name + "-err");
    var input = form.elements[name];
    err.textContent = msg;
    err.hidden = !msg;
    if (msg) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", name + "-err");
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
    return !msg;
  }

  Object.keys(checks).forEach(function (name) {
    form.elements[name].addEventListener("blur", function () { validate(name); });
    form.elements[name].addEventListener("change", function () { validate(name); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(checks).forEach(function (name) {
      if (!validate(name) && !firstBad) firstBad = form.elements[name];
    });
    if (firstBad) { firstBad.focus(); return; }

    var first = form.fullname.value.replace(/^\s+|\s+$/g, "").split(" ")[0];
    var box = document.getElementById("joinbox");
    box.innerHTML = "";
    var h = document.createElement("h2");
    h.appendChild(document.createTextNode("Join the club"));
    var p = document.createElement("p");
    p.className = "thanks";
    p.setAttribute("role", "status");
    p.tabIndex = -1;
    p.appendChild(document.createTextNode("Thanks, " + first + "! We will email you within two days."));
    box.appendChild(h);
    box.appendChild(p);
    p.focus();
  });
})();
