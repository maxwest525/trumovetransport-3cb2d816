 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import logoImg from "@/assets/logo.png";
 import {
   Shield, CheckCircle2, Star, Clock, Phone, Users, Truck, Award,
   Play, ArrowRight, ChevronDown, Sparkles, MessageCircle, ArrowUp,
   Lock, Heart, ThumbsUp, Zap, Timer
 } from "lucide-react";
 import { useState, useEffect } from "react";
 
 // TruMove Logo Component
 export const TruMoveLogo = ({ className = "h-10", inverted = false }: { className?: string; inverted?: boolean }) => (
   <img 
     src={logoImg} 
     alt="TruMove" 
     className={`${className} ${inverted ? 'brightness-0 invert' : ''}`} 
   />
 );
 
 // Powered by TruMove Badge
 export const PoweredByBadge = () => (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full">
      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
      <span className="text-xs font-medium text-white">Powered by</span>
      <span className="text-xs font-bold text-blue-400">TruMove AI</span>
    </div>
  );
 
 // TruMove Guarantee Badge
 export const TruMoveGuaranteeBadge = ({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) => {
   const sizeClasses = {
     small: 'px-2 py-1 text-xs',
     default: 'px-4 py-2 text-sm',
     large: 'px-6 py-3 text-base'
   };
   return (
      <div className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-primary/10 border border-primary/30 rounded-full`}>
        <Shield className="w-4 h-4 text-primary" />
        <span className="font-bold text-primary">TruMove Guarantee</span>
     </div>
   );
 };
 
 // Trust Badge Strip
 export const TrustBadgeStrip = ({ theme = 'light' }: { theme?: 'light' | 'dark' }) => {
   const badges = [
     { icon: Shield, text: "FMCSA Licensed" },
     { icon: Award, text: "BBB A+ Rated" },
     { icon: Users, text: "50,000+ Moves" },
     { icon: Star, text: "4.9/5 Rating" },
   ];
   
   return (
     <div className={`flex justify-center items-center gap-6 py-4 border-y ${theme === 'dark' ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
       {badges.map((badge, i) => (
         <div key={i} className="flex items-center gap-2">
           <badge.icon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
           <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>{badge.text}</span>
         </div>
       ))}
     </div>
   );
 };
 
 // Social Proof Ticker
 export const SocialProofTicker = () => {
   const proofs = [
     "Sarah from Austin just saved $847 on her move",
     "Michael in Denver got a quote in 47 seconds",
     "The Johnson family completed their TruMove today",
     "Emily from Seattle rated TruMove 5 stars",
     "1,247 quotes generated today",
     "David from Miami just booked his move",
   ];
   
   return (
     <div className="bg-slate-900 text-white py-3 overflow-hidden relative">
       <div className="flex animate-marquee whitespace-nowrap">
         {[...proofs, ...proofs].map((proof, i) => (
           <span key={i} className="mx-8 flex items-center gap-2">
             <span className="text-blue-400">●</span>
             <span className="text-sm">{proof}</span>
           </span>
         ))}
       </div>
     </div>
   );
 };
 
 // Countdown Timer
 export const CountdownTimer = ({ endTime = 24 * 60 * 60 }: { endTime?: number }) => {
   const [timeLeft, setTimeLeft] = useState(endTime);
   
   useEffect(() => {
     const timer = setInterval(() => {
       setTimeLeft(prev => Math.max(0, prev - 1));
     }, 1000);
     return () => clearInterval(timer);
   }, []);
   
   const hours = Math.floor(timeLeft / 3600);
   const minutes = Math.floor((timeLeft % 3600) / 60);
   const seconds = timeLeft % 60;
   
   return (
     <div className="flex items-center gap-3">
       <Timer className="w-5 h-5 text-red-500 animate-pulse" />
       <div className="flex items-center gap-1 font-mono">
         <div className="bg-slate-900 text-white px-2 py-1 rounded text-lg font-bold">{String(hours).padStart(2, '0')}</div>
         <span className="text-xl font-bold">:</span>
         <div className="bg-slate-900 text-white px-2 py-1 rounded text-lg font-bold">{String(minutes).padStart(2, '0')}</div>
         <span className="text-xl font-bold">:</span>
         <div className="bg-slate-900 text-white px-2 py-1 rounded text-lg font-bold">{String(seconds).padStart(2, '0')}</div>
       </div>
       <span className="text-sm text-red-600 font-medium">Limited Time Offer!</span>
     </div>
   );
 };
 
 // Urgency Banner
 export const UrgencyBanner = ({ message = "Only 3 spots left this week!" }: { message?: string }) => (
   <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-2 px-4 text-center">
     <span className="flex items-center justify-center gap-2 text-sm font-medium">
       <Zap className="w-4 h-4 animate-pulse" />
       {message}
       <Zap className="w-4 h-4 animate-pulse" />
     </span>
   </div>
 );
 
 // Sticky Header Bar
 export const StickyHeader = ({ businessName = "TruMove" }: { businessName?: string }) => (
    <header className="relative z-10 bg-white border-b-2 border-blue-500 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <TruMoveLogo className="h-8" />
        <div className="flex items-center gap-4">
          <a href="tel:1-800-TRUMOVE" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors">
            <Phone className="w-4 h-4" />
            <span className="font-semibold">1-800-TRUMOVE</span>
          </a>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Get a Quote</Button>
       </div>
     </div>
   </header>
 );
 
 // 3-Step Process Section
 export const ThreeStepProcess = ({ theme = 'light' }: { theme?: 'light' | 'dark' }) => {
   const steps = [
     { number: 1, icon: "📱", title: "Scan Your Home", description: "Use our AI scanner to instantly inventory your belongings" },
     { number: 2, icon: "🔍", title: "Get Matched", description: "TruMove AI matches you with verified carriers in seconds" },
     { number: 3, icon: "🚚", title: "Move Stress-Free", description: "Track your move in real-time with TruTrack technology" },
   ];
   
   return (
     <div className={`py-16 px-8 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
       <div className="text-center mb-12">
         <Badge className="mb-4 bg-blue-500/10 text-blue-600 border border-blue-500/30">How TruMove Works</Badge>
         <h2 className={`text-3xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
           3 Simple Steps to Your Perfect Move
         </h2>
         <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
           Powered by TruMove AI technology
         </p>
       </div>
       
       <div className="relative max-w-4xl mx-auto">
         {/* Connecting line */}
         <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 hidden md:block" />
         
         <div className="grid md:grid-cols-3 gap-8">
           {steps.map((step, i) => (
             <div key={i} className="relative text-center">
               <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30 relative z-10">
                 {step.icon}
               </div>
               <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center z-20`}>
                 {step.number}
               </div>
               <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
               <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{step.description}</p>
             </div>
           ))}
         </div>
       </div>
       
       <div className="text-center mt-10">
         <PoweredByBadge />
       </div>
     </div>
   );
 };
 
 // Triple Guarantee Section
 export const TripleGuaranteeSection = () => {
   const guarantees = [
     { icon: Lock, title: "100% Price Lock", description: "Your quote is guaranteed. No hidden fees, ever." },
     { icon: Shield, title: "Full Insurance", description: "Every item is covered by comprehensive insurance." },
     { icon: Clock, title: "On-Time Delivery", description: "We deliver when we say, or your next move is free." },
   ];
   
   return (
     <div className="py-16 px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
       <div className="text-center mb-12">
         <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
           <Shield className="w-10 h-10 text-white" />
         </div>
         <h2 className="text-3xl font-bold text-white mb-3">The TruMove Triple Guarantee</h2>
         <p className="text-lg text-slate-400">Your move is protected by our iron-clad promise</p>
       </div>
       
       <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
         {guarantees.map((g, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors">
              <g.icon className="w-12 h-12 mx-auto mb-4 text-blue-400" />
             <h3 className="text-xl font-bold text-white mb-2">{g.title}</h3>
             <p className="text-slate-400">{g.description}</p>
           </div>
         ))}
       </div>
       
       <div className="flex justify-center gap-4 mt-12">
         <Badge className="bg-white/10 text-white border border-white/20">FMCSA #MC-123456</Badge>
         <Badge className="bg-white/10 text-white border border-white/20">BBB A+ Rated</Badge>
         <Badge className="bg-white/10 text-white border border-white/20">SSL Secured</Badge>
       </div>
     </div>
   );
 };
 
 // Video Testimonial Grid
 export const VideoTestimonialGrid = () => {
   const testimonials = [
     { name: "Sarah M.", location: "Austin, TX", stars: 5, thumbnail: "👩‍💼" },
     { name: "Michael C.", location: "Denver, CO", stars: 5, thumbnail: "👨‍💻" },
     { name: "Emily R.", location: "Seattle, WA", stars: 5, thumbnail: "👩‍🎨" },
     { name: "David K.", location: "Miami, FL", stars: 5, thumbnail: "👨‍🔧" },
   ];
   
   return (
     <div className="py-16 px-8 bg-slate-50">
       <div className="text-center mb-12">
         <Badge className="mb-4 bg-purple-500/10 text-purple-600 border border-purple-500/30">Real Stories</Badge>
         <h2 className="text-3xl font-bold text-slate-900 mb-3">Watch Real TruMove Stories</h2>
         <p className="text-lg text-slate-600">See why families across America trust TruMove</p>
       </div>
       
       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
         {testimonials.map((t, i) => (
           <div key={i} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
             <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-6xl relative">
               {t.thumbnail}
               <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                   <Play className="w-6 h-6 text-blue-600 ml-1" />
                 </div>
               </div>
             </div>
             <div className="p-4">
               <div className="flex items-center gap-0.5 mb-2">
                 {Array(t.stars).fill(0).map((_, i) => (
                   <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                 ))}
               </div>
               <p className="font-bold text-slate-900">{t.name}</p>
               <p className="text-sm text-slate-500">{t.location}</p>
             </div>
           </div>
         ))}
       </div>
     </div>
   );
 };
 
 // Comparison Table Section
 export const ComparisonTableSection = () => {
   const features = [
     { name: "AI-Powered Inventory Scan", trumove: true, traditional: false, diy: false, exclusive: true },
     { name: "Real-Time GPS Tracking", trumove: true, traditional: false, diy: false, exclusive: true },
     { name: "Guaranteed Price Lock", trumove: true, traditional: false, diy: false, exclusive: true },
     { name: "24/7 Live Support", trumove: true, traditional: true, diy: false },
     { name: "Full Insurance Coverage", trumove: true, traditional: true, diy: false },
     { name: "Licensed & Bonded", trumove: true, traditional: true, diy: false },
     { name: "Instant Online Quotes", trumove: true, traditional: false, diy: true },
     { name: "Flexible Scheduling", trumove: true, traditional: true, diy: true },
   ];
   
   return (
     <div className="py-16 px-8 bg-white">
       <div className="text-center mb-12">
         <Badge className="mb-4 bg-blue-500/10 text-blue-600 border border-blue-500/30">Compare Options</Badge>
         <h2 className="text-3xl font-bold text-slate-900 mb-3">Why Choose TruMove?</h2>
         <p className="text-lg text-slate-600">See how we stack up against the competition</p>
       </div>
       
       <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
         <table className="w-full">
           <thead>
             <tr className="bg-slate-900 text-white">
               <th className="text-left p-4">Feature</th>
               <th className="p-4 text-center bg-blue-600">
                 <div className="flex flex-col items-center">
                   <TruMoveLogo className="h-6 brightness-0 invert mb-1" />
                   <span className="text-xs opacity-80">AI-Powered</span>
                 </div>
               </th>
               <th className="p-4 text-center">Traditional<br/><span className="text-xs opacity-70">Movers</span></th>
               <th className="p-4 text-center">DIY<br/><span className="text-xs opacity-70">Moving</span></th>
             </tr>
           </thead>
           <tbody>
             {features.map((f, i) => (
               <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                 <td className="p-4 font-medium text-slate-900">
                   {f.name}
                   {f.exclusive && (
                     <Badge className="ml-2 text-[10px] bg-blue-500/10 text-blue-600 border-0">TruMove Exclusive</Badge>
                   )}
                 </td>
                  <td className="p-4 text-center bg-blue-50">
                    {f.trumove ? <CheckCircle2 className="w-6 h-6 text-blue-600 mx-auto" /> : <span className="text-slate-300">—</span>}
                 </td>
                 <td className="p-4 text-center">
                   {f.traditional ? <CheckCircle2 className="w-5 h-5 text-slate-400 mx-auto" /> : <span className="text-slate-300">—</span>}
                 </td>
                 <td className="p-4 text-center">
                   {f.diy ? <CheckCircle2 className="w-5 h-5 text-slate-400 mx-auto" /> : <span className="text-slate-300">—</span>}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>
   );
 };
 
 // FAQ Accordion Section
 export const FAQSection = () => {
   const [openIndex, setOpenIndex] = useState<number | null>(0);
   
   const faqs = [
     { q: "How does TruMove's AI inventory scanner work?", a: "Simply open the TruMove app and point your camera at each room. Our AI instantly identifies and catalogs your belongings, creating an accurate inventory in seconds. This eliminates the guesswork from traditional estimates." },
     { q: "Is my quote really guaranteed?", a: "Absolutely! When you receive a TruMove quote, that's the price you pay. We use AI to ensure accuracy, and our TruPrice Promise means no surprise fees or hidden charges on moving day." },
     { q: "How does real-time tracking work?", a: "Every TruMove truck is equipped with TruTrack technology. You'll receive a link to track your belongings 24/7, with live ETA updates and milestone notifications throughout your move." },
     { q: "What happens if something gets damaged?", a: "Your move includes comprehensive insurance coverage. In the rare event of damage, our claims process is fast and fair. Most claims are resolved within 5 business days." },
     { q: "Can I speak with a real person?", a: "Of course! While our AI assistant Trudy can handle most questions instantly, our human support team is available 24/7 at 1-800-TRUMOVE." },
     { q: "How far in advance should I book?", a: "We recommend booking 4-6 weeks in advance for the best availability and rates. However, TruMove can often accommodate last-minute moves with as little as 48 hours notice." },
   ];
   
   return (
     <div className="py-16 px-8 bg-slate-50">
       <div className="text-center mb-12">
         <Badge className="mb-4 bg-amber-500/10 text-amber-600 border border-amber-500/30">Questions?</Badge>
         <h2 className="text-3xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
         <p className="text-lg text-slate-600">Everything you need to know about TruMove</p>
       </div>
       
       <div className="max-w-3xl mx-auto space-y-3">
         {faqs.map((faq, i) => (
           <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
             <button
               onClick={() => setOpenIndex(openIndex === i ? null : i)}
               className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
             >
               <span className="font-semibold text-slate-900">{faq.q}</span>
               <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
             </button>
             {openIndex === i && (
               <div className="px-5 pb-5 text-slate-600 border-t border-slate-100 pt-4">
                 {faq.a}
               </div>
             )}
           </div>
         ))}
       </div>
     </div>
   );
 };
 
 // Final CTA Section
 export const FinalCTASection = ({ theme }: { theme: { primary: string; primaryDark: string } }) => (
   <div 
     className="py-20 px-8 text-center"
     style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)` }}
   >
     <h2 className="text-4xl font-bold text-white mb-4">Ready for a Stress-Free Move?</h2>
     <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
       Join 50,000+ families who saved an average of $847 with TruMove AI.
     </p>
     
     <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-2xl">
       <div className="space-y-3 mb-4">
         <Input placeholder="Moving from (ZIP code)" className="text-center" />
         <Input placeholder="Moving to (ZIP code)" className="text-center" />
         <Input placeholder="Phone number" className="text-center" />
       </div>
       <Button className="w-full py-6 text-lg font-bold bg-slate-900 hover:bg-slate-800">
         Get My Free TruMove Quote <ArrowRight className="w-5 h-5 ml-2" />
       </Button>
       <p className="text-xs text-slate-500 mt-3">🔒 No credit card required • Instant results</p>
     </div>
     
     <div className="mt-8">
       <CountdownTimer />
     </div>
   </div>
 );
 
 // Comprehensive Footer
 export const TruMoveFooter = () => (
   <footer className="bg-slate-900 text-white py-16 px-8">
     <div className="max-w-6xl mx-auto">
       <div className="grid md:grid-cols-4 gap-12 mb-12">
         <div>
           <TruMoveLogo className="h-10 brightness-0 invert mb-4" />
           <p className="text-slate-400 text-sm mb-4">AI-Powered Moving Made Simple</p>
           <p className="text-slate-500 text-xs">Trusted by 50,000+ families nationwide</p>
         </div>
         <div>
           <h4 className="font-bold mb-4">Contact</h4>
           <div className="space-y-2 text-sm text-slate-400">
             <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1-800-TRUMOVE</p>
             <p>support@trumove.com</p>
             <p>Mon-Sun 24/7</p>
           </div>
         </div>
         <div>
           <h4 className="font-bold mb-4">Legal</h4>
           <div className="space-y-2 text-sm text-slate-400">
             <p className="hover:text-white cursor-pointer">Privacy Policy</p>
             <p className="hover:text-white cursor-pointer">Terms of Service</p>
             <p className="hover:text-white cursor-pointer">FMCSA License #MC-123456</p>
           </div>
         </div>
         <div>
           <h4 className="font-bold mb-4">Trust & Safety</h4>
           <div className="flex flex-wrap gap-2">
             <Badge className="bg-white/10 border-white/20">BBB A+</Badge>
             <Badge className="bg-white/10 border-white/20">FMCSA</Badge>
             <Badge className="bg-white/10 border-white/20">SSL</Badge>
           </div>
         </div>
       </div>
       
       <div className="border-t border-white/10 pt-8 flex items-center justify-between">
         <p className="text-sm text-slate-500">© 2025 TruMove. All rights reserved.</p>
         <PoweredByBadge />
       </div>
     </div>
   </footer>
 );
 
 // Floating CTA Button (for mobile)
 export const FloatingStickyBar = () => (
   <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg p-3 md:hidden">
     <Button className="w-full py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700">
       Get Your Free Quote <ArrowRight className="w-5 h-5 ml-2" />
     </Button>
   </div>
 );
 
 // Chat with Trudy Button
 export const ChatWithTrudyButton = () => (
   <button className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-xl transition-shadow">
     <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
       <Truck className="w-4 h-4" />
       <Sparkles className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-amber-300" />
     </div>
     <span className="font-medium">Chat with Trudy</span>
   </button>
 );
 
 // Back to Top Button
 export const BackToTopButton = () => (
   <button 
     onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
     className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
   >
     <ArrowUp className="w-5 h-5" />
   </button>
 );
 
 // Add marquee animation to your tailwind config or use inline styles
 // For now, adding a simple CSS animation via inline style won't work, so we'll use a basic version
 // The actual marquee animation should be added to tailwind.config.ts