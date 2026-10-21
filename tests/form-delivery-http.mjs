import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,readFile,readdir,stat,rm,mkdir,rename} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
import {request as httpRequest} from 'node:http';
const testRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const root=resolve(process.env.FORM_TEST_ROOT||testRoot);
const site=process.argv[2]||'conthtml';
const PHP=process.env.PHP_BINARY||'C:/dev/php/php.exe';
const temp=await mkdtemp(join(tmpdir(),`${site}-http-delivery-`));
const queue=join(temp,'queue');const modeFile=join(temp,'mode.json');const capture=join(temp,'requests.jsonl');
const settings=join(temp,'private.php');const port=Number(process.env.FORM_TEST_PORT||8770);
const good={status:201,body:JSON.stringify({contactId:'A'.repeat(26),submissionId:'B'.repeat(26),dealId:'D'.repeat(26)})};
const message='Consulta completa: ñ, åäö, 😀\nSegunda línea sin perder el mensaje.';
let checks=0;const check=(v,m)=>{if(!v)throw Error(m);checks++;};
await writeFile(settings,`<?php return ['VENDERCRM_URL'=>'https://crm.example.com','VENDERCRM_API_KEY'=>'test-key'];\n`);
await writeFile(modeFile,JSON.stringify(good));await writeFile(capture,'');
const env={...process.env,CRM_TEST_SOURCE:root,CRM_TEST_SITE:site,CRM_TEST_MODE_FILE:modeFile,CRM_TEST_CAPTURE:capture,
 VENDERCRM_URL:'https://crm.example.com',VENDERCRM_API_KEY:'test-key',VENDERCRM_CONFIG_FILE:settings,VENDERCRM_OUTBOX_DIR:queue,
 POZO_CONFIG:join(temp,'absent-pozo.php'),VENDERCRM_CONFIG:settings,
 RESEND_API_KEY:'',LEAD_NOTIFY_TO:'',NOTIFY_EMAIL:'',MAIL_FROM:'',LEAD_FROM:'',
 SITE_OUTBOX_DIR:join(temp,'review'),STORAGE_DIR:join(temp,'storage'),LEAD_ENABLED:'1',PRACTITIONER_NAME:'Synthetic test recipient'};
