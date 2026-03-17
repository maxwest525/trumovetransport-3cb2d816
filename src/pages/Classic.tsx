import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Shield, Truck, Users, Star, ChevronDown, ChevronUp, CheckCircle2, Award, Home, Building, Package, ArrowRight, Heart, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/phoneFormat';
import heroImage from '@/assets/classic-hero-truck.jpg';
import familyPhoto from '@/assets/classic-family-1.jpg';
import familyMovingPhoto from '@/assets/classic-family-moving.jpg';
import serviceResidential from '@/assets/service-residential.jpg';
import serviceLongDistance from '@/assets/service-longdistance.jpg';
import serviceCommercial from '@/assets/service-commercial.jpg';
import servicePacking from '@/assets/service-packing.jpg';
import serviceSenior from '@/assets/service-senior.jpg';
import serviceStorage from '@/assets/service-storage.jpg';

const Classic = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    moveSize: '',
    moveType: '',
    moveDate: '',
    movingFrom: '',
    movingTo: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    localStorage.setItem("tm_lead", JSON.stringify({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      fromCity: formData.movingFrom.trim(),
      toCity: formData.movingTo.trim(),
      moveDate: formData.moveDate,
      size: formData.moveSize,
      moveType: formData.moveType,
      variant: 'classic',
      ts: Date.now()
    }));

    const subject = encodeURIComponent(`TruMove Quote Request - ${formData.name.trim()}`);
    const body = encodeURIComponent(`
TruMove Quote Request

CONTACT INFORMATION
Name: ${formData.name.trim()}
Email: ${formData.email.trim()}
Phone: ${formData.phone.trim()}

MOVE DETAILS
Moving From: ${formData.movingFrom.trim() || 'Not specified'}
Moving To: ${formData.movingTo.trim() || 'Not specified'}
Move Type: ${formData.moveType || 'Not specified'}
Move Size: ${formData.moveSize || 'Not specified'}
Preferred Date: ${formData.moveDate || 'Not specified'}

ADDITIONAL NOTES
${formData.message.trim() || 'None'}

---
Source: Classic Quote Form
Variant: classic
    `.trim());

    window.location.href = `mailto:quotes@trumove.com?subject=${subject}&body=${body}`;
    
    toast.success('Opening your email client...');
    setIsSubmitting(false);
  };

  // Clear error when user starts typing
  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const services = [
    {
      title: 'Residential Moving',
      description: 'Full-service home moving with the personal touch of a local mover.',
      icon: Home,
      image: serviceResidential,
    },
    {
      title: 'Long Distance',
      description: 'Coast-to-coast moves with one point of contact from start to finish.',
      icon: Truck,
      image: serviceLongDistance,
    },
    {
      title: 'Commercial Moving',
      description: 'Office relocations handled with professionalism and care.',
      icon: Building,
      image: serviceCommercial,
    },
    {
      title: 'Packing Services',
      description: 'We pack it like it\'s our own grandmother\'s china.',
      icon: Package,
      image: servicePacking,
    },
    {
      title: 'Senior Moving',
      description: 'Patient, compassionate service for our valued seniors.',
      icon: Users,
      image: serviceSenior,
    },
    {
      title: 'Storage Solutions',
      description: 'Secure, climate-controlled storage when you need it.',
      icon: Shield,
      image: serviceStorage,
    },
  ];

  const stats = [
    { value: '25+', label: 'Years Experience' },
    { value: '50,000+', label: 'Moves Completed' },
    { value: '4.9/5', label: 'Customer Rating' },
    { value: '100%', label: 'Licensed & Insured' },
  ];

  const testimonials = [
    {
      name: 'Margaret S.',
      location: 'Tampa, FL',
      text: 'The crew was wonderful - so patient and careful with my antiques. I couldn\'t have asked for better service. They made my move completely stress-free.',
    },
    {
      name: 'Robert & Linda M.',
      location: 'Atlanta, GA',
      text: 'After 40 years in our home, we were dreading the move. TruMove made it completely worry-free. Professional from start to finish.',
    },
    {
      name: 'James T.',
      location: 'Phoenix, AZ',
      text: 'Professional, punctual, and reasonably priced. They treated our furniture like it was their own. Would recommend to anyone.',
    },
  ];

  const faqs = [
    {
      question: 'How far in advance should I book my move?',
      answer: 'We recommend booking at least 2-4 weeks in advance, especially during peak moving seasons (May through September). This ensures we can accommodate your preferred dates and provide you with our best rates.',
    },
    {
      question: 'Do you provide packing materials and services?',
      answer: 'Yes! We offer complete packing services including all materials - boxes, tape, bubble wrap, and specialty containers for fragile items. You can choose full-service packing or purchase materials only.',
    },
    {
      question: 'Are you licensed and insured?',
      answer: 'Absolutely. We are fully licensed with the U.S. Department of Transportation and carry comprehensive insurance coverage. Your belongings are protected throughout the entire moving process.',
    },
    {
      question: 'How do you calculate the cost of a move?',
      answer: 'Moving costs depend on distance, volume of belongings, and services needed. We provide free, no-obligation estimates after understanding your specific needs. There are no hidden fees.',
    },
    {
      question: 'What if something gets damaged during the move?',
      answer: 'All moves include basic liability coverage. We also offer additional protection options for high-value items. In the rare event of damage, we have a straightforward claims process to make things right.',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
      {/* Add scroll-margin-top to all sections to offset sticky header */}
      <style>{`
        #home, #services, #quote, #about, #testimonials, #faq, #contact {
          scroll-margin-top: 80px;
        }
      `}</style>
      <div className="bg-[#1a365d] text-white py-2 text-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="mailto:info@trumove.com" className="flex items-center gap-2 hover:text-amber-300 transition-colors">
              <Mail className="w-4 h-4" />
              info@trumove.com
            </a>
            <span className="hidden md:flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Mon-Sat: 8:00 AM - 6:00 PM
            </span>
          </div>
          <a href="tel:1-800-555-6683" className="flex items-center gap-2 font-bold hover:text-amber-300 transition-colors">
            <Phone className="w-4 h-4" />
            1-800-555-MOVE
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b-4 border-[#1a365d] py-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1a365d] rounded-lg flex items-center justify-center">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-[#1a365d] tracking-tight">TruMove</span>
              <div className="text-xs text-gray-500 -mt-1">Professional Moving Services</div>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#home" className="text-[#1a365d] font-medium hover:text-amber-600 transition-colors">Home</a>
            <a href="#services" className="text-[#1a365d] font-medium hover:text-amber-600 transition-colors">Services</a>
            <a href="#about" className="text-[#1a365d] font-medium hover:text-amber-600 transition-colors">About Us</a>
            <a href="#testimonials" className="text-[#1a365d] font-medium hover:text-amber-600 transition-colors">Testimonials</a>
            <a href="#faq" className="text-[#1a365d] font-medium hover:text-amber-600 transition-colors">FAQ</a>
            <a href="#contact" className="text-[#1a365d] font-medium hover:text-amber-600 transition-colors">Contact</a>
          </nav>
          <a 
            href="#quote" 
            className="border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white px-6 py-3 rounded font-bold transition-colors"
          >
            Get Free Quote
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative">
        <div 
          className="min-h-[600px] bg-cover bg-center flex items-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-[#1a365d]/70" />
          <div className="relative container mx-auto px-4 py-16">
            <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-1 text-sm font-bold mb-4 rounded">
                  <Heart className="w-4 h-4" />
                  FAMILY OWNED SINCE 1998
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Small Company Care.<br />
                  <span className="text-amber-400">Nationwide Reach.</span>
                </h1>
                <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-xl">
                  We're still the same family business that started with one truck and a handshake — 
                  now serving all 50 states with the personal touch you deserve.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="#quote" 
                    className="border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-8 py-4 rounded text-lg font-bold transition-colors text-center shadow-lg flex items-center justify-center gap-2"
                  >
                    Get Your Free Quote
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <a 
                    href="tel:1-800-555-6683" 
                    className="bg-white hover:bg-gray-100 text-[#1a365d] px-8 py-4 rounded text-lg font-bold transition-colors text-center shadow-lg flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Call 1-800-555-MOVE
                  </a>
                </div>
              </div>
              
              {/* Right Compact Form */}
              <div className="hidden lg:block bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Accent Stripe */}
                <div className="h-[3px] bg-gradient-to-r from-[#1a365d]/60 via-amber-500 to-[#1a365d]/60" />
                <div className="bg-[#1a365d] px-6 py-4 text-center">
                  <h3 className="text-lg font-bold text-white">Get Your Free Quote</h3>
                  <p className="text-white/70 text-sm">No obligation • Response in 24hrs</p>
                </div>
                <div className="p-5 space-y-3">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="h-11 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="h-11 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', formatPhoneNumber(e.target.value))}
                    className="h-11 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Moving From"
                      value={formData.movingFrom}
                      onChange={(e) => handleFieldChange('movingFrom', e.target.value)}
                      className="h-11 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20"
                    />
                    <Input
                      placeholder="Moving To"
                      value={formData.movingTo}
                      onChange={(e) => handleFieldChange('movingTo', e.target.value)}
                      className="h-11 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20"
                    />
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base"
                  >
                    {isSubmitting ? 'Sending...' : 'Get Free Quote'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-center text-xs text-gray-500">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Your info is secure & never shared
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Strip */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {/* BBB Accredited */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#005a8c] rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">BBB</span>
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Accredited Business</div>
                <div className="text-[#1a365d] font-bold">A+ Rating</div>
              </div>
            </div>
            
            {/* FMCSA Licensed */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1a365d] rounded flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500 uppercase tracking-wide">FMCSA</div>
                <div className="text-[#1a365d] font-bold">Licensed Carrier</div>
              </div>
            </div>
            
            {/* Fully Insured */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded flex items-center justify-center">
                <BadgeCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Coverage</div>
                <div className="text-[#1a365d] font-bold">Fully Insured</div>
              </div>
            </div>
            
            {/* USDOT */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1a365d] rounded flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500 uppercase tracking-wide">USDOT</div>
                <div className="text-[#1a365d] font-bold">Registered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#1a365d] py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">{stat.value}</div>
                <div className="text-sm md:text-base opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-block bg-amber-500/10 text-amber-600 px-4 py-1 text-sm font-bold mb-4 rounded">
              OUR SERVICES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              Big Enough to Handle It. Small Enough to Care.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every move gets the personal attention of our family — whether you're moving down the block or across the country.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl hover:border-amber-400 transition-all duration-300 group"
              >
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a365d]/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-[#1a365d] mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section id="quote" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto overflow-hidden rounded-xl shadow-xl">
            {/* Accent Stripe */}
            <div className="h-[3px] bg-gradient-to-r from-[#1a365d]/60 via-amber-500 to-[#1a365d]/60" />
            <div className="bg-[#1a365d] p-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Get Your Free Moving Quote
              </h2>
              <p className="text-lg text-white/80">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
            </div>
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-b-xl shadow-2xl p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-[#1a365d] mb-2 uppercase tracking-wide">
                    Your Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Full Name"
                    maxLength={100}
                    className={`h-12 text-base border-gray-300 focus:border-amber-500 focus:ring-amber-500 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1a365d] mb-2 uppercase tracking-wide">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', formatPhoneNumber(e.target.value))}
                    placeholder="(555) 123-4567"
                    className={`h-12 text-base border-gray-300 focus:border-amber-500 focus:ring-amber-500 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#1a365d] mb-2 uppercase tracking-wide">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="your@email.com"
                  maxLength={255}
                  className={`h-12 text-base border-gray-300 focus:border-amber-500 focus:ring-amber-500 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-[#1a365d] mb-2 uppercase tracking-wide">
                    Moving From
                  </label>
                  <Input
                    type="text"
                    value={formData.movingFrom}
                    onChange={(e) => setFormData({ ...formData, movingFrom: e.target.value })}
                    placeholder="City, State or ZIP Code"
                    className="h-12 text-base border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1a365d] mb-2 uppercase tracking-wide">
                    Moving To
                  </label>
                  <Input
                    type="text"
                    value={formData.movingTo}
                    onChange={(e) => setFormData({ ...formData, movingTo: e.target.value })}
                    placeholder="City, State or ZIP Code"
                    className="h-12 text-base border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-[#1a365d] mb-2 uppercase tracking-wide">
                    Move Size
                  </label>
                  <Select
                    value={formData.moveSize}
                    onValueChange={(value) => setFormData({ ...formData, moveSize: value })}
                  >
                    <SelectTrigger className="h-12 text-base border-gray-300">
                      <SelectValue placeholder="Select size..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="1bed">1 Bedroom</SelectItem>
                      <SelectItem value="2bed">2 Bedrooms</SelectItem>
                      <SelectItem value="3bed">3 Bedrooms</SelectItem>
                      <SelectItem value="4bed">4+ Bedrooms</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1a365d] mb-2 uppercase tracking-wide">
                    Preferred Move Date
                  </label>
                  <Input
                    type="date"
                    value={formData.moveDate}
                    onChange={(e) => setFormData({ ...formData, moveDate: e.target.value })}
                    className="h-12 text-base border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-[#1a365d] mb-2 uppercase tracking-wide">
                  Additional Details (Optional)
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about any special requirements, large items, or questions..."
                  rows={4}
                  className="text-base border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white rounded"
              >
                {isSubmitting ? 'Sending...' : 'Request My Free Quote →'}
              </Button>
              <p className="text-center text-sm text-gray-500 mt-4">
                ✓ No Obligation &nbsp;&nbsp; ✓ Quick Response &nbsp;&nbsp; ✓ Transparent Pricing
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Family-Owned Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-1 text-sm font-bold mb-4 rounded">
                <Heart className="w-4 h-4" />
                FAMILY OWNED & OPERATED
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
                Local Values. National Service.
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We've grown from a one-truck operation to serving all 50 states — but we've never 
                forgotten that every move is personal. You'll always talk to family, not a call center.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <img 
                  src={familyPhoto} 
                  alt="The TruMove Family" 
                  className="rounded-xl shadow-xl w-full"
                />
                <p className="text-center text-sm text-gray-500 mt-3 italic">
                  The Mitchell Family — Three generations, one commitment to you
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#1a365d] mb-4">
                  "Your Move Is Personal to Us"
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  In 1998, our father started this company with one truck and a simple promise: 
                  treat every customer like family. That's still how we operate today — even though 
                  we now move families coast to coast.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  When you call TruMove, you're not getting a faceless corporation. You're getting 
                  a family that's been moving families for over 25 years. Our grandchildren now 
                  help out on weekends — that's how much this business means to us.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-amber-500" />
                    <span className="text-[#1a365d] font-medium">Fully Licensed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-amber-500" />
                    <span className="text-[#1a365d] font-medium">Fully Insured</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-amber-500" />
                    <span className="text-[#1a365d] font-medium">No Hidden Fees</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-amber-500" />
                    <span className="text-[#1a365d] font-medium">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-[#1a365d] rounded-xl p-8 text-white">
                  <Award className="w-16 h-16 text-amber-400 mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Our Family Promise</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mt-2" />
                      <span>On-time pickup and delivery, guaranteed</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mt-2" />
                      <span>Careful handling of all your belongings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mt-2" />
                      <span>Transparent pricing with no surprises</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mt-2" />
                      <span>Background-checked, trained crew members</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mt-2" />
                      <span>A real person answers when you call</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <img 
                  src={familyMovingPhoto} 
                  alt="Happy family on moving day" 
                  className="rounded-xl shadow-xl w-full"
                />
                <p className="text-center text-sm text-gray-500 mt-3 italic">
                  Making moving day a happy memory for families everywhere
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-block bg-amber-500/10 text-amber-600 px-4 py-1 text-sm font-bold mb-4 rounded">
              TESTIMONIALS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our customers have to say about their experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-bold text-[#1a365d]">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-block bg-amber-500/10 text-amber-600 px-4 py-1 text-sm font-bold mb-4 rounded">
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions? We have answers. If you don't see your question here, give us a call.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-medium text-[#1a365d] pr-4">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#1a365d]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Contact us today for a free, no-obligation quote. We're here to make your move as smooth as possible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#quote" 
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded text-lg font-bold transition-colors text-center shadow-lg"
            >
              Get Your Free Quote
            </a>
            <a 
              href="tel:1-800-555-6683" 
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded text-lg font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              1-800-555-MOVE
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#0f2744] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">TruMove</span>
              </div>
              <p className="text-white/70 leading-relaxed mb-6 max-w-md">
                Professional moving services with care and integrity. Licensed, insured, 
                and trusted by families nationwide for over 25 years.
              </p>
              <div className="flex items-center gap-4">
                <div className="bg-white/10 px-3 py-2 rounded text-sm">
                  <span className="text-white/60">USDOT #</span> 4507647
                </div>
                <div className="bg-white/10 px-3 py-2 rounded text-sm">
                  <span className="text-white/60">MC #</span> 1784124
                </div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Us</h4>
              <div className="space-y-3 text-white/70">
                <a href="tel:1-800-555-6683" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Phone className="w-4 h-4" />
                  1-800-555-MOVE
                </a>
                <a href="mailto:info@trumove.com" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Mail className="w-4 h-4" />
                  info@trumove.com
                </a>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Mon-Sat: 8:00 AM - 6:00 PM
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Serving All 50 States
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <div className="space-y-2 text-white/70">
                <a href="#home" className="block hover:text-amber-400 transition-colors">Home</a>
                <a href="#services" className="block hover:text-amber-400 transition-colors">Our Services</a>
                <a href="#quote" className="block hover:text-amber-400 transition-colors">Get a Quote</a>
                <a href="#about" className="block hover:text-amber-400 transition-colors">About Us</a>
                <a href="#faq" className="block hover:text-amber-400 transition-colors">FAQ</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
              <p>© {new Date().getFullYear()} TruMove. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="/site" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  ← Back to Modern Site
                </a>
                <a href="/site/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
                <a href="/site/terms" className="hover:text-amber-400 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Classic;
