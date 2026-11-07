// Montecarlo Concierge — shared interactions. No data leaves the browser:
// the wizard and membership forms are demo front-ends; submission shows a
// confirmation state and offers WhatsApp / email to reach Pasquale.
(function(){
  "use strict";
  var WA="https://wa.me/33633967192";
  var EMAIL="montecarloconcierge1@gmail.com";
  document.querySelectorAll("[data-wa]").forEach(function(a){a.href=WA;});
  document.querySelectorAll("[data-email]").forEach(function(a){a.href="mailto:"+EMAIL;});
  // Mobile nav
  var menuBtn=document.querySelector(".menu-btn"), nav=document.querySelector("nav.main");
  if(menuBtn&&nav){menuBtn.addEventListener("click",function(){var open=nav.classList.toggle("open");menuBtn.setAttribute("aria-expanded",open);});}
  // Reveal on scroll (rest state visible if JS fails: elements start visible, class only animates)
  var els=document.querySelectorAll("[data-reveal]");
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.style.opacity="1";e.target.style.transform="none";io.unobserve(e.target);}});},{threshold:.1});
    els.forEach(function(el){el.style.opacity="0";el.style.transform="translateY(20px)";el.style.transition="opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)";io.observe(el);});
  }
  // WhatsApp bot mock
  var bot=document.getElementById("concierge-bot");
  if(bot){
    var head=bot.querySelector(".bot-head"), body=bot.querySelector(".bot-body"),
        msgs=bot.querySelector(".bot-msgs"), chips=bot.querySelectorAll("[data-chip]");
    head.addEventListener("click",function(){bot.classList.toggle("open");head.setAttribute("aria-expanded",bot.classList.contains("open"));});
    function addMsg(text,who){var d=document.createElement("div");d.className="msg "+(who==="user"?"user-m":"bot-m");d.textContent=text;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
    var replies={
      table:"Understood — a table in Monaco. Tell Pasquale the date, the party size and any occasion, and he will confirm what can be arranged.",
      yacht:"Understood — a yacht charter from Port Hercule. Tell Pasquale the date, the party size and whether you would like a day charter or a longer passage, and he will confirm availability.",
      jet:"Understood — aviation. Tell Pasquale the route, the date and the number of travellers, and he will confirm the transfer options.",
      villa:"Understood — a villa or residence. Tell Pasquale the dates, the party size and how much seclusion you need, and he will present the options he can arrange."
    };
    var prompts={
      table:"I would like a table in Monaco this Saturday evening.",
      yacht:"I would like a yacht charter from Monaco.",
      jet:"I would like a helicopter or jet transfer.",
      villa:"I would like a villa in Monaco or nearby."
    };
    chips.forEach(function(c){c.addEventListener("click",function(){
      var k=c.getAttribute("data-chip"); addMsg(prompts[k],"user");
      setTimeout(function(){addMsg(replies[k],"bot");},450);
    });});
  }
  // Request wizard
  var wiz=document.getElementById("request-wizard");
  if(wiz){
    var steps=Array.prototype.slice.call(wiz.querySelectorAll(".wizard-step"));
    var bars=Array.prototype.slice.call(wiz.querySelectorAll(".wizard-progress span"));
    var current=0, service="";
    function show(i){
      current=i;
      steps.forEach(function(s,idx){s.classList.toggle("active",idx===i);});
      bars.forEach(function(b,idx){b.classList.toggle("on",idx<=i);});
      var first=steps[i].querySelector("input,select,textarea,button"); if(first) first.focus();
      window.scrollTo({top:wiz.offsetTop-100,behavior:"smooth"});
    }
    function setInvalid(field,msg){field.classList.add("invalid");var e=field.querySelector(".error");if(e&&msg)e.textContent=msg;}
    function clearInvalid(field){field.classList.remove("invalid");}
    wiz.querySelectorAll(".pill[data-service]").forEach(function(p){
      p.addEventListener("click",function(){
        wiz.querySelectorAll(".pill[data-service]").forEach(function(x){x.setAttribute("aria-pressed","false");});
        p.setAttribute("aria-pressed","true"); service=p.getAttribute("data-service");
        var sum=wiz.querySelector("#summary-service"); if(sum) sum.textContent=p.textContent.trim();
      });
    });
    // Prefill from ?service=
    var params=new URLSearchParams(window.location.search);
    var pre=params.get("service");
    if(pre){var match=wiz.querySelector('.pill[data-service="'+pre+'"]'); if(match) match.click();}
    wiz.querySelectorAll("[data-next]").forEach(function(btn){
      btn.addEventListener("click",function(){
        var step=steps[current], ok=true;
        if(current===0 && !service){var f=step.querySelector(".field"); setInvalid(f,"Please choose a service to continue."); ok=false;}
        if(current===1){
          ["arrival","departure","guests"].forEach(function(id){
            var input=step.querySelector("#"+id), field=input.closest(".field");
            clearInvalid(field);
            if(!input.value){setInvalid(field,"This field is required."); ok=false;}
          });
          var a=step.querySelector("#arrival"), d=step.querySelector("#departure");
          if(a.value&&d.value&&d.value<a.value){setInvalid(d.closest(".field"),"Departure must be after arrival."); ok=false;}
        }
        if(current===2){
          var det=step.querySelector("#details"), field=det.closest(".field"); clearInvalid(field);
          if(!det.value.trim()){setInvalid(field,"Please add a few lines so Pasquale understands the brief."); ok=false;}
        }
        if(ok) show(current+1);
      });
    });
    wiz.querySelectorAll("[data-prev]").forEach(function(btn){btn.addEventListener("click",function(){show(current-1);});});
    // Review summary
    wiz.addEventListener("input",function(){
      function set(id,val){var el=wiz.querySelector(id); if(el) el.textContent=val||"—";}
      set("#summary-dates",(wiz.querySelector("#arrival")||{}).value+" → "+(wiz.querySelector("#departure")||{}).value);
      set("#summary-guests",(wiz.querySelector("#guests")||{}).value);
      set("#summary-location",(wiz.querySelector("#location")||{}).value);
      set("#summary-budget",(wiz.querySelector('input[name="budget"]:checked')||{}).value);
      set("#summary-details",(wiz.querySelector("#details")||{}).value);
    });
    var form=wiz.querySelector("#request-form");
    if(form){
      form.addEventListener("submit",function(ev){
        ev.preventDefault(); var ok=true;
        ["fullname","email","phone"].forEach(function(id){
          var input=form.querySelector("#"+id), field=input.closest(".field"); clearInvalid(field);
          if(!input.value.trim()){setInvalid(field,"This field is required."); ok=false;}
        });
        var em=form.querySelector("#email");
        if(em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)){setInvalid(em.closest(".field"),"Please enter a valid email address."); ok=false;}
        var consent=form.querySelector("#consent");
        if(!consent.checked){setInvalid(consent.closest(".field"),"Please confirm you are happy for us to use these details to handle your request."); ok=false;}
        if(!ok) return;
        var ref="MC-2026-"+String(Math.floor(1000+Math.random()*9000));
        var rc=wiz.querySelector("#ref-code"); if(rc) rc.textContent=ref;
        wiz.querySelector("#wizard-steps").style.display="none";
        wiz.querySelector("#wizard-confirm").style.display="block";
        wiz.querySelector("#wizard-confirm").scrollIntoView({behavior:"smooth"});
      });
    }
  }
  // Membership application
  var mem=document.getElementById("membership-form");
  if(mem){
    mem.addEventListener("submit",function(ev){
      ev.preventDefault(); var ok=true;
      mem.querySelectorAll("[required]").forEach(function(input){
        var field=input.closest(".field"); field.classList.remove("invalid");
        if(!input.value.trim()){field.classList.add("invalid"); ok=false;}
      });
      var em=mem.querySelector("#mem-email");
      if(em.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)){em.closest(".field").classList.add("invalid"); ok=false;}
      if(!ok) return;
      mem.style.display="none";
      var done=document.getElementById("membership-confirm"); if(done) done.style.display="block";
    });
  }
  // Portal demo login
  var portal=document.getElementById("portal-login");
  if(portal){
    portal.addEventListener("submit",function(ev){
      ev.preventDefault();
      var input=portal.querySelector("#portal-id");
      if(!input.value.trim()){input.closest(".field").classList.add("invalid"); return;}
      document.getElementById("portal-gate").style.display="none";
      document.getElementById("portal-dash").style.display="block";
    });
  }
  // Cookie banner
  var cookie=document.getElementById("cookie-banner");
  if(cookie && !localStorage.getItem("mc-cookie-choice")){
    cookie.classList.add("show");
  }
  document.querySelectorAll("[data-cookie]").forEach(function(b){
    b.addEventListener("click",function(){
      try{localStorage.setItem("mc-cookie-choice",b.getAttribute("data-cookie"));}catch(e){}
      if(cookie) cookie.classList.remove("show");
    });
  });
})();
