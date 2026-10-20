// Harbour Swim Club website scripts

// timetable: mark today's day
(function () {
  var today = new Date().getDay(); // 0 = Sunday
  var days = document.querySelectorAll(".day");
  var links = document.querySelectorAll(".daynav a");
  for (var i = 0; i < days.length; i++) {
    if (Number(days[i].getAttribute("data-day")) === today) {
      var tag = document.createElement("span");
      tag.className = "today-tag";
      tag.textContent = "Today";
      days[i].querySelector("h3").appendChild(tag);
      days[i].className += " is-today";
      for (var j = 0; j < links.length; j++) {
        if (links[j].getAttribute("href") === "#" + days[i].id) {
          links[j].setAttribute("aria-current", "date");
        }
      }
    }
  }
})();

// join form
(function () {
  var form = document.getElementById("joinform");
  if (!form) return;

  // each check returns an error message, or "" when the value is fine
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
    consent: function (v, el) {
      return el.checked ? "" : "Please tick the box so we can contact you";
    }
  };

  function validate(id) {
    var el = document.getElementById(id);
    var msg = checks[id](el.value, el);
    var out = document.getElementById(id + "-err");
    out.textContent = msg;
    out.hidden = msg === "";
    var field = el.closest(".field");
    field.className = field.className.replace(/\s*invalid/, "");
    if (msg) {
      field.className += " invalid";
      el.setAttribute("aria-invalid", "true");
      el.setAttribute("aria-describedby", id + "-err");
    } else {
      el.removeAttribute("aria-invalid");
      el.removeAttribute("aria-describedby");
    }
    return msg === "";
  }

  var ids = ["fullname", "email", "phone", "mtype", "consent"];
  ids.forEach(function (id) {
    var el = document.getElementById(id);
    // check a field when the user leaves it; once it shows an error, recheck as they fix it
    el.addEventListener("blur", function () { validate(id); });
    el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input", function () {
      if (el.getAttribute("aria-invalid")) validate(id);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstBad = null;
    ids.forEach(function (id) {
      if (!validate(id) && !firstBad) firstBad = document.getElementById(id);
    });
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
    p.setAttribute("role", "status");
    p.setAttribute("tabindex", "-1");
    p.appendChild(document.createTextNode("Thanks, " + first + "! We will email you within two days."));
    box.appendChild(h);
    box.appendChild(p);
    p.focus();
  });
})();
