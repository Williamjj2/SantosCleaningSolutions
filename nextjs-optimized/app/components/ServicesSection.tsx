import { CheckIcon, HomeIcon, SparklesIcon, TruckIcon } from '@heroicons/react/24/outline'

const services = [
  {
    name: 'Regular House Cleaning',
    description: 'Weekly, bi-weekly, or monthly hamod cleaning services to keep your Marietta or Atlanta home spotless.',
    price: 'Starting from $69',
    icon: HomeIcon,
    features: [
      'Surface cleaning & dusting',
      'Vacuuming & mopping',
      'Bathroom sanitization',
      'Kitchen deep clean',
      'Trash removal',
      'Flexible scheduling'
    ],
    popular: false
  },
  {
    name: 'Deep Cleaning',
    description: 'Comprehensive top-to-bottom hamod cleaning perfect for first-time visits or seasonal deep cleans.',
    price: 'Starting from $159',
    icon: SparklesIcon,
    features: [
      'All regular cleaning services',
      'Inside appliances',
      'Baseboards & window sills',
      'Light fixtures & ceiling fans',
      'Inside cabinets',
      'Detailed bathroom scrub'
    ],
    popular: true
  },
  {
    name: 'Move-In/Move-Out Cleaning',
    description: 'Complete cleaning service for moving transitions in Atlanta metro area. Leave nothing behind!',
    price: 'Starting from $173',
    icon: TruckIcon,
    features: [
      'Complete deep cleaning',
      'Inside all cabinets & drawers',
      'Appliance deep cleaning',
      'Wall washing',
      'Closet cleaning',
      'Garage cleaning available'
    ],
    popular: false
  }
]

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display">
            Professional <span className="text-primary-600">Hamod Cleaning</span> Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Serving Marietta, Atlanta, Buckhead, Sandy Springs, Alpharetta, and Roswell with 
            professional house cleaning services you can trust.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <div 
              key={service.name}
              className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                service.popular ? 'ring-2 ring-primary-500 scale-105' : ''
              }`}
            >
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${service.popular ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    <service.icon className={`w-8 h-8 ${service.popular ? 'text-primary-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 font-display">{service.name}</h3>
                    <p className={`text-2xl font-bold ${service.popular ? 'text-primary-600' : 'text-accent-600'}`}>
                      {service.price}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={`block w-full text-center py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
                    service.popular
                      ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-primary-500/25'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Get Free Estimate
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Service Areas */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            We Proudly Serve These Areas in Georgia
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Marietta, GA',
              'Atlanta, GA', 
              'Buckhead, Atlanta',
              'Sandy Springs, GA',
              'Alpharetta, GA',
              'Roswell, GA',
              'Smyrna, GA',
              'Vinings, GA'
            ].map((area) => (
              <span
                key={area}
                className="inline-block bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}