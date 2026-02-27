import { LucideIcon, Video, Phone, ScanLine, Lightbulb, Truck, Scale, HelpCircle, CloudSun, Headphones, Package, DollarSign, Calendar, MapPin, Shield, Clock, Home, Building2, Users, Image, Layout, TrendingUp, Target } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: 'navigate' | 'quote' | 'call' | 'message';
  target?: string;
  message?: string;
}

export interface PageContext {
  key: string;
  firstMessage: string;
  quickActions: QuickAction[];
  agentContext: string;
}

// Keyword-based contextual responses for more varied interactions
export interface KeywordContext {
  keywords: string[];
  quickReplies: QuickAction[];
  agentHint: string;
}

export const keywordContexts: KeywordContext[] = [
  // Pricing & Cost related
  {
    keywords: ['price', 'cost', 'how much', 'expensive', 'cheap', 'budget', 'afford', 'estimate', 'quote', 'pricing'],
    quickReplies: [
      { id: 'video-consult', label: 'Get Accurate Quote', icon: Video, action: 'navigate', target: '/book' },
      { id: 'call-pricing', label: 'Speak to Specialist', icon: Phone, action: 'call' },
    ],
    agentHint: 'User is asking about pricing. Explain that accurate quotes require a video consultation or speaking with a specialist. Do NOT provide specific prices.',
  },
  // Timeline & Scheduling
  {
    keywords: ['when', 'schedule', 'date', 'time', 'available', 'book', 'appointment', 'soon', 'urgent', 'rush', 'asap'],
    quickReplies: [
      { id: 'book-consult', label: 'Schedule Consultation', icon: Calendar, action: 'navigate', target: '/book' },
      { id: 'call-schedule', label: 'Call for Availability', icon: Phone, action: 'call' },
    ],
    agentHint: 'User is asking about scheduling or timing. Help them understand the booking process and offer to connect with an agent for specific dates.',
  },
  // Packing & Preparation
  {
    keywords: ['pack', 'packing', 'box', 'boxes', 'wrap', 'prepare', 'preparation', 'supplies', 'materials'],
    quickReplies: [
      { id: 'packing-tips', label: 'Packing Tips', icon: Package, action: 'message', message: 'What are the best packing tips for a move?' },
      { id: 'packing-services', label: 'Our Packing Services', icon: Truck, action: 'message', message: 'Tell me about your packing services' },
    ],
    agentHint: 'User is interested in packing. Explain our full-service packing options and share helpful packing tips.',
  },
  // Distance & Location
  {
    keywords: ['long distance', 'cross country', 'interstate', 'state to state', 'far', 'miles', 'across'],
    quickReplies: [
      { id: 'long-distance', label: 'Long Distance Info', icon: MapPin, action: 'message', message: 'How do long distance moves work?' },
      { id: 'get-route', label: 'Plan My Route', icon: Truck, action: 'navigate', target: '/online-estimate' },
    ],
    agentHint: 'User is asking about long-distance moves. Explain our interstate moving process, timing, and coordination.',
  },
  // Local moves
  {
    keywords: ['local', 'same city', 'nearby', 'short distance', 'apartment', 'studio'],
    quickReplies: [
      { id: 'local-info', label: 'Local Move Info', icon: Home, action: 'message', message: 'What do local moves include?' },
      { id: 'quick-estimate', label: 'Quick Estimate', icon: DollarSign, action: 'navigate', target: '/online-estimate' },
    ],
    agentHint: 'User is asking about local moves. Explain our local moving services and typical process.',
  },
  // Safety & Insurance
  {
    keywords: ['insur', 'safe', 'damage', 'broken', 'protect', 'liability', 'coverage', 'guarantee'],
    quickReplies: [
      { id: 'insurance-info', label: 'Coverage Options', icon: Shield, action: 'message', message: 'What insurance options do you offer?' },
      { id: 'carrier-vetting', label: 'Carrier Safety', icon: Scale, action: 'navigate', target: '/carrier-vetting' },
    ],
    agentHint: 'User is concerned about safety and protection. Explain our insurance options and carrier vetting process.',
  },
  // Storage
  {
    keywords: ['storage', 'store', 'warehouse', 'hold', 'temporary', 'between'],
    quickReplies: [
      { id: 'storage-info', label: 'Storage Solutions', icon: Building2, action: 'message', message: 'Tell me about your storage options' },
      { id: 'call-storage', label: 'Discuss Storage', icon: Phone, action: 'call' },
    ],
    agentHint: 'User is interested in storage. Explain our storage-in-transit and long-term storage options.',
  },
  // Large/Special items
  {
    keywords: ['piano', 'pool table', 'heavy', 'large', 'special', 'antique', 'fragile', 'artwork', 'gun safe', 'hot tub'],
    quickReplies: [
      { id: 'specialty-info', label: 'Specialty Moving', icon: Package, action: 'message', message: 'How do you handle specialty items like pianos?' },
      { id: 'video-survey', label: 'Video Survey', icon: Video, action: 'navigate', target: '/book' },
    ],
    agentHint: 'User has specialty or oversized items. Explain our specialty item handling and recommend a video survey for accurate assessment.',
  },
  // Commercial/Office
  {
    keywords: ['office', 'commercial', 'business', 'company', 'corporate', 'workplace', 'desk', 'cubicle'],
    quickReplies: [
      { id: 'commercial-info', label: 'Commercial Moving', icon: Building2, action: 'message', message: 'Tell me about commercial moving services' },
      { id: 'business-consult', label: 'Business Consultation', icon: Phone, action: 'call' },
    ],
    agentHint: 'User is interested in commercial/office moving. Explain our business relocation services and minimal downtime approach.',
  },
  // Senior moves
  {
    keywords: ['senior', 'elderly', 'parent', 'grandparent', 'retirement', 'downsiz', 'assisted'],
    quickReplies: [
      { id: 'senior-info', label: 'Senior Moving', icon: Users, action: 'message', message: 'What senior moving services do you offer?' },
      { id: 'compassionate-call', label: 'Speak with Specialist', icon: Headphones, action: 'call' },
    ],
    agentHint: 'User is asking about senior moves. Be extra compassionate and explain our specialized senior relocation services.',
  },
  // Timing questions
  {
    keywords: ['how long', 'duration', 'days', 'weeks', 'fast', 'quick', 'timeline'],
    quickReplies: [
      { id: 'timeline-info', label: 'Move Timeline', icon: Clock, action: 'message', message: 'How long does a typical move take?' },
      { id: 'plan-move', label: 'Plan My Move', icon: Calendar, action: 'navigate', target: '/online-estimate' },
    ],
    agentHint: 'User is asking about timing and duration. Explain typical timelines based on distance and inventory size.',
  },
  // Tracking
  {
    keywords: ['track', 'where', 'status', 'location', 'gps', 'find', 'shipment'],
    quickReplies: [
      { id: 'tracking-info', label: 'How Tracking Works', icon: Truck, action: 'message', message: 'How does shipment tracking work?' },
      { id: 'track-move', label: 'Track My Move', icon: MapPin, action: 'navigate', target: '/live-tracking' },
    ],
    agentHint: 'User wants to track their shipment. Explain our real-time GPS tracking features.',
  },
  // Trust & Reviews
  {
    keywords: ['review', 'rating', 'trust', 'reliable', 'reputation', 'recommend', 'legit', 'scam'],
    quickReplies: [
      { id: 'vetting-info', label: 'How We Vet Carriers', icon: Shield, action: 'navigate', target: '/carrier-vetting' },
      { id: 'safety-info', label: 'Our Safety Standards', icon: Scale, action: 'message', message: 'What safety standards do your carriers meet?' },
    ],
    agentHint: 'User is concerned about trust and reliability. Emphasize our carrier vetting process and safety standards.',
  },
];

