/**
 * This function will pull the requested field off the URL.
 *
 * @param name the URL parameter to fetch
 * @param path the URL path to extract the name from
 * @return the value of the name otherwise an empty string if not found
 */
var getParameterByName = function (name, path) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec("?" + path);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

/**
 * This function gets called when the iframe is loaded. It will populate the form with the fields on the URL.
 */
function processQueryString (e) {
  $("input[name='first_name']").val(getParameterByName("fname", e.data));
  $("input[name='last_name']").val(getParameterByName("lname", e.data));
  $("input[name='email']").val(getParameterByName("email", e.data));
  $("input[name='home_zipcode']").val(getParameterByName("zip", e.data));

  var loan_amount = getParameterByName("loan", e.data);
  if (loan_amount == "") {
    $("select[name='loan_amount_requested']").val("300");
  }
  else {
    $("select[name='loan_amount_requested'] option[value='" + loan_amount + "']").attr('selected', 'selected');
  }
}

function initialize () {
}

function scrollPageToTop () {
  $("html, body").animate({ scrollTop: 0 }, "slow");
  window.parent.postMessage("scroll", "*");
}

function redirectUser (url) {
  console.log("Redirecting the parent: ")
  window.parent.postMessage(url, "*");
}

// This handles receiving messages from the parent.
if (window.addEventListener) {
  window.addEventListener("message", processQueryString, false);
}
else if (window.attachEvent) {
  window.attachEvent('onmessage', processQueryString);
}