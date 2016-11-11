/**
 * This file will hold all of our "custom" scripts for the form.
 */
$(function () {

  var form = $("#main-form");
  form.validate({
    errorClass: "error",
    validClass: "success",
    errorPlacement: function (error, element) {
      error.appendTo(element.parents(".field"));
    }
  });

  $(".back-button").click(function() {
    window.history.back()
  });

  $('main').on('click', '.preform-button', function() {
    location.href = "form.html";
    return false;
  });

  $('main').on('click', '.first-step-continue', function() {
    if (form.valid()) {
      $("html, body").animate({ scrollTop: 0 }, "slow");
      $('.application-first-step').toggle();
      $('.application-second-step').toggle();
      $('.bar-personal-info').toggleClass('active');
      $('.bar-employment-info').toggleClass('active');
    }
    return false;
  });

  $('main').on('click', '.employment-back', function() {
    $('.application-second-step').toggle();
    $('.application-first-step').toggle();
    $('.bar-personal-info').toggleClass('active');
    $('.bar-employment-info').toggleClass('active');
  });

  $('main').on('click', '.second-step-continue', function() {
    if (form.valid()) {
      $("html, body").animate({ scrollTop: 0 }, "slow");
      $('.application-second-step').toggle();
      $('.application-third-step').toggle();
      $('.bar-employment-info').toggleClass('active');
      $('.bar-banking-info').toggleClass('active');
    }
    return false;
  });

  $('main').on('click', '.banking-back', function() {
    $('.application-third-step').toggle();
    $('.application-second-step').toggle();
    $('.bar-employment-info').toggleClass('active');
    $('.bar-banking-info').toggleClass('active');
  });

  $('main').on('click', '.third-step-continue', function() {
    if (form.valid()) {
      // Nothing here yet...
    }
    return false;
  });

});