"use strict";

const emptyForm={task:"",audience:"",context:"",material:"",sourceMode:"",format:"",length:"",tone:"",criteria:"",askQuestions:true,verifyFacts:true,avoidInventing:true};
const templates=[
 {label:"בניית שיעור",icon:"◫",form:{task:"בנה מערך שיעור בנושא",audience:"תלמידי כיתה ט׳",context:"שיעור של 45 דקות בכיתה הטרוגנית",format:"טבלה עם שלבי השיעור, זמן, פעילות מורה ופעילות תלמידים",criteria:"כלול פתיחה מסקרנת, תרגול פעיל ובדיקת הבנה קצרה"}},
 {label:"הסבר מושג",icon:"◎",form:{task:"הסבר את המושג",audience:"תלמידים ללא ידע מוקדם",format:"הסבר קצר, דוגמה מחיי היום־יום ושאלת בדיקה",tone:"פשוט, בהיר ולא מתיילד"}},
 {label:"יצירת פעילות",icon:"✦",form:{task:"צור פעילות לימודית בנושא",audience:"תלמידי חטיבת ביניים",context:"עבודה בזוגות במשך 20 דקות",format:"הנחיות לתלמידים, שלבים ותוצר סופי",criteria:"הפעילות צריכה לדרוש חשיבה ולא רק איתור מידע"}},
 {label:"מחקר והשוואה",icon:"⌕",form:{task:"השווה בין",format:"טבלת השוואה ולאחריה מסקנה מנומקת",criteria:"הפרד בין עובדות, פרשנות ומסקנות; ציין אי־ודאות",sourceMode:"search",verifyFacts:true}},
 {label:"כתיבה ועריכה",icon:"✎",form:{task:"ערוך ושפר את הטקסט הבא",format:"גרסה ערוכה ולאחריה רשימה קצרה של השינויים המרכזיים",tone:"טבעי, מדויק ובהיר",criteria:"שמור על המשמעות ועל הקול של הכותב",sourceMode:"only"}}
];
const steps=[{label:"המשימה",title:"מה בדיוק תרצו לקבל?"},{label:"הקשר",title:"למי, למה ובאילו תנאים?"},{label:"התוצר",title:"איך התשובה צריכה להיראות?"},{label:"דיוק",title:"מה יהפוך את התשובה לטובה?"}];
const fieldIds=["task","audience","context","material","sourceMode","format","length","tone","criteria","askQuestions","verifyFacts","avoidInventing"];
let form={...emptyForm},activeStep=0;
const byId=id=>document.getElementById(id);

function load(){try{const saved=localStorage.getItem("prompt-builder-he");if(saved)form={...emptyForm,...JSON.parse(saved)}}catch{} syncFields()}
function save(){try{localStorage.setItem("prompt-builder-he",JSON.stringify(form))}catch{}}
function syncFields(){fieldIds.forEach(id=>{const el=byId(id);if(!el)return;if(el.type==="checkbox")el.checked=Boolean(form[id]);else el.value=form[id]||""});renderPrompt()}
function bindFields(){fieldIds.forEach(id=>{const el=byId(id);if(!el)return;el.addEventListener("input",e=>{form[id]=e.target.type==="checkbox"?e.target.checked:e.target.value;save();renderPrompt()});el.addEventListener("change",e=>{form[id]=e.target.type==="checkbox"?e.target.checked:e.target.value;save();renderPrompt()})})}

function sourceInstruction(){
 if(form.sourceMode==="only")return "הסתמך רק על החומר והמקורות שסיפקתי. אם המידע הדרוש אינו מופיע בהם, ציין זאת ואל תשלים מידע מבחוץ.";
 if(form.sourceMode==="external")return "אפשר להיעזר גם בידע חיצוני מעבר לחומר שסיפקתי, תוך הבחנה ברורה בין המידע שסיפקתי לבין מידע נוסף.";
 if(form.sourceMode==="search")return "כאשר יש לך גישה לחיפוש או למקורות חיצוניים, חפש מידע רלוונטי ואמת טענות מרכזיות באמצעות מקורות אמינים ועדכניים. אם אין לך גישה כזו, ציין זאת.";
 return "";
}

