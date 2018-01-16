AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: 'us-east-1:3a6af8c5-6f8e-4aee-ad8a-9ae0ae09a3d4' //Amazon Cognito Identity Pool ID
});

var options = {
  appId : '60ef047bfa774665aafd3ab257d6b866',
  appTitle : "Just Right"
};

var mobileAnalyticsClient = new AMA.Manager(options);

function popitup (url) {
  newwindow=window.open(url,'name','height=800,width=600');
  if (window.focus) {newwindow.focus()}
  return false;
}

$(function () {

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
    var yr = $("select[name='"+prefix+"_year']").val();
    var mo = $("select[name='"+prefix+"_month']").val();
    var dy = $("select[name='"+prefix+"_day']").val();
    if (yr.length == 1) yr = '0'+yr;
    if (mo.length == 1) mo = '0'+mo;
    if (dy.length == 1) dy = '0'+dy;
    return yr + "-" + mo + "-" + dy;
  };

  /** The items between these comments are required for iframe processing **/
  var getParameterByName = function (name, path) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec("?" + path);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  // This function gets called when we receive a message from the parent.
  function processQueryString (e) {
    $('#id_first_name').val(getParameterByName("fname", e.data));
    $('#id_last_name').val(getParameterByName("lname", e.data));
    $('#id_email').val(getParameterByName("email", e.data));
    $('#id_home_zipcode').val(getParameterByName("zip", e.data));

    var loan_amount = getParameterByName("loan", e.data);
    if (loan_amount == "") {
      $("select[name='loan_amount_requested']").val("300");
    }
    else {
      $('#id_loan_amount_requested option[value="' + loan_amount + '"]').attr('selected', 'selected');
    }
  }

  // This handles receiving messages from the parent.
  if (window.addEventListener) {
    window.addEventListener("message", processQueryString, false);
  }
  else if (window.attachEvent) {
    window.attachEvent('onmessage', processQueryString);
  }
  /** **/

  // This sets the input mask for certain elements.
  $("input[name='phone_home']").mask("(000) 000-0000");
  $("input[name='phone_work']").mask("(000) 000-0000");
  $("input[name='ssn']").mask("000-00-0000");
  $("input[name='home_zipcode']").mask("00000");
  $("input[name='employer_zipcode']").mask("00000");

  // This intializes the form
  $("select[name='credit']").val("0");

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

  // Create random dates for the following fields.
  $("#id_bank_start_date").val(randomDate());
  $("#id_employer_start_date").val(randomDate());
  $("#id_home_start_date").val(randomDate());

  var form = $("#oaform");
  var validator = form.validate({
    errorClass: "has-error",
    validClass: "has-success",
    errorPlacement: function (error, element) {
      error.appendTo(element.parent(".form-group"));
    },
    highlight: function(element, errorClass, validClass) {
      $(element).parent(".form-group").addClass(errorClass).removeClass(validClass);
    },
    unhighlight: function(element, errorClass, validClass) {
      $(element).parent(".form-group").removeClass(errorClass).addClass(validClass);
    },
    rules: {
      home_zipcode: {
        required: true,
        remote: {
          url: "/worker/validate/zipcode",
          type: "GET",
          data: {
            zipcode: function () {
              return $("input[name='home_zipcode']").val();
            }
          }
        }
      },
      employer_zipcode: {
        required: true,
        remote: {
          url: "/worker/validate/zipcode",
          type: "GET",
          data: {
            zipcode: function () {
              return $("input[name='employer_zipcode']").val();
            }
          }
        }
      },
      email: { required: true, email: true },
      phone_home: { required: true, phone: true },
      phone_work: { required: true, phone: true, phoneWork: "input[name='phone_home']" },
      ssn: { required: true, ssn: true },
      bank_aba: {
        required: true,
        remote: {
          url: "/worker/validate/bankaba",
          type: "GET",
          data: {
            aba: function () {
              return $("input[name='bank_aba']").val();
            }
          }
        }
      },
      pay_date_next_year: { required: true },
      pay_date_next_month: { required: true },
      pay_date_next_day: { required: true },
      dob_year: { required: true },
      dob_month: { required: true },
      dob_day: { required: true }
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

  // Signal that the main form was loaded.
  mobileAnalyticsClient.recordEvent("Screen_Started", {
    "Screen_Name": "One"
  });

  var form = $("#oaform");
  $("#oaform").submit(function (event) {
    event.preventDefault();
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

      $('.application-form').addClass('hidden');
      $('.application-processing-step').removeClass('hidden');

      // Signal that the submit was initiated.
      mobileAnalyticsClient.recordEvent("Screen_Started", {
        "Screen_Name": "Submit"
      });

      $("html, body").animate({ scrollTop: 0 }, "slow");
      window.parent.postMessage("scroll", "*");

      // Start the progress bar animation.
      $(".progress-circle").circleProgress("value", 1.0);
      $(".progress-circle").circleProgress("startAngle", 3 * (Math.PI/2));

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
      rtnval.pay_date_second_next = nextpay.format("YYYY-MM-DD");

      $.ajax({
        url: "/worker/campaign/submit",
        data: rtnval,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        success: function (result) {
          if (result.hasOwnProperty("url")) {
            checkResponse(result.url, {
              success: function (submit) {
                window.parent.postMessage(submit.redirect, "*");
              },
              error: function (error, submit) {
                if (submit && submit.hasOwnProperty("redirect")) {
                  window.parent.postMessage(submit.redirect, "*");
                }
              }
            })
          }
          else {
            alert("Something went wrong while processing your application. Please try resubmitting.");
          }
        },
        error: function (jqxhr, status, thrown) {
          console.error(status);
          window.parent.postMessage("https://www.fcpersonalloans.com/creditscore.html", "*");
        }
      });
    }
    else {
      alert("Please make sure you filled all of the required fields in.");
    }
  });

});