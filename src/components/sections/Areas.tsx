import { MapPin } from "lucide-react";

export function Areas() {
  const areas = [
    "Buckhead",
    "Alpharetta",
    "Sandy Springs",
    "Roswell",
    "Dunwoody",
    "Johns Creek",
    "Marietta",
    "Brookhaven"
  ];

  return (
    <section id="areas" className="py-24 bg-[#020202] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-center justify-between">
          <div className="md:w-1/3">
            <h2 className="text-3xl md:text-5xl font-display text-white mb-4">Maid Service for Buckhead, Alpharetta &amp; Atlanta Metro</h2>
            <p className="text-white/50 text-lg mb-8">
              Professional house cleaning in Sandy Springs, Roswell, Dunwoody, Johns Creek, Marietta, and Brookhaven. Proudly serving premium Atlanta neighborhoods.
            </p>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {areas.map((area) => (
              <div 
                key={area}
                className="flex items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group cursor-default"
              >
                <MapPin className="w-4 h-4 text-white/30 group-hover:text-blue-400 transition-colors" />
                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  {area}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
