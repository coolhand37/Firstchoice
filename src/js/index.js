$(function () {
  var getParameterByName = function (name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  $(".collapsed-menu").click(function(){
    $(".collapsed-navbar").slideToggle();
  });

  $(".collapsed-navbar").click(function(){
    $(".collapsed-navbar").slideToggle();
  });

  $(".back-button").click(function() {
    window.history.back()
  });

  $('main').on('click', '.preform-button', function (event){
    var affid = getParameterByName("affid");
    var token = getParameterByName("r");
    var amount = $("select[name='amount']").val();
    var credit = $("select[name='creditscore']").val();
    var zipcode = $("input[name='zipcode']").val();
    window.location.href = "form.html?amount="+amount+"&credit="+credit+"&zipcode="+zipcode+"&affid="+affid+"&r="+token;
    event.preventDefault();
  });
});
