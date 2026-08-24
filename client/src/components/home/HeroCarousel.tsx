import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    badge: '10-MINUTE GROCERY DELIVERY',
    title: 'Fresh Farm Fruits & Veggies',
    subtitle: 'Harvested daily, delivered crisp & fresh within minutes.',
    tag: 'UP TO 30% OFF',
    cta: 'Shop Fresh Produce',
    link: '/categories/fruits-vegetables',
    bgGradient: 'from-emerald-700 via-emerald-600 to-teal-800',
    accentColor: 'bg-emerald-400 text-emerald-950',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    badge: 'DAILY ESSENTIALS',
    title: 'Dairy, Breads & Farm Fresh Eggs',
    subtitle: 'Pure milk, salted butter, artisan breads delivered by 7 AM.',
    tag: 'BEST PRICES',
    cta: 'Order Breakfast Essentials',
    link: '/categories/dairy-bread-eggs',
    bgGradient: 'from-blue-800 via-indigo-700 to-blue-900',
    accentColor: 'bg-amber-400 text-indigo-950',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    badge: 'EXCLUSIVE COUPON: WELCOME50',
    title: 'Flat 50% Off On Your First Order',
    subtitle: 'Use coupon code WELCOME50 at checkout on orders above ₹199.',
    tag: 'SAVE ₹100',
    cta: 'Explore All Products',
    link: '/categories/snacks-munchies',
    bgGradient: 'from-amber-600 via-orange-600 to-red-700',
    accentColor: 'bg-white text-orange-900',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
  },
];

export const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`min-w-full relative bg-gradient-to-r ${slide.bgGradient} text-white p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[260px] sm:min-h-[300px]`}
          >
            {/* Left Content */}
            <div className="flex-1 z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-[10px] sm:text-xs font-black tracking-wider uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {slide.badge}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-2">
                {slide.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/85 max-w-md mb-5 leading-relaxed mx-auto md:mx-0">
                {slide.subtitle}
              </p>
              <Link
                to={slide.link}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-900 font-bold text-xs sm:text-sm hover:bg-gray-100 transition shadow-lg active:scale-95"
              >
                <span>{slide.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right Image */}
            <div className="w-44 sm:w-60 md:w-72 aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 shrink-0 hidden sm:block">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur transition"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur transition"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              current === i ? 'w-6 bg-white' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;