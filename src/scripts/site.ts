import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true});
gsap.ticker.lagSmoothing(0);
let smooth:Lenis|undefined;
const menu=document.querySelector<HTMLDialogElement>('#site-menu');
const opener=document.querySelector<HTMLButtonElement>('.menu-button');
opener?.addEventListener('click',()=>{
 menu?.showModal();opener.setAttribute('aria-expanded','true');document.body.classList.add('menu-open');smooth?.stop();
 menu?.querySelector<HTMLAnchorElement>('nav a')?.focus();
});
menu?.querySelector('.menu-close')?.addEventListener('click',()=>menu.close());
menu?.addEventListener('close',()=>{opener?.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');smooth?.start();opener?.focus();});
menu?.addEventListener('click',event=>{if(event.target===menu){const r=menu.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)menu.close();}});
for(const comparison of document.querySelectorAll<HTMLElement>('[data-comparison]')){
 const range=comparison.querySelector<HTMLInputElement>('input[type=range]')!;
 const images=comparison.querySelector<HTMLElement>('.comparison-images')!;
 const update=()=>{images.style.setProperty('--split',`${range.value}%`);range.setAttribute('aria-valuetext',`${range.value}% before photo visible`);};
 range.addEventListener('input',update);
 images.addEventListener('click',event=>{const r=images.getBoundingClientRect();range.value=String(Math.round(Math.max(0,Math.min(100,(event.clientX-r.left)/r.width*100))));update();});
}
for(const preview of document.querySelectorAll<HTMLElement>('.footer-preview')){
 const show=()=>preview.classList.add('preview-active');const hide=()=>preview.classList.remove('preview-active');
 preview.addEventListener('pointerenter',show);preview.addEventListener('pointerleave',hide);preview.addEventListener('focusin',show);preview.addEventListener('focusout',hide);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
}
const fields='input:not([type=range]):not([type=radio]):not([type=checkbox]), textarea, select';
document.addEventListener('focusin',event=>{if((event.target as HTMLElement).matches(fields))document.body.classList.add('field-focused');});
document.addEventListener('focusout',()=>setTimeout(()=>{if(!document.activeElement?.matches(fields))document.body.classList.remove('field-focused');},0));
const media=gsap.matchMedia();
media.add({motion:'(prefers-reduced-motion: no-preference)',desktop:'(min-width:768px)',mobile:'(max-width:767px)'},context=>{
 if(!context.conditions?.motion)return;
 const desktop=Boolean(context.conditions.desktop);
 smooth=new Lenis({duration:.7,smoothWheel:true,syncTouch:false,anchors:true});
 const lenis=smooth;const tick=(time:number)=>lenis.raf(time*1000);
 lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(tick);
 const hero=document.querySelector<HTMLElement>('.hero');
 const statement=document.querySelector<HTMLElement>('.statement');
 const actions=hero?.querySelector<HTMLElement>('.actions');
 if(hero){
  const travel=desktop?12:8;
  const timeline=gsap.timeline({scrollTrigger:{id:'hero-parts',trigger:hero,start:'top top',end:()=>`+=${innerHeight*(desktop?1:.6)}`,scrub:true,invalidateOnRefresh:true}});
  timeline.to('.hero-strip',{xPercent:(i:number)=>i%2?travel:-travel,yPercent:(i:number)=>i<2?-8:8,ease:'none'},0)
   .fromTo('.hero-strip img',{scale:1.07},{scale:1.12,xPercent:(i:number)=>i%2?-travel/2:travel/2,ease:'none'},0)
   .to('.hero-stage>.hex-wall',{scale:1.08,yPercent:8,ease:'none'},0)
   .to('.hero-foreground',{xPercent:12,yPercent:8,ease:'none'},0)
   .to('.hero-display',{yPercent:-18,scale:.97,opacity:0,ease:'none'},.5);
  try{if(!sessionStorage.getItem('flockbuilt-lights')){gsap.fromTo('.hero .hex-unit',{opacity:.05},{opacity:1,duration:.6,stagger:.016,ease:'power1.out'});sessionStorage.setItem('flockbuilt-lights','on');}}catch{/* Static end state remains available. */}
 }
 if(statement){
  const words=statement.querySelectorAll<HTMLElement>('.statement-words>span');
  gsap.to(words,{color:(i:number)=>[0,6,7].includes(i)?'#f25560':'#f0f0f0',stagger:.15,ease:'none',scrollTrigger:{id:'statement-words',trigger:statement,start:'top top',end:'bottom bottom',scrub:true}});
  const protectActions=()=>{if(!actions)return;const a=actions.getBoundingClientRect(),s=statement.getBoundingClientRect();actions.inert=s.top<a.bottom&&s.bottom>a.top;};
  ScrollTrigger.create({trigger:statement,start:'top bottom',end:'bottom top',onUpdate:protectActions,onEnter:protectActions,onLeave:protectActions,onLeaveBack:protectActions});
 }
 for(const mark of document.querySelectorAll('.check-mark'))gsap.fromTo(mark,{strokeDashoffset:30},{strokeDashoffset:0,duration:.7,ease:'power1.out',scrollTrigger:{trigger:mark,start:'top 85%',once:true}});
 const logo=document.querySelector('[data-logo-reveal]');
 if(logo){const layers=logo.querySelectorAll('.logo-pixel-layer');gsap.fromTo(layers,{xPercent:(i:number)=>i%2?16:-16,yPercent:(i:number)=>(i-1.5)*8,opacity:.45},{xPercent:0,yPercent:0,opacity:1,ease:'none',scrollTrigger:{id:'logo-assemble',trigger:logo.closest('.badge-section'),start:'top 80%',end:'center center',scrub:true}});}
 gsap.to('.tire-rail span',{scaleY:1,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:true}});
 let frame=0;
 const cells=[...document.querySelectorAll<SVGPathElement>('.hero-stage .hex-cell')];
 const light=(event:PointerEvent)=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const wall=cells[0]?.ownerSVGElement;const matrix=wall?.getScreenCTM();if(!matrix)return;const nearest=cells.map(cell=>{const point=new DOMPoint(Number(cell.dataset.x),Number(cell.dataset.y)).matrixTransform(matrix);return{cell,distance:Math.hypot(point.x-event.clientX,point.y-event.clientY)};}).sort((a,b)=>a.distance-b.distance).slice(0,3).map(item=>item.cell);cells.forEach(cell=>cell.classList.toggle('cell-lit',nearest.includes(cell)));});};
 const bays=[...document.querySelectorAll<HTMLElement>('.bay-card')];
 const bayLight=(event:Event)=>{const bay=event.currentTarget as HTMLElement;bay.classList.toggle('bay-lit',event.type==='pointerenter'||event.type==='focusin');};
 if(desktop){window.addEventListener('pointermove',light);bays.forEach(bay=>['pointerenter','pointerleave','focusin','focusout'].forEach(type=>bay.addEventListener(type,bayLight)));}
 const refresh=()=>ScrollTrigger.refresh();document.fonts.ready.then(refresh);
 return()=>{window.removeEventListener('pointermove',light);cancelAnimationFrame(frame);cells.forEach(cell=>cell.classList.remove('cell-lit'));bays.forEach(bay=>['pointerenter','pointerleave','focusin','focusout'].forEach(type=>bay.removeEventListener(type,bayLight)));if(actions)actions.inert=false;gsap.ticker.remove(tick);lenis.destroy();smooth=undefined;};
});
window.addEventListener('pagehide',()=>media.revert(),{once:true});
