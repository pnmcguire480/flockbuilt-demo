import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);

const menu = document.querySelector<HTMLDialogElement>('#site-menu');
const opener = document.querySelector<HTMLButtonElement>('.menu-button');
const close = document.querySelector<HTMLButtonElement>('.menu-close');
opener?.addEventListener('click', () => {
  menu?.showModal(); opener.setAttribute('aria-expanded','true');
  menu?.querySelector<HTMLAnchorElement>('nav a')?.focus();
});
close?.addEventListener('click', () => menu?.close());
menu?.addEventListener('close', () => { opener?.setAttribute('aria-expanded','false'); opener?.focus(); });
menu?.addEventListener('click', (event) => {
  if(event.target===menu) { const r=menu.getBoundingClientRect(); if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) menu.close(); }
});
for(const comparison of document.querySelectorAll<HTMLElement>('[data-comparison]')) {
  const range=comparison.querySelector<HTMLInputElement>('input[type=range]')!;
  const images=comparison.querySelector<HTMLElement>('.comparison-images')!;
  range.addEventListener('input',()=> { images.style.setProperty('--split',`${range.value}%`); range.setAttribute('aria-valuetext',`${range.value}% before photo visible`); });
}
const fields = 'input:not([type=range]):not([type=radio]):not([type=checkbox]), textarea, select';
document.addEventListener('focusin',event=> { if((event.target as HTMLElement).matches(fields)) document.body.classList.add('field-focused'); });
document.addEventListener('focusout',()=>setTimeout(()=> { if(!document.activeElement?.matches(fields)) document.body.classList.remove('field-focused'); },0));

const media=gsap.matchMedia();
media.add('(prefers-reduced-motion: no-preference)', () => {
  const lenis=new Lenis({duration:.7,smoothWheel:true,anchors:true});
  const tick=(time:number)=>lenis.raf(time*1000);
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(tick);
  const hero=document.querySelector('.hero');
  if(hero) {
    const travel=matchMedia('(max-width:767px)').matches?8:12;
    gsap.to('.hero-strip',{xPercent:(i:number)=>i%2?travel:-travel,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero-strip img',{scale:1.1,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
    try {if(!sessionStorage.getItem('flockbuilt-lights')){gsap.fromTo('.hero .hex-wall .hex-cell',{opacity:.25},{opacity:1,duration:.6,stagger:.025,ease:'power1.out'});sessionStorage.setItem('flockbuilt-lights','on');}}catch{ /* The static wall remains visible if browser storage is unavailable. */ }
  }
  // Content starts visible. Only small photo movement follows scrolling.
  return ()=>{ gsap.ticker.remove(tick);lenis.destroy(); };
});
window.addEventListener('pagehide',()=>media.revert(),{once:true});
