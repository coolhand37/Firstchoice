$(function () {


  // $('body').on('click', '.privacy-lightbox', function(){
  //   $(this).siblings('.contactus_box').removeClass('hidden')
  // })
  // $('.close').on('click', function() {
  //   $(this).parents('.contactus_box').addClass('hidden')
  // })

  $(".privacy-form-link").click(function(){
    $(".privacy-lightbox").toggle();
    $('body').css({
        'overflow': 'hidden',
    });
  });

  $(".econsent-form-link").click(function(){
    $(".econsent-lightbox").toggle();
    $('body').css({
        'overflow': 'hidden',
    });
  });

  $('.privacy-close').click(function() {
      $(".privacy-lightbox").toggle();
      $('body').css({
          'overflow': 'visible',
      });
      return false
  });

  $('.econsent-close').click(function() {
      $(".econsent-lightbox").toggle();
      $('body').css({
          'overflow': 'visible',
      });
      return false
  });
 

  var unloadHandler = function (e) {
    if ($(".bar-get-approved").hasClass("active")) {
      var msg = "Refreshing will cancel your application, are you sure?";
      e.returnValue = msg;
      return msg;
    }
    e.preventDefault();
  }

  var randomDate = function () {
    var today  = new Date();
    var start  = new Date(2010, 0, 1);
    var end    = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    var random = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    var rtnval = moment(random);
    return rtnval.format("YYYY-MM-DD");
  }

  window.addEventListener("beforeunload", unloadHandler);

  var checkResponse = function (url, options) {
    if (url != undefined && url != "") {
      $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (results) {
          if (results != undefined && results.status == "success") {
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

  var getParameterByName = function (name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  $("input[name='phone_home']").mask("(000) 000-0000");
  $("input[name='phone_work']").mask("(000) 000-0000");
  $("input[name='ssn']").mask("000-00-0000");
  $("input[name='home_zipcode']").mask("00000");
  $("input[name='employer_zipcode']").mask("00000");

  var tmp_amount = getParameterByName("amount");
  if (tmp_amount == "") {
    tmp_amount = "300";
  }

  var tmp_credit = getParameterByName("credit");
  if (tmp_credit == "") {
    tmp_credit = "0";
  }

  $("select[name='loan_amount_requested']").val(tmp_amount);
  $("select[name='credit']").val(tmp_credit);
  $("input[name='home_zipcode']").val(getParameterByName("zipcode"));

  jQuery.validator.addMethod("phone", function (value, element) {
    return this.optional(element) || /^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/.test(value);
  }, "Valid format: (800) 555-1212");

  jQuery.validator.addMethod("ssn", function (value, element) {
    return this.optional(element) || /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/.test(value);
  }, "Valid format: 111-22-3333");

  jQuery.validator.addMethod("phoneWork", function (value, element, param) {
    return this.optional(element) || value != $(param).val();
  }, "Matches home phone");

  jQuery.validator.addMethod("zipcode", function(value, element) {
    return this.optional(element) || /^\d{5}(?:-\d{4})?$/.test(value);
  }, "Please provide a valid zip code.");

  // Disable the submit button if the consent box is not checked.
  $(".consent").change(function () {
    var submit_btn = $("button.form-button.third-step-continue");
    if (this.checked) {
      $(submit_btn).prop("disabled", false);
    }
    else {
      $(submit_btn).prop("disabled", true);
    }
  });

  $("#id_bank_start_date").val(randomDate());
  $("#id_employer_start_date").val(randomDate());
  $("#id_home_start_date").val(randomDate());

  var form = $("#main-form");
  var validator = form.validate({
    errorClass: "error",
    validClass: "success",
    groups: {
      pay_date_next: "pay_date_next_year pay_date_next_month pay_date_next_day",
      dob: "dob_year dob_month dob_day"
    },
    errorPlacement: function (error, element) {
      error.appendTo(element.parents(".field"));
    },
    rules: {
      home_zipcode: { required: true, zipcode: true },
      employer_zipcode: { required: true, zipcode: true },
      email: { required: true, email: true },
      phone_home: { required: true, phone: true },
      phone_work: { required: true, phone: true, phoneWork: "input[name='phone_home']" },
      ssn: { required: true, ssn: true },
      bank_aba: {
        required: true,
        remote: {
          url: "https://offerannex.herokuapp.com/worker/validate/bankaba",
          type: "GET",
          data: {
            aba: function () {
              return $("input[name='bank_aba']").val();
            }
          }
        }
      }
    },
    messages: {
      loan_amount_requested: "Required",
      credit: "Required",
      first_name: "Required",
      last_name: "Required",
      home_address_1: "Required",
      home_zipcode: {
        required: "Required",
        zipcode: "Invalid format"
      },
      home_type: "Required",
      email: {
        required: "Required",
        email: "Invalid format"
      },
      phone_home: "Required",
      best_contact_time: "Required",
      income_source: "Required",
      monthly_income: "Required",
      employer: "Required",
      phone_work: {
        required: "Required",
        phoneWork: "Cannot match home phone"
      },
      employer_address_1: "Required",
      employer_zipcode: {
        required: "Required",
        zipcode: "Invalid format"
      },
      pay_frequency: "Required",
      pay_date_next_year: "Required",
      pay_date_next_month: "Required",
      pay_date_next_day: "Required",
      bank_account_type: "Required",
      direct_deposit: "Required",
      bank_aba: "Required",
      bank_account: "Required",
      ssn: "Required",
      state_id_number: "Required",
      state_id_issue_state: "Required",
      dob_year: "Required",
      dob_month: "Required",
      dob_day: "Required"
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

  // Move to the second screen.
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

  // Move back to the first screen.
  $('main').on('click', '.employment-back', function() {
    $('.application-second-step').toggle();
    $('.application-first-step').toggle();
    $('.bar-personal-info').toggleClass('active');
    $('.bar-employment-info').toggleClass('active');
  });

  // Move to the third screen.
  $('main').on('click', '.second-step-continue', function() {
    if (form.valid()) {
      //
      // Before showing the second screen, calculate the second pay date.
      //
      var paydate = moment(createDate("pay_date_next"));
      var freq    = $("select[name='pay_frequency']").val();
      var nextpay = paydate;

      // Make sure the paydate is in the future.
      if (paydate.isBefore()) {
        validator.showErrors({ "pay_date_next_year": "Invalid pay date" });
        return false;
      }

      if (freq == "W") {
        nextpay = paydate.add(1, "w");
      }
      else if (freq == "B") {
        nextpay = paydate.add(2, "w");
      }
      else if (freq == "M") {
        nextpay = paydate.add(1, "M");
      }
      else {
        nextpay = paydate.add(15, "d");
      }

      // Now make sure the date doesn't fall on a weekend.
      if (nextpay.isoWeekday() == 6) {
        nextpay = nextpay.subtract(1, "d");
      }
      else if (nextpay.isoWeekday() == 7) {
        nextpay = nextpay.add(1, "d");
      }

      $("input[name='pay_date_second_next']").val(nextpay.format("YYYY-MM-DD"));
      $("html, body").animate({ scrollTop: 0 }, "slow");
      $('.application-second-step').toggle();
      $('.application-third-step').toggle();
      $('.bar-employment-info').toggleClass('active');
      $('.bar-banking-info').toggleClass('active');
    }
    return false;
  });

  // Move back to the second screen.
  $('main').on('click', '.banking-back', function() {
    $('.application-third-step').toggle();
    $('.application-second-step').toggle();
    $('.bar-employment-info').toggleClass('active');
    $('.bar-banking-info').toggleClass('active');
  });

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

  $("#tier1-submit").click(function () {
    $("#id_main_submit").val("tier1-submit");
  });

  $("#tier0-submit").click(function () {
    $("#id_main_submit").val("tier0-submit");
  });

  $("#main-form").submit(function (event) {
    if (form.valid()) {
      var paydate = moment(createDate("pay_date_next"));
      var freq    = $("select[name='pay_frequency']").val();
      var nextpay = paydate;

      // Make sure the paydate is in the future.
      if (paydate.isBefore()) {
        validator.showErrors({ "pay_date_next_year": "Invalid pay date" });
        return false;
      }

      if (freq == "W") {
        nextpay = paydate.add(1, "w");
      }
      else if (freq == "B") {
        nextpay = paydate.add(2, "w");
      }
      else if (freq == "M") {
        nextpay = paydate.add(1, "M");
      }
      else {
        nextpay = paydate.add(15, "d");
      }

      // Now make sure the date doesn't fall on a weekend.
      if (nextpay.isoWeekday() == 6) {
        nextpay = nextpay.subtract(1, "d");
      }
      else if (nextpay.isoWeekday() == 7) {
        nextpay = nextpay.add(1, "d");
      }

      var submitBtn = $("#id_main_submit").val();
      $("html, body").animate({ scrollTop: 0 }, "slow");
      $('.bar-banking-info').toggleClass('active');
      $('.bar-get-approved').toggleClass('active');

      if (submitBtn == "main-submit") {
        $('.application-first-step').toggle();
        $('.application-second-step').toggle();
        $('.application-third-step').toggle();
        $('.application-processing-step').toggle();
        $("#id_main_submit").val("0");
      }
      else {
        $('.pl-denial').toggle();
        $('.application-processing-step').toggle();
      }

      // Start the progress bar animation.
      $(".progress-circle").circleProgress("value", 1.0);
      $(".progress-circle").circleProgress("startAngle", 3 * (Math.PI/2));

      // We need to figure out which tier to run this lead against.
      var tier = 1;

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

      // Figure out which buyer tier this lead needs to be processed with.
      var amount = parseInt($("select[name='loan_amount_requested']").val());
      if (amount >= 1000 && submitBtn == "main-submit") {
        tier = 2;
      }
      else if (submitBtn == "tier1-submit") {
        rtnval["loan_amount_requested"] = 800;
        tier = 1;
      }
      else if (submitBtn == "tier0-submit") {
        rtnval["loan_amount_requested"] = 800;
        tier = 0;
      }
      rtnval["tier"] = tier;

      // Now build up the dob and pay_date_next fields.
      rtnval.dob = createDate("dob");
      rtnval.pay_date_next = createDate("pay_date_next");
      rtnval.pay_date_second_next = nextpay.format("YYYY-MM-DD");

      $.ajax({
        url: "https://offerannex.herokuapp.com/worker/campaign/submit",
        data: rtnval,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        success: function (result) {
          if (result.hasOwnProperty("url")) {
            checkResponse(result.url, {
              success: function (submit) {
                if (tier == 2 && submit.status != "A") {
                  //
                  // The user requested more than $1k and was declined. Before serving
                  // them the decline link, we'll offer them the chance to go for a
                  // lower loan amount.
                  //
                  $("html, body").animate({ scrollTop: 0 }, "slow");
                  $('.application-processing-step').toggle();
                  $('.pl-denial').toggle();
                }
                else {
                  //
                  // The user requested less than $1k or was accepted, so we'll serve
                  // them the decline link that was provided.
                  //
                  window.removeEventListener("beforeunload", unloadHandler);
                  window.location.href = submit.redirect;
                }
              },
              error: function (error, submit) {
                window.removeEventListener("beforeunload", unloadHandler);
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
        error: function (jqxhr, status, thrown) {
          window.removeEventListener("beforeunload", unloadHandler);
          console.error(status);
          window.location.href = "/creditscore.html";
        }
      });
    }
    else {
      alert("Please make sure you filled all of the required fields in.");
    }
    event.preventDefault();
  });

});
