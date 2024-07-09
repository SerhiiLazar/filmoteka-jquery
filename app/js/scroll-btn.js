$(function () {
  const $scrollBtnEl = $("#scroll-up");

  $(window).on("scroll", function () {
    let $scrolled = $(window).scrollTop();
    if ($scrolled > 500) {
      $scrollBtnEl.removeAttr("hidden").addClass("scroll-btn");
    } else {
      $scrollBtnEl.attr("hidden", true).removeClass("scroll-btn");
    }
  });

  $scrollBtnEl.on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 500);
  });
});
