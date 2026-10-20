// Harbour Swim Club website scripts

// join form
var joinForm = document.getElementById("joinform");

function showError(message, field) {
  var err = document.getElementById("formerror");
  err.textContent = message;
  err.hidden = false;
  field.focus();
}

joinForm.addEventListener("submit", function (e) {
  e.preventDefault();

  var name = document.getElementById("fullname").value.trim();
  var email = document.getElementById("email").value;
  var phone = document.getElementById("phone").value;
  var type = document.getElementById("mtype").value;
  var consent = document.getElementById("consent");

  if (name.length < 2) {
    return showError("Please enter your full name", document.getElementById("fullname"));
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return showError("Please enter a valid email address", document.getElementById("email"));
  }
  if (phone.replace(/[^0-9]/g, "").length < 7) {
    return showError("Please enter your phone number", document.getElementById("phone"));
  }
  if (type === "") {
    return showError("Please choose a membership type", document.getElementById("mtype"));
  }
  if (!consent.checked) {
    return showError("Please tick the box so we can contact you", consent);
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
