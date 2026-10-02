import { transportServices, quoteChoices } from '../content/services';
const form=document.querySelector<HTMLFormElement>('#quote-form');
if(form) {
  const byId=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
  const service=byId<HTMLSelectElement>('service');
  const submit=byId<HTMLButtonElement>('quote-submit');
  const status=byId<HTMLElement>('form-status');
  const summary=byId<HTMLElement>('error-summary');
  const photos=byId<HTMLInputElement>('photos');
  const previews=byId<HTMLElement>('photo-previews');
  const receipt=byId<HTMLElement>('quote-receipt');
  let previewUrls:string[]=[];
  let receiptText='';
  let submitting=false;
  const transport=()=> {
    const enabled=transportServices.includes(service.value);
    byId<HTMLElement>('transport-fields').hidden=!enabled;
    for(const id of ['pickup','dropoff']) byId<HTMLInputElement>(id).required=enabled;
    byId<HTMLElement>('transport-announcement').textContent=enabled?'Pickup and drop-off locations are now required.':'Pickup and drop-off locations are not needed for this service.';
  };
  const preset=new URLSearchParams(location.search).get('service');
  if(preset && quoteChoices.some(([value])=>value===preset)) service.value=preset;
  transport(); service.addEventListener('change',transport);
  form.addEventListener('change',()=> {
    byId<HTMLElement>('text-consent').hidden=new FormData(form).get('contactMethod')!=='text';
  });
  const showErrors=(errors:Record<string,string>)=> {
    for(const id of ['name','phone','service','vehicle','pickup','dropoff','photos']) {
      byId<HTMLElement>(`${id}-error`).textContent=errors[id]||'';
      const field=byId<HTMLInputElement>(id); if(errors[id]) field.setAttribute('aria-invalid','true');else field.removeAttribute('aria-invalid');
    }
    const list=summary.querySelector('ul')!;list.replaceChildren();
    for(const [id,message] of Object.entries(errors)) {
      const li=document.createElement('li');
      if(document.getElementById(id)) {const a=document.createElement('a');a.href=`#${id}`;a.textContent=message;a.addEventListener('click',e=>{e.preventDefault();document.getElementById(id)?.focus();});li.append(a);}else li.textContent=message;
      list.append(li);
    }
    summary.hidden=Object.keys(errors).length===0;
    if(!summary.hidden) summary.focus();
  };
  const checkFiles=()=> {
    const files=Array.from(photos.files||[]);
    if(files.length>3) return 'Choose up to 3 photos.';
    for(const file of files) {
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)) return `${file.name}: use JPEG, PNG or WebP.`;
      if(file.size>10*1024*1024) return `${file.name}: choose a photo smaller than 10 MB.`;
    }
    return '';
  };
  photos.addEventListener('change',()=> {
    previewUrls.forEach(URL.revokeObjectURL);previewUrls=[];previews.replaceChildren();
    const error=checkFiles();byId<HTMLElement>('photos-error').textContent=error;
    if(error){photos.setAttribute('aria-invalid','true');return;}photos.removeAttribute('aria-invalid');
    Array.from(photos.files||[]).forEach((file,i)=> {
      const url=URL.createObjectURL(file);previewUrls.push(url);
      const figure=document.createElement('figure');const img=document.createElement('img');img.src=url;img.alt=`Selected photo ${i+1}`;
      const caption=document.createElement('figcaption');caption.textContent=file.name;figure.append(img,caption);previews.append(figure);
    });
  });
  const processPhoto=async(file:File,index:number)=> {
    let bitmap:ImageBitmap;
    try { bitmap=await createImageBitmap(file); }catch {throw new Error(`${file.name}: this photo could not be opened. Choose a JPEG, PNG or WebP photo.`);}
    const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const context=canvas.getContext('2d');if(!context){bitmap.close();throw new Error('Photo processing is unavailable. Remove the photos or use another browser.');}
    context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    const data=canvas.toDataURL('image/jpeg',.8).split(',')[1];
    if(!data||data.length>2800000) throw new Error(`${file.name}: the processed photo is too large. Choose a smaller image.`);
    return {name:`photo-${index+1}.jpg`,type:'image/jpeg',data,width:canvas.width,height:canvas.height};
  };
  form.addEventListener('submit',async event=> {
    event.preventDefault();if(submitting)return;
    const values=Object.fromEntries(new FormData(form).entries()) as Record<string,any>;
    delete values.photos;
    const errors:Record<string,string>={};
    if(!String(values.name||'').trim())errors.name='Enter your name.';
    const digits=String(values.phone||'').replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'');
    if(digits.length!==10)errors.phone='Enter a 10-digit US phone number.';
    if(!quoteChoices.some(([value])=>value===values.service))errors.service='Choose a service.';
    if(!String(values.vehicle||'').trim())errors.vehicle='Enter your vehicle or load details.';
    if(transportServices.includes(values.service)){if(!String(values.pickup||'').trim())errors.pickup='Enter the pickup location.';if(!String(values.dropoff||'').trim())errors.dropoff='Enter the drop-off location.';}else{delete values.pickup;delete values.dropoff;}
    const fileError=checkFiles();if(fileError)errors.photos=fileError;
    showErrors(errors);if(Object.keys(errors).length)return;
    submitting=true;submit.disabled=true;status.textContent='Processing photos and preparing your demo request…';
    try {
      const processed=[];
      for(const [index,file] of Array.from(photos.files||[]).entries())processed.push(await processPhoto(file,index));
      // GitHub Pages is static. This response is generated in the browser;
      // no text or photos leave the tab and no API endpoint is called.
      const failure=byId<HTMLInputElement>('simulate-failure').checked;
      const response=new Response(JSON.stringify(failure
        ? {demo:true,sent:false,error:'Simulated delivery failure. Turn off the failure test and retry.'}
        : {demo:true,sent:false,reference:`DEMO-${crypto.randomUUID().slice(0,8).toUpperCase()}`}),{status:failure?503:200,headers:{'Content-Type':'application/json'}});
      const result=await response.json();
      if(!response.ok){if(result.errors){showErrors(result.errors);status.textContent='';return;}throw new Error(result.error||'Demo request failed.');}
      const serviceLabel=quoteChoices.find(([value])=>value===values.service)?.[1]||values.service;
      const method=values.contactMethod==='text'?'text':'call';
      byId<HTMLElement>('receipt-reference').textContent=result.reference;
      byId<HTMLElement>('receipt-method').textContent=`In the live flow, the shop would ${method} ${values.phone} to discuss the request. This sample was not sent.`;
      const fields:Record<string,string>={'Name':values.name,'Phone':values.phone,'Service':serviceLabel,'Vehicle / load':values.vehicle};
      if(transportServices.includes(values.service)){fields['Pickup']=values.pickup;fields['Drop-off']=values.dropoff;}
      if(values.preferred)fields['Preferred timing']=values.preferred;if(values.message)fields['Message']=values.message;
      fields['Photos']=`${processed.length} processed JPEG${processed.length===1?'':'s'} / originals not uploaded`;fields['Contact preference']=method;
      const dl=byId<HTMLElement>('receipt-details');dl.replaceChildren();
      for(const [label,value] of Object.entries(fields)){const div=document.createElement('div');const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=value;div.append(dt,dd);dl.append(div);}
      receiptText=`FLOCK BUILT PERFORMANCE — DEMO RECEIPT\n${result.reference}\nNothing was sent, booked or paid.\n\n${Object.entries(fields).map(([k,v])=>`${k}: ${v}`).join('\n')}\n`;
      form.hidden=true;receipt.hidden=false;status.textContent='';byId<HTMLElement>('receipt-heading').focus();
    }catch(error) {
      const message=error instanceof Error?error.message:'Demo request failed.';
      const isPhoto=message.includes('photo')||message.includes('image');
      showErrors(isPhoto?{photos:message}:{form:`${message} Nothing was sent. Your details are kept. Turn off the failure test and retry, or call/text 813-240-3815 for a real request.`});
      status.textContent='';
    }finally{submitting=false;submit.disabled=false;}
  });
  byId<HTMLButtonElement>('edit-request').addEventListener('click',()=>{receipt.hidden=true;form.hidden=false;byId<HTMLInputElement>('name').focus();});
  byId<HTMLButtonElement>('download-receipt').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([receiptText],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='flockbuilt-demo-receipt.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  window.addEventListener('pagehide',()=>previewUrls.forEach(URL.revokeObjectURL),{once:true});
}
