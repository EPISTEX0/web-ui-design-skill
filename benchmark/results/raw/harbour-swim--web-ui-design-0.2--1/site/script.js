// Harbour Swim Club website scripts

// timetable day filter
(function () {
  var rows = document.querySelectorAll("#timetable tbody tr");
  var bar = document.getElementById("dayfilter");
  if (!rows.length || !bar) return;

  var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var buttons = [];

  function show(day) {
    for (var i = 0; i < rows.length; i++) {
      rows[i].hidden = day !== "All" && rows[i].getAttribute("data-day") !== day;
    }
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].setAttribute("aria-pressed", buttons[j].getAttribute("data-day") === day ? "true" : "false");
    }
  }

  ["All"].concat(days).forEach(function (day) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("data-day", day);
    b.textContent = day === "All" ? "All days" : day.slice(0, 3);
    b.setAttribute("aria-label", day === "All" ? "All days" : day);
    b.addEventListener("click", function () { show(day); });
    bar.appendChild(b);
    buttons.push(b);
  });
  bar.hidden = false;
  show(days[(new Date().getDay() + 6) % 7]);
})();

// join form
(function () {
  var form = document.getElementById("joinform");
  if (!form) return;

  function setError(id, message) {
    var field = document.getElementById(id);
    var err = document.getElementById("err-" + id);
    var wrap = field.closest(".field");
    err.hidden = !message;
    err.textContent = message || "";
    wrap.classList.toggle("invalid", !!message);
    field.setAttribute("aria-invalid", message ? "true" : "false");
    return message ? field : null;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("fullname").value.replace(/^\s+|\s+$/g, "");
    var email = document.getElementById("email").value.replace(/^\s+|\s+$/g, "");
    var phone = document.getElementById("phone").value;
    var type = document.getElementById("mtype").value;
    var consent = document.getElementById("consent").checked;

    var bad = [
      setError("fullname", name.length < 2 ? "Enter your full name." : ""),
      setError("email", /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? "" : "Enter an email address like name@example.com."),
      setError("phone", phone.replace(/[^0-9]/g, "").length < 7 ? "Enter a phone number with at least 7 digits." : ""),
      setError("mtype", type === "" ? "Choose a membership type." : ""),
      setError("consent", consent ? "" : "Tick the box so we can contact you.")
    ].filter(Boolean);

    if (bad.length) {
      bad[0].focus();
      return;
    }

    var box = document.getElementById("joinbox");
    box.innerHTML = "";
    var h = document.createElement("h2");
    h.textContent = "Join the club";
    var p = document.createElement("p");
    p.className = "thanks";
    p.setAttribute("role", "status");
    p.textContent = "Thanks, " + name.split(" ")[0] + "! We will email you within two days.";
    box.appendChild(h);
    box.appendChild(p);
  });
})();
