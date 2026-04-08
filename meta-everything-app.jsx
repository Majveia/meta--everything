import { useState, useEffect, useRef, useCallback, createContext, useContext, useMemo } from "react";

const pals = {
  dark: { bg:"#0A0A0A",bgS:"#0F0E0D",bgH:"#141312",bdr:"#1C1A18",bdrS:"#141312",bdrH:"#282624",tx:"#E8E0D4",txS:"#9B9590",txM:"#6B6560",txF:"#3A3634",tc:"#BF5A3C",tcG:"#D4714F",am:"#E8A849",tl:"#3D8B8B",gn:"#4A9B6E",card:"#0F0E0D",cardB:"#1C1A18",sh:"0 4px 20px rgba(0,0,0,.35)",shL:"0 16px 56px rgba(0,0,0,.5)",navBg:"rgba(15,14,13,.88)",ht:.018,gl:"06",skelA:"#141312",skelB:"#1C1A18" },
  light: { bg:"#F5F1EB",bgS:"#FFFFFF",bgH:"#ECE7DF",bdr:"#DED5C8",bdrS:"#E8E1D8",bdrH:"#D0C5B6",tx:"#1A1816",txS:"#6B6560",txM:"#9B9590",txF:"#C8BFB3",tc:"#BF5A3C",tcG:"#D4714F",am:"#C4893A",tl:"#2E7A7A",gn:"#3D8B5E",card:"#FFFFFF",cardB:"#E4DCD0",sh:"0 4px 16px rgba(0,0,0,.05)",shL:"0 16px 56px rgba(0,0,0,.07)",navBg:"rgba(255,255,255,.88)",ht:.012,gl:"03",skelA:"#EDE8E0",skelB:"#E2D9CC" },
};
const TC=createContext();const useT=()=>useContext(TC);const E="cubic-bezier(.16,1,.3,1)";
const pc={twitch:"#9146FF",x:"#8B8580",youtube:"#FF0000",substack:"#E8A849",kick:"#53FC18"};

function MetaLogo({size=26}){const{p}=useT();const[tk,sTk]=useState(0);useEffect(()=>{const id=setInterval(()=>sTk(t=>t+1),40);return()=>clearInterval(id)},[]);const t=tk*.04,c=p.tc;
return(<svg width={size} height={size} viewBox="0 0 100 100" style={{overflow:"visible",flexShrink:0}}><circle cx="50" cy="50" r={38+Math.sin(t*.7)*3} fill="none" stroke={c} strokeWidth="1" opacity={.22+Math.sin(t*.5)*.08} strokeDasharray="8 4" strokeDashoffset={tk*.5}/><circle cx="50" cy="50" r={28+Math.sin(t*1.1)*2} fill="none" stroke={c} strokeWidth=".8" opacity={.13+Math.sin(t*.8)*.06} strokeDasharray="4 6" strokeDashoffset={-tk*.3}/>{[0,1,2].map(i=>{const a=(t*15+i*120)*Math.PI/180,r=20+Math.sin(t*.9+i)*3;return(<circle key={i} cx={50+Math.cos(a)*r} cy={50+Math.sin(a)*r} r={2.5+Math.sin(t+i*2)*.5} fill={c} opacity={.4+Math.sin(t*1.3+i)*.2}/>)})}<circle cx="50" cy="50" r={5+Math.sin(t*1.8)} fill={c} opacity={.15}/><circle cx="50" cy="50" r={2.5} fill={p.tcG} opacity={.7}/><line x1="44" y1="41" x2="47.5" y2="59" stroke={p.tx} strokeWidth="1.4" opacity={.4+Math.sin(t*2)*.12}/><line x1="52.5" y1="41" x2="56" y2="59" stroke={p.tx} strokeWidth="1.4" opacity={.4+Math.sin(t*2+.5)*.12}/></svg>)}

function LiveDot(){return(<span style={{width:6,height:6,borderRadius:"50%",background:"#E84040",display:"inline-block",animation:"lp 2s ease infinite",boxShadow:"0 0 8px #E8404050"}}/>)}

