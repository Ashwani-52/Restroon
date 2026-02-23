import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import { Quote } from 'lucide-react';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/free-mode';
import { testimonialsConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!testimonialsConfig.titleRegular && testimonialsConfig.testimonials.length === 0) return null;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header — slide up
      ScrollTrigger.create({
        trigger: headerRef.current,
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo(
            headerRef.current,
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
          );
        },
        once: true,
      });

      // Carousel — fade up
      ScrollTrigger.create({
        trigger: carouselRef.current,
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo(
            carouselRef.current,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
          );
        },
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 bg-white overflow-hidden"
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16 md:mb-20">
        <div ref={headerRef} className="text-center opacity-0">
          {testimonialsConfig.subtitle && (
            <p className="text-softblack/50 text-sm font-body uppercase tracking-widest mb-4">
              {testimonialsConfig.subtitle}
            </p>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-softblack tracking-tight">
            {testimonialsConfig.titleRegular} <span className="font-serif italic font-normal text-softblack/70">{testimonialsConfig.titleItalic}</span>
          </h2>
        </div>
      </div>

      {/* Testimonials Carousel */}
      <div ref={carouselRef} className="relative opacity-0">
        <Swiper
          modules={[Autoplay, FreeMode]}
          spaceBetween={24}
          slidesPerView={1.2}
          centeredSlides={true}
          loop={true}
          speed={800}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 1.5,
              spaceBetween: 24,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 32,
            },
            1024: {
              slidesPerView: 2.5,
              spaceBetween: 40,
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 48,
            },
          }}
          className="!px-6"
        >
          {testimonialsConfig.testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <div className="group bg-offwhite rounded-lg p-8 md:p-10 h-full transition-all duration-500 hover:bg-forest-dark hover:text-white">
                {/* Quote icon */}
                <Quote className="w-10 h-10 text-softblack/10 group-hover:text-white/20 mb-6 transition-colors duration-500" strokeWidth={1} />

                {/* Quote text */}
                <p className="text-softblack/80 group-hover:text-white/90 font-body text-base md:text-lg leading-relaxed mb-8 transition-colors duration-500">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-softblack group-hover:text-white transition-colors duration-500">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-softblack/50 group-hover:text-white/60 font-body transition-colors duration-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Gradient overlays for fade effect */}
        <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      </div>

      {/* Decorative element */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16">
        <div className="h-px bg-gradient-to-r from-transparent via-softblack/10 to-transparent" />
      </div>
    </section>
  );
}
