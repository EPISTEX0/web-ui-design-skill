// Harbour Swim Club website scripts

// timetable day filter
// Reads the day from the first cell of each row, so rows can be edited without extra markup.
(function () {
  var filter = document.getElementById("dayfilter");
  var rows = document.querySelectorAll("#timetable tbody tr");
  if (!filter || !rows.length) return;

  var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var today = days[(new Date().getDay() + 6) % 7];
  var buttons = [];

  function show(day) {
    for (var i = 0; i < rows.length; i++) {
      var rowDay = rows[i].cells[0].textContent.replace(/\s+/g, "");
      rows[i].hidden = day !== "All" && rowDay !== day;
    }
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].setAttribute("aria-pressed", buttons[j].getAttribute("data-day") === day ? "true" : "false");
    }
  }

  function addButton(day, label) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("data-day", day);
    b.appendChild(document.createTextNode(label));
    if (day === today) {
      var s = document.createElement("small");
      s.appendChild(document.createTextNode("today"));
      b.appendChild(s);
    }
    b.addEventListener("click", function () { show(day); });
    filter.appendChild(b);
    buttons.push(b);
  }

  addButton("All", "All");
  for (var i = 0; i < days.length; i++) addButton(days[i], days[i].slice(0, 3));

  filter.hidden = false;
  show(today);
})();

// join form
var joinForm = document.getElementById("joinform");

function setError(id, message) {
  var field = document.getElementById(id);
  var error = document.getElementById(id + "-error");
  var wrap = field.closest(".field");
  if (message) {
    error.textContent = message;
    error.hidden = false;
    wrap.classList.add("invalid");
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", id + "-error");
  } else {
    error.hidden = true;
    wrap.classList.remove("invalid");
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  }
  return !message;
}

var checks = {
  fullname: function () {
    var ok = document.getElementById("fullname").value.replace(/^\s+|\s+$/g, "").length >= 2;
    return setError("fullname", ok ? "" : "Please enter your full name");
  },
  email: function () {
    var ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(document.getElementById("email").value);
    return setError("email", ok ? "" : "Please enter a valid email address, like name@example.com");
  },
  phone: function () {
    var ok = document.getElementById("phone").value.replace(/[^0-9]/g, "").length >= 7;
    return setError("phone", ok ? "" : "Please enter your phone number");
  },
  mtype: function () {
    return setError("mtype", document.getElementById("mtype").value ? "" : "Please choose a membership type");
  },
  consent: function () {
    return setError("consent", document.getElementById("consent").checked ? "" : "Please tick the box so we can contact you");
  }
};

// check each field when the user leaves it
Object.keys(checks).forEach(function (id) {
  var el = document.getElementById(id);
  el.addEventListener(id === "mtype" || id === "consent" ? "change" : "blur", checks[id]);
});

joinForm.addEventListener("submit", function (e) {
  e.preventDefault();
  var firstBad = null;
  Object.keys(checks).forEach(function (id) {
    if (!checks[id]() && !firstBad) firstBad = id;
  });
  if (firstBad) {
    document.getElementById(firstBad).focus();
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
  p.setAttribute("tabindex", "-1");
  p.appendChild(document.createTextNode("Thanks, " + first + "! We will email you within two days."));
  box.appendChild(h);
  box.appendChild(p);
  p.focus();
});
