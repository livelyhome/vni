import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Menu, X, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Clock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [about, setAbout] = useState({ title: '', content: '' });
  const [busyDates, setBusyDates] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchAbout();
    fetchAvailability();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchAbout = async () => {
    try {
      const response = await axios.get(`${API}/about`);
      setAbout(response.data);
    } catch (error) {
      console.error('Error fetching about:', error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`${API}/calendar/availability`);
      const busy = response.data.dates
        .filter(d => !d.is_available)
        .map(d => new Date(d.date));
      setBusyDates(busy);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, formData);
      toast.success('Thank you! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-800">Construction Pro</h1>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">About</a>
              <a href="#gallery" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">Gallery</a>
              <a href="#calendar" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">Availability</a>
              <a href="#contact" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">Contact</a>
              <a href="/admin/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Admin</a>
            </div>
            
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t" data-testid="mobile-menu">
            <div className="px-4 py-3 space-y-3">
              <a href="#about" className="block text-slate-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>About</a>
              <a href="#gallery" className="block text-slate-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Gallery</a>
              <a href="#calendar" className="block text-slate-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Availability</a>
              <a href="#contact" className="block text-slate-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <a href="/admin/login" className="block text-blue-600" onClick={() => setMobileMenuOpen(false)}>Admin</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Building Dreams,<br />Creating Quality
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Professional construction services you can trust. Family-owned, quality-focused.
          </p>
          <Button 
            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full transition-all hover:shadow-lg"
            data-testid="get-quote-btn"
          >
            Get a Free Quote
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-8 text-center" data-testid="about-title">{about.title || 'About Us'}</h2>
          <div className="bg-slate-50 rounded-2xl p-8 shadow-sm border border-slate-200">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap" data-testid="about-content">
              {about.content || 'Welcome to our family-owned construction business. We take pride in delivering quality workmanship and exceptional service.'}
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Our Projects</h2>
          {projects.length === 0 ? (
            <div className="text-center text-slate-500">
              <p>No projects available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-16">
              {projects.map((project) => (
                <ProjectGallery key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Calendar Section */}
      <section id="calendar" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">Check Our Availability</h2>
          <p className="text-slate-600 text-center mb-12">See when we're available for inspections. Dates marked in red are busy.</p>
          <div className="flex justify-center" data-testid="availability-calendar">
            <Calendar
              mode="single"
              disabled={busyDates}
              className="rounded-2xl border-2 border-slate-200 shadow-md bg-white p-4"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Get In Touch</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full"
                  placeholder="Your name"
                  data-testid="contact-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full"
                  placeholder="your@email.com"
                  data-testid="contact-email-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full"
                  placeholder="Your phone number"
                  data-testid="contact-phone-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message *</label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full min-h-[120px]"
                  placeholder="Tell us about your project..."
                  data-testid="contact-message-input"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl transition-all hover:shadow-lg"
                data-testid="contact-submit-btn"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Construction Pro</h3>
          <p className="text-slate-400 mb-6">Building excellence since day one</p>
          <div className="flex justify-center space-x-6 text-slate-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-slate-500 mt-8 text-sm">© 2025 Construction Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Project Gallery Component with Horizontal Scroll
const ProjectGallery = ({ project }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const images = project.images.length > 0 
    ? project.images 
    : [
        'https://images.unsplash.com/photo-1541976844346-f18aeac57b06?w=800',
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
        'https://images.unsplash.com/photo-1590496793907-3802b8db1d26?w=800'
      ];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200" data-testid={`project-${project.id}`}>
      <div className="p-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-2" data-testid={`project-title-${project.id}`}>{project.title}</h3>
        <p className="text-slate-600 mb-6" data-testid={`project-description-${project.id}`}>{project.description}</p>
      </div>
      
      <div className="relative group">
        <div className="aspect-video overflow-hidden bg-slate-100">
          <img
            src={images[currentIndex]}
            alt={`${project.title} - ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-testid={`project-image-${project.id}`}
          />
        </div>
        
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
              data-testid={`project-prev-btn-${project.id}`}
            >
              <ChevronLeft className="h-6 w-6 text-slate-900" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
              data-testid={`project-next-btn-${project.id}`}
            >
              <ChevronRight className="h-6 w-6 text-slate-900" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                  data-testid={`project-dot-${project.id}-${idx}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
