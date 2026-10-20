// Harbour Swim Club website scripts

// timetable day filter (table stays fully visible without JS)
(function () {
  var bar = document.getElementById("days");
  var rows = Array.prototype.slice.call(document.querySelectorAll("#timetable tbody tr"));
  if (!bar || !rows.length) return;

  var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var today = names[new Date().getDay()];
  var days = [];
  rows.forEach(function (r) {
    var d = r.getAttribute("data-day");
    if (days.indexOf(d) === -1) days.push(d);
  });

  function show(day) {
    var prev = null;
    rows.forEach(function (r) {
      var d = r.getAttribute("data-day");
      r.hidden = day !== "All" && d !== day;
      r.classList.toggle("is-today", d === today);
      r.classList.toggle("day-start", !r.hidden && d !== prev);
      if (!r.hidden) prev = d;
    });
    Array.prototype.forEach.call(bar.children, function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-day") === day));
    });
  }

  ["All"].concat(days).forEach(function (d) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("data-day", d);
    b.textContent = d === "All" ? "All week" : d.slice(0, 3);
    b.setAttribute("aria-label", d === "All" ? "All week" : d);
    if (d === today) b.className = "today";
    b.addEventListener("click", function () { show(d); });
    bar.appendChild(b);
  });
  bar.hidden = false;
  show("All");
})();

// join form
(function () {
  var form = document.getElementById("joinform");
  if (!form) return;

  function setError(id, msg) {
    var field = document.getElementById(id);
    var err = document.getElementById("err-" + id);
    err.textContent = msg || "";
    err.hidden = !msg;
    if (field.type === "checkbox") return;
    if (msg) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("fullname").value.replace(/^\s+|\s+$/g, "");
    var email = document.getElementById("email").value;
    var phone = document.getElementById("phone").value;
    var type = document.getElementById("mtype").value;
    var consent = document.getElementById("consent").checked;

    var checks = [
      ["fullname", name.length < 2, "Enter your full name."],
      ["email", !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()), "Enter an email address like name@example.com."],
      ["phone", phone.replace(/[^0-9]/g, "").length < 7, "Enter a phone number with at least 7 digits."],
      ["mtype", type === "", "Choose a membership type."],
      ["consent", !consent, "Tick the box so we can contact you."]
    ];
    var firstBad = null;
    checks.forEach(function (c) {
      setError(c[0], c[1] ? c[2] : "");
      if (c[1] && !firstBad) firstBad = c[0];
    });
    if (firstBad) {
      document.getElementById(firstBad).focus();
      return;
    }

    var first = name.split(" ")[0];
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
