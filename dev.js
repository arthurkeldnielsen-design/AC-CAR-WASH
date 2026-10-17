// dev.js — basic client-side dev mode
(function(){
  var ACTIVATION_CODE = '041012';
  var storageKey = 'ac_car_wash_dev_state_v1';

  function q(sel){return document.querySelector(sel)}
  function showToast(msg){console.log('DEV:',msg)}

  // create floating button
  var devBtn = document.createElement('button');
  devBtn.className = 'dev-button';
  devBtn.textContent = 'Dev';
  document.body.appendChild(devBtn);

  var panel = document.createElement('div');
  panel.className = 'dev-panel';
  panel.style.display = 'none';
  panel.innerHTML = "<h4>Dev Mode</h4><div class='small'>Enter code to activate editing features.</div>\n    <div id='devAuth' style='margin-top:8px;display:flex;gap:8px'><input id='devCode' placeholder='enter code' style='flex:1;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:inherit' /><button id='devUnlock' style='padding:8px;border-radius:6px'>Unlock</button></div>\n    <div id='devTools' style='margin-top:10px;display:none'>\n      <div class='dev-tools'>\n        <button id='addText'>Add text box</button>\n        <button id='addImage'>Add image box (drag/drop)</button>\n        <button id='newPage'>Create new page</button>\n        <button id='copyHtml'>Copy current page HTML</button>\n        <div class='dev-capture'>\n          <button id='saveLocal'>Save to browser</button>\n          <button id='restoreLocal'>Restore saved</button>\n        </div>\n        <div style='margin-top:8px' class='small'>Changes are local to your browser until you copy/paste them into GitHub.</div>\n      </div>\n    </div>";
  document.body.appendChild(panel);

  devBtn.addEventListener('click', function(){
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  // Auth flow
  var devUnlock = panel.querySelector('#devUnlock');
  var devCodeInput = panel.querySelector('#devCode');
  var devTools = panel.querySelector('#devTools');
  function setActive(active){
    if(active){
      devTools.style.display = 'block';
      panel.querySelector('#devAuth').style.display = 'none';
      showToast('dev mode active');
      localStorage.setItem(storageKey, JSON.stringify({active:true, pages: loadPages()}));
    } else {
      devTools.style.display = 'none';
      panel.querySelector('#devAuth').style.display = 'flex';
      localStorage.removeItem(storageKey);
    }
  }

  devUnlock.addEventListener('click', function(){
    var code = devCodeInput.value.trim();
    if(code === ACTIVATION_CODE){
      setActive(true);
    } else {
      alert('Incorrect code');
    }
  });

  // Tools
  function createEditable(text){
    var d = document.createElement('div');
    d.className = 'dev-editable';
    d.contentEditable = true;
    d.innerHTML = text || 'Editable text...';
    d.style.marginTop = '8px';
    d.addEventListener('focus', function(){ d.style.outline = '2px solid rgba(0,180,216,0.12)'});
    d.addEventListener('blur', function(){ d.style.outline = 'none'});
    return d;
  }

  function createImageBox(){
    var box = document.createElement('div');
    box.className = 'dev-dropzone';
    box.textContent = 'Drag & drop an image here or click to choose';
    box.style.marginTop = '8px';
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    function setImageDataUrl(dataUrl){
      box.innerHTML = '';
      var img = document.createElement('img');
      img.src = dataUrl;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      box.appendChild(img);
    }

    box.addEventListener('click', function(){ input.click(); });

    input.addEventListener('change', function(e){
      var f = e.target.files[0];
      if(!f) return;
      var reader = new FileReader();
      reader.onload = function(ev){ setImageDataUrl(ev.target.result); };
      reader.readAsDataURL(f);
    });

    box.addEventListener('dragover', function(e){ e.preventDefault(); box.style.opacity=0.9 });
    box.addEventListener('dragleave', function(e){ box.style.opacity=1 });
    box.addEventListener('drop', function(e){ e.preventDefault(); box.style.opacity=1; var f = e.dataTransfer.files[0]; if(!f) return; var reader = new FileReader(); reader.onload = function(ev){ setImageDataUrl(ev.target.result); }; reader.readAsDataURL(f); });

    box.appendChild(input);
    return box;
  }

  panel.querySelector('#addText').addEventListener('click', function(){
    var ed = createEditable();
    var target = q('#mainContent') || document.body;
    target.appendChild(ed);
  });

  panel.querySelector('#addImage').addEventListener('click', function(){
    var box = createImageBox();
    var target = q('#mainContent') || document.body;
    target.appendChild(box);
  });

  panel.querySelector('#copyHtml').addEventListener('click', function(){
    var html = '<!doctype html>\n' + document.documentElement.outerHTML;
    navigator.clipboard.writeText(html).then(function(){ alert('Page HTML copied to clipboard — paste into a new GitHub file to save.'); });
  });

  panel.querySelector('#saveLocal').addEventListener('click', function(){
    var state = collectState();
    localStorage.setItem(storageKey, JSON.stringify(state));
    alert('Saved to browser localStorage. Your edits persist on this device only.');
  });

  panel.querySelector('#restoreLocal').addEventListener('click', function(){
    var s = localStorage.getItem(storageKey);
    if(!s){ alert('No saved state found.'); return; }
    try{ var state = JSON.parse(s); applyState(state); alert('Restored saved state.'); }catch(e){ alert('Failed to restore: '+e.message); }
  });

  panel.querySelector('#newPage').addEventListener('click', function(){
    var name = prompt('Enter new page name (e.g., specials) — will appear as #/devpage/specials');
    if(!name) return;
    var slug = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g,'-');
    savePage(slug, {title: name, body: '<h2>'+name+'</h2><p>New page content...</p>'});
    insertDevLink(slug, name);
    alert('Created new dev page: #/devpage/'+slug);
  });

  // Simple in-memory pages store
  function loadPages(){ try{ var s = localStorage.getItem(storageKey); if(!s) return {}; var st = JSON.parse(s); return st.pages || {}; }catch(e){ return {}; } }
  function savePage(slug, content){ var pages = loadPages(); pages[slug]=content; var st = {active:true,pages:pages}; localStorage.setItem(storageKey, JSON.stringify(st)); }

  function insertDevLink(slug, name){
    var nav = q('.sidebar nav') || q('nav');
    if(!nav) return;
    var a = document.createElement('a');
    a.href = '#/devpage/'+slug;
    a.textContent = name + ' (dev)';
    nav.appendChild(a);
  }

  function collectState(){
    var html = document.documentElement.outerHTML;
    var pages = loadPages();
    return {timestamp:Date.now(), html:html, pages:pages};
  }

  function applyState(state){
    if(state.html){
      // replace body content only (safe)
      try{
        var doc = new DOMParser().parseFromString(state.html, 'text/html');
        document.body.innerHTML = doc.body.innerHTML;
        // re-run script.js and dev.js? simpler to reload page
        location.reload();
      }catch(e){ console.error(e); }
    }
  }

  // Router for dev pages
  function checkRoute(){
    var hash = location.hash || '';
    if(hash.indexOf('#/devpage/') === 0){
      var slug = hash.replace('#/devpage/','');
      var pages = loadPages();
      var p = pages[slug];
      if(p){
        var main = q('#mainContent');
        if(main){ main.innerHTML = p.body; }
      }
    }
  }
  window.addEventListener('hashchange', checkRoute);
  checkRoute();

  // on load, if saved pages exist, insert links
  (function insertSavedLinks(){ var pages = loadPages(); Object.keys(pages).forEach(function(slug){ insertDevLink(slug, pages[slug].title || slug); }); })();

  // auto-activate if previously set
  try{ var prev = JSON.parse(localStorage.getItem(storageKey)); if(prev && prev.active){ setActive(true); } }catch(e){}

})();
