  var login = document.getElementById("login")
  login.addEventListener("keydown", function(e) {
    if (!e) { var e = window.event; }
    //e.preventDefault()
    console.log("event")

    // Enter is pressed
    if (e.keyCode == 13) { 
      e.preventDefault()
      console.log("event enter " + login.value)
      chrome.extension.getBackgroundPage().login(login.value, function(resp) {
        var p = document.createElement("p")
        p.innerText = resp.Success
        document.body.appendChild(p)
      }) 
    }
  }, false);
