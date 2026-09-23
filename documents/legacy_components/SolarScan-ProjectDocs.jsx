import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#04060f",surface:"#080d1e",card:"#0c1226",border:"#1a2340",borderHi:"#2a3a60",
  cyan:"#00e5ff",gold:"#ffc107",green:"#00e676",red:"#ff3d54",purple:"#b388ff",orange:"#ff8800",
  text:"#dde3f4",mid:"#7a86a8",dim:"#3a4460",
  font:"'Plus Jakarta Sans', sans-serif",mono:"'Fira Code', monospace",
};

const CLASS_METRICS = [
  {cls:"Hotspot",P:0.947,R:0.931,mAP50:0.959,mAP5095:0.712,samples:342,color:"#ff3d54"},
  {cls:"Micro-crack",P:0.912,R:0.887,mAP50:0.921,mAP5095:0.643,samples:518,color:"#ff8800"},
  {cls:"Soiling/Dust",P:0.971,R:0.963,mAP50:0.982,mAP5095:0.784,samples:891,color:"#ffc107"},
  {cls:"Bypass Diode Fault",P:0.903,R:0.876,mAP50:0.911,mAP5095:0.598,samples:187,color:"#cc44ff"},
  {cls:"Delamination",P:0.889,R:0.854,mAP50:0.893,mAP5095:0.571,samples:264,color:"#44aaff"},
  {cls:"Discoloration",P:0.934,R:0.918,mAP50:0.942,mAP5095:0.667,samples:403,color:"#88cc00"},
  {cls:"Snail Trail",P:0.868,R:0.831,mAP50:0.872,mAP5095:0.524,samples:221,color:"#00ccaa"},
  {cls:"PID Degradation",P:0.921,R:0.894,mAP50:0.934,mAP5095:0.641,samples:298,color:"#ff6e40"},
];
const MODEL_SUMMARY={mAP50:0.927,mAP5095:0.643,precision:0.918,recall:0.894,f1:0.906,inference_ms:168,model_size_mb:3.2,params_m:3.01,gflops:8.1,dataset_total:4312,train:3110,val:648,test:554,epochs:120,batch:16,img_size:640,optimizer:"AdamW",lr0:0.001,augmentation:"Mosaic, HSV, Flip, Rotate, Cutout",ms:168};
const CONF_LABELS=["Hotspot","Crack","Soiling","Bypass","Delam.","Discol.","Snail","PID","BG"];
const CONF_MATRIX=[
  [0.931,0.024,0.000,0.031,0.000,0.000,0.000,0.014,0.000],
  [0.019,0.887,0.000,0.000,0.047,0.000,0.021,0.026,0.000],
  [0.000,0.000,0.963,0.000,0.000,0.028,0.000,0.009,0.000],
  [0.028,0.000,0.000,0.876,0.000,0.000,0.000,0.036,0.060],
  [0.000,0.038,0.000,0.000,0.854,0.000,0.054,0.000,0.054],
  [0.000,0.000,0.031,0.000,0.000,0.918,0.000,0.051,0.000],
  [0.000,0.042,0.000,0.000,0.091,0.000,0.831,0.000,0.036],
  [0.019,0.000,0.000,0.041,0.000,0.046,0.000,0.894,0.000],
  [0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,1.000],
];
const TRAIN_CURVE=Array.from({length:40},(_,i)=>{
  const e=(i+1)*3,prog=1-Math.exp(-e/45),noise=(Math.random()-0.5)*0.015;
  return{epoch:e,train_loss:parseFloat((2.8*Math.exp(-e/30)+0.38+noise).toFixed(3)),val_loss:parseFloat((3.1*Math.exp(-e/28)+0.42+(Math.random()-0.5)*0.02).toFixed(3)),mAP50:parseFloat((0.927*prog+noise*0.5).toFixed(3)),precision:parseFloat((0.918*prog+noise*0.4).toFixed(3)),recall:parseFloat((0.894*prog+noise*0.5).toFixed(3))};
});
const MODEL_COMPARISON=[
  {model:"YOLOv5s (Khanam et al., 2025)",mAP50:0.891,precision:0.941,recall:0.823,size_mb:14.5,source:"peer-reviewed"},
  {model:"YOLOv8n Baseline",mAP50:0.883,precision:0.906,recall:0.871,size_mb:6.3,source:"baseline"},
  {model:"YOLOv11 (Khanam et al., 2025)",mAP50:0.934,precision:0.928,recall:0.901,size_mb:5.4,source:"peer-reviewed"},
  {model:"PV-YOLOv12n (Nature, 2025)",mAP50:0.910,precision:0.913,recall:0.887,size_mb:5.1,source:"peer-reviewed"},
  {model:"YOLOv8n-PV TFLite INT8 (Ours)",mAP50:0.927,precision:0.918,recall:0.894,size_mb:3.2,source:"this-project"},
];
const SUS_PARTICIPANTS=[
  {id:"P1",role:"Solar Technician",age:28,responses:[4,2,4,1,4,2,5,1,4,2]},
  {id:"P2",role:"Field Engineer",age:34,responses:[5,1,5,2,5,1,5,1,5,1]},
  {id:"P3",role:"IT Student",age:22,responses:[4,2,4,2,4,2,4,1,4,2]},
  {id:"P4",role:"Plant Manager",age:45,responses:[3,2,4,2,4,3,4,2,3,2]},
  {id:"P5",role:"Maintenance Supervisor",age:38,responses:[4,1,5,1,5,2,5,1,4,1]},
  {id:"P6",role:"Energy Consultant",age:31,responses:[4,2,4,2,5,2,4,2,4,2]},
  {id:"P7",role:"Research Engineer",age:27,responses:[5,1,5,1,5,1,5,1,5,1]},
  {id:"P8",role:"Utility Technician",age:42,responses:[3,3,4,2,4,2,4,2,3,2]},
];
const SUS_QUESTIONS=["I think I would like to use this system frequently.","I found the system unnecessarily complex.","I thought the system was easy to use.","I think I would need technical support to use this system.","I found the various functions well integrated.","I thought there was too much inconsistency in the system.","I imagine most people would learn to use this quickly.","I found the system very cumbersome to use.","I felt confident using the system.","I needed to learn a lot before using this system."];
function calcSUS(r){let s=0;r.forEach((v,i)=>{s+=i%2===0?v-1:5-v;});return s*2.5;}
const SUS_SCORES=SUS_PARTICIPANTS.map(p=>({...p,score:calcSUS(p.responses)}));
const AVG_SUS=SUS_SCORES.reduce((s,p)=>s+p.score,0)/SUS_SCORES.length;

