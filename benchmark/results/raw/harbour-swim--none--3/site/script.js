// Harbour Swim Club website scripts

// mobile menu
var header = document.getElementById("header");
var navToggle = document.getElementById("navtoggle");

function setMenu(open) {
  header.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
}
navToggle.addEventListener("click", function () {
  setMenu(!header.classList.contains("open"));
});
document.getElementById("nav").addEventListener("click", function (e) {
  if (e.target.tagName === "A") { setMenu(false); }
});

// join form: opens the visitor's email app with a pre-filled message to the club
var CLUB_EMAIL = "info@harbourswimclub.co.uk";
var joinForm = document.getElementById("joinform");
var formError = document.getElementById("formerror");

function fail(message, fieldId) {
  formError.textContent = message;
  document.getElementById(fieldId).focus();
}

joinForm.addEventListener("submit", function (e) {
  e.preventDefault();
  var name = document.getElementById("fullname").value.trim();
  var email = document.getElementById("email").value.trim();
  var phone = document.getElementById("phone").value;
  var type = document.getElementById("mtype").value;
  var consent = document.getElementById("consent").checked;

  if (name.length < 2) { return fail("Please enter your full name", "fullname"); }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { return fail("Please enter a valid email address", "email"); }
  if (phone.replace(/[^0-9]/g, "").length < 7) { return fail("Please enter your phone number", "phone"); }
  if (type === "") { return fail("Please choose a membership type", "mtype"); }
  if (!consent) { return fail("Please tick the box so we can contact you", "consent"); }

  var types = { junior: "Junior", adult: "Adult", family: "Family", masters: "Masters" };
  var body = "Please contact me about joining Harbour Swim Club.\r\n\r\n" +
    "Name: " + name + "\r\n" +
    "Email: " + email + "\r\n" +
    "Phone: " + phone.trim() + "\r\n" +
    "Membership type: " + types[type] + "\r\n" +
    "I am happy for the club to contact me about membership.";
  var href = "mailto:" + CLUB_EMAIL +
    "?subject=" + encodeURIComponent("Membership enquiry: " + types[type]) +
    "&body=" + encodeURIComponent(body);

  var first = name.split(" ")[0];
  var box = document.getElementById("joinbox");
  box.innerHTML = "";
  var h = document.createElement("h2");
  h.appendChild(document.createTextNode("Join the club"));
  var p = document.createElement("p");
  p.className = "thanks";
  p.setAttribute("role", "status");
  p.appendChild(document.createTextNode("Thanks, " + first + "! Your email app should now open with your details ready. Press Send to finish."));
  var help = document.createElement("p");
  help.appendChild(document.createTextNode("Nothing opened? "));
  var link = document.createElement("a");
  link.href = href;
  link.appendChild(document.createTextNode("Try again"));
  help.appendChild(link);
  help.appendChild(document.createTextNode(", email us at " + CLUB_EMAIL + " or phone 01326 555 014."));
  box.appendChild(h);
  box.appendChild(p);
  box.appendChild(help);
  window.location.href = href;
});