function PI({platform,size=14}){const{p}=useT();const s=size;const m={
twitch:(<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#9146FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zM11 11V7M16 11V7"/></svg>),
x:(<svg width={s-1} height={s-1} viewBox="0 0 24 24" fill={p.tx} opacity={.8}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
youtube:(<svg width={s} height={s} viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3 3 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3 3 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3 3 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3 3 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>),
substack:(<svg width={s-1} height={s-1} viewBox="0 0 24 24" fill={p.am}><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>),
kick:(<svg width={s-1} height={s-1} viewBox="0 0 24 24" fill="#53FC18"><rect x="2" y="2" width="6" height="20" rx="1"/><path d="M10 12l6-8h6l-7 9 7 9h-6l-6-8z"/></svg>),
};return m[platform]||null}

function Avi({name,color,size=28}){return(<div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${color}40,${color}18)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1.5px solid ${color}25`}}><span style={{fontFamily:"'Outfit',sans-serif",fontSize:size*.4,fontWeight:500,color,opacity:.9}}>{name[0]}</span></div>)}

// ═══ PLATFORM-SPECIFIC THUMBNAILS ═══
function Thumb({platform,h=145,hover,isLive}){
  const{p}=useT();const ac=pc[platform];
  // Each platform gets a distinct visual pattern
  const patterns = {
    twitch: (
      <>
        {/* Diagonal stream lines */}
        <div style={{position:"absolute",inset:0,opacity:.04,background:`repeating-linear-gradient(135deg,transparent,transparent 12px,${ac} 12px,${ac} 13px)`}}/>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 25% 70%,${ac}18 0%,transparent 50%)`}}/>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 75% 30%,${ac}10 0%,transparent 40%)`}}/>
      </>
    ),
    youtube: (
      <>
        {/* Play button silhouette */}
        <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 50%,${ac}14 0%,transparent 35%)`}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:40,height:40,opacity:.06}}>
          <svg viewBox="0 0 24 24" fill={ac}><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div style={{position:"absolute",bottom:0,left:"10%",right:"10%",height:3,borderRadius:2,background:`${ac}15`}}/>
      </>
    ),
    x: (
      <>
        {/* Text lines pattern */}
        {[20,35,50,65].map((top,i)=>(<div key={i} style={{position:"absolute",top:`${top}%`,left:"12%",right:`${20+i*8}%`,height:2,borderRadius:1,background:`${p.tx}${i===0?"0A":"06"}`,}}/>))}
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 80% 20%,${ac}08 0%,transparent 40%)`}}/>
      </>
    ),
    substack: (
      <>
        {/* Article/book feel — horizontal rules */}
        <div style={{position:"absolute",top:"15%",left:"15%",right:"15%",height:1,background:`${ac}12`}}/>
        <div style={{position:"absolute",top:"25%",left:"15%",right:"30%",height:1,background:`${ac}0A`}}/>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,${ac}08 0%,transparent 30%,transparent 70%,${ac}06 100%)`}}/>
        <div style={{position:"absolute",left:"15%",top:"35%",bottom:"30%",width:1,background:`${ac}0A`}}/>
      </>
    ),
    kick: (
      <>
        {/* Electric/gaming feel — grid */}
        <div style={{position:"absolute",inset:0,opacity:.03,background:`linear-gradient(${p.tx} 1px,transparent 1px),linear-gradient(90deg,${p.tx} 1px,transparent 1px)`,backgroundSize:"20px 20px"}}/>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 40% 60%,${ac}14 0%,transparent 45%)`}}/>
      </>
    ),
  };

  return(
    <div style={{width:"100%",height:h,position:"relative",overflow:"hidden",
      background:`linear-gradient(${platform==="youtube"?"160deg":"145deg"},${ac}${isLive?"1A":"0C"} 0%,${p.bg} ${isLive?"35%":"55%"},${ac}06 100%)`}}>
      {/* Halftone base */}
      <div style={{position:"absolute",inset:0,opacity:p.ht*(isLive?2:1.5),backgroundImage:`radial-gradient(circle,${p.tx} .45px,transparent .45px)`,backgroundSize:"4.5px 4.5px",mixBlendMode:isLive?"overlay":"normal"}}/>
      {/* Platform pattern */}
      {patterns[platform]}
      {/* Watermark */}
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{transform:`scale(${hover?(isLive?4:3):isLive?3.5:2.6})`,transition:`transform .6s ${E}`,opacity:.06}}><PI platform={platform} size={isLive?40:32}/></div>
      </div>
      {/* Shimmer on live */}
      {isLive&&<div style={{position:"absolute",inset:0,background:`linear-gradient(105deg,transparent 40%,${ac}08 50%,transparent 60%)`,backgroundSize:"200% 100%",animation:"shimmer 4s ease infinite"}}/>}
      {/* Live badge */}
      {isLive&&<div style={{position:"absolute",top:14,left:14,display:"flex",alignItems:"center",gap:6,padding:"4px 11px",borderRadius:6,background:"rgba(232,64,64,.92)",backdropFilter:"blur(4px)"}}><LiveDot/><span style={{fontFamily:"'SF Mono',monospace",fontSize:9.5,color:"#fff",fontWeight:600,letterSpacing:".08em"}}>LIVE</span></div>}
      {/* Bottom fade */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:isLive?80:55,background:`linear-gradient(transparent,${p.card})`}}/>
    </div>
  );
}

function LikeBtn({count}){const{p}=useT();const[liked,sL]=useState(false);const[pop,sP]=useState(false);
return(<button onClick={e=>{e.stopPropagation();sL(l=>!l);sP(true);setTimeout(()=>sP(false),400)}} style={{background:"none",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:3,padding:"4px 6px",borderRadius:6,margin:"-4px -6px",transition:"background .15s ease",fontFamily:"'SF Mono',monospace",fontSize:9.5,color:liked?"#E84040":p.txM,letterSpacing:".02em"}}
onMouseEnter={e=>{e.currentTarget.style.background=liked?"#E8404010":p.bgH}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
<svg width="11" height="11" viewBox="0 0 24 24" fill={liked?"#E84040":"none"} stroke={liked?"#E84040":p.txM} strokeWidth="2" style={{transition:"all .3s ease",transform:pop?"scale(1.4)":"scale(1)"}}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>{count||""}
</button>)}

function BookmarkBtn(){const{p}=useT();const[saved,sS]=useState(false);
return(<button onClick={e=>{e.stopPropagation();sS(s=>!s)}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 5px",borderRadius:6,margin:"-4px -5px",transition:"background .15s ease"}} onMouseEnter={e=>{e.currentTarget.style.background=p.bgH}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
<svg width="11" height="11" viewBox="0 0 24 24" fill={saved?p.am:"none"} stroke={saved?p.am:p.txM} strokeWidth="2" style={{transition:"all .25s ease",transform:saved?"scale(1.1)":"scale(1)"}}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
</button>)}

function ShareBtn(){const{p}=useT();const[pop,sP]=useState(false);
return(<button onClick={e=>{e.stopPropagation();sP(true);setTimeout(()=>sP(false),600)}} style={{background:"none",border:"none",cursor:"pointer",padding:"4px 5px",borderRadius:6,margin:"-4px -5px",transition:"background .15s ease"}} onMouseEnter={e=>{e.currentTarget.style.background=p.bgH}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={pop?p.tc:p.txM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transition:"all .25s ease",transform:pop?"scale(1.15) rotate(-12deg)":"scale(1)"}}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
</button>)}

function Eng({views,likes,comments}){const{p}=useT();const s={fontFamily:"'SF Mono',monospace",fontSize:9.5,color:p.txM,letterSpacing:".02em",display:"inline-flex",alignItems:"center",gap:3};
return(<div style={{display:"flex",gap:10,marginTop:10,alignItems:"center"}}>
{views&&<span style={s}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>{views}</span>}
<LikeBtn count={likes}/>
{comments&&<span style={s}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>{comments}</span>}
<div style={{marginLeft:"auto",display:"flex",gap:4}}><ShareBtn/><BookmarkBtn/></div>
</div>)}

function Skeleton({h=200,radius=14}){const{p}=useT();return(<div style={{height:h,borderRadius:radius,overflow:"hidden",background:`linear-gradient(90deg,${p.skelA} 25%,${p.skelB} 50%,${p.skelA} 75%)`,backgroundSize:"200% 100%",animation:"shimmer 1.8s ease infinite"}}/>)}
function SkeletonFeed(){return(<div style={{display:"flex",flexDirection:"column",gap:14,paddingTop:20}}><Skeleton h={280}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><Skeleton h={240}/><Skeleton h={240}/></div><Skeleton h={100} radius={12}/></div>)}

// ═══ CARDS ═══
function LiveCard({onTap,...props}){const{p}=useT();const{platform,title,subtitle,viewers,author,views,likes,delay=0}=props;
const[h,sH]=useState(false);const[v,sV]=useState(false);const ac=pc[platform];
useEffect(()=>{const t=setTimeout(()=>sV(true),delay);return()=>clearTimeout(t)},[delay]);
return(<div onClick={()=>onTap&&onTap(props)} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{background:p.card,borderRadius:14,border:`1px solid ${h?ac+"28":p.cardB}`,boxShadow:h?p.sh:"none",cursor:"pointer",transition:`all .4s ${E}`,transform:v?(h?"translateY(-4px)":"none"):"translateY(20px)",opacity:v?1:0,overflow:"hidden",gridColumn:"1/-1"}}>
<Thumb platform={platform} h={195} hover={h} isLive/>
{viewers&&<div style={{position:"absolute",top:14,right:14,padding:"4px 10px",borderRadius:6,background:"rgba(10,10,10,.5)",backdropFilter:"blur(8px)",zIndex:2}}><span style={{fontFamily:"'SF Mono',monospace",fontSize:9.5,color:"#E8E0D4"}}>{viewers}</span></div>}
<div style={{padding:"12px 22px 18px"}}>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>{author&&<Avi name={author} color={ac} size={22}/>}<PI platform={platform} size={12}/><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,letterSpacing:".1em",textTransform:"uppercase",color:ac,opacity:.8}}>{platform}</span></div>
<h3 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:20,letterSpacing:"-.025em",color:p.tx,fontWeight:400,marginBottom:5,lineHeight:1.3}}>{title}</h3>
<p style={{fontFamily:"'Outfit',sans-serif",fontSize:13,color:p.txS,lineHeight:1.6}}>{subtitle}</p>
<Eng views={views} likes={likes}/>
</div></div>)}

function StdCard({onTap,...props}){const{p}=useT();const{platform,title,subtitle,time,author,views,likes,comments,delay=0}=props;
const[h,sH]=useState(false);const[v,sV]=useState(false);const ac=pc[platform];
useEffect(()=>{const t=setTimeout(()=>sV(true),delay);return()=>clearTimeout(t)},[delay]);
return(<div onClick={()=>onTap&&onTap(props)} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{background:p.card,borderRadius:14,border:`1px solid ${h?ac+"22":p.cardB}`,boxShadow:h?p.sh:"none",cursor:"pointer",transition:`all .4s ${E}`,transform:v?(h?"translateY(-4px)":"none"):"translateY(20px)",opacity:v?1:0,overflow:"hidden"}}>
<Thumb platform={platform} h={145} hover={h}/>
<div style={{padding:"10px 18px 16px"}}>
<div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>{author&&<Avi name={author} color={ac} size={20}/>}<PI platform={platform} size={11}/><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,letterSpacing:".1em",textTransform:"uppercase",color:ac,opacity:.8}}>{platform}</span>{time&&(<><span style={{color:p.txF,fontSize:7}}>·</span><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,color:p.txF}}>{time}</span></>)}</div>
<h3 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:16.5,letterSpacing:"-.02em",color:p.tx,fontWeight:400,marginBottom:5,lineHeight:1.3}}>{title}</h3>
<p style={{fontFamily:"'Outfit',sans-serif",fontSize:12,color:p.txS,lineHeight:1.55}}>{subtitle}</p>
<Eng views={views} likes={likes} comments={comments}/>
</div></div>)}

function CompactCard({onTap,...props}){const{p}=useT();const{platform,title,subtitle,time,author,views,likes,comments,delay=0}=props;
const[h,sH]=useState(false);const[v,sV]=useState(false);const ac=pc[platform];
useEffect(()=>{const t=setTimeout(()=>sV(true),delay);return()=>clearTimeout(t)},[delay]);
return(<div onClick={()=>onTap&&onTap(props)} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{background:p.card,borderRadius:12,border:`1px solid ${h?ac+"1C":p.cardB}`,padding:"16px 18px",cursor:"pointer",transition:`all .35s ${E}`,transform:v?(h?"translateY(-3px)":"none"):"translateY(16px)",opacity:v?1:0}}>
<div style={{display:"flex",gap:10,marginBottom:10}}>{author&&<Avi name={author} color={ac} size={26}/>}<div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>{author&&<span style={{fontFamily:"'Outfit',sans-serif",fontSize:12.5,fontWeight:500,color:p.tx}}>{author}</span>}<PI platform={platform} size={11}/><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,letterSpacing:".1em",textTransform:"uppercase",color:ac,opacity:.8}}>{platform}</span>{time&&(<><span style={{color:p.txF,fontSize:7}}>·</span><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,color:p.txF}}>{time}</span></>)}</div></div>
<h3 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:15.5,letterSpacing:"-.015em",color:p.tx,fontWeight:400,marginBottom:5,lineHeight:1.35}}>{title}</h3>
<p style={{fontFamily:"'Outfit',sans-serif",fontSize:12,color:p.txS,lineHeight:1.55}}>{subtitle}</p>
<Eng views={views} likes={likes} comments={comments}/>
</div>)}

function SectionLabel({label,live}){const{p}=useT();return(<div style={{display:"flex",alignItems:"center",gap:8,margin:"22px 0 12px",paddingLeft:2}}>{live&&<LiveDot/>}<span style={{fontFamily:"'SF Mono',monospace",fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:live?p.tc:p.txM}}>{label}</span></div>)}

function renderCard(item,i,onTap){const pr={...item,onTap,isLive:item.type==="live"};if(item.type==="live")return(<LiveCard key={i}{...pr}/>);if(item.type==="compact")return(<CompactCard key={i}{...pr}/>);return(<StdCard key={i}{...pr}/>)}

// ═══ ALL CONTENT ═══
const allContent = [
  {type:"live",platform:"twitch",title:"Kai Cenat — Subathon Day 47",author:"Kai Cenat",subtitle:"Breaking records. 72-hour stream with surprise guests.",extra:"The stream has been going for three days straight. Celebrity appearances include musicians, athletes, and fellow streamers.",viewers:"214K",views:"1.2M",likes:"89K",tags:["gaming","entertainment"],delay:80},
  {type:"std",platform:"youtube",title:"Visualizing Higher Dimensions",author:"3Blue1Brown",subtitle:"Projecting 4D objects into perceivable space.",extra:"Grant Sanderson walks through dimensional projection with his signature visual clarity — tesseracts, hyperspheres, and geometric intuitions.",time:"2h",views:"840K",likes:"62K",tags:["science","math"],delay:140},
  {type:"compact",platform:"x",title:"On Recursive Self-Improvement",author:"Andrej Karpathy",subtitle:"\"The compound AI system is inevitable. Every generation ships with scaffolding that makes the next generation better.\"",extra:"The thread continues with examples from software engineering — compilers that compile themselves, tests that test the testing framework.",time:"38m",views:"420K",likes:"18K",comments:"2.1K",tags:["ai","tech"],delay:200},
  {type:"std",platform:"substack",title:"The Physics of Intelligence",author:"Dwarkesh Patel",subtitle:"Thermodynamic limits of computation.",extra:"A deep interview exploring whether intelligence has fundamental physical constraints. Touches on Landauer's principle and reversible computing.",time:"4h",views:"95K",likes:"4.2K",tags:["science","ai","philosophy"],delay:260},
  {type:"compact",platform:"x",title:"Your thread is gaining traction",author:"You",subtitle:"47 likes, 12 reposts on meta-recursive design systems.",time:"3h",views:"1.8K",likes:"47",comments:"8",tags:["meta","tech"],delay:320},
  {type:"live",platform:"kick",title:"Late Night Code Session",author:"CodeWithFire",subtitle:"Building a recursive engine live.",viewers:"1.2K",views:"8.4K",likes:"620",tags:["coding","gaming"],delay:380},
  {type:"std",platform:"youtube",title:"10 Things I Hate About Every Framework",author:"Fireship",subtitle:"Honest takes on React, Svelte, Vue, and HTMX.",extra:"Jeff Delaney's trademark style stretched to 12 minutes. Each framework gets praised and roasted in equal measure.",time:"6h",views:"1.8M",likes:"112K",comments:"8.7K",tags:["tech","coding"],delay:440},
  {type:"live",platform:"twitch",title:"Vim + Rust Speedrun",author:"ThePrimeagen",subtitle:"Rewriting a JS tool in Rust with Vim motions.",viewers:"18K",views:"62K",likes:"4.1K",tags:["coding","gaming"],delay:80},
  {type:"std",platform:"youtube",title:"The Black Hole Information Paradox",author:"Veritasium",subtitle:"Where does information go past the horizon?",extra:"Derek Muller traces the paradox from Hawking's original paper through the Page curve resolution. Animations by the Kurzgesagt team.",time:"1h",views:"2.1M",likes:"145K",comments:"12K",tags:["science","physics"],delay:140},
  {type:"compact",platform:"x",title:"Reply to your thread",author:"@deepmind_fan",subtitle:"\"The meta-loop isn't a feature, it's a philosophy.\"",time:"2h",views:"340",likes:"12",tags:["ai","meta"],delay:200},
  {type:"std",platform:"substack",title:"The Art of Shipping",author:"Lenny Rachitsky",subtitle:"Balancing speed with craft.",time:"5h",views:"78K",likes:"3.8K",tags:["startups","tech"],delay:260},
  {type:"std",platform:"youtube",title:"Writing an OS from Scratch",author:"Tsoding",subtitle:"Raw assembly and C. Episode 23.",time:"8h",views:"340K",likes:"28K",comments:"3.2K",tags:["coding","tech"],delay:320},
  {type:"compact",platform:"substack",title:"The AI Value Chain",author:"Ben Thompson",subtitle:"Where value accrues in the stack.",time:"12h",views:"120K",likes:"8.4K",tags:["ai","startups"],delay:380},
  {type:"std",platform:"youtube",title:"The Unreasonable Effectiveness of Mathematics",author:"Veritasium",subtitle:"Why does math describe reality so perfectly?",time:"5h",views:"3.2M",likes:"210K",comments:"15K",tags:["science","math","philosophy"],delay:100},
  {type:"compact",platform:"x",title:"Sam Altman on AGI timelines",author:"Sam Altman",subtitle:"\"We're closer than most people think but further than most AI researchers think.\"",time:"1h",views:"1.1M",likes:"45K",comments:"8.2K",tags:["ai","startups"],delay:160},
  {type:"std",platform:"youtube",title:"Why Gravity is NOT a Force",author:"Veritasium",subtitle:"General relativity reframed in 20 minutes.",time:"2d",views:"18M",likes:"890K",comments:"42K",tags:["science","physics"],delay:220},
];

const fyIdx = [0,1,2,3,4,5,6];
const flIdx = [7,8,9,10,11,12];
const exIdx = [13,14,15];

// ═══ DETAIL SHEET ═══
function DetailSheet({item,onClose,allItems}){
  const{p}=useT();const[vis,sVis]=useState(false);
  useEffect(()=>{if(item)requestAnimationFrame(()=>requestAnimationFrame(()=>sVis(true)))},[item]);
  if(!item)return null;
  const ac=pc[item.platform];
  const close=()=>{sVis(false);setTimeout(onClose,300)};
  // Related: same tags, different item
  const related=allItems.filter(c=>c.title!==item.title&&c.tags&&item.tags&&c.tags.some(t=>item.tags.includes(t))).slice(0,3);

  return(<>
    <div onClick={close} style={{position:"fixed",inset:0,zIndex:150,background:`rgba(0,0,0,${vis?.6:0})`,transition:"background .3s ease"}}/>
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:151,maxHeight:"88vh",overflowY:"auto",background:p.card,borderRadius:"20px 20px 0 0",boxShadow:p.shL,transform:vis?"translateY(0)":"translateY(100%)",transition:`transform .4s ${E}`}}>
      <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px",cursor:"pointer"}} onClick={close}><div style={{width:36,height:4,borderRadius:2,background:p.bdrH}}/></div>
      <Thumb platform={item.platform} h={200} hover={false} isLive={item.type==="live"}/>
      {item.viewers&&<div style={{position:"absolute",top:60,right:24,padding:"5px 12px",borderRadius:6,background:"rgba(10,10,10,.5)",backdropFilter:"blur(8px)",zIndex:2}}><span style={{fontFamily:"'SF Mono',monospace",fontSize:10,color:"#E8E0D4"}}>{item.viewers}</span></div>}
      <div style={{padding:"0 24px 32px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          {item.author&&<Avi name={item.author} color={ac} size={36}/>}
          <div>{item.author&&<span style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:500,color:p.tx,display:"block"}}>{item.author}</span>}
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}><PI platform={item.platform} size={12}/><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,letterSpacing:".1em",textTransform:"uppercase",color:ac}}>{item.platform}</span>{item.time&&(<><span style={{color:p.txF,fontSize:7}}>·</span><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,color:p.txF}}>{item.time}</span></>)}</div></div>
        </div>
        <h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:24,letterSpacing:"-.03em",color:p.tx,fontWeight:400,marginBottom:10,lineHeight:1.25}}>{item.title}</h2>
        <p style={{fontFamily:"'Outfit',sans-serif",fontSize:14,color:p.txS,lineHeight:1.7,marginBottom:6}}>{item.subtitle}</p>
        {item.extra&&<p style={{fontFamily:"'Outfit',sans-serif",fontSize:14,color:p.txS,lineHeight:1.7}}>{item.extra}</p>}
        {item.tags&&<div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap"}}>{item.tags.map((t,i)=>(<span key={i} style={{fontFamily:"'SF Mono',monospace",fontSize:9,padding:"3px 10px",borderRadius:6,background:ac+"10",color:ac,letterSpacing:".04em"}}>#{t}</span>))}</div>}
        <Eng views={item.views} likes={item.likes} comments={item.comments}/>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button style={{flex:1,padding:"12px 0",borderRadius:10,border:"none",background:ac,color:"#fff",fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer",transition:`all .2s ${E}`,letterSpacing:".01em"}}
            onMouseEnter={e=>{e.currentTarget.style.opacity=".9"}} onMouseLeave={e=>{e.currentTarget.style.opacity="1"}}>
            {item.type==="live"?"Watch Now":item.platform==="x"?"View Thread":item.platform==="substack"?"Read Article":"Watch"}
          </button>
          <button style={{padding:"12px 16px",borderRadius:10,border:`1px solid ${p.bdr}`,background:"transparent",color:p.tx,fontFamily:"'Outfit',sans-serif",fontSize:13,cursor:"pointer"}}>Share</button>
        </div>
        {/* Related */}
        {related.length>0&&(<>
          <div style={{margin:"28px 0 14px"}}><span style={{fontFamily:"'SF Mono',monospace",fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:p.txM}}>Related</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {related.map((r,i)=>(<div key={i} style={{display:"flex",gap:12,alignItems:"center",padding:"12px 14px",background:p.bgS,borderRadius:10,border:`1px solid ${p.cardB}`,cursor:"pointer",transition:`all .2s ${E}`}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=pc[r.platform]+"20"}} onMouseLeave={e=>{e.currentTarget.style.borderColor=p.cardB}}>
              {r.author&&<Avi name={r.author} color={pc[r.platform]} size={28}/>}
              <div style={{flex:1,minWidth:0}}>
                <span style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:14,color:p.tx,display:"block",lineHeight:1.3,marginBottom:2}}>{r.title}</span>
                <div style={{display:"flex",alignItems:"center",gap:5}}><PI platform={r.platform} size={10}/><span style={{fontFamily:"'SF Mono',monospace",fontSize:8.5,color:pc[r.platform],letterSpacing:".08em",textTransform:"uppercase"}}>{r.platform}</span>{r.time&&<span style={{fontFamily:"'SF Mono',monospace",fontSize:8.5,color:p.txF}}>· {r.time}</span>}</div>
              </div>
            </div>))}
          </div>
        </>)}
      </div>
    </div>
  </>);
}

// ═══ FEED ═══
function FeedSection({items,onTap}){
  const live=items.filter(i=>i.type==="live");
  const recent=items.filter(i=>i.type!=="live"&&i.time&&!i.time.includes("d")&&parseInt(i.time)<7);
  const earlier=items.filter(i=>!live.includes(i)&&!recent.includes(i));
  const g={display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14};
  return(<div>
    {live.length>0&&<><SectionLabel label="Live Now" live/><div style={g}>{live.map((f,i)=>renderCard(f,`l${i}`,onTap))}</div></>}
    {recent.length>0&&<><SectionLabel label="Recent"/><div style={g}>{recent.map((f,i)=>renderCard(f,`r${i}`,onTap))}</div></>}
    {earlier.length>0&&<><SectionLabel label="Earlier"/><div style={g}>{earlier.map((f,i)=>renderCard(f,`e${i}`,onTap))}</div></>}
  </div>);
}

function SwipeFeed({onTap}){const{p}=useT();
const[tab,sTab]=useState(0);const[dx,sDx]=useState(0);const[drag,sDrag]=useState(false);
const sx=useRef(0),st=useRef(0),ref=useRef(null);
const onS=useCallback(x=>{sx.current=x;st.current=Date.now();sDrag(true)},[]);
const onM=useCallback(x=>{if(!drag)return;let d=x-sx.current;if((tab===0&&d>0)||(tab===1&&d<0))d*=.12;sDx(d)},[drag,tab]);
const onE=useCallback(()=>{if(!drag)return;sDrag(false);const v=Math.abs(dx)/(Date.now()-st.current),th=v>.3?30:80;if(dx<-th&&tab===0)sTab(1);else if(dx>th&&tab===1)sTab(0);sDx(0)},[drag,dx,tab]);
useEffect(()=>{if(!drag)return;const mm=e=>onM(e.clientX),mu=()=>onE();window.addEventListener("mousemove",mm);window.addEventListener("mouseup",mu);return()=>{window.removeEventListener("mousemove",mm);window.removeEventListener("mouseup",mu)}},[drag,onM,onE]);
const w=ref.current?.offsetWidth||400,tx=-tab*50+(dx/w)*50;
const fy=fyIdx.map(i=>allContent[i]);const fl=flIdx.map(i=>allContent[i]);
return(<div>
<div style={{display:"flex",justifyContent:"center",gap:32,marginBottom:18}}>
{["For You","Following"].map((l,i)=>(<button key={i} onClick={()=>{sTab(i);sDx(0)}} style={{background:"none",border:"none",cursor:"pointer",padding:"6px 4px",fontFamily:"'Instrument Serif',Georgia,serif",fontSize:18,letterSpacing:"-.02em",color:tab===i?p.tx:p.txF,fontWeight:400,transition:`color .3s ${E}`,position:"relative"}}>{l}<div style={{position:"absolute",bottom:-4,left:"15%",right:"15%",height:2,borderRadius:1,background:p.tc,transform:`scaleX(${tab===i?1:0})`,transition:`transform .4s ${E}`,transformOrigin:tab===i?"center":(i===0?"right":"left")}}/></button>))}
</div>
<div ref={ref} onTouchStart={e=>onS(e.touches[0].clientX)} onTouchMove={e=>onM(e.touches[0].clientX)} onTouchEnd={onE} onMouseDown={e=>{e.preventDefault();onS(e.clientX)}} style={{overflow:"hidden",cursor:drag?"grabbing":"default",userSelect:"none",WebkitUserSelect:"none"}}>
<div style={{display:"flex",width:"200%",transform:`translateX(${tx}%)`,transition:drag?"none":`transform .5s ${E}`,willChange:"transform"}}>
<div style={{width:"50%",paddingRight:8}}><FeedSection items={fy} onTap={onTap}/></div>
<div style={{width:"50%",paddingLeft:8}}><FeedSection items={fl} onTap={onTap}/></div>
</div></div></div>)}

// ═══ EXPLORE ═══
function ExploreView({onTap}){const{p}=useT();
const[activeTopic,sAT]=useState(null);
const topics=["All","AI","Science","Coding","Gaming","Startups","Philosophy"];
const exItems=exIdx.map(i=>allContent[i]);
const filtered=activeTopic&&activeTopic!=="All"?allContent.filter(c=>c.tags&&c.tags.includes(activeTopic.toLowerCase())):exItems;
const g={display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14};
return(<div>
<h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:22,letterSpacing:"-.025em",fontWeight:400,color:p.tx,marginBottom:18}}>Explore</h2>
<div style={{display:"flex",gap:6,overflowX:"auto",margin:"0 -20px",padding:"0 20px 16px",scrollbarWidth:"none"}}>
{topics.map((t,i)=>{const active=activeTopic===t||(t==="All"&&!activeTopic);return(
<button key={i} onClick={()=>sAT(t==="All"?null:t)} style={{padding:"7px 16px",borderRadius:8,border:`1px solid ${active?p.tc+"50":p.bdr}`,background:active?p.tc+"12":p.bgS,fontFamily:"'Outfit',sans-serif",fontSize:12,color:active?p.tc:p.txS,whiteSpace:"nowrap",cursor:"pointer",flexShrink:0,transition:`all .25s ${E}`,fontWeight:active?500:400}}>
{t}</button>)})}
</div>
<SectionLabel label={activeTopic?"Results":"Trending"}/>
<div style={g}>{filtered.map((f,i)=>renderCard({...f,delay:i*80},`ex${i}`,onTap))}</div>
</div>)}

// ═══ ACTIVITY / PROFILE ═══
const nots=[{icon:"📱",text:"3 new messages from study group",app:"iMessage",time:"2m",ac:"#5B8DB8"},{icon:"🔴",text:"Kai Cenat went live",app:"Twitch",time:"23m",ac:"#9146FF"},{icon:"🎬",text:"Veritasium: Black Hole Info Paradox",app:"YouTube",time:"2h",ac:"#FF0000"},{icon:"📝",text:"New from Lenny's Newsletter",app:"Substack",time:"3h",ac:"#E8A849"},{icon:"💬",text:"@deepmind_fan replied to your thread",app:"X",time:"4h",ac:"#8B8580"},{icon:"📧",text:"Assignment grades posted",app:"Email",time:"5h",ac:"#D4A03C"}];

function ActivityView(){const{p}=useT();return(<div><h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:22,letterSpacing:"-.025em",fontWeight:400,color:p.tx,marginBottom:20}}>Activity</h2><div style={{display:"flex",flexDirection:"column",gap:8}}>{nots.map((n,i)=>(<div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"14px 16px",background:p.card,borderRadius:12,border:`1px solid ${p.cardB}`,cursor:"pointer",transition:`all .2s ${E}`}} onMouseEnter={e=>{e.currentTarget.style.borderColor=n.ac+"20"}} onMouseLeave={e=>{e.currentTarget.style.borderColor=p.cardB}}><div style={{width:36,height:36,borderRadius:10,background:n.ac+"10",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{n.icon}</div><div style={{flex:1}}><p style={{fontFamily:"'Outfit',sans-serif",fontSize:13,color:p.tx,lineHeight:1.45,margin:0}}>{n.text}</p><div style={{display:"flex",gap:8,marginTop:5}}><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,color:n.ac}}>{n.app}</span><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,color:p.txF}}>{n.time} ago</span></div></div><div style={{width:6,height:6,borderRadius:"50%",background:n.ac,marginTop:8,flexShrink:0,opacity:.5}}/></div>))}</div></div>)}

function ProfileView({isDark,onThemeToggle}){const{p}=useT();
return(<div><div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:20,marginBottom:28}}><div style={{width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${p.tc}30,${p.am}20)`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,border:`2px solid ${p.tc}25`}}><span style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:28,color:p.tc}}>M</span></div><h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:22,letterSpacing:"-.02em",fontWeight:400,color:p.tx,marginBottom:4}}>Majveia</h2><p style={{fontFamily:"'SF Mono',monospace",fontSize:10,color:p.txM,letterSpacing:".06em",marginBottom:20}}>Building meta//everything</p><div style={{display:"flex",gap:24}}>{[["Posts","12"],["Following","847"],["Followers","234"]].map(([l,v],i)=>(<div key={i} style={{textAlign:"center"}}><span style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:20,color:p.tx,display:"block"}}>{v}</span><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,color:p.txM,letterSpacing:".05em"}}>{l}</span></div>))}</div></div>
<div style={{background:p.card,borderRadius:14,border:`1px solid ${p.cardB}`,overflow:"hidden"}}><div style={{padding:"14px 18px",borderBottom:`1px solid ${p.bdrS}`}}><span style={{fontFamily:"'SF Mono',monospace",fontSize:10,letterSpacing:".1em",textTransform:"uppercase",color:p.txM}}>Settings</span></div>
{[{label:"Dark mode",value:isDark,toggle:onThemeToggle},{label:"Notifications",value:true},{label:"Haptic feedback",value:true}].map((s,i,a)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:i<a.length-1?`1px solid ${p.bdrS}`:"none"}}><span style={{fontFamily:"'Outfit',sans-serif",fontSize:14,color:p.tx}}>{s.label}</span><div onClick={s.toggle||undefined} style={{width:44,height:24,borderRadius:12,cursor:s.toggle?"pointer":"default",background:s.value?p.tc:p.bdrH,transition:"background .3s ease",position:"relative"}}><div style={{position:"absolute",top:2,left:s.value?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:`left .3s ${E}`,boxShadow:s.value?`0 0 8px ${p.tc}40`:"none"}}/></div></div>))}</div>
<div style={{marginTop:20,background:p.card,borderRadius:14,border:`1px solid ${p.cardB}`,overflow:"hidden"}}>{["Saved items","Privacy","Help & Support","About meta//everything"].map((item,i,arr)=>(<div key={i} style={{padding:"14px 18px",borderBottom:i<arr.length-1?`1px solid ${p.bdrS}`:"none",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",transition:`background .12s ease`}} onMouseEnter={e=>{e.currentTarget.style.background=p.bgH}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}><span style={{fontFamily:"'Outfit',sans-serif",fontSize:14,color:p.tx}}>{item}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.txF} strokeWidth="1.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></div>))}</div>
<p style={{textAlign:"center",fontFamily:"'SF Mono',monospace",fontSize:9,color:p.txF,marginTop:24,letterSpacing:".04em"}}>v47.0 · Made with love</p>
</div>)}

