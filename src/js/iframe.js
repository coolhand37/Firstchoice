$(function () {

  var randomDate = function () {
    var today  = new Date();
    var start  = new Date(2010, 0, 1);
    var end    = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    var random = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    var rtnval = moment(random);
    return rtnval.format("YYYY-MM-DD");
  }

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
    errorPlacement: function (error, element) {
      error.appendTo(element.parents(".field"));
    },
    rules: {
      email: { required: true, email: true },
      phone_home: { required: true, phone: true },
      phone_work: { required: true, phone: true, phoneWork: "input[name='phone_home']" },
      ssn: { required: true, ssn: true },
      bank_aba: {
        required: true,
        remote: {
          url: "/helpers/validate/bankaba",
          type: "GET",
          dataType: "json",
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
      home_zipcode: "Required",
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
      employer_zipcode: "Required",
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

});
