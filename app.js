const products=window.CATALOG;
const standalone=document.body.dataset.page==='standalone';
const pageType=document.body.dataset.page;
const externalTab='target="_blank" rel="noopener"';
const categories=[['all','Все модели'],['barrel','Бани-бочки'],['quadro','Квадробочки'],['viking','Викинг'],['parus','Парус'],['module','Модульные бани'],['capsule','Капсульные бани'],['oval','Квадроовальные бани'],['house','Модульные дома']];
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
const label=id=>categories.find(c=>c[0]===id)?.[1]||'';
let basket=[],filter='all',timer;
try{const saved=JSON.parse(localStorage.getItem('banya-selection')||'[]');if(Array.isArray(saved))basket=[...new Set(saved)].filter(id=>products.some(p=>p.id===id));}catch{}
function notify(text){$('#toast').textContent=text;clearTimeout(timer);timer=setTimeout(()=>$('#toast').textContent='',3000);}
function price(p){return p.price===null?'Цена по запросу':money(p.price);}
function productUrl(id){const url=standalone?new URL(location.href):new URL('product.html',location.href);url.hash=standalone?'product/'+id:'';if(!standalone){url.search='';url.searchParams.set('id',id);}return url.href;}
function productHref(id){return standalone?'#product/'+id:'product.html?id='+encodeURIComponent(id);}
function renderFilters(){ $('#filters').innerHTML=categories.map(([id,name])=>`<button data-filter="${id}" class="${filter===id?'active':''}" aria-pressed="${filter===id}">${name}<sup>${id==='all'?products.length:products.filter(p=>p.category===id).length}</sup></button>`).join('');}
function render(){
 $('#count').textContent=basket.length;
 if(!$('#products'))return;
 const query=$('#search').value.trim().toLocaleLowerCase('ru');
 let list=products.filter(p=>(filter==='all'||p.category===filter)&&(`${p.name} ${label(p.category)}`).toLocaleLowerCase('ru').includes(query));
 const sort=$('#sort').value;
 if(sort!=='default')list.sort((a,b)=>a.price===null?(b.price===null?0:1):b.price===null?-1:sort==='asc'?a.price-b.price:b.price-a.price);
 $('#result-count').textContent=`Найдено: ${list.length}`;
 $('#products').innerHTML=list.length?list.map(p=>`<article class="product"><a href="${productHref(p.id)}" ${externalTab} class="product-picture"><img src="${p.image}" alt="${p.name}" width="280" height="210"></a><div class="category-label">${label(p.category)}</div><h3><a href="${productHref(p.id)}" ${externalTab}>${p.name}</a></h3><div class="price">${price(p)}<small>${p.price===null?'Уточните комплектацию у менеджера':'Комплектацию уточнит менеджер'}</small></div><div class="product-actions"><button class="add" data-add="${p.id}">${basket.includes(p.id)?'В подборке ✓':'В подборку +'}</button><a href="${productHref(p.id)}" ${externalTab} aria-label="Подробнее: ${p.name}">Подробнее ↗</a><button data-share="${p.id}" aria-label="Скопировать ссылку: ${p.name}">Ссылка</button></div></article>`).join(''):'<p class="empty">Модели не найдены. Измените поисковый запрос или категорию.</p>';
 $('#count').textContent=basket.length;
}
function save(){try{localStorage.setItem('banya-selection',JSON.stringify(basket));}catch{}render();}
function renderCart(){
 const list=basket.map(id=>products.find(p=>p.id===id));
 $('#cart-items').innerHTML=list.length?list.map(p=>`<div class="cart-row"><a href="${productHref(p.id)}" ${externalTab}>${p.name}</a><span class="price">${price(p)}</span><button data-remove="${p.id}" aria-label="Удалить: ${p.name}">Удалить из подборки</button></div>`).join(''):'<p>В подборке пока пусто. Добавьте модели из каталога.</p>';
 const sum=list.reduce((s,p)=>s+(p.price||0),0),unknown=list.some(p=>p.price===null);
 $('#total').textContent=list.length?(unknown?'Сумма известных цен: ':'По ценам каталога: ')+money(sum):'';
 if(list.length){const note=document.createElement('small');note.textContent=unknown?'Позиции по запросу не включены. Доставка рассчитывается отдельно.':'Без доставки и дополнительных опций. Стоимость требует подтверждения.';$('#total').append(note);}
 $('#request').disabled=!list.length;$('#request-box').hidden=true;$('#copy-status').textContent='';
}
function openCart(){renderCart();$('#cart-dialog').showModal();}
async function share(id){if(!products.some(p=>p.id===id))return;const url=productUrl(id);if(location.protocol!=='file:'){try{await navigator.clipboard.writeText(url);notify('Ссылка на модель скопирована');return;}catch{}}$('#share-url').value=url;$('#share-hint').textContent=location.protocol==='file:'?'Файл открыт на вашем компьютере. Для отправки клиентам разместите сайт в интернете.':'Выделите ссылку и скопируйте её вручную.';$('#share-dialog').showModal();$('#share-url').focus();$('#share-url').select();}
function renderProduct(id){
 const p=products.find(p=>p.id===id);
 if(!$('#detail'))return;
 if(!p){$('#detail').innerHTML='<h1>Модель не найдена</h1><p>Выберите другую модель в каталоге.</p>';$('#crumb-name').textContent='Модель не найдена';document.title='Модель не найдена — Банная Мануфактура';return;}
 document.title=p.name+' — Банная Мануфактура';
 $('#crumb-name').textContent=p.name;
 $('#detail').innerHTML=`<div class="detail-grid"><div class="detail-photo"><img src="${p.detailImage||p.image}" alt="${p.name}"><p>Визуализация модели. Внешний вид зависит от выбранной комплектации.</p></div><div class="detail-copy"><div class="category-label">${label(p.category)}</div><h1>${p.name}</h1><div class="price">${price(p)}<small>Актуальную стоимость, наличие и сроки подтвердит менеджер.</small></div><div class="actions"><button class="button gold" data-add="${p.id}">Добавить в подборку +</button><button class="button outline" data-share="${p.id}">Скопировать ссылку ↗</button></div><p class="detail-warning">Создайте своё пространство отдыха. Обсудите с производителем комплектацию, отделку и доставку до вашего участка.</p>${p.specs?`<h3 class="equipment-title">Характеристики</h3><dl class="specs">${Object.entries(p.specs).map(([key,value])=>`<dt>${key}</dt><dd>${value}</dd>`).join('')}</dl><h3 class="equipment-title">Комплектация</h3><ul class="equipment">${p.equipment.map(item=>`<li>${item}</li>`).join('')}</ul>`:'<h3 class="equipment-title">О модели</h3><p>Модель представлена в коллекции «'+label(p.category)+'». Уточните размеры, варианты отделки и подробную комплектацию у производителя — подберём решение для вашего участка.</p>'}<a class="text-link" href="https://bannaya-manufactura.ru/" target="_blank" rel="noopener">Обсудить модель с производителем ↗</a></div></div>`;
}
function route(){
 const legacy=location.hash.startsWith('#product/')?location.hash.slice(9):null;
 if(!standalone){
  if(legacy){location.replace(productHref(legacy));return;}
  if(pageType==='product')renderProduct(new URLSearchParams(location.search).get('id'));
  return;
 }
 const view=legacy?'product':location.hash==='#catalog'?'catalog':'home';
 document.querySelectorAll('[data-view]').forEach(el=>el.hidden=el.dataset.view!==view);
 if($('#cart-dialog').open)$('#cart-dialog').close();
 document.title=view==='catalog'?'Каталог — Банная Мануфактура':'Банная Мануфактура — искусство загородной жизни';
 if(view==='product')renderProduct(legacy);
 if(location.hash.startsWith('#home/'))document.getElementById(location.hash.slice(6))?.scrollIntoView();
 else if(!['#philosophy','#contacts','#reviews'].includes(location.hash))window.scrollTo(0,0);
}
document.addEventListener('click',e=>{
 const category=e.target.closest('[data-filter]');if(category){filter=category.dataset.filter;renderFilters();render();}
 const add=e.target.closest('[data-add]');if(add){if(!basket.includes(add.dataset.add)){basket.push(add.dataset.add);save();notify('Модель добавлена в подборку');}else notify('Эта модель уже в подборке');}
 const remove=e.target.closest('[data-remove]');if(remove){basket=basket.filter(id=>id!==remove.dataset.remove);save();renderCart();}
 const shareButton=e.target.closest('[data-share]');if(shareButton)share(shareButton.dataset.share);
 const close=e.target.closest('[data-close]');if(close)document.getElementById(close.dataset.close).close();
});
$('#search')?.addEventListener('input',render);$('#sort')?.addEventListener('change',render);
$('#open-cart').onclick=openCart;

