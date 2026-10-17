// script.js — simple menu toggle for mobile + before/after slider behavior
(function(){
  var btn = document.getElementById('menuBtn');
  var sidebar = document.getElementById('sidebar');
  if(btn && sidebar){
    btn.addEventListener('click', function(){
      sidebar.classList.toggle('open');
    });
  }

  // before/after slider
  function initBeforeAfter(){
    var container = document.getElementById('baContainer');
    if(!container) return;
    var afterWrap = document.getElementById('baAfterWrap');
    var handle = document.getElementById('baHandle');
    var dragging = false;

    function setPosition(x){
      var rect = container.getBoundingClientRect();
      var offset = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
      afterWrap.style.width = (offset * 100) + '%';
      handle.style.left = (offset * 100) + '%';
    }

    handle.addEventListener('pointerdown', function(e){ dragging=true; handle.setPointerCapture(e.pointerId); });
    window.addEventListener('pointerup', function(e){ if(dragging){ dragging=false; } });
    window.addEventListener('pointermove', function(e){ if(!dragging) return; setPosition(e.clientX); });

    // also allow clicking on container to move
    container.addEventListener('click', function(e){ setPosition(e.clientX); });

    // initialize to 50%
    setPosition(container.getBoundingClientRect().left + container.getBoundingClientRect().width/2);

    // touch-friendly: ensure pointer events enabled
  }

  document.addEventListener('DOMContentLoaded', function(){ initBeforeAfter(); });

})();
