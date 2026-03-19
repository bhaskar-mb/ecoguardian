import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnvironmentalResource, User } from '../types.ts';

const PUBLIC_RESOURCES: EnvironmentalResource[] = [
  // FIELD NOTES
  { id: 'n1', title: 'Elephant Corridor Safety', content: 'Recent migrations detected near highway 102. Avoid heavy noise and keep speed under 40kmph.', category: 'note', icon: '🐘' },
  { id: 'n2', title: 'Forest Fire Prevention', content: 'Dry season alert. Ensure no glass bottles are left in open sun. Report smoke instantly.', category: 'note', icon: '🔥' },
  { id: 'n3', title: 'Water Table Monitoring', content: 'Low groundwater levels detected in Sector 4. Limit non-essential agricultural irrigation until rainfall.', category: 'note', icon: '💧' },
  { id: 'n4', title: 'Pollinator Protection', content: 'Bee population decline noted in urban edges. Avoid pesticide use during early morning hours.', category: 'note', icon: '🐝' },
  { id: 'n5', title: 'Composting 101', content: 'Redirect 40% of household waste to soil regeneration. Avoid meat products in backyard bins.', category: 'note', icon: '🌱' },
  
  // WILDLIFE AT RISK
  { id: 'w1', title: 'Bengal Tiger (Endangered)', content: 'Estimated population: 3,500. Highly threatened by poaching and habitat fragmentation.', category: 'wildlife', icon: '🐅' },
  { id: 'w2', title: 'Olive Ridley Turtle', content: 'Nesting season starts in November. Keep beach lights off after 8 PM to guide hatchlings.', category: 'wildlife', icon: '🐢' },
  { id: 'w3', title: 'Vaquita (Critical)', content: 'World\'s rarest marine mammal. Only ~10 individuals left in the wild. Threatened by illegal gillnets.', category: 'wildlife', icon: '🐬' },
  { id: 'w4', title: 'Pangolin (Trafficked)', content: 'The most trafficked mammal globally. Hunted for scales used in traditional medicine.', category: 'wildlife', icon: '🐜' },
  { id: 'w5', title: 'Javan Rhino', content: 'Critically endangered with only one known population in Ujung Kulon National Park.', category: 'wildlife', icon: '🦏' },
  { id: 'w6', title: 'Snow Leopard', content: 'Ghost of the mountains. Vulnerable to climate change and human-wildlife conflict.', category: 'wildlife', icon: '🐆' },

  // GOVERNANCE LINKS
  { id: 'l1', title: 'Global Wildlife Fund', content: 'International body supporting wildlife conservation efforts globally.', category: 'link', icon: '🌍', url: 'https://www.worldwildlife.org' },
  { id: 'l2', title: 'EPA Official Portal', content: 'United States Environmental Protection Agency reporting and standards.', category: 'link', icon: '🏛️', url: 'https://www.epa.gov' },
  { id: 'l3', title: 'UN Environment Programme', content: 'UN agency responsible for coordinating global environmental activities.', category: 'link', icon: '🇺🇳', url: 'https://www.unep.org' },
  { id: 'l4', title: 'IUCN Red List', content: 'The world\'s most comprehensive inventory of biological species status.', category: 'link', icon: '📋', url: 'https://www.iucnredlist.org' },
  { id: 'l5', title: 'CITES Secretariat', content: 'Convention on International Trade in Endangered Species of Wild Fauna and Flora.', category: 'link', icon: '📄', url: 'https://cites.org' },
  { id: 'l6', title: 'Swachh Bharat Mission Urban', content: 'Official SBM-U portal for national cleanliness guidelines, citizen initiatives, and sanitation policies.', category: 'link', icon: '🇮🇳', url: 'https://sbmurban.org/' },
  { id: 'l7', title: 'Ministry of Housing and Urban Affairs', content: 'MoHUA official site overseeing urban development, smart cities, and civic infrastructure.', category: 'link', icon: '🏢', url: 'https://mohua.gov.in/' },
  { id: 'l8', title: 'Central Pollution Control Board', content: 'National apex body for air/water pollution control and environmental standards monitoring.', category: 'link', icon: '📊', url: 'https://cpcb.nic.in/' },
];

const AUTHORITY_RESOURCES: EnvironmentalResource[] = [
  // DIRECTIVES
  { id: 'dir1', title: 'Joint Task Force Protocol', content: 'Standard operating procedures for coordinating with external units during a red-alert event. All dispatches must be logged within 15 minutes of activation.', category: 'directive', icon: '🚨' },
  { id: 'dir2', title: 'Equipment Requisition', content: 'Forms and authorization paths for ordering specialized thermal drones, chemical kits, and search units. Lead officer approval required for orders above $5,000.', category: 'directive', icon: '🚁' },
  { id: 'dir3', title: 'Incident Classification SOP', content: 'Standard Operating Procedure for classifying field reports into Low / Medium / High / Critical tiers. Determines escalation and response time targets.', category: 'directive', icon: '📋' },
  // AGENCY DIRECTORY
  { id: 'ag1', title: 'Forestry Commission', content: 'Primary contact: Warden Smith. Covers Northern Ridge and Eastern Highlands biosphere sectors.', category: 'directory', icon: '🌲', email: 'warden.smith@forestry.gov', phone: '+1 555-0192' },
  { id: 'ag2', title: 'Wildlife Rescue Unit', content: 'Primary contact: Dr. Jane Marsh. Specialized in live animal extraction and emergency veterinary response.', category: 'directory', icon: '🐾', email: 'jane.marsh@wildliferescue.org', phone: '+1 555-0193' },
  { id: 'ag3', title: 'EPA Response Team', content: 'Primary contact: Director Vance. Hazmat and chemical spill containment response — 24/7 on-call.', category: 'directory', icon: '☣️', email: 'vance@epa.gov', phone: '+1 555-0194' },
  { id: 'ag4', title: 'Marine Conservation Society', content: 'Primary contact: Capt. Diya Menon. Covers all coastal and aquatic incident response zones.', category: 'directory', icon: '🌊', email: 'capt.diya@marineconsoc.org', phone: '+1 555-0195' },
  { id: 'ag5', title: 'Field Team Alpha (Internal)', content: 'Your organization\'s primary field response unit. 6 officers. Equipped for ground-based search and containment.', category: 'directory', icon: '🧑‍🤝‍🧑', email: 'alpha.team@ecoguardian.internal', phone: 'Ext. 112' },
  // REGULATIONS
  { id: 'reg1', title: 'Clean Water Act 2026', content: 'Updated thresholds for agricultural runoff. Field tests must check for nitrate spikes above 10ppm. Non-compliance triggers automatic escalation.', category: 'regulation', icon: '💧' },
  { id: 'reg2', title: 'Drone Airspace Regulations', content: 'Maximum flight altitude restricted to 400ft in protected zones. Night operations require a visible beacon. Thermal cameras require county permit.', category: 'regulation', icon: '📡' },
  { id: 'reg3', title: 'Wildlife Protection Act §14', content: 'Any relocation of protected species requires co-authorization from the Wildlife Rescue Unit and EPA within 48 hours.', category: 'regulation', icon: '⚖️' },
];

