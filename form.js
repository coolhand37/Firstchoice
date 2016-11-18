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
              options.error(JSON.stringify(results.error));
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
            rtnval[this.name] = this.value.replace(/-/g, "") || "";
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
          console.log(result);
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