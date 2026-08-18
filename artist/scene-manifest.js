(function(){
'use strict';
const base='../assets/kxtxr-video/corpus/';
const plateBase='../assets/kxtxr-video/plates/';
const V={a:'../assets/stairwell-shadow-021.mp4',b:'../assets/traffic-white-112.mp4',c:'../assets/easter_egg.mpeg'};
const I=file=>file?base+file.replace(/\.webp$/,'.svg'):'';
const P=file=>'';
const chapters=[
  {
    id:'entry',code:'00',label:'ENTRY',title:'KXTXR',kicker:'THE ARTIST TO BE THAT ALREADY WAS',copy:'Scroll does not open pages. It changes the state of the same world.',span:140,align:'center',plate:'kxtxr-title.png',
    shots:[
      {at:[0,.45],bg:I('image-gen-1-20260818-015745.webp'),plate:P('kxtxr-title.png'),kaiju:I('image-gen-8-20260818-014852.webp'),footage:'a'},
      {at:[.45,1],bg:I('image-gen-1-20260818-014840.webp'),plate:P('kxtxr-title.png'),actor:I('image-gen-3-20260818-015747.webp'),propA:I('image-gen-3-20260818-022740.webp'),footage:'a'}
    ]
  },
  {
    id:'origin',code:'01',label:'ORIGIN',title:'BEFORE THE NAME',kicker:'A ROOM / A BODY / A SIGNAL NOT YET DECLARED',copy:'The environment is ordinary. The persistence is not.',span:210,align:'left',plate:'before-the-name.png',
    shots:[
      {at:[0,.33],bg:I('image-gen-1-20260818-014840.webp'),plate:P('before-the-name.png'),actor:I('image-gen-2-20260818-020524.webp'),propA:I('image-gen-2-20260818-023737.webp')},
      {at:[.33,.66],bg:I('image-gen-1-20260818-015745.webp'),plate:P('before-the-name.png'),actor:I('image-gen-4-20260818-014845.webp'),propA:I('image-gen-3-20260818-015236.webp')},
      {at:[.66,1],bg:I('image-gen-1-20260818-015745.webp'),actor:I('image-gen-3-20260818-022357.webp'),propA:I('image-gen-4-20260818-015237.webp'),propB:I('image-gen-5-20260818-015240.webp')}
    ]
  },
  {
    id:'signal',code:'02',label:'REM618',title:'REM 618',kicker:'THE FIRST CARRIER',copy:'A fragment survives contact with time and becomes observable.',span:230,align:'right',plate:'rem618.png',
    shots:[
      {at:[0,.34],bg:I('image-gen-2-20260818-014842.webp'),plate:P('rem618.png'),propA:I('image-gen-3-20260818-022740.webp'),propB:I('image-gen-8-20260818-015249.webp'),footage:'c'},
      {at:[.34,.68],bg:I('image-gen-2-20260818-014842.webp'),plate:P('rem618.png'),propA:I('image-gen-6-20260818-022401.webp'),propB:I('image-gen-4-20260818-022741.webp'),actor:I('image-gen-4-20260818-015748.webp')},
      {at:[.68,1],bg:I('image-gen-1-20260818-015234.webp'),propA:I('image-gen-6-20260818-022744.webp'),propB:I('image-gen-10-20260818-022410.webp'),footage:'c'}
    ]
  },
  {
    id:'assembly',code:'03',label:'ASSEMBLY',title:'THE PARTS BEGIN TO RETURN',kicker:'INSTRUMENT / MEMORY / RESIDUE / ROUTE',copy:'Nothing resets. Previous objects remain available to the next state.',span:255,align:'left',plate:'parts-begin-to-return.png',
    shots:[
      {at:[0,.25],bg:I('image-gen-1-20260818-015745.webp'),plate:P('parts-begin-to-return.png'),actor:I('image-gen-4-20260818-015748.webp'),propA:I('image-gen-3-20260818-015236.webp'),propB:I('image-gen-4-20260818-015237.webp')},
      {at:[.25,.5],bg:I('image-gen-1-20260818-015745.webp'),plate:P('parts-begin-to-return.png'),actor:I('image-gen-5-20260818-020527.webp'),propA:I('image-gen-5-20260818-015240.webp'),propB:I('image-gen-6-20260818-015243.webp')},
      {at:[.5,.75],bg:I('image-gen-1-20260818-023736.webp'),actor:I('image-gen-7-20260818-020529.webp'),propA:I('image-gen-7-20260818-015245.webp'),propB:I('image-gen-8-20260818-022406.webp')},
      {at:[.75,1],bg:I('image-gen-1-20260818-022738.webp'),actor:I('image-gen-9-20260818-020531.webp'),propA:I('image-gen-2-20260818-022739.webp'),propB:I('image-gen-7-20260818-022745.webp')}
    ]
  },
  {
    id:'kxtxr',code:'04',label:'IDENTITY',title:'THE NAME ARRIVES LATE',kicker:'IDENTITY AS A PERSISTENT CONFIGURATION',copy:'KXTXR is not an introduction. It is the visible state of what was already operating.',span:250,align:'right',plate:'name-arrives-late.png',
    shots:[
      {at:[0,.25],bg:I('image-gen-5-20260818-022400.webp'),plate:P('name-arrives-late.png'),actor:I('image-gen-1-20260818-020522.webp'),propA:I('image-gen-2-20260818-023737.webp')},
      {at:[.25,.5],bg:I('image-gen-5-20260818-022400.webp'),plate:P('name-arrives-late.png'),actor:I('image-gen-10-20260818-020532.webp'),propA:I('image-gen-10-20260818-022410.webp')},
      {at:[.5,.75],bg:I('image-gen-1-20260818-015234.webp'),actor:I('image-gen-4-20260818-022359.webp'),propA:I('image-gen-3-20260818-015236.webp')},
      {at:[.75,1],bg:I('image-gen-3-20260818-014843.webp'),actor:I('image-gen-7-20260818-014849.webp'),propA:I('image-gen-2-20260818-023737.webp')}
    ]
  },
  {
    id:'one11',code:'05',label:'111',title:'TRANSFORMATION',kicker:'THE SIGNAL CHANGES WITHOUT DISAPPEARING',copy:'111 conducts the passage. The world reorganizes around the same carrier.',span:290,align:'center',plate:'transformation.png',
    shots:[
      {at:[0,.33],bg:I('image-gen-5-20260818-022400.webp'),plate:P('transformation.png'),actor:I('image-gen-5-20260818-015750.webp'),propA:I('image-gen-5-20260818-022743.webp')},
      {at:[.33,.66],bg:I('image-gen-1-20260818-015234.webp'),plate:P('transformation.png'),actor:I('image-gen-6-20260818-014848.webp'),propA:I('image-gen-6-20260818-022744.webp'),propB:I('image-gen-8-20260818-022746.webp'),footage:'b'},
      {at:[.66,1],bg:I('image-gen-1-20260818-015234.webp'),actor:I('image-gen-5-20260818-014846.webp'),propA:I('image-gen-5-20260818-022743.webp'),propB:I('image-gen-9-20260818-015755.webp')}
    ]
  },
  {
    id:'propagation',code:'06',label:'PROPAGATION',title:'PROPAGATION',kicker:'THE SIGNAL LEAVES THE SOURCE',copy:'Distribution is treated as part of the work: carriers, traces, platforms and return paths.',span:250,align:'right',plate:'propagation.png',
    shots:[
      {at:[0,.34],bg:I('image-gen-1-20260818-015234.webp'),plate:P('propagation.png'),propA:I('image-gen-6-20260818-022744.webp'),propB:I('image-gen-7-20260818-022745.webp'),footage:'b'},
      {at:[.34,.67],bg:I('image-gen-2-20260818-015235.webp'),plate:P('propagation.png'),actor:I('image-gen-6-20260818-020528.webp'),propA:I('image-gen-6-20260818-022401.webp'),propB:I('image-gen-9-20260818-022408.webp')},
      {at:[.67,1],bg:I('image-gen-3-20260818-014843.webp'),actor:I('image-gen-7-20260818-014849.webp'),propA:I('image-gen-8-20260818-015249.webp'),footage:'b'}
    ]
  },
  {
    id:'performance',code:'07',label:'CONTACT',title:'THE ROOM BECOMES A STAGE',kicker:'ONE BODY / MANY ROLES / ONE SIGNAL',copy:'The performer persists while architecture, scale and audience replace the room.',span:280,align:'left',
    shots:[
      {at:[0,.34],bg:I('image-gen-3-20260818-014843.webp'),actor:I('image-gen-3-20260818-020525.webp'),propA:I('image-gen-2-20260818-023737.webp')},
      {at:[.34,.67],bg:I('image-gen-3-20260818-014843.webp'),actor:I('image-gen-7-20260818-014849.webp'),propA:I('image-gen-2-20260818-015235.webp')},
      {at:[.67,1],bg:I('image-gen-2-20260818-015235.webp'),actor:I('image-gen-6-20260818-020528.webp'),propA:I('image-gen-7-20260818-015245.webp')}
    ]
  },
  {
    id:'firstshow',code:'08',label:'FIRST SHOW',title:'GODZILLA + KXTXR',kicker:'THE OBSERVER ENTERS THE SAME FRAME AS THE SIGNAL',copy:'The first show is the first public contact between the carrier, the creature and the field.',span:320,align:'center',
    shots:[
      {at:[0,.2],bg:I('image-gen-3-20260818-014843.webp'),actor:I('image-gen-7-20260818-014849.webp'),kaiju:I('image-gen-8-20260818-014852.webp')},
      {at:[.2,.4],bg:I('image-gen-3-20260818-014843.webp'),actor:I('image-gen-7-20260818-014849.webp'),kaiju:I('image-gen-7-20260818-015752.webp')},
      {at:[.4,.6],bg:I('image-gen-3-20260818-014843.webp'),actor:I('image-gen-7-20260818-014849.webp'),kaiju:I('image-gen-8-20260818-015754.webp'),sfx:I('image-gen-9-20260818-015755.webp')},
      {at:[.6,.8],bg:I('image-gen-2-20260818-015235.webp'),duet:I('image-gen-6-20260818-015751.webp'),kaiju:I('image-gen-9-10.webp'),sfx:I('image-gen-10-20260818-015757.webp')},
      {at:[.8,1],bg:I('image-gen-2-20260818-015235.webp'),duet:I('image-gen-6-20260818-015751.webp'),kaiju:I('image-gen-9-9.webp')}
    ]
  },
  {
    id:'return',code:'09',label:'RETURN',title:'WHAT SURVIVES COMES BACK CHANGED',kicker:'EVIDENCE-BEARING PASSAGE',copy:'Earlier states re-enter the frame as residue instead of nostalgia.',span:245,align:'left',plate:'what-survives.png',
    shots:[
      {at:[0,.34],bg:I('image-gen-1-20260818-015745.webp'),plate:P('what-survives.png'),propA:I('image-gen-3-20260818-022740.webp'),propB:I('image-gen-2-20260818-023737.webp')},
      {at:[.34,.67],bg:I('image-gen-5-20260818-022400.webp'),plate:P('what-survives.png'),propA:I('image-gen-8-20260818-022746.webp'),propB:I('image-gen-9-20260818-022747.webp')},
      {at:[.67,1],bg:I('image-gen-1-20260818-014840.webp'),actor:I('image-gen-3-20260818-015747.webp'),propA:I('image-gen-8-20260818-015249.webp')}
    ]
  },
  {
    id:'resolution',code:'10',label:'RESOLUTION',title:'THE STORY BECOMES A ROUTE',kicker:'SIGNAL / STORY / RETURN',copy:'Nothing disappears. The room, REM618, 111, the first show and every object remain addressable in the next state.',span:205,align:'center',plate:'kxtxr-title.png',
    shots:[
      {at:[0,.5],bg:I('image-gen-1-20260818-015234.webp'),plate:P('kxtxr-title.png'),propA:I('image-gen-3-20260818-022740.webp'),propB:I('image-gen-5-20260818-022743.webp')},
      {at:[.5,1],bg:I('image-gen-1-20260818-023736.webp'),plate:P('kxtxr-title.png'),propA:I('image-gen-2-20260818-023737.webp'),footage:'a'}
    ]
  }
];
window.KXTXR_SIGNAL_FILM={chapters,videos:V};
})();
