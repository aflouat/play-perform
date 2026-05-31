import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { IconBookOpen, IconFlask, IconUsers, IconHeart, IconCircleDot, IconCalendarStats, IconStar, IconMessage2, IconFileCode, IconArrowUpRight, IconExternalLink, IconArticle, IconBuildingSkyscraper, IconSailboat, IconRocket } from '@tabler/icons-react';

// Unified Color Palette (maintained for sleekness)
const colors = {
  bg: '#111827', // slate-900
  cardBg: '#1f2937', // slate-800
  text: '#f3f4f6', // slate-100
  subText: '#9ca3af', // slate-400
  lab: '#38bdf8', // sky-400 (unchanged)
  clubs: '#a855f7', // purple-500 (cosmic purple - unchanged)
  clubsAlt: '#f97316', // orange-500 (astral orange - unchanged)
  hub: '#4ade80', // emerald-400 (unchanged)
};

const fontStack = "'Geist', 'Inter', sans-serif";

// --- NEW DATA STRUCTURES REFLECTING WORLDS AND CONSTRUCTION ---

const constructiveActivityData = [
  { day: 'Mon', labBricks: 5, clubsBricks: 1, hubBlueprints: 2 },
  { day: 'Tue', labBricks: 10, clubsBricks: 3, hubBlueprints: 3 },
  { day: 'Wed', labBricks: 15, clubsBricks: 5, hubBlueprints: 4 },
  { day: 'Thu', labBricks: 18, clubsBricks: 7, hubBlueprints: 5 },
  { day: 'Fri', labBricks: 18, clubsBricks: 9, hubBlueprints: 6 },
  { day: 'Sat', labBricks: 20, clubsBricks: 10, hubBlueprints: 6 },
  { day: 'Sun', labBricks: 22, clubsBricks: 10, hubBlueprints: 6 },
];

const mockData = {
  // Lab World construction focus
  labWorld: {
    project: 'The Code Fortress', // User's chosen structure
    icon: IconBuildingSkyscraper,
    modules: [
        { title: 'Build a Discord Bot in Python', progress: 80, deadline: '2 days', bricksAdded: 15 },
        { title: 'Deploy a Next.js SaaS', progress: 45, deadline: '1 week', bricksAdded: 12 },
        { title: 'React Performance Audit', progress: 95, deadline: 'Tomorrow', bricksAdded: 5 },
    ],
  },
  // Club World construction focus
  clubWorld: {
    project: 'The Collaboration Pirate Ship',
    icon: IconSailboat,
    clubAstronomy: {
        board: [
            { role: 'Ship Architect', name: 'Alara K.' },
            { role: 'Deck Hand / Tech', name: 'Kenji T.' },
        ],
        piece: 'Interactive Black Hole Guide Module', // A component of the larger project
        bricks: 10,
    },
  },
  // Hub World (Blueprints/Inspiration focus)
  hubWorld: {
    project: 'The Deep Space Star Base',
    icon: IconRocket,
    blueprints: [
        { type: 'video', source: 'Arte', title: 'Synthesize Design: The Rise of AI in Art', label: 'documentary', id: 'ai-art' },
        { type: 'text', title: 'Blueprint: Consumer Psychology', heading: 'Structure of Choice', text: 'Apply confirmation bias, anchoring, and social proof blueprints to interface design...', id: 'biases' },
        { type: 'comic', title: 'Creative Spark Brick: Commit Realities', source: 'xkcd (adapt)', id: 'comic-1' },
        { type: 'text', title: 'Strategy Blueprint: Pitch Decks', heading: 'Structure 10 Mandatory Slides', text: 'Replicate winning deck structures from Airbnb, Coinbase. Apply problem/solution alignment blueprints...', id: 'pitch-decks' },
    ],
  },
};

// --- UPDATED SUB-COMPONENTS ---

