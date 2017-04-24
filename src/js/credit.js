$(function () {
  var getParameterByName = function (name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  $("input[name='first_name']").val(getParameterByName("first_name"));
  $("input[name='last_name']").val(getParameterByName("last_name"));
  $("input[name='email']").val(getParameterByName("email"));
  $("input[name='phone_home']").val(getParameterByName("phone_home"));
  $("input[name='address']").val(getParameterByName("address"));
  $("input[name='city']").val(getParameterByName("city"));
  $("select[name='state']").val(getParameterByName("state"));
  $("input[name='zipcode']").val(getParameterByName("zipcode"));

  $("#submit").click(function (event) {
    var url = "http://www.bhmediatrack.com/cmp/2WNF9Q/2BCRGX/?SID=cleanup";
    url += "&firstname=" + encodeURIComponent($("input[name='first_name']").val());
    url += "&lastname=" + encodeURIComponent($("input[name='last_name']").val());
    url += "&zipcode=" + encodeURIComponent($("input[name='zipcode']").val());
    url += "&email=" + encodeURIComponent($("input[name='email']").val());
    window.location.href = url;
    event.preventDefault();
  });
});