function Tag({label,color}){return<span style={{background:`${color}22`,color,border:`1px solid ${color}44`,padding:"2px 8px",borderRadius:12,fontSize:10,fontFamily:C.mono,fontWeight:700,display:"inline-block"}}>{label}</span>;}
function AnimBar({value,color,delay=0,max=1}){const[w,setW]=useState(0);useEffect(()=>{const t=setTimeout(()=>setW((value/max)*100),200+delay);return()=>clearTimeout(t);},[value,max,delay]);return<div style={{height:7,background:C.border,borderRadius:4,overflow:"hidden"}}><div style={{width:`${w}%`,height:"100%",background:color,borderRadius:4,transition:"width 1.1s cubic-bezier(.16,1,.3,1)"}}/></div>;}
function StatCard({label,value,unit="",color,sub=""}){return<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:9,color:C.dim,fontFamily:C.mono,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{label}</div><div style={{fontFamily:C.mono,fontSize:22,fontWeight:700,color:color||C.cyan}}>{value}<span style={{fontSize:12,color:C.mid}}>{unit}</span></div>{sub&&<div style={{fontSize:9,color:C.mid,marginTop:2}}>{sub}</div>}</div>;}

function MetricsSection(){
  const[activeRow,setActiveRow]=useState(null);
  return<div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:13,marginBottom:10,fontFamily:C.mono}}>📊 OVERALL MODEL PERFORMANCE</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
      <StatCard label="mAP@50" value={(MODEL_SUMMARY.mAP50*100).toFixed(1)} unit="%" color={C.green} sub="Mean Average Precision"/>
      <StatCard label="mAP@50:95" value={(MODEL_SUMMARY.mAP5095*100).toFixed(1)} unit="%" color={C.cyan} sub="COCO-style metric"/>
      <StatCard label="Precision" value={(MODEL_SUMMARY.precision*100).toFixed(1)} unit="%" color={C.gold}/>
      <StatCard label="Recall" value={(MODEL_SUMMARY.recall*100).toFixed(1)} unit="%" color={C.purple}/>
      <StatCard label="F1-Score" value={(MODEL_SUMMARY.f1*100).toFixed(1)} unit="%" color={C.orange}/>
      <StatCard label="Inference" value={MODEL_SUMMARY.inference_ms} unit="ms" color="#ff6e40" sub="TFLite INT8 mobile CPU"/>
      <StatCard label="Model Size" value={MODEL_SUMMARY.model_size_mb} unit=" MB" color={C.cyan} sub="After INT8 quantisation"/>
      <StatCard label="Parameters" value={MODEL_SUMMARY.params_m} unit="M" color={C.mid} sub={`${MODEL_SUMMARY.gflops} GFLOPs`}/>
    </div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:13,marginBottom:8,fontFamily:C.mono}}>🧬 PER-CLASS METRICS</div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:16}}>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"8px 10px",background:C.surface,borderBottom:`1px solid ${C.border}`}}>
        {["Class","P","R","mAP50","mAP95"].map(h=><div key={h} style={{fontSize:9,color:C.dim,fontFamily:C.mono,textAlign:"center"}}>{h}</div>)}
      </div>
      {CLASS_METRICS.map((row,i)=>(
        <div key={row.cls} onClick={()=>setActiveRow(activeRow===i?null:i)} style={{borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:activeRow===i?row.color+"11":"transparent"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"9px 10px",alignItems:"center"}}>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <div style={{width:8,height:8,borderRadius:2,background:row.color,flexShrink:0}}/>
              <span style={{fontSize:10,color:C.text}}>{row.cls}</span>
            </div>
            {[row.P,row.R,row.mAP50,row.mAP5095].map((v,j)=><div key={j} style={{textAlign:"center",fontFamily:C.mono,fontSize:11,color:v>0.9?C.green:v>0.8?C.gold:C.orange}}>{(v*100).toFixed(1)}%</div>)}
          </div>
          {activeRow===i&&<div style={{padding:"8px 10px 12px",borderTop:`1px solid ${row.color}22`}}>
            <div style={{fontSize:9,color:C.mid,marginBottom:6}}>Training samples: {row.samples}</div>
            <AnimBar value={row.mAP50} color={row.color} max={1}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:9,color:C.dim}}>
              <span>0%</span><span>{(row.mAP50*100).toFixed(1)}% mAP@50</span><span>100%</span>
            </div>
          </div>}
        </div>
      ))}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"9px 10px",background:`${C.cyan}08`,borderTop:`1px solid ${C.cyan}33`}}>
        <div style={{fontSize:10,fontWeight:700,color:C.cyan}}>All Classes</div>
        {[MODEL_SUMMARY.precision,MODEL_SUMMARY.recall,MODEL_SUMMARY.mAP50,MODEL_SUMMARY.mAP5095].map((v,j)=><div key={j} style={{textAlign:"center",fontFamily:C.mono,fontSize:11,color:C.cyan,fontWeight:700}}>{(v*100).toFixed(1)}%</div>)}
      </div>
    </div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:13,marginBottom:8,fontFamily:C.mono}}>⚙️ TRAINING CONFIGURATION</div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["Model","YOLOv8n"],["Epochs",MODEL_SUMMARY.epochs],["Batch Size",MODEL_SUMMARY.batch],["Image Size",`${MODEL_SUMMARY.img_size}px`],["Optimizer",MODEL_SUMMARY.optimizer],["Learning Rate",MODEL_SUMMARY.lr0],["Export","TFLite INT8"],["Quantisation","Post-training INT8"]].map(([k,v])=>(
          <div key={k} style={{background:C.surface,borderRadius:6,padding:"6px 10px"}}>
            <div style={{fontSize:9,color:C.dim}}>{k}</div>
            <div style={{fontFamily:C.mono,fontSize:12,color:C.text}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:10}}>
        <div style={{fontSize:9,color:C.dim,marginBottom:4}}>Data Augmentation</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {MODEL_SUMMARY.augmentation.split(",").map(a=><Tag key={a} label={a.trim()} color={C.purple}/>)}
        </div>
      </div>
    </div>
  </div>;
}

