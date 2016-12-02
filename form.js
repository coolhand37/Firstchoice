/**
 * This file will hold all of our "custom" scripts for the form.
 */
$(function () {

  var checkResponse = function (url, options) {
    if (url != undefined && url != "") {
      $.ajax({
        url: url,
        type: "GET",
        dataType: "jsonp",
        jsonp: "callback",
        success: function (results) {
          if (results != undefined && results.status == "success") {
            console.log(results);
            if (options.success) {
              options.success(results.submit);
            }
          }
          else if (results != undefined && results.status == "error") {
            if (options.error) {
              options.error(JSON.stringify(results.error), results.submit);
            }
          }
          else {
            setTimeout(function () { checkResponse(url, options); }, 1000);
          }
        }
      });
    }
    else {
      console.log("No URL was provided");
    }
  };

  var createDate = function (prefix) {
    var yr = "select[name='"+prefix+"_year']";
    var mo = "select[name='"+prefix+"_month']";
    var dy = "select[name='"+prefix+"_day']";
    return $(yr).val() + "-" + $(mo).val() + "-" + $(dy).val();
  };

  $("input[name='phone_home']").mask("(000) 000-0000");
  $("input[name='phone_work']").mask("(000) 000-0000");
  $("input[name='ssn']").mask("000-00-0000");

  jQuery.validator.addMethod("phone", function (value, element) {
    return this.optional(element) || /^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/.test(value);
  }, "Valid format: (800) 555-1212");

  jQuery.validator.addMethod("ssn", function (value, element) {
    return this.optional(element) || /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/.test(value);
  }, "Valid format: 111-22-3333");

  jQuery.validator.addMethod("phoneWork", function (value, element, param) {
    return this.optional(element) || value != $(param).val();
  }, "Cannot match home phone");

  var form = $("#main-form");
  form.validate({
    errorClass: "error",
    validClass: "success",
    errorPlacement: function (error, element) {
      error.appendTo(element.parents(".field"));
    },
    rules: {
      email: { required: true, email: true },
      phone_home: { required: true, phone: true },
      phone_work: { required: true, phone: true, phoneWork: "input[name='phone_home']" },
      ssn: { required: true, ssn: true }
    }
  });

  $(".progress-circle").circleProgress({
    value: 0.0,
    fill: "#099246",
    size: 156,
    thickness: 16,
    startAngle: 3 * (Math.PI/2),
    animation: { duration: 200000, easing: "linear" }
  }).on("circle-animation-progress", function (event, progress) {
    $(this).find("strong").html(parseInt(100 * progress) + "<i>%</i>");
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

  // Initialize the form by getting the transaction token from the server.
  var cid = $("#id_cid").val();
  $.ajax({
    url: "https://offerannex.herokuapp.com/worker/campaign/"+cid+"/maketransaction",
    jsonp: "callback",
    dataType: "jsonp",
    data: {
      "affiliate_id": $("#id_id").val()
    },
    success: function (result) {
      if (result && result.status == "success") {
        $("#id_client_ip").val(result.ip);
        $("#id_user_agent").val(result.user_agent);
        $("#id_tid").val(result.tid);
      }
    }
  });

  $("#main-form").submit(function (event) {
    if (form.valid()) {
      $("html, body").animate({ scrollTop: 0 }, "slow");
      $('.application-third-step').toggle();
      $('.application-processing-step').toggle();
      $('.bar-banking-info').toggleClass('active');
      $('.bar-get-approved').toggleClass('active');

      // Start the progress bar animation.
      $(".progress-circle").circleProgress("value", 1.0);

      // Convert the form elements into JSON to be posted to the backend.
      var items = $(this).serializeArray();
      var rtnval = {};
      $.each(items, function () {
        if (this.name.startsWith("dob_") || this.name.startsWith("pay_date_next_")) {
          return;
        }
        if (rtnval[this.name] !== undefined) {
          if (!rtnval[this.name].push) {
            rtnval[this.name] = [rtnval[this.name]];
          }
          rtnval[this.name].push(this.value || "");
        }
        else {
          if (this.name.startsWith("phone_")) {
            rtnval[this.name] = this.value.replace(/[\s-\(\)]/g, "") || "";
          }
          else {
            rtnval[this.name] = this.value || "";
          }
        }
      });

      // Now build up the dob and pay_date_next fields.
      rtnval.dob = createDate("dob");
      rtnval.pay_date_next = createDate("pay_date_next");

      $.ajax({
        url: "https://offerannex.herokuapp.com/worker/campaign/submit",
        data: rtnval,
        type: "POST",
        dataType: "jsonp",
        crossDomain: true,
        success: function (result) {
          if (result.hasOwnProperty("url")) {
            checkResponse(result.url, {
              success: function (submit) {
                console.log(submit.redirect);
                window.location.href = submit.redirect;
              },
              error: function (error, submit) {
                console.error(error);
                if (submit && submit.hasOwnProperty("redirect")) {
                  window.location.href = submit.redirect;
                }
              }
            })
          }
          else {
            alert("Something went wrong while processing your application. Please try resubmitting.");
          }
        },
        error: function (e) {
          console.error(e);
        }
      });
    }
    else {
      alert("Please make sure you filled all of the required fields in.");
    }
    event.preventDefault();
  });

});