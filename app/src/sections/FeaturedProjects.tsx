import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { featuredProjectsConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export function FeaturedProjects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  if (!featuredProjectsConfig.titleRegular && featuredProjectsConfig.projects.length === 0) return null;

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

      // Project cards — clip-path reveal + scale + parallax + text stagger
      const projectCards = projectsRef.current?.querySelectorAll('.project-card');
      if (projectCards) {
        projectCards.forEach((card, index) => {
          const imageWrap = card.querySelector('.project-image-wrap') as HTMLElement;
          const img = card.querySelector('.project-image') as HTMLElement;
          const content = card.querySelector('.project-content') as HTMLElement;
          const textEls = content?.querySelectorAll('.project-text-item');

          // Alternate clip-path direction: even from left, odd from right
          const fromClip = index % 2 === 0
            ? 'inset(0 100% 0 0)'
            : 'inset(0 0 0 100%)';

          // Image wrapper — clip-path reveal
          if (imageWrap) {
            ScrollTrigger.create({
              trigger: card,
              start: 'top 80%',
              onEnter: () => {
                gsap.set(imageWrap, { opacity: 1 });
                gsap.fromTo(
                  imageWrap,
                  { clipPath: fromClip },
                  {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    duration: 1.4,
                    ease: 'power4.inOut',
                  }
                );
                // Inner image scale
                if (img) {
                  gsap.fromTo(
                    img,
                    { scale: 1.35 },
                    { scale: 1.1, duration: 1.8, ease: 'power3.out' }
                  );
                }
              },
              once: true,
            });

            // Parallax on image
            if (img) {
              gsap.fromTo(
                img,
                { yPercent: -5 },
                {
                  yPercent: 5,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: imageWrap,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5,
                  },
                }
              );
            }
          }

          // Content — staggered text reveal
          if (content) {
            ScrollTrigger.create({
              trigger: card,
              start: 'top 75%',
              onEnter: () => {
                gsap.set(content, { opacity: 1 });
                if (textEls && textEls.length) {
                  gsap.fromTo(
                    textEls,
                    { y: 50, opacity: 0 },
                    {
                      y: 0,
                      opacity: 1,
                      duration: 0.9,
                      ease: 'power3.out',
                      stagger: 0.1,
                      delay: 0.4,
                    }
                  );
                }
              },
              once: true,
            });
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 bg-forest-dark"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-20 opacity-0">
          <div>
            {featuredProjectsConfig.subtitle && (
              <p className="text-white/50 text-sm font-body uppercase tracking-widest mb-4">
                {featuredProjectsConfig.subtitle}
              </p>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-white tracking-tight">
              {featuredProjectsConfig.titleRegular} <span className="font-serif italic font-normal text-white/80">{featuredProjectsConfig.titleItalic}</span>
            </h2>
          </div>
          {featuredProjectsConfig.viewAllText && (
            <a
              href={featuredProjectsConfig.viewAllHref || '#contact'}
              className="mt-6 md:mt-0 inline-flex items-center gap-2 text-white/70 hover:text-white font-body text-sm transition-colors duration-300 group"
            >
              {featuredProjectsConfig.viewAllText}
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </a>
          )}
        </div>

        {/* Projects Grid */}
        <div ref={projectsRef} className="space-y-20 md:space-y-32">
          {featuredProjectsConfig.projects.map((project, index) => (
            <div
              key={project.id}
              className={`project-card grid md:grid-cols-2 gap-8 md:gap-12 items-center ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Image with Viewfinder */}
              <div
                className={`project-image-wrap relative overflow-hidden rounded-lg group cursor-pointer opacity-0 ${
                  index % 2 === 1 ? 'md:order-2' : ''
                }`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="project-image w-full h-full object-cover will-change-transform"
                    loading="lazy"
                  />
                </div>

                {/* Viewfinder overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-white/70 transition-all duration-300 group-hover:w-12 group-hover:h-12 group-hover:border-white" />
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-white/70 transition-all duration-300 group-hover:w-12 group-hover:h-12 group-hover:border-white" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-white/70 transition-all duration-300 group-hover:w-12 group-hover:h-12 group-hover:border-white" />
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-white/70 transition-all duration-300 group-hover:w-12 group-hover:h-12 group-hover:border-white" />
                  {/* Center crosshair */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-px h-6 bg-white/50" />
                    <div className="w-6 h-px bg-white/50 -mt-3 -ml-[11px]" />
                  </div>
                </div>

                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Content */}
              <div className={`project-content opacity-0 ${index % 2 === 1 ? 'md:order-1 md:text-right' : ''}`}>
                <div className={`project-text-item flex items-center gap-3 mb-4 ${index % 2 === 1 ? 'md:justify-end' : ''}`}>
                  <span className="text-white/50 font-body text-sm">{project.category}</span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span className="text-white/50 font-body text-sm">{project.year}</span>
                </div>
                <h3 className="project-text-item text-2xl md:text-3xl lg:text-4xl font-sans font-bold text-white tracking-tight mb-4">
                  {project.title}
                </h3>
                <p className="project-text-item text-white/60 font-body text-base md:text-lg leading-relaxed mb-6">
                  {project.description}
                </p>
                {featuredProjectsConfig.viewProjectText && (
                  <a
                    href="#contact"
                    className={`project-text-item inline-flex items-center gap-2 text-white font-body text-sm border-b border-white/30 pb-1 hover:border-white transition-colors duration-300 group/link ${
                      index % 2 === 1 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {featuredProjectsConfig.viewProjectText}
                    <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-300" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
