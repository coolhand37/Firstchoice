var $ = require('jquery');

console.log("hello world")


// $('.collapsed-menu').on('click', function () {

// 		// $(this).parents('form').toggleClass('expand');
// 		console.log("hi")

// 	});

$(".collapsed-menu").click(function(){
    $(".main-navbar").toggle();
});