function buildPrompt(){
 const s=[];
 if(form.task.trim())s.push(`המשימה:\n${form.task.trim()}`);
 const context=[form.audience.trim()&&`קהל היעד: ${form.audience.trim()}`,form.context.trim()&&`הקשר ומגבלות: ${form.context.trim()}`].filter(Boolean);if(context.length)s.push(`הקשר:\n${context.join("\n")}`);
 if(form.material.trim())s.push(`מידע או חומר שעליו יש להתבסס:\n${form.material.trim()}`);
 const sourceRule=sourceInstruction();if(sourceRule)s.push(`שימוש במקורות:\n${sourceRule}`);
 const output=[form.format.trim()&&`פורמט: ${form.format.trim()}`,form.length.trim()&&`אורך: ${form.length.trim()}`,form.tone.trim()&&`סגנון: ${form.tone.trim()}`].filter(Boolean);if(output.length)s.push(`דרישות לתוצר:\n${output.join("\n")}`);
 if(form.criteria.trim())s.push(`קריטריונים להצלחה:\n${form.criteria.trim()}`);
 const rules=[form.askQuestions&&"אם חסר מידע חיוני לביצוע המשימה, שאל עד 3 שאלות הבהרה לפני כתיבת התשובה.",form.verifyFacts&&"כאשר ניתן, אמת עובדות מרכזיות באמצעות המקורות או הכלים הזמינים לך. אם אין אפשרות לאמת, ציין זאת והבחן בין עובדה, הערכה ואי־ודאות.",form.avoidInventing&&"אל תמציא מידע. אם אינך יודע או שאין די מידע, אמור זאת במפורש."].filter(Boolean);if(rules.length)s.push(`כללי עבודה:\n${rules.map(x=>`• ${x}`).join("\n")}`);
 return s.join("\n\n");
}

function getScore(){
 if(!form.task.trim())return 0;
 let score=35;
 if(form.task.trim().length>=25)score+=10;
 if(form.audience.trim())score+=10;
 if(form.context.trim())score+=10;
 if(form.material.trim()||form.sourceMode)score+=8;
 if(form.format.trim())score+=10;
 if(form.length.trim()||form.tone.trim())score+=5;
 if(form.criteria.trim())score+=7;
 if(form.askQuestions||form.verifyFacts||form.avoidInventing)score+=5;
 return Math.min(100,score);
}

function getFeedback(score){
 if(!form.task.trim())return ["התחילו מהמשימה","כתבו מה בדיוק תרצו שהבינה תעשה"];
 const missing=[];
 if(form.task.trim().length<25)missing.push("דייקו מעט יותר את המשימה");
 if(!form.audience.trim()&&!form.context.trim())missing.push("הוסיפו קהל יעד או הקשר");
 if(!form.format.trim())missing.push("הגדירו איך התוצר צריך להיראות");
 if(!form.criteria.trim())missing.push("הוסיפו קריטריון להצלחה");
 if(!form.sourceMode&&form.material.trim())missing.push("הגדירו כיצד להשתמש במקורות");
 if(score>=90)return ["פרומפט חזק מאוד","המשימה, ההקשר והדרישות מוגדרים היטב"];
 if(score>=75)return ["פרומפט חזק",missing[0]||"ברור, ממוקד וניתן לביצוע"];
 if(score>=50)return ["כיוון טוב",missing[0]||"אפשר להוסיף עוד מעט דיוק"];
 return ["כדאי להוסיף פרטים",missing[0]||"הוסיפו הקשר ודרישות לתוצר"];
}