// ═══ OVERLAYS ═══
function NotifDrop({open,onClose}){const{p}=useT();if(!open)return null;return(<><div onClick={onClose} style={{position:"fixed",inset:0,zIndex:90}}/><div style={{position:"absolute",top:"100%",right:0,zIndex:100,width:340,maxHeight:"70vh",overflowY:"auto",marginTop:8,background:p.card,borderRadius:14,border:`1px solid ${p.cardB}`,boxShadow:p.shL,animation:`ni .22s ${E}`}}><div style={{padding:"14px 16px 10px",borderBottom:`1px solid ${p.bdrS}`}}><h3 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:16,fontWeight:400,color:p.tx,letterSpacing:"-.02em"}}>Notifications</h3></div><div style={{padding:4}}>{nots.slice(0,4).map((n,i)=>(<div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px",borderRadius:9,cursor:"pointer",transition:"background .1s ease",animation:`nit .25s ${E} ${i*.03}s both`}} onMouseEnter={e=>{e.currentTarget.style.background=p.bgH}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}><div style={{width:30,height:30,borderRadius:8,background:n.ac+"0F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{n.icon}</div><div style={{flex:1}}><p style={{fontFamily:"'Outfit',sans-serif",fontSize:12.5,color:p.tx,lineHeight:1.4,margin:0}}>{n.text}</p><div style={{display:"flex",gap:7,marginTop:4}}><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,color:n.ac}}>{n.app}</span><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,color:p.txF}}>{n.time}</span></div></div></div>))}</div><div onClick={onClose} style={{padding:"10px 16px",borderTop:`1px solid ${p.bdrS}`,textAlign:"center",cursor:"pointer"}}><span style={{fontFamily:"'Outfit',sans-serif",fontSize:12,color:p.tc}}>View all</span></div></div></>)}