interface ResourcesProps {
  user?: User;
}

const Resources: React.FC<ResourcesProps> = ({ user }) => {
  const isAuthOrAdmin = user?.role === 'authority' || user?.role === 'admin';
  const RESOURCES = isAuthOrAdmin ? AUTHORITY_RESOURCES : PUBLIC_RESOURCES;
  const [filter, setFilter] = useState<'all' | 'note' | 'wildlife' | 'link' | 'directive' | 'directory' | 'regulation'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Load bookmarks from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ecoguardian_bookmarks');
    if (saved) {
      try {
        setBookmarkedIds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load bookmarks");
      }
    }
  }, []);

  // Save bookmarks to local storage whenever they change
  const toggleBookmark = (id: string) => {
    const newBookmarks = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter(bid => bid !== id)
      : [...bookmarkedIds, id];
    
    setBookmarkedIds(newBookmarks);
    localStorage.setItem('ecoguardian_bookmarks', JSON.stringify(newBookmarks));
  };

  const filteredResources = RESOURCES
    .filter(r => filter === 'all' || r.category === filter)
    .filter(r => 
      searchQuery === '' || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const categories = isAuthOrAdmin ? [
    { id: 'all', label: 'All Archives', icon: '🌐' },
    { id: 'directive', label: 'Directives', icon: '📋' },
    { id: 'directory', label: 'Agency Directory', icon: '📇' },
    { id: 'regulation', label: 'Regulations', icon: '⚖️' },
  ] : [
    { id: 'all', label: 'All Resources', icon: '🌐' },
    { id: 'note', label: 'Field Notes', icon: '📝' },
    { id: 'wildlife', label: 'Wildlife at Risk', icon: '🐾' },
    { id: 'link', label: 'Gov Portals', icon: '🏛️' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      {/* Header & Navigation */}
      <motion.div variants={itemVariants} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{isAuthOrAdmin ? 'Agency Intercoms' : 'Guardian Library'}</h2>
          <p className="text-slate-500 font-medium">{isAuthOrAdmin ? 'Inter-agency directories, directives, and operation regulations.' : 'Equipping the network with ecological intelligence.'}</p>
        </div>
        
        <div className="flex flex-col md:items-end gap-4 w-full md:w-auto mt-6 md:mt-0">
          <div className="relative w-full max-w-sm group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search library resources..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
            />
          </div>
          <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-200 gap-1 overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id as any)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                  filter === cat.id 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Resource Grid */}
      <motion.div variants={containerVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredResources.map((r) => {
          const isBookmarked = bookmarkedIds.includes(r.id);
          return (
            <motion.div 
              layout
              variants={itemVariants} 
              initial="hidden" 
              animate="show" 
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              key={r.id} 
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="text-4xl transform group-hover:scale-110 transition-transform">{r.icon}</div>
                {r.category === 'link' && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2"/></svg>
                  </a>
                )}
              </div>
              
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${
                r.category === 'note' || r.category === 'directive' ? 'text-emerald-500' : 
                r.category === 'wildlife' || r.category === 'directory' ? 'text-amber-500' : 
                'text-indigo-500'
              }`}>
                {r.category === 'note' ? 'Field Guideline' : 
                 r.category === 'wildlife' ? 'At Risk' : 
                 r.category === 'link' ? 'Official Portal' : 
                 r.category === 'directive' ? 'Directive' : 
                 r.category === 'directory' ? 'Authority Profile' : 'Regulation'}
              </span>
              
              <h4 className="text-xl font-black text-slate-900 mb-4">{r.title}</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed flex-grow">{r.content}</p>
              
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ECO-REF-{r.id.toUpperCase()}</span>
                <div className="flex items-center gap-2">
                  {r.category === 'directory' && (r as any).email && (
                    <a
                      href={`mailto:${(r as any).email}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      ✉ Message
                    </a>
                  )}
                  <button
                    onClick={() => toggleBookmark(r.id)}
                    className={`text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group/btn ${
                      isBookmarked ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-900'
                    }`}
                  >
                  <svg className={`w-4 h-4 transition-transform ${isBookmarked ? 'scale-110 fill-current' : 'group-hover/btn:scale-110'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isBookmarked ? 'Saved' : 'Bookmark'}
                </button>
              </div>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-black uppercase tracking-widest">No matching resources found in this sector.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Resources;
