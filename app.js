const intervals=[{name:'Minor 2nd',n:1,aliases:['minor second','minor 2nd','minor two','half step','semitone']},{name:'Major 2nd',n:2,aliases:['major second','major 2nd','major two','whole step','whole tone']},{name:'Minor 3rd',n:3,aliases:['minor third','minor 3rd','minor three']},{name:'Major 3rd',n:4,aliases:['major third','major 3rd','major three']},{name:'Perfect 4th',n:5,aliases:['perfect fourth','perfect 4th','fourth','4th']},{name:'Tritone',n:6,aliases:['tritone','augmented fourth','diminished fifth']},{name:'Perfect 5th',n:7,aliases:['perfect fifth','perfect 5th','fifth','5th']},{name:'Minor 6th',n:8,aliases:['minor sixth','minor 6th','minor six']},{name:'Major 6th',n:9,aliases:['major sixth','major 6th','major six']},{name:'Minor 7th',n:10,aliases:['minor seventh','minor 7th','minor seven']},{name:'Major 7th',n:11,aliases:['major seventh','major 7th','major seven']},{name:'Octave',n:12,aliases:['octave','perfect octave','perfect eighth']}];
const chords=[{name:'Major',notes:[0,4,7],aliases:['major','major chord','major triad']},{name:'Minor',notes:[0,3,7],aliases:['minor','minor chord','minor triad']},{name:'Diminished',notes:[0,3,6],aliases:['diminished','diminished chord','diminished triad']},{name:'Augmented',notes:[0,4,8],aliases:['augmented','augmented chord','augmented triad']},{name:'Major 7th',notes:[0,4,7,11],aliases:['major seventh','major seven','major 7','major 7th','major seventh chord']},{name:'Minor 7th',notes:[0,3,7,10],aliases:['minor seventh','minor seven','minor 7','minor 7th','minor seventh chord']},{name:'Dominant 7th',notes:[0,4,7,10],aliases:['dominant seventh','dominant seven','dominant 7','dominant 7th','dominant','seven chord','seventh chord']},{name:'Major 9th',notes:[0,4,7,11,14],aliases:['major ninth','major nine','major 9','major 9th']},{name:'Minor 9th',notes:[0,3,7,10,14],aliases:['minor ninth','minor nine','minor 9','minor 9th']},{name:'Dominant 9th',notes:[0,4,7,10,14],aliases:['dominant ninth','dominant nine','dominant 9','dominant 9th']}];
const levels=[{title:'Ascending intervals',subtitle:'Find the distance as notes climb',type:'MELODIC · ASCENDING',icon:'↗',description:'Two notes, one after the other. Find the distance as they climb.',pool:intervals,mode:'up'},{title:'Descending intervals',subtitle:'A new perspective, from top to bottom',type:'MELODIC · DESCENDING',icon:'↘',description:'Same distances, different direction. Listen as the notes fall.',pool:intervals,mode:'down'},{title:'Harmonic intervals',subtitle:'Two notes, played together',type:'HARMONIC · INTERVALS',icon:'≋',description:'Hear both notes at once and find the interval between them.',pool:intervals,mode:'harmonic'},{title:'Chord qualities',subtitle:'Major, minor, diminished & augmented',type:'HARMONIC · TRIADS',icon:'♬',description:'Get to know the color of four essential triad qualities.',pool:chords.slice(0,4),mode:'chord'},{title:'Sevenths & extensions',subtitle:'Add some color to your chords',type:'HARMONIC · EXTENSIONS',icon:'✳',description:'Explore seventh and ninth chords, and hear the color in each.',pool:chords.slice(4),mode:'chord'}];
const $=id=>document.getElementById(id);const KEY='earway-progress-v1';let progress;try{progress=JSON.parse(localStorage.getItem(KEY))}catch{}if(!progress||!Array.isArray(progress.correct)||progress.correct.length!==5)progress={score:0,correct:[0,0,0,0,0],best:0};let selected=0,active=false,current=null,attempts=0,streak=0,sessionScore=0,question=0,audio=null,run=0,timer=null,speechToken=0,speechTimer=null;
let model=null,recognizer=null,micStream=null,micSource=null,micProcessor=null,micSilence=null,listenWanted=false,setupAbort=null,sessionToken=0,touchOnly=false;
const MODEL_URL='https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-en-us-0.15.tar.gz';
const INSTRUMENT_KEY='earway-instrument-v1';let instrument='soft-keys';try{let saved=localStorage.getItem(INSTRUMENT_KEY);if(['soft-keys','mellow','sine','organ'].includes(saved))instrument=saved}catch{}$('instrument').value=instrument;$('instrument').addEventListener('change',e=>{instrument=e.target.value;try{localStorage.setItem(INSTRUMENT_KEY,instrument)}catch{}});
function save(){try{localStorage.setItem(KEY,JSON.stringify(progress))}catch{}}
function unlocked(i){return i===0||progress.correct[i-1]>=5}
function render(){ $('totalScore').textContent=progress.score;$('totalCorrect').textContent=progress.correct.reduce((a,b)=>a+b,0);$('bestStreak').textContent=progress.best;$('levelList').innerHTML='';levels.forEach((l,i)=>{const b=document.createElement('button');b.className='level'+(i===selected?' selected':'');b.disabled=!unlocked(i);b.innerHTML=`<span class="level-icon">${l.icon}</span><span class="level-info"><strong>${l.title}</strong><small>${l.subtitle}</small></span><span class="level-end"><span class="progress-mini">${unlocked(i)?(progress.correct[i]>=5?'✓ COMPLETE':progress.correct[i]+'/5 CORRECT'):'🔒 LOCKED'}</span><span class="arrow">${unlocked(i)?'↗':''}</span></span>`;b.addEventListener('click',()=>{selected=i;render()});$('levelList').append(b)});let l=levels[selected];$('selectedTitle').textContent=l.title;$('selectedDescription').textContent=l.description;$('cardNumber').textContent=String(selected+1).padStart(2,'0');$('cardType').textContent=l.type}
function status(title,detail){$('gameStatus').textContent=title;$('gameDetail').textContent=detail}
function stopListening(){
  listenWanted=false;$('orb').classList.remove('active');
  if(recognizer){try{recognizer.remove()}catch{}recognizer=null}
}
function listen(){
  if(!active||!current)return;stopListening();
  if(touchOnly||!model||!micStream){status('Use touch answers','Voice is unavailable. Only use touch controls while parked.');return}
  try{
    const r=new model.KaldiRecognizer(audio.sampleRate);recognizer=r;
    r.on('result',message=>{
      if(!active||!listenWanted||recognizer!==r)return;
      const text=(message.result&&message.result.text||'').trim();
      if(!text)return;
      stopListening();$('transcript').textContent='Heard: “'+text+'”';handleVoice([text]);
    });
    r.on('error',()=>{if(recognizer!==r)return;stopListening();status('Voice recognition stopped','Tap Resume listening while parked, or use touch answers.');});
    listenWanted=true;$('orb').classList.add('active');status('Your turn','Say the answer, or say “repeat”.');
  }catch(e){status('Voice recognition unavailable','Use touch controls while parked.');console.error(e)}
}
async function loadVoiceModel(signal){
  if(signal.aborted)throw new DOMException('Cancelled','AbortError');
  status('Preparing voice model','The first use downloads about 41 MB. Keep this screen open while parked.');
  // A stable URL lets Vosk's own IndexedDB-backed model cache be reused on later visits.
  const m=new window.Vosk.Model(MODEL_URL,-1);model=m;
  await new Promise((resolve,reject)=>{
    let finished=false;const timeout=setTimeout(()=>finish(new Error('Voice model took too long to load')),120000);
    function finish(err){if(finished)return;finished=true;clearTimeout(timeout);signal.removeEventListener('abort',aborted);if(err)reject(err);else resolve()}
    function aborted(){finish(new DOMException('Cancelled','AbortError'))}
    signal.addEventListener('abort',aborted,{once:true});
    m.on('load',message=>finish(message.result?null:new Error('Voice model could not load')));
    m.on('error',message=>finish(new Error(message.error||'Voice model error')));
    if(signal.aborted)aborted();
  });
}
function releaseVoice(keepModel=false){
  stopListening();if(micProcessor){micProcessor.onaudioprocess=null;try{micProcessor.disconnect()}catch{}micProcessor=null}if(micSource){try{micSource.disconnect()}catch{}micSource=null}if(micSilence){try{micSilence.disconnect()}catch{}micSilence=null}if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}if(model&&!keepModel){try{model.worker.terminate()}catch{try{model.terminate()}catch{}}model=null}
}
function normalize(s){return s.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function parseAnswer(raw,pool,mode){
  const text=normalize(raw);
  // Reject conflicting guesses rather than scoring one as wrong.
  const major=/\b(major|maj)\b/.test(text), minor=/\b(minor|min)\b/.test(text);
  const diminished=/\b(diminished|diminish|dim)\b/.test(text), augmented=/\b(augmented|augment|aug)\b/.test(text);
  const dominant=/\b(dominant|dom)\b/.test(text), perfect=/\b(perfect|perf)\b/.test(text);
  const flat=/\b(flat|flattened)\b/.test(text), sharp=/\b(sharp|sharpened)\b/.test(text);
  const qualities=[major,minor,diminished,augmented,dominant,perfect,flat,sharp].filter(Boolean).length;
  if(qualities>1)return null;
  const patterns=[
    [2,/\b(second|2nd|two|2)\b/], [3,/\b(third|3rd|three|3)\b/],
    [4,/\b(fourth|4th|four|4)\b/], [5,/\b(fifth|5th|five|5)\b/],
    [6,/\b(sixth|6th|six|6)\b/], [7,/\b(seventh|7th|seven|7)\b/],
    [8,/\b(octave|eighth|8th|eight|8)\b/], [9,/\b(ninth|9th|nine|9)\b/]
  ];
  const degrees=patterns.filter(([,re])=>re.test(text)).map(([n])=>n);
  if(mode!=='chord'){
    const semis=text.match(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\s+(?:semi\s?tones?|half\s?steps?)\b/);
    if(semis){const words=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];const n=/^\d+$/.test(semis[1])?Number(semis[1]):words.indexOf(semis[1]);return pool.find(p=>p.n===n)||null}
    if(/\b(tritone|tri tone)\b/.test(text)||((augmented||sharp)&&degrees.length===1&&degrees[0]===4)||((diminished||flat)&&degrees.length===1&&degrees[0]===5))return pool.find(p=>p.n===6)||null;
    if(/\b(half step|half tone|semitone|semi tone)\b/.test(text))return pool.find(p=>p.n===1)||null;
    if(/\b(whole step|whole tone)\b/.test(text))return pool.find(p=>p.n===2)||null;
    if(degrees.length!==1)return null;
    const degree=degrees[0];let n=null;
    if(degree===8&&!minor&&!diminished&&!augmented&&!flat&&!sharp&&!dominant)n=12;
    else if(degree===4&&!major&&!minor&&!diminished&&!flat&&!dominant)n=5;
    else if(degree===5&&!major&&!minor&&!augmented&&!sharp&&!dominant)n=7;
    else if([2,3,6,7].includes(degree)&&!diminished&&!augmented&&!dominant&&!perfect&&!sharp){
      const natural={2:2,3:4,6:9,7:11}[degree];
      if(minor||flat)n=natural-1;else if(major)n=natural;
    }
    return pool.find(p=>p.n===n)||null;
  }
  if(degrees.length>1)return null;
  const d=degrees[0];let name=null;
  if(d===7||d===9){if(major)name=`Major ${d}th`;else if(minor)name=`Minor ${d}th`;else if(dominant||qualities===0)name=`Dominant ${d}th`}
  else if(!d||d===3){if(major)name='Major';else if(minor)name='Minor';else if(diminished)name='Diminished';else if(augmented)name='Augmented'}
  return pool.find(p=>p.name===name)||null;
}
function handleVoice(results){const spoken=results.map(normalize);if(spoken.some(x=>/\b(repeat|replay|again)\b/.test(x))){replay();return}if(spoken.some(x=>/\b(skip|pass)\b/.test(x))){skip();return}if(spoken.some(x=>/\b(stop|quit|exit)\b/.test(x))){endGame();return}let choice=null;for(const text of spoken){choice=parseAnswer(text,levels[selected].pool,levels[selected].mode);if(choice)break}if(choice){answer(choice)}else{status('Not quite sure what you said','Try a full name, like “minor third”, or say “repeat”.');announce('I didn’t catch that. Please try the full name.',listen)}}
function cancelSpeech(){speechToken++;clearTimeout(speechTimer);if('speechSynthesis' in window)window.speechSynthesis.cancel()}
function announce(text,after){cancelSpeech();const token=speechToken;let done=false;const finish=()=>{if(done||token!==speechToken||!active)return;done=true;clearTimeout(speechTimer);after()};if(!('speechSynthesis' in window)){speechTimer=setTimeout(finish,1800);return}let utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-GB';utterance.rate=1.05;utterance.onend=finish;utterance.onerror=finish;speechTimer=setTimeout(finish,6000);window.speechSynthesis.speak(utterance)}
function tone(freq,start,duration){
  // Oscillator-based timbres, not sampled acoustic instruments. Keep chord peaks modest.
  const timbres={
    'soft-keys':{attack:.012,decay:true,partials:[[1,.105],[2,.028],[3,.012],[4,.005]]},
    mellow:{attack:.035,decay:true,partials:[[1,.15,'triangle']]},
    sine:{attack:.025,decay:false,partials:[[1,.14]]},
    organ:{attack:.04,decay:false,partials:[[1,.10],[2,.027],[3,.014],[4,.007]]}
  };
  const sound=timbres[instrument]||timbres['soft-keys'];
  for(const [ratio,volume,type] of sound.partials){
    const osc=audio.createOscillator(),gain=audio.createGain();osc.type=type||'sine';osc.frequency.value=freq*ratio;
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+sound.attack);
    if(sound.decay)gain.gain.exponentialRampToValueAtTime(volume*.2,start+Math.max(sound.attack+.01,duration-.08));
    else gain.gain.setValueAtTime(volume,start+duration-.08);
    gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(gain);gain.connect(audio.destination);osc.start(start);osc.stop(start+duration+.02);
  }
}
async function previewSound(){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();await audio.resume();const t=audio.currentTime+.05;tone(261.63,t,.7);tone(329.63,t+.85,.7)}catch{alert('Audio could not start. Check your browser and sound settings.')}}
function play(){if(!active||!current)return;cancelSpeech();stopListening();const token=++run;clearTimeout(timer);$('transcript').textContent='';status('Listen closely','Name what you hear when the notes finish.');let l=levels[selected],t=audio.currentTime+.12,root=current.root,notes=l.mode==='chord'?current.item.notes:[0,current.item.n],duration;if(l.mode==='down')notes=[current.item.n,0];if(l.mode==='up'||l.mode==='down'){notes.forEach((n,i)=>tone(440*Math.pow(2,(root+n-69)/12),t+i*.85,.7));duration=1900}else{notes.forEach(n=>tone(440*Math.pow(2,(root+n-69)/12),t,1.35));duration=1700}timer=setTimeout(()=>{if(active&&token===run)listen()},duration)}
function next(){if(!active)return;clearTimeout(timer);stopListening();const pool=levels[selected].pool;let item=pool[Math.floor(Math.random()*pool.length)];if(current&&pool.length>1)while(item===current.item)item=pool[Math.floor(Math.random()*pool.length)];current={item,root:48+Math.floor(Math.random()*13)};attempts=0;question++;$('questionNumber').textContent=String(question).padStart(2,'0');$('answerButtons').innerHTML='';pool.forEach(p=>{let b=document.createElement('button');b.textContent=p.name;b.addEventListener('click',()=>answer(p));$('answerButtons').append(b)});play()}
function answer(item){if(!active||!current)return;stopListening();++run;clearTimeout(timer);if(item===current.item){const points=Math.max(20,100-attempts*20);sessionScore+=points;streak++;progress.score+=points;progress.correct[selected]++;progress.best=Math.max(progress.best,streak);save();render();$('streak').textContent=streak;$('sessionScore').textContent=sessionScore;const completed=progress.correct[selected]===5;const correctName=current.item.name;status('That’s right! +'+points,'It was '+correctName+'. Next one coming up.');$('transcript').textContent='';current=null;announce('Correct. '+points+' points. '+(completed&&selected<levels.length-1?'Level complete. The next level is unlocked. ': '')+'Next question.',next)}else{attempts++;streak=0;$('streak').textContent=0;status('Not quite — try again','Say another answer, or say “repeat”.');announce('Not quite. Try again.',listen)}}
function replay(){if(!active||!current)return;attempts++;play()}
function skip(){if(!active||!current)return;stopListening();++run;clearTimeout(timer);streak=0;$('streak').textContent=0;const name=current.item.name;status('On to the next','That was '+name+'.');current=null;announce('That was '+name+'. Next question.',next)}
async function start(){
  if(active)return;
  active=true;touchOnly=false;question=0;streak=0;sessionScore=0;current=null;const token=++sessionToken;setupAbort=new AbortController();
  $('streak').textContent='0';$('sessionScore').textContent='0';$('gameTitle').textContent=levels[selected].title;$('gameLevelNumber').textContent='· LEVEL '+String(selected+1).padStart(2,'0');$('gameModal').classList.remove('hidden');$('touchOnlyBtn').classList.add('hidden');$('micBtn').disabled=true;$('repeatBtn').disabled=true;$('skipBtn').disabled=true;$('answerButtons').innerHTML='';
  try{
    audio=audio||new (window.AudioContext||window.webkitAudioContext)();await audio.resume();
    if(!navigator.mediaDevices?.getUserMedia||!window.Vosk)throw new Error('Microphone or voice engine unavailable');
    status('Allow the microphone','Grant access while parked to use voice commands.');
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,channelCount:1},video:false});
    if(!active||token!==sessionToken){stream.getTracks().forEach(t=>t.stop());return}micStream=stream;
    if(!model||!model.ready)await loadVoiceModel(setupAbort.signal);if(!active||token!==sessionToken)return;
    micSource=audio.createMediaStreamSource(micStream);micProcessor=audio.createScriptProcessor(4096,1,1);micSilence=audio.createGain();micSilence.gain.value=0;
    micProcessor.onaudioprocess=e=>{if(active&&listenWanted&&recognizer){try{recognizer.acceptWaveform(e.inputBuffer)}catch(err){console.error(err)}}};
    micSource.connect(micProcessor);micProcessor.connect(micSilence);micSilence.connect(audio.destination);
    micStream.getAudioTracks().forEach(track=>track.addEventListener('ended',()=>{if(active){stopListening();status('Microphone disconnected','End the session and reconnect while parked.');$('touchOnlyBtn').classList.remove('hidden')}}));
    $('micBtn').disabled=false;$('repeatBtn').disabled=false;$('skipBtn').disabled=false;next();
  }catch(e){
    if(!active||token!==sessionToken)return;releaseVoice();console.error(e);status('Voice setup failed',e.name==='NotAllowedError'?'Allow microphone access in Chrome, then start a new session while parked.':'Check your connection and microphone, then start a new session while parked.');$('touchOnlyBtn').classList.remove('hidden');
  }
}
function endGame(){active=false;sessionToken++;if(setupAbort)setupAbort.abort();setupAbort=null;cancelSpeech();run++;clearTimeout(timer);releaseVoice(Boolean(model&&model.ready));current=null;$('gameModal').classList.add('hidden');render()}
function continueTouchOnly(){if(!active)return;cancelSpeech();clearTimeout(timer);if(setupAbort)setupAbort.abort();releaseVoice();touchOnly=true;$('touchOnlyBtn').classList.add('hidden');$('micBtn').disabled=true;$('repeatBtn').disabled=false;$('skipBtn').disabled=false;if(!current)next();else status('Use touch answers','Voice is unavailable. Only use touch controls while parked.')}
$('touchOnlyBtn').onclick=continueTouchOnly;$('previewInstrument').onclick=previewSound;$('startBtn').onclick=start;$('closeGame').onclick=endGame;$('repeatBtn').onclick=replay;$('skipBtn').onclick=skip;$('micBtn').onclick=()=>{if(active&&current)listen()};$('helpBtn').onclick=()=>$('helpModal').classList.remove('hidden');$('closeHelp').onclick=()=>$('helpModal').classList.add('hidden');$('resetBtn').onclick=()=>$('resetConfirm').classList.remove('hidden');$('cancelReset').onclick=()=>$('resetConfirm').classList.add('hidden');$('confirmReset').onclick=()=>{progress={score:0,correct:[0,0,0,0,0],best:0};selected=0;save();render();$('resetConfirm').classList.add('hidden')};render();
