// frontend/src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, MapPin, Zap, Shield, Users, TrendingUp, 
  ChevronRight, Play, CheckCircle, Globe, Cpu,
  Battery, Route, Clock, BarChart3
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Real-Time Tracking',
      description: 'Monitor your entire fleet with live GPS tracking and geofencing capabilities.'
    },
    {
      icon: Route,
      title: 'AI Route Optimization',
      description: 'Reduce fuel costs and delivery times with intelligent route planning using Dijkstra\'s algorithm.'
    },
    {
      icon: Zap,
      title: 'Predictive Maintenance',
      description: 'Prevent breakdowns with AI-powered maintenance predictions and alerts.'
    },
    {
      icon: Battery,
      title: 'EV Fleet Support',
      description: 'Optimized for electric vehicle fleets with battery monitoring and charging station integration.'
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Dedicated dashboards for admins, fleet managers, drivers, and customers.'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive reports and insights to optimize fleet performance.'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Vehicles Managed' },
    { value: '99.9%', label: 'Uptime' },
    { value: '30%', label: 'Cost Reduction' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-neuro-dark">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-neuro-dark/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-neuro-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-xl font-bold text-white">NeuroFleetX</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-lg transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-neuro-accent">Fleet Intelligence</span> Platform
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              Transform your fleet operations with AI-driven insights, real-time tracking, 
              intelligent routing, and predictive maintenance. Built for the future of urban mobility.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             
                
              
                
             
            </div>
          </div>

        
          
        </div>
      </section>

      

     

      

      
      

      
    </div>
  );
};

export default LandingPage;