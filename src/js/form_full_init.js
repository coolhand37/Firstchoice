/**
 * This function will pull the requested field off the URL.
 *
 * @param name the URL parameter to fetch
 * @return the value of the name otherwise an empty string if not found
 */
function getParameterByName (name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

/**
 * This function will check to see if a token was generated for this form. If not, we'll grab one.
 */
function initialize () {

  // Initialize the form by getting the transaction token from the server.
  var token = getParameterByName("r");
  var affid = getParameterByName("affid");
  var subid = getParameterByName("subid");
  $("#id_id").val(affid);

  if (token == undefined || token == "") {
    var cid = $("#id_cid").val();
    $.ajax({
      url: "https://offerannex.herokuapp.com/worker/campaign/"+cid+"/maketransaction",
      type: "GET",
      dataType: "json",
      data: {
        "affid": affid,
        "subid": subid
      },
      success: function (result) {
        if (result && result.status == "success") {
          $("#id_client_ip").val(result.ip);
          $("#id_user_agent").val(result.user_agent);
          $("#id_tid").val(result.tid);
        }
      }
    });
  }
  else {
    $("#id_tid").val(token);
  }
}

function scrollPageToTop () {
  $("html, body").animate({ scrollTop: 0 }, "slow");
}

function redirectUser (url) {
  window.location.href = url;
}