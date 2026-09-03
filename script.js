const seed = {
  tasks:[
    {id:'t1',title:'Take recycling to curb',meta:'Home · James',time:'8:00 AM',done:false},
    {id:'t2',title:'Return library books',meta:'Errand · Caroline',time:'4:30 PM',done:false},
    {id:'t3',title:'Water the garden',meta:'Backyard · James',time:'6:00 PM',done:true},
    {id:'t4',title:'Practice piano',meta:'Daily · Caroline',time:'7:00 PM',done:false}
  ],
  groceries:[
    {name:'Honeycrisp apples',category:'Produce',quantity:'6',done:false},{name:'Baby spinach',category:'Produce',quantity:'1 bag',done:true},{name:'Whole milk',category:'Dairy',quantity:'1 gal',done:true},{name:'Sourdough bread',category:'Bakery',quantity:'1',done:false},{name:'Chicken thighs',category:'Meat',quantity:'2 lb',done:false}
  ],
  events:[
    {day:0,title:'Labor Day',time:'All day',tone:'green'}, {day:1,title:'School drop-off',time:'8:15 AM',tone:'blue'},
    {day:2,title:'Dentist · Caroline',time:'3:30 PM',tone:'blue'}, {day:3,title:'Team standup',time:'9:00 AM',tone:'amber'},
    {day:3,title:'Soccer practice',time:'5:30 PM',tone:'blue'}, {day:4,title:'Date night',time:'7:00 PM',tone:'rose'},
    {day:5,title:'Farmers market',time:'10:00 AM',tone:'green'}, {day:6,title:'Family dinner',time:'5:30 PM',tone:'green'}
  ],
  feed:[{author:'Sarah',text:'First day of school success! She was so excited 🎒',time:'2 hours ago'},{author:'James',text:'The raised garden beds are finally finished. Tomatoes next!',time:'Yesterday'}]
};

const storageKey='hearth-family-hub-v1';
const load=()=>{try{return {...structuredClone(seed),...JSON.parse(localStorage.getItem(storageKey)||'{}')}}catch{return structuredClone(seed)}};
let state=load();
const save=()=>localStorage.setItem(storageKey,JSON.stringify(state));
const $=(s,root=document)=>root.querySelector(s); const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const escapeHtml=value=>String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;

const modules={
  calendar:{kicker:'TIME TOGETHER',title:'Family calendar',description:'One calm view of everyone’s schedule.',type:'calendar'},
  tasks:{kicker:'ORGANIZE',title:'Tasks & chores',description:'Shared responsibilities, recurring routines, and a record of what got done.',type:'tasks'},
  grocery:{kicker:'ORGANIZE',title:'Grocery list',description:'A live, collaborative list with history and smart grouping.',type:'grocery'},
  meals:{kicker:'NOURISH',title:'Meals & recipes',description:'Plan the week without letting empty meal slots get in the way.',cards:[['♨','Tonight','Roasted chicken & vegetables'],['□','Friday dinner','Homemade pizza'],['♡','Recipe library','24 family recipes'],['＋','Add to grocery','Choose recipe ingredients']]},
  lists:{kicker:'ORGANIZE',title:'Shared lists',description:'Ideas and checklists, shared with exactly the right people.',cards:[['🎁','Christmas gifts','8 items · Private'],['⌁','Beach packing','14 of 22 packed'],['⌂','Home improvements','6 ideas'],['＋','New list','Private, family, or selected people']]},
  goals:{kicker:'GROW TOGETHER',title:'Goals & rewards',description:'Celebrate progress, from family dreams to everyday wins.',cards:[['◇','Summer road trip','68% complete'],['★','Caroline’s rewards','1,740 / 2,500 points'],['✓','Point requests','2 awaiting approval'],['＋','Create a goal','Family or personal']]},
  maintenance:{kicker:'LOOK AFTER HOME',title:'Home & vehicles',description:'Maintenance history and reminders for the things your family relies on.',cards:[['◇','2021 Subaru Outback','Oil change in 5 days'],['⌂','HVAC system','Filter due September 14'],['◉','Smoke detectors','Batteries due in 28 days'],['＋','Add an asset','Home or vehicle']]},
  gallery:{kicker:'FAMILY ARCHIVE',title:'Gallery',description:'Keep the moments that become your family story.',cards:[['▧','Summer 2026','48 photos'],['▧','First day of school','12 photos'],['▧','Garden project','8 photos'],['＋','Create an album','Upload photos and video']]},
  journal:{kicker:'PRIVATE SPACE',title:'My journal',description:'Your entries are private by default and protected by elevated access controls.',cards:[['▱','A fresh school year','September 2 · Hopeful'],['▱','Things I’m grateful for','August 28 · Content'],['⌕','Search journal','Search titles, entries, and tags'],['＋','New entry','Private by default']]},
  feed:{kicker:'STAY CLOSE',title:'Family feed',description:'Small updates and favorite moments, just for your family.',type:'feed'},
  documents:{kicker:'PROTECTED',title:'Document vault',description:'An isolated, audited home for sensitive family files.',secure:'Document contents stay isolated and are never surfaced elsewhere. V1 establishes the permission, audit, and storage boundary for future encrypted uploads.'},
  finance:{kicker:'PROTECTED',title:'Finance',description:'A deliberately limited foundation for future family finances.',secure:'No bank credentials or fabricated accounts are stored. Future connections will use revocable provider tokens inside a dedicated data boundary.'},
  portfolio:{kicker:'SEPARATE ACCESS',title:'Portfolio invitations',description:'Professional work shared without granting any Family Hub access.',cards:[['↗','Design system case study','2 active guest invitations'],['↗','Analytics dashboard','1 invitation · expires Sep 12'],['＋','Invite a guest','Restricted project session'],['⌕','Access history','All guest activity is audited']]}
};

