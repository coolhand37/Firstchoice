function cb (e) {
  if (e.data.substring(0, 4) == "http") {
    window.location = e.data.replace(/&/g, "&")
  }
}

if (window.addEventListener) {
  window.addEventListener("message", cb, false)
}
else if (window.attachEvent) {
  window.attachEvent("onmessage", cb)
}

function sendCommand () {
  var iframe = document.getElementById("app_frame").contentWindow;
  iframe.postMessage(window.location.search.substr(1), "*");
}