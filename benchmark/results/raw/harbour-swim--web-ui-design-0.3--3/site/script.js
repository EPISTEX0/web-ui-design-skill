// Harbour Swim Club website scripts

var CLUB_EMAIL = "info@harbourswimclub.co.uk";

// join form
var form = document.getElementById("joinform");
var fields = ["fullname", "email", "phone", "mtype", "consent"];

var checks = {
  fullname: function (el) {
    return el.value.replace(/^\s+|\s+$/g, "").length >= 2 ? "" : "Enter your full name.";
  },
  email: function (el) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value) ? "" : "Enter a valid email address, like name@example.com.";
  },
  phone: function (el) {
    return el.value.replace(/[^0-9]/g, "").length >= 7 ? "" : "Enter a phone number with at least 7 digits.";
  },
  mtype: function (el) {
    return el.value !== "" ? "" : "Choose a membership type.";
  },
  consent: function (el) {
    return el.checked ? "" : "Tick the box so we can contact you.";
  }
};

function checkField(id) {
  var el = document.getElementById(id);
  var err = document.getElementById(id + "-err");
  var message = checks[id](el);
  err.textContent = message;
  err.hidden = message === "";
  if (message) {
    el.setAttribute("aria-invalid", "true");
    el.setAttribute("aria-describedby", id + "-err");
  } else {
    el.removeAttribute("aria-invalid");
    el.removeAttribute("aria-describedby");
  }
  return message === "";
}

fields.forEach(function (id) {
  var el = document.getElementById(id);
  el.addEventListener("blur", function () {
    // only judge a field once the visitor has typed in it or already seen an error
    if (el.value !== "" || el.checked || el.getAttribute("aria-invalid")) checkField(id);
  });
  el.addEventListener("input", function () {
    if (el.getAttribute("aria-invalid")) checkField(id);
  });
  el.addEventListener("change", function () {
    if (el.getAttribute("aria-invalid")) checkField(id);
  });
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  var firstBad = null;
  fields.forEach(function (id) {
    if (!checkField(id) && !firstBad) firstBad = document.getElementById(id);
  });
  if (firstBad) {
    firstBad.focus();
    return;
  }

  var name = document.getElementById("fullname").value.replace(/^\s+|\s+$/g, "");
  var email = document.getElementById("email").value;
  var phone = document.getElementById("phone").value;
  var typeSelect = document.getElementById("mtype");
  var typeLabel = typeSelect.options[typeSelect.selectedIndex].text;

  var body = "Name: " + name + "\nEmail: " + email + "\nPhone: " + phone +
    "\nMembership type: " + typeLabel + "\n\nI am happy for the club to contact me about membership.";
  var href = "mailto:" + CLUB_EMAIL +
    "?subject=" + encodeURIComponent("Membership enquiry: " + typeLabel) +
    "&body=" + encodeURIComponent(body);

  var first = name.split(" ")[0];
  var box = document.getElementById("joinbox");
  box.innerHTML = "";
  var h = document.createElement("h2");
  h.appendChild(document.createTextNode("Join the club"));
  var wrap = document.createElement("div");
  wrap.className = "thanks";
  wrap.setAttribute("role", "status");
  wrap.tabIndex = -1;
  var h3 = document.createElement("h3");
  h3.appendChild(document.createTextNode("Nearly there, " + first + "!"));
  var p1 = document.createElement("p");
  p1.appendChild(document.createTextNode("Your email app should now open with your details ready. Press send there to finish. We will email you within two days."));
  var p2 = document.createElement("p");
  p2.appendChild(document.createTextNode("Nothing opened? Email "));
  var a = document.createElement("a");
  a.href = href;
  a.appendChild(document.createTextNode(CLUB_EMAIL));
  p2.appendChild(a);
  p2.appendChild(document.createTextNode(" or call 01326 555 014."));
  wrap.appendChild(h3);
  wrap.appendChild(p1);
  wrap.appendChild(p2);
  box.appendChild(h);
  box.appendChild(wrap);
  wrap.focus();

  window.location.href = href;
});

// "Join as ..." links on the membership cards choose the type in the form
var planLinks = document.querySelectorAll(".plan-link");
Array.prototype.forEach.call(planLinks, function (link) {
  link.addEventListener("click", function () {
    var select = document.getElementById("mtype");
    if (select) {
      select.value = link.getAttribute("data-type");
      if (select.getAttribute("aria-invalid")) checkField("mtype");
    }
  });
});
