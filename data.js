// AstroCompanion prototype data.
// Product logic lives in matching.js and app.js. Content here is illustrative.

const JOURNEY_TYPES = {
  career: {
    label: "Career clarity",
    topic: "CAREER",
    insight: "A decision feels urgent when you are looking at the whole road at once. Today, reduce it to one question you can actually answer.",
    card: "You don't need the whole map. You need the next honest step.",
    prompts: ["What part of the decision feels most uncertain?", "What information would make this choice easier?", "Which option still feels right after the excitement fades?"]
  },
  relationships: {
    label: "Relationship clarity",
    topic: "RELATIONSHIPS",
    insight: "Clarity today comes from noticing what is actually being said, not what you are afraid the silence means. Ask one honest question.",
    card: "Clarity starts with the question you have been avoiding.",
    prompts: ["What do you need to hear?", "What are you assuming without asking?", "What would a calm conversation look like?"]
  },
  purpose: {
    label: "Life direction",
    topic: "LIFE DIRECTION",
    insight: "You do not need to solve your future today. Notice which option gives you energy after the excitement wears off.",
    card: "Your next chapter does not need to be decided in one day.",
    prompts: ["What are you moving toward?", "Which choice is yours, not someone else's?", "What small experiment could give you evidence?"]
  },
  family: {
    label: "Family & home",
    topic: "FAMILY",
    insight: "Not every family tension needs a verdict. Today, separate what you can change from what you can only respond to.",
    card: "You can care deeply without carrying everything.",
    prompts: ["What belongs to you to solve?", "Where do you need a boundary?", "What would make home feel lighter this week?"]
  },
  wellbeing: {
    label: "Personal wellbeing",
    topic: "WELLBEING",
    insight: "Treat today's energy as information, not a verdict. One small act of care can change the tone of the rest of the day.",
    card: "A softer day can still be a productive one.",
    prompts: ["What is draining you?", "What can wait?", "What would make today 10% easier?"]
  }
};

const SHARE_CARD_LINES = [
  "You don't need the whole map. You need the next honest step.",
  "Clarity starts with the question you have been avoiding.",
  "Your next chapter does not need to be decided in one day.",
  "You can care deeply without carrying everything.",
  "A softer day can still be a productive one."
];

const SPECIALTIES = [
  {
    id: "relationships", label: "Relationships & Love",
    keywords: [
      {word:"partner",weight:4},{word:"relationship",weight:4},{word:"breakup",weight:4},{word:"marriage",weight:4},
      {word:"boyfriend",weight:4},{word:"girlfriend",weight:4},{word:"love",weight:2},{word:"dating",weight:3},
      {word:"spouse",weight:4},{word:"divorce",weight:4},{word:"trust",weight:2},{word:"distance",weight:2}
    ],
    astrologer:{name:"Priya Menon",tag:"Relationship & Synastry · 4.9★ · 12k consults"}
  },
  {
    id:"career", label:"Career & Money",
    keywords:[
      {word:"job",weight:4},{word:"career",weight:4},{word:"money",weight:3},{word:"promotion",weight:4},
      {word:"business",weight:3},{word:"boss",weight:2},{word:"salary",weight:3},{word:"interview",weight:3},
      {word:"finance",weight:3},{word:"work",weight:1},{word:"offer",weight:3},{word:"college",weight:2}
    ],
    astrologer:{name:"Rakesh Iyer",tag:"Career & Wealth · 4.8★ · 9.4k consults"}
  },
  {
    id:"family", label:"Family & Home",
    keywords:[
      {word:"family",weight:4},{word:"parents",weight:4},{word:"mother",weight:3},{word:"father",weight:3},
      {word:"sibling",weight:3},{word:"home",weight:2},{word:"kids",weight:3},{word:"children",weight:3}
    ],
    astrologer:{name:"Lakshmi Rao",tag:"Family & Domestic Harmony · 4.9★ · 15k consults"}
  },
  {
    id:"wellbeing", label:"Wellbeing",
    keywords:[
      {word:"health",weight:4},{word:"stress",weight:3},{word:"sleep",weight:3},{word:"tired",weight:2},
      {word:"sick",weight:3},{word:"energy",weight:2},{word:"overwhelmed",weight:3},{word:"burnout",weight:4}
    ],
    astrologer:{name:"Arvind Sethi",tag:"Wellbeing Reader · 4.7★ · 6.1k consults"}
  },
  {
    id:"purpose", label:"Life Direction & Purpose",
    keywords:[
      {word:"confused",weight:3},{word:"lost",weight:3},{word:"purpose",weight:4},{word:"direction",weight:4},
      {word:"future",weight:3},{word:"decision",weight:3},{word:"stuck",weight:3},{word:"path",weight:3},
      {word:"choice",weight:2},{word:"uncertain",weight:2}
    ],
    astrologer:{name:"Meera Kapoor",tag:"Life Path & Dasha · 4.9★ · 18k consults"}
  }
];

const PRICING_TIERS = [
  {
    id:"free", name:"Free Journey", price:"₹0", badge:"START HERE", featured:false,
    features:["7-day personalized journey","Daily reflection + check-in","Unlimited share cards","Smart Match discovery"]
  },
  {
    id:"plus", name:"Cosmic+", price:"₹149 / month", badge:"BEST VALUE", featured:true,
    features:["Everything in Free","Monthly deep-dive personal report","Save multiple life journeys","Compatibility vault","Priority matched-consult booking"]
  },
  {
    id:"report", name:"One Journey Report", price:"₹79 one-time", badge:null, featured:false,
    features:["Deep-dive report for one topic","Shareable summary card","No subscription required"]
  }
];
