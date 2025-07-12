import React from 'react';
import { Check } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';

const plans = [
  {
    name: "Free",
    price: "$0",
    features: [
      "3 AI-generated CVs per month",
      "Basic ATS optimization",
      "Standard templates",
      "Up to 6 credits rollover",
      "Email support"
    ],
    buttonText: "Get Started",
    popular: false
  },
  {
    name: "Plus",
    price: "$12",
    period: "/month",
    features: [
      "30 AI-generated CVs per month",
      "Advanced ATS optimization",
      "Premium templates",
      "Up to 60 credits rollover",
      "Priority support",
      "Custom branding",
      "Export formats"
    ],
    buttonText: "Start Free Trial",
    popular: true
  },
  {
    name: "Pro",
    price: "$39",
    period: "/month",
    features: [
      "100 AI-generated CVs per month",
      "Enterprise ATS optimization",
      "All premium templates",
      "Up to 200 credits rollover",
      "Dedicated support",
      "Team collaboration",
      "Advanced analytics",
      "API access"
    ],
    buttonText: "Contact Sales",
    popular: false
  }
];

export const Pricing = () => {
  return (
    <div className="py-20">
      <FadeIn>
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Simple, Transparent <span className="gradient-text">Pricing</span>
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          All plans include monthly credits that rollover. Need more? Purchase additional credits that never expire.
        </p>
      </FadeIn>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {plans.map((plan, index) => (
          <FadeIn 
            key={index} 
            delay={index * 0.2}
            className={`bg-dark-light p-8 rounded-lg ${
              plan.popular ? 'ring-2 ring-primary' : ''
            }`}
          >
            {plan.popular && (
              <span className="bg-primary text-dark text-sm font-bold px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="text-2xl font-bold text-white mt-4">{plan.name}</h3>
            <div className="mt-4 mb-6">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              {plan.period && (
                <span className="text-gray-400">{plan.period}</span>
              )}
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center text-gray-400">
                  <Check className="w-5 h-5 text-primary mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-lg font-bold ${
              plan.popular
                ? 'bg-primary text-dark hover:bg-primary-dark'
                : 'bg-dark text-white hover:bg-dark-light border border-gray-700'
            } transition-all transform hover:scale-105`}>
              {plan.buttonText}
            </button>
          </FadeIn>
        ))}
      </div>
      
      <FadeIn delay={0.6}>
        <div className="mt-16 bg-dark-light rounded-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-4">
            Need More Credits?
          </h3>
          <p className="text-gray-400 text-center mb-6">
            Purchase additional credits that work with any plan and never expire.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-dark p-4 rounded-lg">
              <h4 className="text-primary font-bold text-lg">5 Credits</h4>
              <p className="text-white text-xl font-bold">$9.99</p>
              <p className="text-gray-400 text-sm">$2.00 per credit</p>
            </div>
            <div className="bg-dark p-4 rounded-lg">
              <h4 className="text-primary font-bold text-lg">10 Credits</h4>
              <p className="text-white text-xl font-bold">$17.99</p>
              <p className="text-gray-400 text-sm">$1.80 per credit</p>
            </div>
            <div className="bg-dark p-4 rounded-lg border-2 border-primary">
              <h4 className="text-primary font-bold text-lg">25 Credits</h4>
              <p className="text-white text-xl font-bold">$39.99</p>
              <p className="text-gray-400 text-sm">$1.60 per credit</p>
              <span className="text-xs bg-primary text-dark px-2 py-1 rounded-full mt-2 inline-block">
                Best Value
              </span>
            </div>
            <div className="bg-dark p-4 rounded-lg">
              <h4 className="text-primary font-bold text-lg">50 Credits</h4>
              <p className="text-white text-xl font-bold">$69.99</p>
              <p className="text-gray-400 text-sm">$1.40 per credit</p>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};
