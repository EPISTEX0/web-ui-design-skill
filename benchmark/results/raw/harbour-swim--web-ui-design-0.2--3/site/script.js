// Harbour Swim Club website scripts
document.documentElement.classList.add("js");

// mobile menu
(function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();

// timetable day filter, opens on today
(function () {
  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var tabs = document.getElementById("daytabs");
  var rows = document.querySelectorAll("#ttable tbody tr");
  var today = days[new Date().getDay()];
  var buttons = [];

  function show(day) {
    for (var i = 0; i < rows.length; i++) {
      rows[i].hidden = day !== "All" && rows[i].getAttribute("data-day") !== day;
    }
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].setAttribute("aria-pressed", buttons[j].getAttribute("data-day") === day ? "true" : "false");
    }
  }

  function add(day, label) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("data-day", day);
    b.textContent = label;
    if (day === today) {
      var s = document.createElement("span");
      s.className = "today-dot";
      s.textContent = "(today)";
      b.appendChild(s);
    }
    b.addEventListener("click", function () { show(day); });
    tabs.appendChild(b);
    buttons.push(b);
  }

  for (var i = 0; i < order.length; i++) add(order[i], order[i]);
  add("All", "All week");
  tabs.hidden = false;
  show(today);
})();

// join form
(function () {
  var form = document.getElementById("joinform");

  function setError(id, msg) {
    var input = document.getElementById(id);
    var field = input.closest(".field");
    document.getElementById("err-" + id).textContent = msg;
    field.classList.toggle("invalid", !!msg);
    if (msg) { input.setAttribute("aria-invalid", "true"); } else { input.removeAttribute("aria-invalid"); }
    return msg;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("fullname").value.replace(/^\s+|\s+$/g, "");
    var email = document.getElementById("email").value;
    var phone = document.getElementById("phone").value;
    var type = document.getElementById("mtype").value;
    var consent = document.getElementById("consent").checked;

    var errors = [
      setError("fullname", name.length < 2 ? "Enter your full name." : ""),
      setError("email", /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? "" : "Enter a valid email address, like name@example.com."),
      setError("phone", phone.replace(/[^0-9]/g, "").length < 7 ? "Enter a phone number with at least 7 digits." : ""),
      setError("mtype", type === "" ? "Choose a membership type." : ""),
      setError("consent", consent ? "" : "Tick the box so we can contact you.")
    ];
    var ids = ["fullname", "email", "phone", "mtype", "consent"];
    for (var i = 0; i < errors.length; i++) {
      if (errors[i]) { document.getElementById(ids[i]).focus(); return; }
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