function renderWeek(target='#week-calendar'){
  const days=['MON','TUE','WED','THU','FRI','SAT','SUN'];
  $(target).innerHTML=days.map((day,i)=>`<div class="day ${i===3?'today':''}"><div class="day-head">${day}<strong>${i+1}</strong></div>${state.events.filter(e=>e.day===i).map(e=>`<div class="event ${e.tone||''}"><strong>${escapeHtml(e.title)}</strong><small>${escapeHtml(e.time)}</small></div>`).join('')}</div>`).join('');
}
function renderTasks(target='#home-tasks'){
  $(target).innerHTML=state.tasks.slice(0,target==='#home-tasks'?4:99).map(t=>`<label class="task-row ${t.done?'completed':''}"><input type="checkbox" data-task="${t.id}" ${t.done?'checked':''}><span><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.meta)}</small></span><time>${escapeHtml(t.time)}</time></label>`).join('');
  $('#task-badge').textContent=state.tasks.filter(t=>!t.done).length;
}
function bindChecks(){
  $$('[data-task]').forEach(el=>el.addEventListener('change',()=>{const item=state.tasks.find(t=>t.id===el.dataset.task);item.done=el.checked;save();renderTasks();if($('#view-module').classList.contains('active')&&$('#module-title').textContent==='Tasks & chores')renderModule('tasks');showToast(item.done?'Task completed':'Task restored')}));
}
function renderModule(name){
  const m=modules[name]||modules.tasks;
  $('#module-kicker').textContent=m.kicker;$('#module-title').textContent=m.title;$('#module-description').textContent=m.description;
  $('#module-add').dataset.add=name==='grocery'?'grocery':name==='feed'?'post':'task';
  let html='';
  if(m.type==='calendar')html=`<section class="card hero-calendar"><div class="section-head"><h2>September 2026</h2><div class="calendar-controls"><button class="icon-button">‹</button><button class="today-button">Today</button><button class="icon-button">›</button></div></div><div class="week" id="module-week"></div><div class="calendar-legend"><span><i class="dot amber"></i>James</span><span><i class="dot rose"></i>Sarah</span><span><i class="dot blue"></i>Caroline</span><span><i class="dot green"></i>Family</span></div></section>`;
  else if(m.type==='tasks')html=`<section class="card panel"><div class="section-head"><h2>Today</h2><span class="tag">${state.tasks.filter(t=>!t.done).length} remaining</span></div><div id="module-tasks"></div></section>`;
  else if(m.type==='grocery')html=`<section class="card panel"><table class="data-table"><thead><tr><th>ITEM</th><th>CATEGORY</th><th>QUANTITY</th><th>STATUS</th></tr></thead><tbody>${state.groceries.map((g,i)=>`<tr><td><label><input type="checkbox" data-grocery="${i}" ${g.done?'checked':''}> ${escapeHtml(g.name)}</label></td><td>${escapeHtml(g.category)}</td><td>${escapeHtml(g.quantity)}</td><td><span class="tag">${g.done?'Picked up':'Needed'}</span></td></tr>`).join('')}</tbody></table></section>`;
  else if(m.type==='feed')html=`<div class="module-grid">${state.feed.map((p,i)=>`<article class="card module-card"><div class="feed-author"><span class="avatar ${i?'avatar-james':'avatar-sarah'}">${p.author.slice(0,2).toUpperCase()}</span><strong>${escapeHtml(p.author)}</strong><span>${escapeHtml(p.time)}</span></div><p>${escapeHtml(p.text)}</p><footer><span>♥ ${i?5:8} · ${i?2:3} comments</span><button class="text-button">Reply →</button></footer></article>`).join('')}</div>`;
  else if(m.secure)html=`<section class="card empty-shell"><div class="lock">▣</div><h3>Secure foundation in place</h3><p>${escapeHtml(m.secure)}</p><span class="security-note">◇ Deny by default · Every access audited</span></section>`;
  else html=`<div class="module-grid">${m.cards.map(c=>`<article class="card module-card"><div class="card-icon">${c[0]}</div><h3>${escapeHtml(c[1])}</h3><p>${escapeHtml(c[2])}</p><footer><span>Updated recently</span><button class="text-button">Open →</button></footer></article>`).join('')}</div>`;
  $('#module-content').innerHTML=html;
  if(m.type==='calendar')renderWeek('#module-week');
  if(m.type==='tasks'){renderTasks('#module-tasks');bindChecks()}
  $$('[data-grocery]').forEach(el=>el.addEventListener('change',()=>{state.groceries[+el.dataset.grocery].done=el.checked;save();renderModule('grocery');showToast(el.checked?'Moved to history':'Restored to list')}));
}

