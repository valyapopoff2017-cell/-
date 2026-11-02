const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const catalog=JSON.parse(fs.readFileSync(__dirname+'/catalog.json','utf8'));
test('all supplied categories and all 39 models are represented',()=>{
 assert.equal(catalog.length,39);assert.equal(new Set(catalog.map(p=>p.id)).size,39);
 const counts=Object.fromEntries(['barrel','quadro','viking','parus','module','capsule','oval','house'].map(c=>[c,catalog.filter(p=>p.category===c).length]));
 assert.deepEqual(counts,{barrel:16,quadro:9,viking:3,parus:1,module:2,capsule:1,oval:2,house:5});
 for(const p of catalog){assert(fs.existsSync(__dirname+'/'+p.image));assert(p.name);assert(p.price===null||p.price>0);}
});
test('prices and VIP-specific specification stay distinct',()=>{
 assert.equal(catalog.filter(p=>p.price===null).length,2);
 const vip=catalog.find(p=>p.id==='quadro-08');assert.equal(vip.price,483000);assert.equal(vip.specs['Общая длина'],'600 см');assert.equal(vip.equipment.length,22);
 assert.equal(catalog.filter(p=>p.specs).length,1);
 assert.equal(catalog.find(p=>p.name==='Модуль 56').price,2352000);
});
test('homepage has no catalog and product links have their own page',()=>{
 const home=fs.readFileSync(__dirname+'/index.html','utf8');
 assert(!home.includes('id="products"'));assert(!home.includes('id="filters"'));
 assert(home.includes('href="catalog.html"'));assert(home.includes('assets/logo.svg'));assert(home.includes('assets/hero.png'));
 assert(fs.readFileSync(__dirname+'/product.html','utf8').includes('data-page="product"'));
 assert(fs.readFileSync(__dirname+'/catalog.html','utf8').includes('id="products"'));
});