function CmdPal({open,onClose,onTheme,allItems,onSelect}){const{p}=useT();const[q,sQ]=useState("");const r=useRef(null);
useEffect(()=>{if(open){sQ("");setTimeout(()=>r.current?.focus(),80)}},[open]);
const results=q.length>1?allItems.filter(c=>c.title.toLowerCase().includes(q.toLowerCase())||c.author?.toLowerCase().includes(q.toLowerCase())||(c.tags&&c.tags.some(t=>t.includes(q.toLowerCase())))):[];
const cmds=[{n:"Toggle theme",s:"⌘D",i:"◐",fn:onTheme},{n:"Settings",s:"⌘,",i:"⚙"}].filter(c=>!q||c.n.toLowerCase().includes(q.toLowerCase()));
if(!open)return null;
return(<div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(5,5,5,.5)",backdropFilter:"blur(20px)",display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"12vh",animation:"fi .1s ease"}}>
<div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:480,margin:"0 16px",background:p.card,borderRadius:14,border:`1px solid ${p.cardB}`,boxShadow:p.shL,overflow:"hidden",animation:`sd .2s ${E}`,maxHeight:"70vh",display:"flex",flexDirection:"column"}}>
<div style={{padding:"12px 16px",borderBottom:`1px solid ${p.bdrS}`,display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
<input ref={r} value={q} onChange={e=>sQ(e.target.value)} placeholder="Search content, creators, topics..." style={{flex:1,border:"none",outline:"none",background:"transparent",color:p.tx,fontFamily:"'Outfit',sans-serif",fontSize:14}}/>
{q&&<button onClick={()=>sQ("")} style={{background:"none",border:"none",cursor:"pointer",color:p.txM,fontSize:16,padding:"0 4px"}}>×</button>}
</div>
<div style={{padding:4,overflowY:"auto",flex:1}}>
{/* Search results */}
{results.length>0&&(<><div style={{padding:"8px 12px 4px"}}><span style={{fontFamily:"'SF Mono',monospace",fontSize:9,color:p.txM,letterSpacing:".08em"}}>CONTENT</span></div>
{results.slice(0,5).map((item,i)=>(<div key={i} onClick={()=>{onSelect(item);onClose()}} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 12px",borderRadius:8,cursor:"pointer",transition:"background .1s ease"}} onMouseEnter={e=>{e.currentTarget.style.background=p.bgH}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
{item.author&&<Avi name={item.author} color={pc[item.platform]} size={24}/>}
<div style={{flex:1,minWidth:0}}><span style={{fontFamily:"'Outfit',sans-serif",fontSize:13,color:p.tx,display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.title}</span>
<span style={{fontFamily:"'SF Mono',monospace",fontSize:9,color:pc[item.platform],letterSpacing:".06em",textTransform:"uppercase"}}>{item.platform}{item.author&&` · ${item.author}`}</span></div>
</div>))}</>)}
{/* Commands */}
{(q.length<2||cmds.length>0)&&(<>{q.length>1&&results.length>0&&<div style={{height:1,background:p.bdrS,margin:"4px 12px"}}/>}
{cmds.map((c,i)=>(<div key={i} onClick={()=>{if(c.fn)c.fn();onClose()}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 11px",borderRadius:7,cursor:"pointer",transition:"background .1s ease"}} onMouseEnter={e=>{e.currentTarget.style.background=p.bgH}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
<div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:12,width:16,textAlign:"center",color:p.tc}}>{c.i}</span><span style={{fontFamily:"'Outfit',sans-serif",fontSize:13,color:p.tx}}>{c.n}</span></div>
<span style={{fontFamily:"'SF Mono',monospace",fontSize:9.5,color:p.txF}}>{c.s}</span></div>))}</>)}
{q.length>1&&results.length===0&&cmds.length===0&&(<div style={{padding:"20px 12px",textAlign:"center"}}><span style={{fontFamily:"'Outfit',sans-serif",fontSize:13,color:p.txM}}>No results for "{q}"</span></div>)}
</div></div></div>)}