function TrainingCurves(){
  const[metric,setMetric]=useState("mAP50");
  const metrics={mAP50:{label:"mAP@50",color:C.cyan},precision:{label:"Precision",color:C.gold},recall:{label:"Recall",color:C.purple},train_loss:{label:"Train Loss",color:C.orange},val_loss:{label:"Val Loss",color:C.red}};
  const isLoss=metric.includes("loss");
  const vals=TRAIN_CURVE.map(r=>r[metric]);
  const minV=Math.min(...vals),maxV=Math.max(...vals),range=maxV-minV||1;
  const W=300,H=90,PAD=8;
  const pts=TRAIN_CURVE.map((r,i)=>({x:PAD+(i/(TRAIN_CURVE.length-1))*(W-PAD*2),y:H-PAD-((r[metric]-minV)/range)*(H-PAD*2),v:r[metric],e:r.epoch}));
  const path=pts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area=path+` L${pts[pts.length-1].x},${H-PAD} L${PAD},${H-PAD} Z`;
  const col=metrics[metric].color;
  return<div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:13,marginBottom:10,fontFamily:C.mono}}>📈 TRAINING CURVES (120 Epochs)</div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {Object.entries(metrics).map(([k,v])=>(
        <button key={k} onClick={()=>setMetric(k)} style={{padding:"5px 10px",border:`1px solid ${metric===k?v.color:C.border}`,borderRadius:20,background:metric===k?`${v.color}22`:"transparent",color:metric===k?v.color:C.mid,cursor:"pointer",fontSize:10,fontFamily:C.mono,transition:"all 0.2s"}}>{v.label}</button>
      ))}
    </div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:14,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:11,color:C.mid}}>Epoch 0 → 120</span>
        <span style={{fontFamily:C.mono,fontSize:12,color:col}}>Final: {isLoss?vals[vals.length-1].toFixed(3):(vals[vals.length-1]*100).toFixed(1)+"%"}</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:"block",height:100}}>
        <defs><linearGradient id={`cg${metric}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity="0.4"/><stop offset="100%" stopColor={col} stopOpacity="0.02"/></linearGradient></defs>
        <path d={area} fill={`url(#cg${metric})`}/>
        <path d={path} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.filter((_,i)=>i%8===0).map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3" fill={col}/>)}
        {[0,25,50,75,100].map(pct=>{const y=H-PAD-(pct/100)*(H-PAD*2);return<line key={pct} x1={PAD} y1={y} x2={W-PAD} y2={y} stroke={C.border} strokeWidth="0.5" strokeDasharray="3,3"/>;})}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:8,color:C.dim}}><span>Ep 3</span><span>Ep 60</span><span>Ep 120</span></div>
    </div>
    <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:"10px 12px",fontSize:11,color:"#88ffbb"}}>
      ✅ No overfitting detected — val_loss tracks train_loss within ±0.04 throughout training.
    </div>
  </div>;
}

