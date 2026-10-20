// Harbour Swim Club website scripts

// news ticker
var tickerPos = 980;
var tickerEl = document.getElementById("tickertext");
var tickerWidth = tickerEl.offsetWidth;

function moveTicker() {
  tickerPos = tickerPos - 1;
  if (tickerPos < -tickerWidth) {
    tickerPos = 980;
  }
  tickerEl.style.left = tickerPos + "px";
}
setInterval(moveTicker, 25);

// join form
function submitJoin() {
  var name = document.getElementById("fullname").value;
  var email = document.getElementById("email").value;
  var phone = document.getElementById("phone").value;
  var type = document.getElementById("mtype").value;
  var consent = document.getElementById("consent").checked;

  name = name.replace(/^\s+|\s+$/g, "");

  if (name.length < 2) {
    alert("Please enter your full name");
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    alert("Please enter a valid email address");
    return;
  }
  if (phone.replace(/[^0-9]/g, "").length < 7) {
    alert("Please enter your phone number");
    return;
  }
  if (type == "") {
    alert("Please choose a membership type");
    return;
  }
  if (!consent) {
    alert("Please tick the box so we can contact you");
    return;
  }

  var first = name.split(" ")[0];
  var box = document.getElementById("joinbox");
  box.innerHTML = "";
  var h = document.createElement("h2");
  h.appendChild(document.createTextNode("Join the club"));
  var p = document.createElement("p");
  p.className = "thanks";
  p.appendChild(document.createTextNode("Thanks, " + first + "! We will email you within two days."));
  box.appendChild(h);
  box.appendChild(p);
}
