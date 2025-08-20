interface City {
  id: string
  name: string
  state: string | null
  description: string | null
  imageUrl: string | null
  _count: {
    locations: number
  }
}

interface CityHeaderProps {
  city: City
}

export function CityHeader({ city }: CityHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" fill="%23000"><defs><linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%2300182e;stop-opacity:1" /><stop offset="50%" style="stop-color:%23002d4a;stop-opacity:1" /><stop offset="100%" style="stop-color:%23000000;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="600" fill="url(%23sky)"/><g fill="%23ffffff" opacity="0.1"><circle cx="100" cy="80" r="2"/><circle cx="300" cy="120" r="1.5"/><circle cx="500" cy="60" r="1"/><circle cx="700" cy="100" r="2.5"/><circle cx="900" cy="70" r="1.8"/><circle cx="1100" cy="90" r="1.2"/></g><g fill="%23ffffff" opacity="0.05"><rect x="50" y="400" width="40" height="200"/><rect x="120" y="350" width="35" height="250"/><rect x="200" y="380" width="50" height="220"/><rect x="280" y="320" width="45" height="280"/><rect x="350" y="360" width="60" height="240"/><rect x="440" y="300" width="55" height="300"/><rect x="520" y="340" width="70" height="260"/><rect x="620" y="280" width="65" height="320"/><rect x="710" y="320" width="80" height="280"/><rect x="820" y="260" width="75" height="340"/><rect x="920" y="300" width="90" height="300"/><rect x="1040" y="240" width="85" height="360"/><rect x="1150" y="280" width="100" height="320"/></g><g fill="%23ffffff" opacity="0.03"><rect x="80" y="420" width="20" height="180"/><rect x="140" y="380" width="25" height="220"/><rect x="220" y="400" width="30" height="200"/><rect x="300" y="360" width="35" height="240"/><rect x="380" y="380" width="40" height="220"/><rect x="470" y="340" width="45" height="260"/><rect x="550" y="360" width="50" height="240"/><rect x="650" y="320" width="55" height="280"/><rect x="740" y="340" width="60" height="260"/><rect x="850" y="300" width="65" height="300"/><rect x="950" y="320" width="70" height="280"/><rect x="1070" y="280" width="75" height="320"/><rect x="1180" y="300" width="80" height="300"/></g><g fill="%23ffffff" opacity="0.02"><rect x="90" y="440" width="10" height="160"/><rect x="150" y="400" width="15" height="200"/><rect x="230" y="420" width="20" height="180"/><rect x="310" y="380" width="25" height="220"/><rect x="390" y="400" width="30" height="200"/><rect x="480" y="360" width="35" height="240"/><rect x="560" y="380" width="40" height="220"/><rect x="660" y="340" width="45" height="260"/><rect x="750" y="360" width="50" height="240"/><rect x="860" y="320" width="55" height="280"/><rect x="960" y="340" width="60" height="260"/><rect x="1080" y="300" width="65" height="300"/><rect x="1190" y="320" width="70" height="280"/></g><g fill="%23ffffff" opacity="0.08"><rect x="70" y="450" width="5" height="150"/><rect x="130" y="410" width="8" height="190"/><rect x="210" y="430" width="12" height="170"/><rect x="290" y="390" width="15" height="210"/><rect x="370" y="410" width="18" height="190"/><rect x="460" y="370" width="22" height="230"/><rect x="540" y="390" width="25" height="210"/><rect x="640" y="350" width="28" height="250"/><rect x="730" y="370" width="32" height="230"/><rect x="840" y="330" width="35" height="270"/><rect x="940" y="350" width="38" height="250"/><rect x="1060" y="310" width="42" height="290"/><rect x="1170" y="330" width="45" height="270"/></g></svg>')`
    }}>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute top-1/4 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-12"></div>
      <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full -translate-y-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm mb-4">
            <span>Home</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Cities</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium">{city.name}</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            {city.name}{city.state ? `, ${city.state}` : ''}
          </h1>
          
          {/* Subtitle */}
          {city.description && (
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              {city.description}
            </p>
          )}
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white mb-1">
                {city._count.locations}
              </div>
              <div className="text-white/80 text-sm">
                Remote Work Spots
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white mb-1">
                4.8
              </div>
              <div className="text-white/80 text-sm">
                Average Rating
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white mb-1">
                24/7
              </div>
              <div className="text-white/80 text-sm">
                Always Available
              </div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explore All Spots
              </span>
            </button>
            <button className="border-2 border-white/30 text-white hover:bg-white/10 font-bold py-3 px-6 rounded-lg transition-all duration-200 backdrop-blur-sm">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Spot
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
} 