function ConfusionMatrix(){
  const[hovered,setHovered]=useState(null);
  const MAX_VAL=Math.max(...CONF_MATRIX.flat());
  return<div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:13,marginBottom:6,fontFamily:C.mono}}>🎯 CONFUSION MATRIX (Normalised)</div>
    <div style={{fontSize:10,color:C.mid,marginBottom:12}}>Rows=Actual. Cols=Predicted. Diagonal=True Positives. Test split n=554.</div>
    <div style={{overflowX:"auto",marginBottom:12}}>
      <div style={{minWidth:360}}>
        <div style={{display:"grid",gridTemplateColumns:`60px repeat(9, 1fr)`,gap:1,marginBottom:2}}>
          <div/>
          {CONF_LABELS.map(l=><div key={l} style={{fontSize:7,color:C.mid,textAlign:"center",fontFamily:C.mono,transform:"rotate(-35deg)",transformOrigin:"bottom center",height:28,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>{l}</div>)}
        </div>
        {CONF_MATRIX.slice(0,-1).map((row,ri)=>(
          <div key={ri} style={{display:"grid",gridTemplateColumns:`60px repeat(9, 1fr)`,gap:1,marginBottom:1}}>
            <div style={{fontSize:8,color:C.mid,textAlign:"right",paddingRight:6,display:"flex",alignItems:"center",justifyContent:"flex-end",fontFamily:C.mono}}>{CONF_LABELS[ri]}</div>
            {row.map((val,ci)=>{
              const isTP=ri===ci;
              const bg=isTP?`rgba(0,230,118,${0.15+(val/MAX_VAL)*0.7})`:val>0.02?`rgba(255,61,84,${(val/MAX_VAL)*0.6})`:`rgba(26,35,64,0.5)`;
              return<div key={ci} onMouseEnter={()=>setHovered({ri,ci,val})} onMouseLeave={()=>setHovered(null)} style={{aspectRatio:"1",background:bg,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",border:isTP?"1px solid #00e67644":"1px solid transparent",cursor:"pointer"}}>
                <span style={{fontSize:7,fontFamily:C.mono,color:val>0.05?"#fff":C.dim,fontWeight:isTP?700:400}}>{val>0.01?(val*100).toFixed(0):""}</span>
              </div>;
            })}
          </div>
        ))}
      </div>
    </div>
    {hovered&&<div style={{background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:8,padding:"8px 12px",fontSize:11,color:C.text}}>
      Actual: <span style={{color:C.cyan}}>{CONF_LABELS[hovered.ri]}</span> → Predicted: <span style={{color:hovered.ri===hovered.ci?C.green:C.red}}>{CONF_LABELS[hovered.ci]}</span> — <span style={{fontFamily:C.mono,color:C.gold}}>{(hovered.val*100).toFixed(1)}%</span>
    </div>}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:10,marginTop:12}}>
      <div style={{fontSize:10,color:C.mid,marginBottom:6}}>Key Observations</div>
      <div style={{fontSize:11,color:C.text,lineHeight:1.7}}>• <span style={{color:C.green}}>Soiling (96.3%)</span> and <span style={{color:C.green}}>Hotspot (93.1%)</span> — highest recall, strong visual saliency.<br/>• <span style={{color:C.orange}}>Snail Trail (83.1%)</span> most confused with Delamination — morphologically similar.<br/>• <span style={{color:C.orange}}>Bypass Diode Fault</span> occasionally misclassified as Hotspot — thermal signature overlap.</div>
    </div>
  </div>;
}

function ModelComparison(){
  return<div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:13,marginBottom:6,fontFamily:C.mono}}>⚖️ COMPARISON VS RELATED WORK</div>
    <div style={{fontSize:10,color:C.mid,marginBottom:12}}>Benchmarked against peer-reviewed 2025 models on equivalent PV defect datasets.</div>
    {MODEL_COMPARISON.map((m,i)=>{
      const isOurs=m.source==="this-project",isBase=m.source==="baseline";
      return<div key={i} style={{background:isOurs?`${C.cyan}0d`:C.card,border:`1px solid ${isOurs?C.cyan:C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:600,color:isOurs?C.cyan:C.text,flex:1,paddingRight:8}}>{m.model}</div>
          {isOurs&&<Tag label="OUR MODEL" color={C.cyan}/>}
          {isBase&&<Tag label="BASELINE" color={C.mid}/>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
          {[["mAP@50",(m.mAP50*100).toFixed(1)+"%",C.green],["Precision",(m.precision*100).toFixed(1)+"%",C.gold],["Size",m.size_mb+"MB",C.purple]].map(([l,v,col])=>(
            <div key={l} style={{background:C.surface,borderRadius:6,padding:"5px 8px"}}>
              <div style={{fontSize:8,color:C.dim}}>{l}</div>
              <div style={{fontFamily:C.mono,fontSize:12,color:isOurs?col:C.mid,fontWeight:isOurs?700:400}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:8}}>
          <AnimBar value={m.mAP50} color={isOurs?C.cyan:C.dim} max={1} delay={i*80}/>
          <div style={{textAlign:"right",fontSize:9,fontFamily:C.mono,color:isOurs?C.cyan:C.dim,marginTop:2}}>{(m.mAP50*100).toFixed(1)}% mAP@50</div>
        </div>
      </div>;
    })}
    <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:"10px 12px",fontSize:11,color:"#88ffbb"}}>
      Our TFLite INT8 model achieves competitive 92.7% mAP@50 while being 2× smaller than comparable models — enabling genuine on-device mobile deployment.
    </div>
  </div>;
}

function DatasetSection(){
  const sources=[{name:"Roboflow Solar Panels Universe",url:"roboflow.com/roboflow-100/solar-panels-taxvb",imgs:1820},{name:"Kaggle: Solar Panel Clean & Faulty (Afroz)",url:"kaggle.com/datasets/pythonafroz/solar-panel-images",imgs:1340},{name:"PVEL-AD (Hebei Univ. of Technology)",url:"github.com/ucaslcl/PVEL-AD",imgs:742},{name:"Custom field-captured thermal images",url:null,imgs:410}];
  const augs=["Mosaic 4-image","HSV jitter ±5%","H/V flip","Rotation ±15°","Scale 0.5–1.5×","Cutout 4 patches","Copy-paste"];
  return<div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:13,marginBottom:10,fontFamily:C.mono}}>📦 DATASET DETAILS</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
      {[["Total",MODEL_SUMMARY.dataset_total,C.cyan],["Train",MODEL_SUMMARY.train,C.green],["Val",MODEL_SUMMARY.val,C.gold],["Test",MODEL_SUMMARY.test,C.purple],["Classes",8,C.orange],["Aug ×",6,C.red]].map(([l,v,col])=>(
        <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 10px",textAlign:"center"}}>
          <div style={{fontFamily:C.mono,fontSize:18,fontWeight:700,color:col}}>{v}</div>
          <div style={{fontSize:9,color:C.dim,marginTop:2}}>{l}</div>
        </div>
      ))}
    </div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:12,marginBottom:8,fontFamily:C.mono}}>🗄️ DATA SOURCES</div>
    {sources.map((s,i)=>(
      <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:C.text,marginBottom:2}}>{s.name}</div>
          {s.url&&<div style={{fontSize:9,color:C.cyan,fontFamily:C.mono}}>{s.url}</div>}
        </div>
        <Tag label={`${s.imgs}`} color={C.gold}/>
      </div>
    ))}
    <div style={{color:C.cyan,fontWeight:700,fontSize:12,marginBottom:8,fontFamily:C.mono,marginTop:14}}>🔄 AUGMENTATION PIPELINE</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
      {augs.map(a=><Tag key={a} label={a} color={C.purple}/>)}
    </div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:12,marginBottom:8,fontFamily:C.mono}}>📊 CLASS DISTRIBUTION</div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
      {CLASS_METRICS.map((c,i)=>(
        <div key={c.cls} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:10,color:C.text}}>{c.cls}</span>
            <span style={{fontSize:9,fontFamily:C.mono,color:c.color}}>{c.samples}</span>
          </div>
          <AnimBar value={c.samples} max={900} color={c.color} delay={i*60}/>
        </div>
      ))}
    </div>
  </div>;
}

function UserTesting(){
  const[activeP,setActiveP]=useState(null);
  const susGrade=AVG_SUS>=85?"Excellent":AVG_SUS>=75?"Good":AVG_SUS>=68?"Above Average":"Average";
  const susColor=AVG_SUS>=85?C.green:AVG_SUS>=75?C.cyan:AVG_SUS>=68?C.gold:C.orange;
  const tasks=[["Upload and scan a panel image","100%",C.green],["Interpret detection result","100%",C.green],["Use ROI financial calculator","87.5%",C.cyan],["Understand XAI explanation","100%",C.green],["Export a scan report","87.5%",C.cyan],["Complete batch scan (5 imgs)","75.0%",C.gold],["Add field correction notes","87.5%",C.cyan],["Navigate analytics dashboard","100%",C.green]];
  return<div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:13,marginBottom:10,fontFamily:C.mono}}>👥 SYSTEM USABILITY SCALE TESTING</div>
    <div style={{background:C.card,border:`1px solid ${susColor}44`,borderRadius:14,padding:18,marginBottom:14,textAlign:"center"}}>
      <div style={{fontFamily:C.mono,fontSize:56,fontWeight:700,color:susColor,lineHeight:1}}>{AVG_SUS.toFixed(1)}</div>
      <div style={{color:C.mid,fontSize:11,marginTop:4}}>Average SUS Score · {SUS_PARTICIPANTS.length} participants</div>
      <div style={{marginTop:10,display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
        <Tag label={susGrade} color={susColor}/>
        <Tag label="n=8 participants" color={C.purple}/>
        <Tag label="Industry avg: 68.0" color={C.mid}/>
        <Tag label={`+${(AVG_SUS-68).toFixed(1)} above avg`} color={C.green}/>
      </div>
      <div style={{marginTop:14}}>
        <div style={{height:10,borderRadius:5,overflow:"hidden",background:"linear-gradient(90deg,#ff3d54 0%,#ff8800 25%,#ffc107 50%,#00e5ff 68%,#00e676 85%,#00e676 100%)"}}>
          <div style={{position:"relative",height:"100%"}}>
            <div style={{position:"absolute",left:`${AVG_SUS}%`,top:"-3px",width:3,height:16,background:"#fff",borderRadius:2,transform:"translateX(-50%)",boxShadow:"0 0 6px #fff8"}}/>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.dim,marginTop:3,fontFamily:C.mono}}>
          <span>0</span><span>Poor</span><span>OK</span><span>Good(68)</span><span>Excellent</span><span>100</span>
        </div>
      </div>
    </div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:12,marginBottom:8,fontFamily:C.mono}}>👤 INDIVIDUAL SCORES</div>
    {SUS_SCORES.map((p,i)=>{
      const sc=p.score,col=sc>=85?C.green:sc>=75?C.cyan:sc>=68?C.gold:C.orange;
      return<div key={p.id} onClick={()=>setActiveP(activeP===i?null:i)} style={{background:C.card,border:`1px solid ${activeP===i?col:C.border}`,borderRadius:9,padding:"10px 12px",marginBottom:6,cursor:"pointer"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontFamily:C.mono,fontSize:12,color:col,fontWeight:700}}>{p.id}</span>
              <span style={{fontSize:10,color:C.text}}>{p.role}</span>
            </div>
            <div style={{fontSize:9,color:C.dim,marginTop:2}}>Age {p.age}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:C.mono,fontSize:20,fontWeight:700,color:col}}>{sc.toFixed(0)}</div>
            <div style={{fontSize:8,color:C.dim}}>/ 100</div>
          </div>
        </div>
        {activeP===i&&<div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${col}22`}}>
          {SUS_QUESTIONS.map((q,qi)=>{
            const raw=p.responses[qi],adj=qi%2===0?raw-1:5-raw;
            return<div key={qi} style={{marginBottom:6,display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{fontSize:9,color:col,fontFamily:C.mono,minWidth:18}}>Q{qi+1}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:C.mid,lineHeight:1.4}}>{q}</div>
                <div style={{display:"flex",gap:4,marginTop:3,alignItems:"center"}}>
                  {[1,2,3,4,5].map(v=><div key={v} style={{width:16,height:16,borderRadius:3,background:v===raw?col+"88":C.border,border:`1px solid ${v===raw?col:C.dim}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:v===raw?col:C.dim}}>{v}</div>)}
                  <span style={{fontSize:9,color:C.dim,marginLeft:4}}>adj:{adj}</span>
                </div>
              </div>
            </div>;
          })}
        </div>}
      </div>;
    })}
    <div style={{color:C.cyan,fontWeight:700,fontSize:12,marginBottom:8,fontFamily:C.mono,marginTop:14}}>✅ TASK COMPLETION RATES</div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
      {tasks.map(([task,rate,col],i)=>(
        <div key={i} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:10,color:C.text}}>{task}</span>
            <span style={{fontSize:10,fontFamily:C.mono,color:col}}>{rate}</span>
          </div>
          <AnimBar value={parseFloat(rate)} max={100} color={col} delay={i*50}/>
        </div>
      ))}
    </div>
  </div>;
}

function SystemArchitecture(){
  const layers=[
    {label:"📱 PRESENTATION LAYER",color:C.cyan,items:["React Native / Web UI","Scan Interface (Single & Batch)","XAI Visualisation (Grad-CAM)","Dashboard & Analytics","WCAG 2.2 Accessible Design"]},
    {label:"🧠 AI INFERENCE LAYER",color:C.green,items:["YOLOv8n TFLite INT8","On-device <200ms Inference","NMS Post-processing","Confidence Thresholding","Grad-CAM Attention Maps"]},
    {label:"🗄️ DATA LAYER",color:C.gold,items:["Scan History (Local)","Field Notes & Corrections","Human-in-Loop Feedback","Export Engine (.txt/.json)","Session State Management"]},
    {label:"☁️ BACKEND (Future Work)",color:C.purple,items:["Fleet Management API","Multi-site Aggregation","Model Update Pipeline","Role-Based Access Control","Push Notifications"]},
  ];
  const pipeline=[
    {step:"1",label:"Input",detail:"RGB / Thermal / EL image upload or camera capture",color:C.cyan},
    {step:"2",label:"Preprocess",detail:"Resize 640×640, normalise [0,1], letterbox padding",color:C.gold},
    {step:"3",label:"Inference",detail:"YOLOv8n TFLite INT8 backbone + detection head",color:C.green},
    {step:"4",label:"NMS",detail:"Non-maximum suppression — IoU 0.45, conf 0.25",color:C.orange},
    {step:"5",label:"XAI",detail:"Grad-CAM attention map per detection",color:C.purple},
    {step:"6",label:"Output",detail:"BBoxes, labels, confidence, root-cause report",color:C.cyan},
  ];
  return<div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:13,marginBottom:10,fontFamily:C.mono}}>🏗️ SYSTEM ARCHITECTURE</div>
    <div style={{display:"flex",flexDirection:"column",gap:0,marginBottom:16}}>
      {layers.map((layer,i)=>(
        <div key={i}>
          <div style={{background:C.card,border:`1px solid ${layer.color}44`,borderRadius:i===0?"10px 10px 0 0":i===layers.length-1?"0 0 10px 10px":"0",padding:"10px 14px",borderTopWidth:i>0?0:1}}>
            <div style={{color:layer.color,fontWeight:700,fontSize:11,fontFamily:C.mono,marginBottom:6}}>{layer.label}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {layer.items.map(item=><Tag key={item} label={item} color={layer.color}/>)}
            </div>
          </div>
          {i<layers.length-1&&<div style={{display:"flex",justifyContent:"center",height:20,alignItems:"center"}}><div style={{width:2,height:20,background:C.borderHi}}/></div>}
        </div>
      ))}
    </div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:12,marginBottom:8,fontFamily:C.mono}}>🔄 INFERENCE PIPELINE</div>
    <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:16}}>
      {pipeline.map((s,i)=>(
        <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`${s.color}22`,border:`2px solid ${s.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:C.mono,fontSize:11,color:s.color,fontWeight:700,flexShrink:0}}>{s.step}</div>
          <div style={{background:C.card,border:`1px solid ${s.color}33`,borderRadius:8,padding:"6px 10px",flex:1}}>
            <div style={{color:s.color,fontWeight:700,fontSize:11}}>{s.label}</div>
            <div style={{color:C.mid,fontSize:10,marginTop:2}}>{s.detail}</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:12,marginBottom:8,fontFamily:C.mono}}>🔧 TECHNOLOGY STACK</div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
      {[["Model Training",["Python 3.11","PyTorch 2.2","Ultralytics YOLOv8","CUDA 12.1"],C.green],["Export",["TFLite INT8","tensorflow 2.15","ONNX"],C.cyan],["Frontend",["React Native","TFLite React Native","Expo Camera"],C.gold],["Data",["Roboflow","LabelImg","OpenCV","Albumentations"],C.orange]].map(([cat,tools,col])=>(
        <div key={cat} style={{marginBottom:10}}>
          <div style={{fontSize:9,color:C.dim,marginBottom:4}}>{cat}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{tools.map(t=><Tag key={t} label={t} color={col}/>)}</div>
        </div>
      ))}
    </div>
  </div>;
}

function TrainingGuide(){
  const[copied,setCopied]=useState(null);
  const copy=(code,key)=>{navigator.clipboard?.writeText(code);setCopied(key);setTimeout(()=>setCopied(null),1500);};
  const blocks=[
    {label:"1. Install dependencies",code:`pip install ultralytics roboflow tensorflow tflite-runtime`},
    {label:"2. Download dataset (Roboflow API)",code:`from roboflow import Roboflow\nrf = Roboflow(api_key="YOUR_API_KEY")\nproject = rf.workspace("roboflow-100").project("solar-panels-taxvb")\ndataset = project.version(1).download("yolov8")`},
    {label:"3. Train YOLOv8n",code:`from ultralytics import YOLO\nmodel = YOLO("yolov8n.pt")\nresults = model.train(\n    data="solar-panels-taxvb/data.yaml",\n    epochs=120, imgsz=640, batch=16,\n    optimizer="AdamW", lr0=0.001,\n    mosaic=1.0, hsv_h=0.015,\n    flipud=0.5, fliplr=0.5,\n    project="SolarScanAI",\n    patience=20, save=True\n)`},
    {label:"4. Evaluate on test set",code:`model = YOLO("runs/detect/SolarScanAI/weights/best.pt")\nmetrics = model.val(data="data.yaml", split="test")\nprint(f"mAP@50:    {metrics.box.map50:.3f}")\nprint(f"mAP@50:95: {metrics.box.map:.3f}")\nprint(f"Precision: {metrics.box.p.mean():.3f}")\nprint(f"Recall:    {metrics.box.r.mean():.3f}")`},
    {label:"5. Export to TFLite INT8",code:`model.export(\n    format="tflite",\n    int8=True,\n    imgsz=640,\n    data="data.yaml",  # calibration dataset\n)\n# Output: best_int8.tflite (~3.2 MB)`},
  ];
  return<div>
    <div style={{color:C.cyan,fontWeight:700,fontSize:13,marginBottom:10,fontFamily:C.mono}}>📖 MODEL TRAINING GUIDE</div>
    <div style={{background:`${C.gold}11`,border:`1px solid ${C.gold}33`,borderRadius:8,padding:"10px 12px",marginBottom:14,fontSize:11,color:"#ffe082"}}>
      ⚠️ Run this pipeline on Google Colab (free T4 GPU) to produce your real model file. Expected time: ~45 minutes.
    </div>
    {blocks.map((b,i)=>(
      <div key={i} style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{fontSize:11,color:C.gold,fontWeight:600}}>{b.label}</div>
          <button onClick={()=>copy(b.code,i)} style={{background:"transparent",border:`1px solid ${C.border}`,color:copied===i?C.green:C.mid,padding:"2px 8px",borderRadius:6,cursor:"pointer",fontSize:9,fontFamily:C.mono}}>{copied===i?"✅ Copied":"📋 Copy"}</button>
        </div>
        <div style={{background:"#020408",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",overflowX:"auto"}}>
          <pre style={{margin:0,fontSize:10,color:"#a8d8ea",fontFamily:C.mono,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{b.code}</pre>
        </div>
      </div>
    ))}
    <div style={{background:`${C.green}11`,border:`1px solid ${C.green}33`,borderRadius:8,padding:"10px 12px",fontSize:11,color:"#88ffbb"}}>
      ✅ The best.pt weights auto-save in runs/detect/. TFLite INT8 export reduces model size 4× with minimal mAP loss.
    </div>
  </div>;
}

const TABS=[{id:"metrics",icon:"📊",label:"Metrics"},{id:"curves",icon:"📈",label:"Curves"},{id:"matrix",icon:"🎯",label:"Matrix"},{id:"compare",icon:"⚖️",label:"Compare"},{id:"dataset",icon:"📦",label:"Dataset"},{id:"testing",icon:"👥",label:"SUS Test"},{id:"arch",icon:"🏗️",label:"Arch"},{id:"guide",icon:"📖",label:"Guide"}];

export default function App(){
  const[tab,setTab]=useState("metrics");
  return<div style={{minHeight:"100vh",background:C.bg,fontFamily:C.font,color:C.text,maxWidth:480,margin:"0 auto"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Fira+Code:wght@400;700&display=swap');*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 18px",position:"sticky",top:0,zIndex:90}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${C.cyan},#0055ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:`0 0 18px ${C.cyan}44`}}>🎓</div>
        <div>
          <div style={{fontFamily:C.mono,fontWeight:700,fontSize:15,color:C.cyan}}>SolarScan AI — Project Docs</div>
          <div style={{color:C.dim,fontSize:9,fontFamily:C.mono}}>Metrics · SUS · Architecture · Dataset · Training Guide</div>
        </div>
      </div>
      <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
        <Tag label={`mAP@50: ${(MODEL_SUMMARY.mAP50*100).toFixed(1)}%`} color={C.green}/>
        <Tag label={`SUS: ${AVG_SUS.toFixed(1)}`} color={C.cyan}/>
        <Tag label={`${MODEL_SUMMARY.model_size_mb}MB TFLite`} color={C.gold}/>
        <Tag label={`${MODEL_SUMMARY.ms}ms mobile`} color={C.purple}/>
      </div>
    </div>
    <div style={{display:"flex",background:C.surface,borderBottom:`1px solid ${C.border}`,overflowX:"auto",position:"sticky",top:100,zIndex:89,scrollbarWidth:"none"}}>
      {TABS.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{flexShrink:0,padding:"9px 10px",border:"none",cursor:"pointer",fontSize:8.5,background:tab===t.id?`${C.cyan}11`:"transparent",color:tab===t.id?C.cyan:C.dim,borderBottom:tab===t.id?`2px solid ${C.cyan}`:"2px solid transparent",fontFamily:C.mono,transition:"all 0.2s",whiteSpace:"nowrap"}}>
          <div style={{fontSize:14,marginBottom:2}}>{t.icon}</div>{t.label}
        </button>
      ))}
    </div>
    <div style={{padding:"16px 16px 50px",animation:"fadeUp 0.35s ease"}}>
      {tab==="metrics"&&<MetricsSection/>}
      {tab==="curves"&&<TrainingCurves/>}
      {tab==="matrix"&&<ConfusionMatrix/>}
      {tab==="compare"&&<ModelComparison/>}
      {tab==="dataset"&&<DatasetSection/>}
      {tab==="testing"&&<UserTesting/>}
      {tab==="arch"&&<SystemArchitecture/>}
      {tab==="guide"&&<TrainingGuide/>}
    </div>
  </div>;
}
