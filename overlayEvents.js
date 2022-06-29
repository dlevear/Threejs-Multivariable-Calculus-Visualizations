// Requires jquery

function overlaySetup() {
  /*
   * Call this when the page is loaded.
   * It will remove the "loading" overlay and hang the 'click' event on the "click to interact overlay"
   */
  transitionToOverlay2();
  hangOverlayEvents();
}

function transitionToOverlay2() {
  $('#overlay1').fadeOut(400);
  $('#overlay1Text').fadeOut(200, function () {
    $('#overlay2Text').fadeIn(200);
  });
}
function hangOverlayEvents() {
  document.querySelector('canvas').addEventListener( 'mousedown', function(e) {
    $("#overlay2").hide();
    e.target.removeEventListener(e.type,arguments.callee);
  });
}