function navigate(name){
  $$('.view').forEach(v=>v.classList.remove('active')); $$('.nav-item,.mobile-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  if(name==='home'){$('#view-home').classList.add('active');$('#page-title').textContent='Good morning, James.';$('#page-eyebrow').textContent='THURSDAY, SEPTEMBER 3'}
  else{$('#view-module').classList.add('active');renderModule(name);$('#page-title').textContent=modules[name]?.title||'Family Hub';$('#page-eyebrow').textContent=modules[name]?.kicker||'FAMILY HUB'}
  $('#sidebar').classList.remove('open');$('#scrim').classList.remove('show');window.scrollTo({top:0});
}

const dialog=$('#action-dialog');
function openDialog(type='task'){
  const configs={
    task:['Add a task',`<div class="dialog-field"><label for="item-title">Task title</label><input id="item-title" name="title" required autocomplete="off"></div><div class="dialog-field"><label for="item-time">Due time</label><input id="item-time" name="time" type="time"></div>`],
    grocery:['Add grocery item',`<div class="dialog-field"><label for="item-title">Item</label><input id="item-title" name="title" required autocomplete="off"></div><div class="dialog-field"><label for="item-category">Category</label><select id="item-category" name="category"><option>Produce</option><option>Meat</option><option>Dairy</option><option>Pantry</option><option>Household</option><option>Other</option></select></div>`],
    post:['Share with family',`<div class="dialog-field"><label for="item-title">What’s happening?</label><textarea id="item-title" name="title" rows="4" required></textarea></div>`]
  };
  const [title,body]=configs[type]||configs.task;$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=body;$('#action-form').dataset.type=type;dialog.showModal();setTimeout(()=>$('#item-title')?.focus(),40);
}
$('#action-form').addEventListener('submit',e=>{
  if(e.submitter?.value==='cancel')return;
  e.preventDefault();const fd=new FormData(e.currentTarget),title=String(fd.get('title')||'').trim();if(!title)return;
  const type=e.currentTarget.dataset.type;
  if(type==='task')state.tasks.push({id:uid(),title,meta:'Home · James',time:fd.get('time')||'Anytime',done:false});
  if(type==='grocery')state.groceries.push({name:title,category:fd.get('category'),quantity:'1',done:false});
  if(type==='post')state.feed.unshift({author:'James',text:title,time:'Just now'});
  save();dialog.close();renderTasks();bindChecks();showToast(type==='post'?'Shared with your family':'Added successfully');
  if($('#view-module').classList.contains('active'))renderModule(type==='post'?'feed':type==='grocery'?'grocery':'tasks');
});
let toastTimer;function showToast(message){$('#toast-message').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2400)}

document.addEventListener('click',e=>{const view=e.target.closest('[data-view]')?.dataset.view;if(view)navigate(view);const add=e.target.closest('[data-add]')?.dataset.add;if(add)openDialog(add)});
$('#quick-add').addEventListener('click',()=>openDialog('task'));$('#mobile-add').addEventListener('click',()=>openDialog('task'));
$('#menu-button').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#scrim').classList.add('show')});$('#scrim').addEventListener('click',()=>navigate('home'));
$('#notification-button').addEventListener('click',()=>showToast('You’re all caught up'));$('#search-button').addEventListener('click',()=>showToast('Search is ready for your family archive'));
renderWeek();renderTasks();bindChecks();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