function BNav({active,onChange}){const{p}=useT();
const items=[
{id:"home",label:"Home",icon:a=>(<svg width="18" height="18" viewBox="0 0 24 24" fill={a?p.tc:"none"} stroke={a?p.tc:p.txM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>)},
{id:"explore",label:"Explore",icon:a=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a?p.tc:p.txM} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" fill={a?p.tc+"30":"none"}/></svg>)},
{id:"activity",label:"Activity",icon:a=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a?p.tc:p.txM} strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>)},
{id:"profile",label:"Profile",icon:a=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={a?p.tc:p.txM} strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>)},
];
return(<nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:p.navBg,borderTop:`1px solid ${p.bdrS}`,backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",transition:"background .4s ease"}}><div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-around",padding:"7px 0 env(safe-area-inset-bottom, 7px)"}}>{items.map(it=>{const a=active===it.id;return(<button key={it.id} onClick={()=>onChange(it.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"5px 16px",transition:`all .2s ${E}`}}><div style={{transition:`transform .25s ${E}`,transform:a?"scale(1.08)":"scale(1)"}}>{it.icon(a)}</div><span style={{fontFamily:"'SF Mono',monospace",fontSize:8.5,letterSpacing:".05em",color:a?p.tc:p.txM,fontWeight:a?600:400,transition:"color .2s ease"}}>{it.label}</span></button>)})}</div></nav>)}