function renderPrompt(){
 const prompt=buildPrompt(),paper=byId("promptPaper");
 if(prompt){const pre=document.createElement("pre");pre.textContent=prompt;paper.replaceChildren(pre)}else{paper.innerHTML='<div class="empty-result"><span>✦</span><p>הפרומפט יופיע כאן</p><small>התחילו בתיאור המשימה או בחרו תבנית</small></div>'}
 const hasTask=Boolean(form.task.trim());byId("copyButton").disabled=!hasTask;
 const score=getScore(),feedback=getFeedback(score);
 byId("score").textContent=score;byId("scoreRing").style.setProperty("--score",`${score*3.6}deg`);
 byId("scoreTitle").textContent=feedback[0];byId("scoreText").textContent=feedback[1];
}

function renderStep(){
 document.querySelectorAll(".step-view").forEach((el,i)=>el.classList.toggle("active",i===activeStep));
 document.querySelectorAll(".stepper button").forEach((el,i)=>el.classList.toggle("active",i===activeStep));
 byId("stepNumber").textContent=activeStep+1;byId("stepLabel").textContent=steps[activeStep].label;byId("stepTitle").textContent=steps[activeStep].title;
 byId("prevButton").disabled=activeStep===0;byId("nextButton").innerHTML=activeStep===3?'העתקת הפרומפט':'לשלב הבא <span>←</span>';
 if(activeStep===3)byId("nextButton").disabled=!form.task.trim();else byId("nextButton").disabled=false;
}

function applyTemplate(template){
 Object.entries(template.form).forEach(([key,value])=>{if(!form[key]||String(form[key]).trim()==="")form[key]=value});
 activeStep=0;syncFields();save();renderStep();byId("task").focus();
}
function appendField(field,value){if(!form[field])form[field]=value;else if(!form[field].includes(value))form[field]=`${form[field]}, ${value}`;syncFields();save()}
async function copyPrompt(){const text=buildPrompt();if(!form.task.trim()||!text)return;try{await navigator.clipboard.writeText(text)}catch{const area=document.createElement("textarea");area.value=text;document.body.appendChild(area);area.select();document.execCommand("copy");area.remove()}const button=byId("copyButton"),old=button.innerHTML;button.innerHTML="<span>✓</span>הועתק!";setTimeout(()=>button.innerHTML=old,1800)}

function init(){
 templates.forEach(template=>{const button=document.createElement("button");button.innerHTML=`<span>${template.icon}</span>${template.label}`;button.addEventListener("click",()=>applyTemplate(template));byId("templateList").appendChild(button)});
 steps.forEach((step,i)=>{const button=document.createElement("button");button.innerHTML=`<span>${i+1}</span><b>${step.label}</b>`;button.addEventListener("click",()=>{activeStep=i;renderStep()});byId("stepper").appendChild(button)});
 [{label:"טבלה השוואתית",field:"format"},{label:"שלבים ממוספרים",field:"format"},{label:"דוגמה מלאה",field:"criteria"},{label:"עברית פשוטה",field:"tone"}].forEach(item=>{const button=document.createElement("button");button.textContent=item.label;button.addEventListener("click",()=>appendField(item.field,item.label));byId("suggestionChips").appendChild(button)});
 bindFields();load();renderStep();
 byId("prevButton").addEventListener("click",()=>{if(activeStep>0){activeStep--;renderStep()}});
 byId("nextButton").addEventListener("click",()=>{if(activeStep<3){activeStep++;renderStep()}else copyPrompt()});
 byId("copyButton").addEventListener("click",copyPrompt);
 byId("clearButton").addEventListener("click",()=>{form={...emptyForm};activeStep=0;syncFields();save();renderStep()});
 const modal=byId("tipsModal"),close=()=>{modal.hidden=true;byId("openTips").focus()};
 byId("openTips").addEventListener("click",()=>{modal.hidden=false;byId("closeTips").focus()});byId("closeTips").addEventListener("click",close);byId("acceptTips").addEventListener("click",close);modal.addEventListener("click",e=>{if(e.target===modal)close()});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.hidden)close()});
}
document.addEventListener("DOMContentLoaded",init);