const webRoot=site==='ciberseguridad'?join(root,'public_html'):root;
const server=spawn(PHP,['-n','-d',`extension_dir=${dirname(PHP)}/ext`,'-d','extension=mbstring','-d','display_errors=0','-d','log_errors=1','-d',`session.save_path=${temp}`,'-S',`127.0.0.1:${port}`,'-t',webRoot,join(testRoot,'tests/mock-curl-router.php')],{cwd:root,env,stdio:['ignore','ignore','pipe']});
let logs='';server.stderr.on('data',c=>logs+=c);
let cookie=site==='ciberseguridad'?`csrf=${'a'.repeat(64)}`:'';
const request=(path,options={})=>new Promise((resolveRequest,reject)=>{
 const body=options.body===undefined?'':String(options.body);
 const headers={Connection:'close',...(cookie?{Cookie:cookie}:{}),...(options.headers||{})};
 if(body)headers['Content-Length']=Buffer.byteLength(body);
 const req=httpRequest({host:'127.0.0.1',port,path,method:options.method||'GET',headers},res=>{
  const chunks=[];res.on('data',c=>chunks.push(c));res.on('error',reject);res.on('end',()=>{
   const text=Buffer.concat(chunks).toString('utf8');
   const set=res.headers['set-cookie']?.[0];if(set)cookie=set.split(';')[0];
   resolveRequest({status:res.statusCode,headers:{get:name=>res.headers[name.toLowerCase()]||null},text:async()=>text,json:async()=>JSON.parse(text)});
  });
 });req.on('error',reject);req.end(body);
});
const newId=()=>randomBytes(16).toString('hex');
const form=async(id=newId(),text=message)=>{
 if(site==='sitiosweb.html'){
  let page=await (await request('/contacto/')).text();
  if(!page.includes('name="submission_id"')&&page.includes('Enviar otra consulta'))page=await(await request('/contacto/')).text();
  const csrf=page.match(/name="csrf" value="([^"]+)"/)?.[1];const actual=page.match(/name="submission_id" value="([^"]+)"/)?.[1];
  check(!!csrf&&!!actual,'Public form must render its session and submission tokens');
  return {csrf,submission_id:actual,name:'Synthetic enquiry',business:'Synthetic business',phone:'+595981000000',need:text,website:'',plan:'presencia',source:'/contacto/',consent:'yes',website_confirm:''};
 }
 if(site==='ciberseguridad')return {submission_id:id,form_type:'orientacion',page:'servicios/backup-recuperacion',ts:String(Math.floor(Date.now()/1000)-30),csrf:'a'.repeat(64),nombre:'Synthetic enquiry',telefono:'0981 000 000',email:'synthetic@example.invalid',rubro:'comercio',empleados:'1-9',disparador:'backup',consent:'1',website:''};
 return {idempotency_key:id,form_id:'contacto',name:'Synthetic enquiry',phone:'0981 000 000',email:'synthetic@example.invalid',message:text,service:site==='pozo'?'Pozos artesianos':'',need:'otro',source_page:'/contacto/',page_url:'https://pozo.com.py/contacto/',consent:'1',website:''};
};
const endpoint=site==='sitiosweb.html'?'/api/lead/':site==='ciberseguridad'?'/enviar/':site==='pozo'?'/contacto.php':'/enviar.php';
const post=async(fields,mode=good)=>{await writeFile(modeFile,JSON.stringify(mode));return request(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:new URLSearchParams(fields)});};
const calls=async()=>{const s=await readFile(capture,'utf8');return s.trim()?s.trim().split('\n').map(x=>JSON.parse(x)):[];};
const entries=async()=>{try{return await Promise.all((await readdir(queue)).filter(x=>x.endsWith('.json')).map(async name=>({name,data:JSON.parse(await readFile(join(queue,name),'utf8'))})));}catch{return[];}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 for(let i=0;i<80;i++){if(server.exitCode!==null)throw Error('Local PHP server stopped: '+logs);try{await request('/');break;}catch{await wait(100);}}
 let fields=await form();let r=await post(fields);check(r.status<400,'Valid public POST accepted');
 let list=await entries();check(list.length===1&&list[0].data.state==='delivered','Saved receipt marks one delivered enquiry '+JSON.stringify({entries:list.map(x=>({state:x.data.state,status:x.data.last_status,code:x.data.last_code})),calls:(await calls()).length,logs}));
 const identity=list[0].data.payload.idempotency_key;
 check(list[0].data.receipt?.submissionId==='B'.repeat(26),'Actual saved-submission receipt retained');
 if(site!=='ciberseguridad')check(list[0].data.payload.message.startsWith(message),'Full Unicode/newline message preserved');
 else check(!('message' in list[0].data.payload)&&list[0].data.payload.fields.disparador==='backup','Structured-only intake restriction preserved');
 const initial=(await calls()).length;await post(fields);check((await calls()).length===initial,'Confirmed identical form does not send again');
 if(site!=='ciberseguridad'){
  const changed={...fields,[site==='sitiosweb.html'?'need':'message']:message+' CHANGED'};
  await post(changed);check((await calls()).length===initial,'Changed content under existing identity never overwrites/sends');
  if(site==='sitiosweb.html'){const result=await(await request('/contacto/')).text();check(result.includes('ya fue enviada con otros datos'),'Altered replay explains that a new form is needed');}
 }
 const second=await form(newId(),message+' Otra consulta.');await post(second);list=await entries();check(list.length===2,'Second enquiry from same person is a separate submission');
 let pending=await form();await post(pending,{status:200,body:'<html>Login page</html>'});list=await entries();let held=list.find(x=>x.data.payload.idempotency_key!==identity&&x.data.last_code==='invalid-receipt');
 check(!!held&&held.data.state==='pending','HTTP200HTML is retained and never marked delivered');
 const count=(await calls()).length;await post(pending);check((await calls()).length===count,'Malformed-receipt replay is held for review');
 const failing=await form();await post(failing,{status:503,body:'service unavailable'});list=await entries();let retry=list.find(x=>x.data.last_status===503);check(!!retry&&retry.data.state==='pending','Outage retains complete pending enquiry');
 const original=JSON.stringify(retry.data.payload);retry.data.next_attempt_at=0;await writeFile(join(queue,retry.name),JSON.stringify(retry.data));
 await writeFile(modeFile,JSON.stringify(good));await request('/__fixture/retry');list=await entries();retry=list.find(x=>x.name===retry.name);
 check(retry.data.state==='delivered'&&JSON.stringify(retry.data.payload)===original,'Retry after restart/time uses unchanged payload and identity');
 const auth=await form();await post(auth,{status:401,body:'authentication required'});list=await entries();check(list.some(x=>x.data.last_status===401&&x.data.state==='pending'),'Authentication error remains privately pending');
 if(['pozo','conthtml','agrovet'].includes(site)){
  const longMessage='ñ'.repeat(4980)+'\nMENSAJE-COMPLETO';const longFields=await form(newId(),longMessage);
  if(site==='conthtml')longFields.plan='pyme';
  await post(longFields);list=await entries();const saved=list.find(x=>x.data.payload.idempotency_key===longFields.idempotency_key);
  check(saved?.data.payload.message===longMessage,'Long accepted message retains its final line without a plan prefix truncating it');
  if(site==='conthtml')check(!!saved?.data.payload.fields.plan_solicitado,'Selected plan remains in a separate readable answer');
 }
 if(site==='ciberseguridad'){
  const csv=join(temp,'storage','orientation-leads.csv');await rename(csv,csv+'.fixture-backup');await mkdir(csv);
  const beforeQueue=(await entries()).length;const beforeCalls=(await calls()).length;
  const response=await post(await form());check(response.status===503,'Failed required local storage is not falsely acknowledged');
  check((await calls()).length===beforeCalls&&(await entries()).length===beforeQueue,'Rejected local-write failure is not sent or scheduled later');
 }
 r=await request('/lib/lead-delivery-cli.php');check(r.status===404,'Operator CLI refuses HTTP execution');
 check(!/PHP (?:Warning|Fatal error|Notice)|Uncaught/.test(logs),'No PHP warnings/fatals during real form flow');
 console.log(`PASS: ${checks} public-form delivery checks for ${site}; synthetic cURL only, no external delivery.`);
}finally{
 server.kill();await new Promise(r=>server.exitCode!==null?r():server.once('exit',r));
 if(!resolve(temp).startsWith(resolve(tmpdir())+pathSeparator()))throw Error('Unsafe test cleanup');
 await rm(temp,{recursive:true,force:true});
}
function pathSeparator(){return process.platform==='win32'?'\\':'/';}
