const hex = (h) => { const s = h.replace('#',''); return [0,2,4].map(i=>parseInt(s.slice(i,i+2),16)); };
const lum = (h) => { const [r,g,b] = hex(h).map(v=>{const c=v/255; return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);}); return 0.2126*r+0.7152*g+0.0722*b; };
const ratio = (a,b) => { const [l1,l2]=[lum(a),lum(b)].sort((x,y)=>y-x); return (l1+0.05)/(l2+0.05); };

console.log('=== CANDIDATE: primary button fill (needs >=4.5 with white) ===');
for (const c of ['#3E7FB1','#3A78A8','#36719F','#327096','#2F6691','#2B5C83']) {
  console.log(`  ${c}  white-on-fill ${ratio('#FFFFFF',c).toFixed(2)}   fill-on-white ${ratio(c,'#FFFFFF').toFixed(2)}`);
}

console.log('\n=== CANDIDATE: accent fill for non-text UI (needs >=3.0 on white) ===');
for (const c of ['#5FAF6B','#57A463','#4A8F55','#44844E','#3D7A47']) {
  console.log(`  ${c}  fill-on-white ${ratio(c,'#FFFFFF').toFixed(2)}   white-on-fill ${ratio('#FFFFFF',c).toFixed(2)}`);
}

console.log('\n=== CANDIDATE: form input border (needs >=3.0 on white AND on base surface) ===');
for (const c of ['#C9D6E2','#AFC1D1','#9FB3C6','#8C a'.replace(' a',''),'#8CA3B8','#7D93A8','#6B8299']) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(c)) continue;
  console.log(`  ${c}  on-white ${ratio(c,'#FFFFFF').toFixed(2)}   on-base ${ratio(c,'#F4F7FA').toFixed(2)}   on-muted ${ratio(c,'#EEF3F7').toFixed(2)}`);
}

console.log('\n=== CANDIDATE: eyebrow / small brand text on soft backgrounds (needs >=4.5) ===');
for (const [c,bg] of [['#2F6691','#E8F0F7'],['#3E7FB1','#E8F0F7'],['#3D7A47','#EAF4EC'],['#4A8F55','#EAF4EC']]) {
  console.log(`  ${c} on ${bg}  ${ratio(c,bg).toFixed(2)}`);
}