// Function to detect keywords and return matching context
export function detectKeywordContext(message: string): KeywordContext | null {
  const lowerMessage = message.toLowerCase();
  
  for (const context of keywordContexts) {
    for (const keyword of context.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return context;
      }
    }
  }
  
  return null;
}

const pageContexts: Record<string, PageContext> = {
  home: {
    key: 'home',
    firstMessage: "Hi! I'm Trudy, your TruMove moving assistant. I can help you understand our services, answer moving questions, or connect you with a specialist for pricing. What can I help with today?",
    quickActions: [
      { id: 'services', label: 'Our Services', icon: Truck, action: 'message', message: 'What moving services does TruMove offer?' },
      { id: 'video', label: 'Video Consult', icon: Video, action: 'navigate', target: '/book' },
      { id: 'call', label: 'Speak to Agent', icon: Phone, action: 'call' },
    ],
    agentContext: "User is on the home page. Help them learn about TruMove services. Do NOT provide pricing - direct them to speak with an agent for quotes.",
  },
  estimate: {
    key: 'estimate',
    firstMessage: "Need help building your inventory? I can explain how our AI scanning works, suggest what to include, or answer any questions about the moving process.",
    quickActions: [
      { id: 'scan', label: 'Scan Room', icon: ScanLine, action: 'navigate', target: '/scan-room' },
      { id: 'tips', label: 'Inventory Tips', icon: Lightbulb, action: 'message', message: 'What are some tips for building an accurate moving inventory?' },
      { id: 'agent', label: 'Talk to Agent', icon: Phone, action: 'call' },
    ],
    agentContext: "User is building their inventory. Help with item selection and process questions. For pricing, suggest speaking with an agent.",
  },
  'video-consult': {
    key: 'video-consult',
    firstMessage: "Looking to book a consultation? I can explain what to expect, help you prepare, or answer questions about our virtual survey process. For scheduling, I'd recommend speaking with an agent.",
    quickActions: [
      { id: 'what-expect', label: 'What to Expect', icon: HelpCircle, action: 'message', message: 'What happens during a video consultation?' },
      { id: 'prepare', label: 'How to Prepare', icon: Lightbulb, action: 'message', message: 'How should I prepare for a video consultation?' },
      { id: 'schedule', label: 'Schedule with Agent', icon: Phone, action: 'call' },
    ],
    agentContext: "User wants to book a video consultation. Help with preparation and process info. For scheduling, connect them to an agent.",
  },
  tracking: {
    key: 'tracking',
    firstMessage: "Tracking your shipment? I can explain the tracking features, check weather conditions, or connect you with your move coordinator for specific updates.",
    quickActions: [
      { id: 'how-tracking', label: 'How Tracking Works', icon: Truck, action: 'message', message: 'How does the live tracking feature work?' },
      { id: 'weather', label: 'Route Weather', icon: CloudSun, action: 'message', message: 'What is the weather like along typical moving routes?' },
      { id: 'coordinator', label: 'Call Coordinator', icon: Headphones, action: 'call' },
    ],
    agentContext: "User is tracking their move. Help with feature explanations. For specific shipment status, connect to their coordinator.",
  },
  vetting: {
    key: 'vetting',
    firstMessage: "Looking to verify a moving company? I can explain what safety scores mean, share red flags to watch for, or help you understand carrier ratings.",
    quickActions: [
      { id: 'scores', label: 'Safety Scores', icon: Scale, action: 'message', message: 'What do the carrier safety scores mean?' },
      { id: 'flags', label: 'Red Flags', icon: HelpCircle, action: 'message', message: 'What are red flags to watch for when hiring movers?' },
      { id: 'agent', label: 'Get Agent Help', icon: Phone, action: 'call' },
    ],
    agentContext: "User is vetting movers. Explain ratings and red flags. For carrier recommendations, connect to an agent.",
  },
  'scan-room': {
    key: 'scan-room',
    firstMessage: "Ready to scan your room? I can guide you through the AI scanning process or share tips for best results.",
    quickActions: [
      { id: 'how-scan', label: 'How It Works', icon: ScanLine, action: 'message', message: 'How does the room scanning feature work?' },
      { id: 'tips', label: 'Scanning Tips', icon: Lightbulb, action: 'message', message: 'What are tips for getting accurate room scans?' },
      { id: 'help', label: 'Get Help', icon: Phone, action: 'call' },
    ],
    agentContext: "User is scanning rooms for inventory. Help with the scanning process. For pricing questions, connect to an agent.",
  },
  info: {
    key: 'info',
    firstMessage: "Have questions about TruMove? I'm Trudy, here to help! Ask me about our services or anything you'd like to know.",
    quickActions: [
      { id: 'services', label: 'Our Services', icon: Truck, action: 'message', message: 'What moving services does TruMove offer?' },
      { id: 'video', label: 'Video Consult', icon: Video, action: 'navigate', target: '/book' },
      { id: 'agent', label: 'Speak to Agent', icon: Phone, action: 'call' },
    ],
    agentContext: "User is on an informational page. Help with questions but direct to agents for pricing and scheduling.",
  },
  general: {
    key: 'general',
    firstMessage: "Hi! I'm Trudy, your TruMove moving assistant. I can answer questions about our services, help you understand the moving process, or connect you with a specialist. How can I help?",
    quickActions: [
      { id: 'services', label: 'Our Services', icon: Truck, action: 'message', message: 'What moving services does TruMove offer?' },
      { id: 'video', label: 'Video Consult', icon: Video, action: 'navigate', target: '/book' },
      { id: 'agent', label: 'Speak to Agent', icon: Phone, action: 'call' },
    ],
    agentContext: "General moving assistance. Help with questions but direct to agents for pricing and scheduling.",
  },
};