const ConstructionProgressGauges = () => (
  <div className="space-y-4">
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Project Progress</div>
    {[
      { label: 'Lab World: The Code Fortress', color: colors.lab, bricks: constructiveActivityData[constructiveActivityData.length - 1].labBricks, goalBricks: 50, icon: mockData.labWorld.icon },
      { label: 'Club World: The Pirate Ship', color: colors.clubs, bricks: constructiveActivityData[constructiveActivityData.length - 1].clubsBricks, goalBricks: 25, icon: mockData.clubWorld.icon },
      { label: 'Hub World: The Star Base', color: colors.hub, bricks: constructiveActivityData[constructiveActivityData.length - 1].hubBlueprints, goalBricks: 15, icon: mockData.hubWorld.icon },
    ].map((item, index) => (
      <div key={index} className="space-y-1.5 p-3 rounded-lg bg-gray-900 border border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold flex items-center gap-1.5" style={{ color: item.color }}>
            <item.icon size={18} stroke={2}/>
            {item.label}
          </span>
          <span className="font-mono text-xs text-gray-400">{item.bricks} / {item.goalBricks} Bricks</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out absolute left-0 top-0"
            style={{ width: `${(item.bricks / item.goalBricks) * 100}%`, backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}80` }}
          />
        </div>
      </div>
    ))}
  </div>
);

const UserProfile = () => (
  <div className="flex items-center gap-4 p-4 mb-6 rounded-2xl bg-gray-800 border border-gray-700 shadow-xl">
    <div className="relative">
      <img src="https://via.placeholder.com/64x64/22d3ee/ffffff?text=EL" alt="User Avatar" className="w-16 h-16 rounded-full border-2 border-cyan-500" />
      <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full ring-2 ring-gray-800 bg-emerald-500" />
    </div>
    <div>
      <div className="text-xl font-bold tracking-tight text-white">Elias Thorne</div>
      <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-cyan-300 border border-gray-600">
        🧱 <span className="uppercase tracking-wide font-bold">Master Builder - Level 14</span>
      </div>
    </div>
  </div>
);

const WorldCard = ({ title, icon: Icon, color, children, worldProjectName, worldIcon: WorldIcon }) => (
  <div className={`p-6 rounded-2xl bg-gray-800 border shadow-2xl transition-all duration-300 hover:border-${color}/50`} style={{ borderColor: `${color}1A` }}>
    <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b" style={{ borderColor: `${color}26` }}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl`} style={{ backgroundColor: `${color}1A`, color: color }}>
          <Icon size={28} stroke={1.5} />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tighter text-white">{title}</h2>
      </div>
       {worldIcon && worldProjectName && (
        <div className="flex items-center gap-1.5 text-sm font-semibold p-1.5 px-3 rounded-lg border border-gray-700" style={{color}}>
            <WorldIcon size={18}/>
            {worldProjectName}
        </div>
      )}
    </div>
    {children}
  </div>
);

const BlueprintCard = ({ blueprint }) => {
  const baseClass = "p-5 rounded-xl border border-gray-700 hover:border-emerald-500/50 transition-colors bg-gray-900/50";
  const brickIndicator = <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-black/70 text-emerald-300 border border-emerald-900/80">Blueprint Gained</span>

  if (blueprint.type === 'video') {
    return (
      <div className={baseClass}>
        <div className="relative aspect-video rounded-lg overflow-hidden mb-4 border border-gray-700">
          <img src={`https://via.placeholder.com/400x225/10b981/ffffff?text=${blueprint.source}+Vid`} alt={blueprint.title} className="w-full h-full object-cover" />
          {brickIndicator}
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-black/70 text-emerald-300">{blueprint.label}</span>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-500 text-white text-3xl">▶</div>
          </div>
        </div>
        <h4 className="font-semibold text-white text-lg leading-tight">{blueprint.title}</h4>
        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5"><IconArrowUpRight size={16}/> Source: {blueprint.source}</p>
      </div>
    );
  }
  if (blueprint.type === 'text') {
    return (
      <div className={baseClass}>
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-700">
            <IconArticle size={32} className='text-emerald-400' />
            <h4 className="font-semibold text-white text-lg leading-tight flex-1">{blueprint.title}</h4>
        </div>
        <div className='relative p-2 rounded-lg bg-gray-900/50 border border-gray-700 mt-2'>
            {brickIndicator}
            <h5 className="font-bold text-base text-gray-100 mt-8 mb-2 px-2">{blueprint.heading}</h5>
            <p className="text-sm text-gray-300 mb-2 leading-relaxed line-clamp-3 px-2">{blueprint.text}</p>
        </div>
        <button className='mt-4 text-sm font-semibold text-emerald-400 flex items-center gap-1 hover:text-emerald-300'>Read Full Synthesis <IconArrowUpRight size={16}/></button>
      </div>
    );
  }
  if (blueprint.type === 'comic') {
      return (
          <div className={`${baseClass} space-y-3`}>
              <div className='flex justify-between items-start'>
                <h4 className="font-semibold text-white text-lg leading-tight flex-1">Creative Brick: {blueprint.title}</h4>
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-gray-700 text-emerald-300">COMIC</span>
              </div>
              <img src="https://via.placeholder.com/400x150/111827/10b981?text=Commit+Msg+Realities+(xkcd+adapt)" alt={blueprint.title} className="w-full rounded border border-gray-700" />
              <button className='text-sm font-semibold text-emerald-400 flex items-center gap-1 hover:text-emerald-300'>View on source <IconExternalLink size={16}/></button>
          </div>
      );
  }
  return null;
};

// --- MAIN DASHBOARD COMPONENT ---

function SynthEduDashboardWorlds() {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-6 font-sans antialiased text-gray-100" style={{ background: colors.bg, fontFamily: fontStack }}>
      
      {/* HEADER */}
      <header className="flex items-center justify-between mb-10 pb-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black tracking-tighter text-white">SYNTH<span className="text-cyan-400">.</span>EDU</div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-800 text-cyan-400 border border-gray-700">WORLDS_ACADEMY</span>
        </div>
        
        <div className="flex items-center gap-6">
            {/* UPDATED: Construction Activity Status */}
            <div className={`flex items-center gap-2 text-sm font-medium transition-all duration-500 ${pulse ? 'opacity-100' : 'opacity-80'} p-2 px-4 rounded-xl border ${pulse ? 'border-emerald-800' : 'border-gray-700'}`} style={{ backgroundColor: `${colors.hub}05` }}>
                <IconHeart className="text-emerald-400" fill={pulse ? colors.hub : 'none'} size={20} />
                <span className={`${pulse ? 'text-emerald-300' : 'text-gray-400'}`}>Constructive Synthesis Active</span>
                <IconCircleDot className='text-gray-600'/>
            </div>
            <div className="flex items-center gap-3">
                <IconMessage2 className="text-gray-400 hover:text-white cursor-pointer"/>
                <IconCalendarStats className="text-gray-400 hover:text-white cursor-pointer"/>
                <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 flex items-center gap-2">
                    <IconBuildingSkyscraper size={18}/> Review Sprints
                </button>
            </div>
        </div>
      </header>

      {/* GLOBAL LAYOUT (Sidebar + Main) */}
      <div className="flex gap-8">
        
        {/* SIDEBAR */}
        <aside className="w-80 space-y-8 flex-shrink-0">
          <UserProfile />
          <div className="p-6 rounded-2xl bg-gray-800 border border-gray-700 space-y-6">
            <ConstructionProgressGauges />
            <div className="pt-6 border-t border-gray-700 h-40">
                <div className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>Constructive Activity Last 7 Days</div>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={constructiveActivityData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorLab" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.lab} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={colors.lab} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorClubs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.clubs} stopOpacity={0.6}/>
                                <stop offset="95%" stopColor={colors.clubs} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{background: colors.cardBg, borderColor: colors.subText, borderRadius: '8px'}} cursor={{ stroke: colors.subText }}/>
                        <Area type="monotone" dataKey="labBricks" stroke={colors.lab} fillOpacity={1} fill="url(#colorLab)" strokeWidth={2} name="Lab Bricks" />
                        <Area type="monotone" dataKey="clubsBricks" stroke={colors.clubs} fillOpacity={1} fill="url(#colorClubs)" strokeWidth={2} name="Club Bricks" />
                        <Area type="monotone" dataKey="hubBlueprints" stroke={colors.hub} strokeWidth={2} fill='none' name="Hub Blueprints" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>
          
          <nav className="p-5 rounded-2xl bg-gray-800 border border-gray-700">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Worlds Directory</div>
            {[
              { label: 'Academy Overview', icon: IconBookOpen },
              { label: 'Lab World (Fortress)', icon: IconBuildingSkyscraper, current: true, color: colors.lab },
              { label: 'Club World (Ship)', icon: IconSailboat, color: colors.clubs },
              { label: 'Hub World (Base)', icon: IconRocket, color: colors.hub },
              { label: 'Construction Plan', icon: IconFileCode },
            ].map(link => (
              <a key={link.label} href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${link.current ? 'bg-cyan-950 text-cyan-100' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}>
                <link.icon size={20} stroke={link.current ? 2 : 1.5} style={link.current ? {color: link.color} : {}} />
                <span className={`font-semibold ${link.current ? '' : 'font-medium'}`}>{link.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* MAIN DASHBOARD */}
        <main className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr,1.3fr] gap-8">
            <div className="space-y-8">
                {/* ZONE 1 CARD (Lab World) */}
                <WorldCard title="Lab World" icon={IconFlask} color={colors.lab} worldProjectName={mockData.labWorld.project} worldIcon={mockData.labWorld.icon}>
                    <div className="space-y-4">
                        {mockData.labWorld.modules.map((proj, idx) => (
                            <div key={idx} className="p-5 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-between gap-4 transition-colors hover:border-cyan-500/50 relative">
                                <div className='flex-1'>
                                    <h4 className="font-semibold text-white">{proj.title}</h4>
                                    <p className="text-sm text-gray-400 mt-1">Brick Deadline: <span className='text-gray-100 font-medium'>{proj.deadline}</span></p>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className="relative w-16 h-16">
                                        <svg viewBox="0 0 36 36" className="w-full h-full text-cyan-400">
                                            <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                                            <path className="text-cyan-400" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeDasharray={`${proj.progress}, 100`} strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold">{proj.progress}%</div>
                                    </div>
                                    <IconArrowUpRight className="text-gray-600 hover:text-cyan-400 cursor-pointer"/>
                                </div>
                                 <span className="absolute top-2 left-2 px-2.5 py-0.5 text-xs font-bold rounded-md bg-gray-700 text-sky-300 border border-gray-600 whitespace-nowrap">🧩 {proj.bricksAdded} Bricks Modules</span>
                            </div>
                        ))}
                        <button className="w-full mt-2 py-3 rounded-xl bg-cyan-950/50 text-cyan-300 font-semibold border border-cyan-800 hover:bg-cyan-900/60 flex items-center justify-center gap-2">
                           <IconFlask size={18}/> Review All World Modules
                        </button>
                    </div>
                </WorldCard>

                {/* ZONE 2 CARD (Club World) */}
                <WorldCard title="Club World" icon={IconUsers} color={colors.clubs} worldProjectName={mockData.clubWorld.project} worldIcon={mockData.clubWorld.icon}>
                    <div className="space-y-5">
                        <div className="p-5 rounded-xl border-2" style={{borderColor: `${colors.clubs}33`, background: `linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(249,115,22,0.05) 100%)`}}>
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">Club Astronomy <IconStar fill={colors.clubsAlt} className='text-orange-400'/></h3>
                                <button className='text-xs font-semibold px-3 py-1 rounded bg-gray-700 text-purple-300 border border-gray-600'>View All Hubs</button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-gray-900/70 border border-gray-700">
                                    <div className="text-sm font-medium text-purple-300 mb-3 uppercase tracking-wider">Elected Constructor Board</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {mockData.clubWorld.clubAstronomy.board.map(mem => (
                                            <div key={mem.name} className='flex items-center gap-3'>
                                                <img src={`https://via.placeholder.com/40x40/f97316/ffffff?text=${mem.name.split(' ')[0][0]}`} className='w-10 h-10 rounded-full border border-gray-600'/>
                                                <div>
                                                    <div className='text-sm font-semibold text-white'>{mem.name}</div>
                                                    <div className='text-xs text-orange-300 font-medium'>{mem.role}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-900/70 border border-gray-700 flex items-center gap-4 relative">
                                    <div className='p-2.5 rounded-lg text-orange-400' style={{backgroundColor: `${colors.clubsAlt}1A`}}><IconFileCode size={24}/></div>
                                    <div className='flex-1'>
                                        <div className='text-sm text-gray-300 font-medium'>Ongoing Contribution</div>
                                        <h4 className='font-semibold text-white mt-1 leading-snug'>{mockData.clubWorld.clubAstronomy.piece}</h4>
                                    </div>
                                    <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-700 text-white hover:bg-gray-600 border border-gray-600 flex items-center gap-2">
                                        Contribute <IconArrowUpRight size={16}/>
                                    </button>
                                     <span className="absolute top-2 left-2 px-2.5 py-0.5 text-xs font-bold rounded-md bg-gray-700 text-purple-300 border border-gray-600 whitespace-nowrap">🧩 {mockData.clubWorld.clubAstronomy.bricks} Bricks Piece</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </WorldCard>
            </div>

            {/* ZONE 3 CARD (Hub World - Inspiration Focus) */}
            <WorldCard title="Hub World" icon={IconBookOpen} color={colors.hub} worldProjectName={mockData.hubWorld.project} worldIcon={mockData.hubWorld.icon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockData.hubWorld.blueprints.map(blueprint => <BlueprintCard key={blueprint.id} blueprint={blueprint} />)}
                </div>
                 <button className="w-full mt-6 py-3 rounded-xl bg-emerald-950/50 text-emerald-300 font-semibold border border-emerald-800 hover:bg-emerald-900/60 flex items-center justify-center gap-2">
                    Load More Synthesis Blueprints <span className='text-lg'>♾️</span>
                </button>
            </WorldCard>
        </main>
      </div>
    </div>
  );
}

export default SynthEduDashboardWorlds;