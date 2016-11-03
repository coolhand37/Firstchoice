var $ = require('jquery');


$(".collapsed-menu").click(function(){
    $(".collapsed-navbar").toggle();
});


$(".collapsed-navbar").click(function(){
    $(".collapsed-navbar").toggle();
});

$(".back-button").click(function() {
    window.history.back()
});

$('main').on('click', '.preform-button', function(){
	location.href = "form.html";
	return false;
});

$('main').on('click', '.first-step-continue', function(){
	$(this).parents('.application-first-step').toggle();
	$(this).parents('.application-first-step').siblings('.application-second-step').toggle();
	$(this).parents('.application-form').siblings('.application-progressbar').children('.bar-personal-info').toggleClass('active');
	$(this).parents('.application-form').siblings('.application-progressbar').children('.bar-employment-info').toggleClass('active');
	return false;
});

$('main').on('click', '.employment-back', function(){
	$(this).parents('.application-second-step').toggle();
	$(this).parents('.application-second-step').siblings('.application-first-step').toggle();
	$(this).parents('.application-form').siblings('.application-progressbar').children('.bar-personal-info').toggleClass('active');
	$(this).parents('.application-form').siblings('.application-progressbar').children('.bar-employment-info').toggleClass('active');
})

$('main').on('click', '.second-step-continue', function(){
	$(this).parents('.application-second-step').toggle();
	$(this).parents('.application-second-step').siblings('.application-third-step').toggle();
	$(this).parents('.application-form').siblings('.application-progressbar').children('.bar-employment-info').toggleClass('active');
	$(this).parents('.application-form').siblings('.application-progressbar').children('.bar-banking-info').toggleClass('active');
	return false;
});

$('main').on('click', '.banking-back', function(){
	$(this).parents('.application-third-step').toggle();
	$(this).parents('.application-third-step').siblings('.application-second-step').toggle();
	$(this).parents('.application-form').siblings('.application-progressbar').children('.bar-employment-info').toggleClass('active');
	$(this).parents('.application-form').siblings('.application-progressbar').children('.bar-banking-info').toggleClass('active');
});

$('main').on('click', '.third-step-continue', function(){
	return false;
});