// ═══ APP ═══
export default function App(){
  const[isDark,sD]=useState(true);const[cmd,sCmd]=useState(false);const[notif,sNot]=useState(false);
  const[nav,sNav]=useState("home");const[ready,sR]=useState(false);const[scrolled,sSc]=useState(false);
  const[loading,sL]=useState(false);const[detail,sDetail]=useState(null);
  const p=isDark?pals.dark:pals.light;

  useEffect(()=>{sR(true);
    const h=e=>{if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();sCmd(o=>!o)}if(e.key==="Escape"){sCmd(false);sNot(false);sDetail(null)}};
    const sc=()=>sSc(window.scrollY>20);
    window.addEventListener("keydown",h);window.addEventListener("scroll",sc,{passive:true});
    return()=>{window.removeEventListener("keydown",h);window.removeEventListener("scroll",sc)}
  },[]);

  const switchNav=n=>{if(n===nav)return;sL(true);sNav(n);window.scrollTo({top:0,behavior:"smooth"});setTimeout(()=>sL(false),400)};

  return(
    <TC.Provider value={{isDark,p}}>
      <div style={{background:p.bg,minHeight:"100vh",color:p.tx,fontFamily:"'Outfit','Helvetica Neue',sans-serif",position:"relative",overflowX:"hidden",paddingBottom:72,transition:"background .45s ease,color .45s ease"}}>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet"/>
        <style>{`
          @keyframes fi{from{opacity:0}to{opacity:1}}
          @keyframes sd{from{opacity:0;transform:translateY(-8px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
          @keyframes lp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
          @keyframes br{0%,100%{opacity:${p.ht}}50%{opacity:${p.ht*1.8}}}
          @keyframes ni{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
          @keyframes nit{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
          @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
          @keyframes fadeView{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
          *{box-sizing:border-box;margin:0;padding:0}
          ::-webkit-scrollbar{width:3px;height:0}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${p.txF};border-radius:4px}
        `}</style>

        <div style={{position:"fixed",inset:0,opacity:p.ht,backgroundImage:`radial-gradient(circle,${p.tx} .35px,transparent .35px)`,backgroundSize:"6px 6px",pointerEvents:"none",animation:"br 10s ease infinite",zIndex:0}}/>
        <div style={{position:"fixed",top:-180,right:-80,width:420,height:420,borderRadius:"50%",background:`radial-gradient(circle,${p.tc}${p.gl} 0%,transparent 70%)`,filter:"blur(70px)",pointerEvents:"none",zIndex:0}}/>

        <CmdPal open={cmd} onClose={()=>sCmd(false)} onTheme={()=>sD(d=>!d)} allItems={allContent} onSelect={sDetail}/>
        <DetailSheet item={detail} onClose={()=>sDetail(null)} allItems={allContent}/>

        <header style={{position:"sticky",top:0,zIndex:60,background:scrolled?p.navBg:"transparent",backdropFilter:scrolled?"blur(24px)":"none",WebkitBackdropFilter:scrolled?"blur(24px)":"none",borderBottom:scrolled?`1px solid ${p.bdrS}`:"1px solid transparent",transition:"all .3s ease"}}>
          <div style={{maxWidth:1100,margin:"0 auto",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:ready?1:0,transition:`opacity .7s ${E}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><MetaLogo size={scrolled?22:26}/><h1 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:scrolled?15:16,letterSpacing:"-.03em",fontWeight:400,color:p.tx,transition:"all .3s ease"}}>meta<span style={{color:p.tc}}>//</span>everything</h1></div>
            <div style={{display:"flex",alignItems:"center",gap:1}}>
              <button onClick={()=>sD(d=>!d)} aria-label="Theme" style={{width:34,height:34,borderRadius:9,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background .1s ease",color:p.txM}} onMouseEnter={e=>{e.currentTarget.style.background=p.bgH}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
                {isDark?(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>)
                :(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>)}
              </button>
              <div onClick={()=>sCmd(true)} style={{width:34,height:34,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"background .1s ease"}} onMouseEnter={e=>{e.currentTarget.style.background=p.bgH}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.txM} strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg></div>
              <div style={{position:"relative"}}><div onClick={()=>sNot(o=>!o)} style={{width:34,height:34,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",transition:"background .1s ease",background:notif?p.bgH:"transparent"}} onMouseEnter={e=>{if(!notif)e.currentTarget.style.background=p.bgH}} onMouseLeave={e=>{if(!notif)e.currentTarget.style.background="transparent"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={notif?p.tc:p.txM} strokeWidth="1.5" strokeLinecap="round" style={{transition:"stroke .2s ease"}}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><div style={{position:"absolute",top:6,right:7,width:6,height:6,borderRadius:"50%",background:"#E84040",border:`1.5px solid ${scrolled?"transparent":p.bg}`,transition:"border-color .3s ease"}}/></div><NotifDrop open={notif} onClose={()=>sNot(false)}/></div>
            </div>
          </div>
        </header>

        <div style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"8px 20px 0"}}>
          {loading?(<SkeletonFeed/>):(<div style={{animation:`fadeView .35s ${E}`}}>
            {nav==="home"&&<SwipeFeed onTap={sDetail}/>}
            {nav==="explore"&&<ExploreView onTap={sDetail}/>}
            {nav==="activity"&&<ActivityView/>}
            {nav==="profile"&&<ProfileView isDark={isDark} onThemeToggle={()=>sD(d=>!d)}/>}
          </div>)}
        </div>
        <BNav active={nav} onChange={switchNav}/>
      </div>
    </TC.Provider>
  );
}