export function getPageContext(pathname: string): PageContext {
  // Exact matches first
  if (pathname === '/' || pathname === '') {
    return pageContexts.home;
  }
  
  // Path prefix matching
  if (pathname.startsWith('/online-estimate')) {
    return pageContexts.estimate;
  }
  if (pathname.startsWith('/book')) {
    return pageContexts['video-consult'];
  }
  if (pathname.startsWith('/track') || pathname.startsWith('/live-tracking')) {
    return pageContexts.tracking;
  }
  if (pathname.startsWith('/carrier-vetting') || pathname.startsWith('/vetting')) {
    return pageContexts.vetting;
  }
  if (pathname.startsWith('/scan-room')) {
    return pageContexts['scan-room'];
  }
  if (pathname.startsWith('/customer-service')) {
    return pageContexts.general;
  }
  if (pathname.startsWith('/about') || pathname.startsWith('/faq') || pathname.startsWith('/terms') || pathname.startsWith('/privacy')) {
    return pageContexts.info;
  }
  
  // Default fallback
  return pageContexts.general;
}

// Marketing-specific context for the AI Marketing Suite
export const marketingContext: PageContext = {
  key: 'marketing',
  firstMessage: "Hi! I'm Trudy, your AI marketing assistant. 🎨\n\nI can help you:\n- **Create ads** with custom images (try: 'ad with a llama')\n- **Build landing pages** for any location\n- **Find keywords** for your campaigns\n- **Launch on Google, Meta, or TikTok**\n\nWhat would you like to create today?",
  quickActions: [
    { id: 'create-ad', label: 'Create Ad', icon: Image, action: 'message', message: 'Help me create an ad for TruMove' },
    { id: 'landing-page', label: 'Landing Page', icon: Layout, action: 'message', message: 'Build a landing page for California moves' },
    { id: 'keywords', label: 'Find Keywords', icon: Target, action: 'message', message: 'What keywords should I target for moving services?' },
    { id: 'optimize', label: 'Optimize', icon: TrendingUp, action: 'message', message: 'How can I improve my campaign performance?' },
  ],
  agentContext: "User is in the AI Marketing Suite. You are Trudy, the AI marketing assistant. You CAN generate images when users request specific visuals (like 'ad with a llama'). Help create ads, landing pages, suggest keywords, and provide platform-specific launch guidance for Google Ads, Meta/Facebook, and TikTok.",
};
