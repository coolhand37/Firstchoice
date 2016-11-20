$(function () {
  $(".collapsed-menu").click(function(){
    $(".collapsed-navbar").slideToggle();
  });

  $(".collapsed-navbar").click(function(){
    $(".collapsed-navbar").slideToggle();
  });

  $(".back-button").click(function() {
    window.history.back()
  });

  $('main').on('click', '.preform-button', function(){
    var amount = $("select[name='amount']").val();
    var credit = $("select[name='creditscore']").val();
    var zipcode = $("input[name='zipcode']").val();
    location.href = "form.html?amount="+amount+"&credit="+credit+"&zipcode="+zipcode;
    return false;
  });
});
