// script.js — simple menu toggle for mobile
(function(){
  var btn = document.getElementById('menuBtn');
  var sidebar = document.getElementById('sidebar');
  if(!btn||!sidebar) return;
  btn.addEventListener('click', function(){
    sidebar.classList.toggle('open');
  });
})();