$('#request').onclick=()=>{
 const list=basket.map(id=>products.find(p=>p.id===id));
 $('#request-text').value='Здравствуйте! Интересуют следующие модели:\n\n'+list.map(p=>`${p.name} — ${price(p)}\n${location.protocol==='file:'?'':productUrl(p.id)}`).join('\n\n')+'\n\nПодскажите актуальную стоимость, размеры, комплектацию, сроки изготовления и условия доставки.';
 $('#request-box').hidden=false;$('#request-text').focus();$('#request-text').select();
};
$('#copy-request').onclick=async()=>{try{await navigator.clipboard.writeText($('#request-text').value);$('#copy-status').textContent='Запрос скопирован. Отправьте его менеджеру.';}catch{$('#request-text').focus();$('#request-text').select();$('#copy-status').textContent='Текст выделен. Скопируйте его вручную.';}};
if(standalone){
 document.querySelectorAll('[data-home]').forEach(a=>a.href='#home');
 document.querySelectorAll('[data-catalog]').forEach(a=>a.href='#catalog');
 document.querySelectorAll('[data-home-anchor]').forEach(a=>a.href='#home/'+a.dataset.homeAnchor);
}else{
 document.querySelectorAll('nav a').forEach(a=>{if((pageType==='home'&&a.hasAttribute('data-home'))||(pageType==='catalog'&&a.hasAttribute('data-catalog')))a.setAttribute('aria-current','page');});
}
window.addEventListener('hashchange',route);
window.addEventListener('storage',e=>{if(e.key==='banya-selection'){try{const saved=JSON.parse(e.newValue||'[]');basket=Array.isArray(saved)?[...new Set(saved)].filter(id=>products.some(p=>p.id===id)):[];render();if($('#cart-dialog').open)renderCart();}catch{}}});
if($('#filters'))renderFilters();render();route();
