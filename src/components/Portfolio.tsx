import React from 'react';
import { ArrowRight } from 'lucide-react';

const projects = [
  {
    title: 'Aura Fintech',
    category: 'SaaS Platform',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Lumina Luxury',
    category: 'E-Commerce App',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Nova AI',
    category: 'Generative Platform',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
  }
];

export default function Portfolio() {
  return (
    <section id="work" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              Visionary <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F43F5E] to-[#7C3AED]">Work</span>
            </h2>
            <p className="text-slate-400">
              A selection of recent projects showcasing our philosophy of merging aesthetics with flawless execution.
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-white font-medium hover:text-[#06B6D4] transition-colors mt-6 md:mt-0">
            View All Projects <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-3xl mb-6 glass-card">
                <div className="aspect-[4/5] relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F23] to-transparent z-10 opacity-60" />
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2 group-hover:text-[#06B6D4] transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-400">
                  {project.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

