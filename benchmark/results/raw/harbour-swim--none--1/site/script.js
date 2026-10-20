// Harbour Swim Club website scripts

// mobile menu
var navToggle = document.getElementById("navtoggle");
var nav = document.getElementById("nav");

function setNav(open) {
  nav.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
}
navToggle.addEventListener("click", function () {
  setNav(!nav.classList.contains("open"));
});
nav.addEventListener("click", function (e) {
  if (e.target.tagName === "A") setNav(false);
});

// join form
document.getElementById("joinform").addEventListener("submit", function (e) {
  e.preventDefault();

  var name = document.getElementById("fullname").value.trim();
  var email = document.getElementById("email").value.trim();
  var phone = document.getElementById("phone").value;
  var type = document.getElementById("mtype").value;
  var consent = document.getElementById("consent").checked;
  var error = document.getElementById("formerror");

  var problem = "";
  var field = null;
  if (name.length < 2) {
    problem = "Please enter your full name";
    field = "fullname";
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    problem = "Please enter a valid email address";
    field = "email";
  } else if (phone.replace(/[^0-9]/g, "").length < 7) {
    problem = "Please enter your phone number";
    field = "phone";
  } else if (type === "") {
    problem = "Please choose a membership type";
    field = "mtype";
  } else if (!consent) {
    problem = "Please tick the box so we can contact you";
    field = "consent";
  }

  if (problem) {
    error.textContent = problem;
    document.getElementById(field).focus();
    return;
  }

  var box = document.getElementById("joinbox");
  box.innerHTML = "";
  var h = document.createElement("h2");
  h.appendChild(document.createTextNode("Join the club"));
  var p = document.createElement("p");
  p.className = "thanks";
  p.setAttribute("role", "status");
  p.appendChild(document.createTextNode("Thanks, " + name.split(" ")[0] + "! We will email you within two days."));
  box.appendChild(h);
  box.appendChild(p);
});
