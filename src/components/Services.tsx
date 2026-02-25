import React from 'react';
import { Layout, Smartphone, Code2, Cpu, Zap, Eye } from 'lucide-react';

const services = [
  {
    title: 'Product Design',
    description: 'We craft intuitive, user-centric interfaces that convert and engage.',
    icon: <Layout className="w-6 h-6 text-[#7C3AED]" />,
    className: 'md:col-span-2 md:row-span-2',
    image: '/images/service-design.png'
  },
  {
    title: 'Mobile Apps',
    description: 'High-performance native and cross-platform mobile experiences.',
    icon: <Smartphone className="w-6 h-6 text-[#06B6D4]" />,
    className: 'md:col-span-1 md:row-span-1',
    image: '/images/service-mobile.png'
  },
  {
    title: 'Web Engineering',
    description: 'Scalable, accessible, and blazingly fast web applications.',
    icon: <Code2 className="w-6 h-6 text-[#F43F5E]" />,
    className: 'md:col-span-1 md:row-span-1',
    image: '/images/service-web.png'
  },
  {
    title: 'AI Integration',
    description: 'Native AI features designed seamlessly into your product workflows.',
    icon: <Cpu className="w-6 h-6 text-[#E2E8F0]" />,
    className: 'md:col-span-2 md:row-span-1',
    image: '/images/service-ai.png'
  }
];

export default function Services() {
  return (
    <section id="services" className="pt-20 pb-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Beyond <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#7C3AED]">Expectations</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Our multidisciplinary team delivers premium digital products through a refined process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 auto-rows-[320px] gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-3xl glass-card transition-all duration-500 hover:-translate-y-2 cursor-pointer ${service.className}`}
            >
              {/* Background Image Setup */}
              <div className="absolute inset-0 z-0">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-75 transition-all duration-700 ease-in-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F23] via-[#0F0F23]/60 to-transparent" />
              </div>

              {/* Glassmorphism Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 mix-blend-overlay" />

              <div className="p-8 flex flex-col h-full relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#0F0F23]/80 backdrop-blur-md border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
                  {service.icon}
                </div>

                <div className="mt-auto">
                  <h3 className="text-2xl font-semibold mb-3 text-white drop-shadow-md">
                    {service.title}
                  </h3>
                  <p className="text-slate-300 group-hover:text-white transition-colors leading-relaxed drop-shadow">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

