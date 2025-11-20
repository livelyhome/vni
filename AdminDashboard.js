import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Calendar } from '../components/ui/calendar';
import { toast } from 'sonner';
import { LogOut, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [about, setAbout] = useState({ title: '', content: '' });
  const [contacts, setContacts] = useState([]);
  const [busyDates, setBusyDates] = useState([]);
  const [newProject, setNewProject] = useState({ title: '', description: '', order: 0 });
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutForm, setAboutForm] = useState({ title: '', content: '' });

  const token = localStorage.getItem('admin_token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    fetchProjects();
    fetchAbout();
    fetchContacts();
    fetchAvailability();
  };

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
      setAboutForm({ title: response.data.title, content: response.data.content });
    } catch (error) {
      console.error('Error fetching about:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API}/contact`, axiosConfig);
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
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

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    onLogout();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/projects`, newProject, axiosConfig);
      toast.success('Project created successfully');
      setNewProject({ title: '', description: '', order: 0 });
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`${API}/projects/${projectId}`, axiosConfig);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleImageUpload = async (projectId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${API}/projects/${projectId}/images`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Image uploaded successfully');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleDeleteImage = async (projectId, imageIndex) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await axios.delete(`${API}/projects/${projectId}/images/${imageIndex}`, axiosConfig);
      toast.success('Image deleted successfully');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleUpdateAbout = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/about`, aboutForm, axiosConfig);
      toast.success('About section updated successfully');
      setEditingAbout(false);
      fetchAbout();
    } catch (error) {
      toast.error('Failed to update about section');
    }
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isBusy = busyDates.some(d => d.toISOString().split('T')[0] === dateStr);
    
    if (isBusy) {
      setBusyDates(busyDates.filter(d => d.toISOString().split('T')[0] !== dateStr));
    } else {
      setBusyDates([...busyDates, date]);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      const dates = busyDates.map(date => ({
        date: date.toISOString().split('T')[0],
        is_available: false
      }));
      await axios.put(`${API}/calendar/availability`, { dates }, axiosConfig);
      toast.success('Calendar updated successfully');
    } catch (error) {
      toast.error('Failed to update calendar');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="flex items-center space-x-2"
              data-testid="admin-logout-btn"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="projects" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="projects" data-testid="tab-projects">Projects</TabsTrigger>
            <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
            <TabsTrigger value="calendar" data-testid="tab-calendar">Calendar</TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts">Contacts</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-4" data-testid="create-project-form">
                <Input
                  required
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  data-testid="project-title-input"
                />
                <Textarea
                  required
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  data-testid="project-description-input"
                />
                <Input
                  type="number"
                  placeholder="Display Order"
                  value={newProject.order}
                  onChange={(e) => setNewProject({ ...newProject, order: parseInt(e.target.value) })}
                  data-testid="project-order-input"
                />
                <Button type="submit" className="w-full" data-testid="create-project-btn">
                  <Plus className="h-4 w-4 mr-2" /> Create Project
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Existing Projects</h2>
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-sm border p-6" data-testid={`admin-project-${project.id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{project.title}</h3>
                      <p className="text-slate-600">{project.description}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      data-testid={`delete-project-btn-${project.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files[0] && handleImageUpload(project.id, e.target.files[0])}
                          data-testid={`upload-image-input-${project.id}`}
                        />
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" /> Upload Image
                          </span>
                        </Button>
                      </label>
                    </div>
                    
                    {project.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-4">
                        {project.images.map((img, idx) => (
                          <div key={idx} className="relative group" data-testid={`admin-project-image-${project.id}-${idx}`}>
                            <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                            <button
                              onClick={() => handleDeleteImage(project.id, idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid={`delete-image-btn-${project.id}-${idx}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">About Section</h2>
                <Button onClick={() => setEditingAbout(!editingAbout)} variant="outline" data-testid="edit-about-btn">
                  {editingAbout ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              
              {editingAbout ? (
                <form onSubmit={handleUpdateAbout} className="space-y-4" data-testid="edit-about-form">
                  <Input
                    required
                    placeholder="Section Title"
                    value={aboutForm.title}
                    onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                    data-testid="about-title-input"
                  />
                  <Textarea
                    required
                    placeholder="About Content"
                    value={aboutForm.content}
                    onChange={(e) => setAboutForm({ ...aboutForm, content: e.target.value })}
                    className="min-h-[200px]"
                    data-testid="about-content-input"
                  />
                  <Button type="submit" className="w-full" data-testid="save-about-btn">Save Changes</Button>
                </form>
              ) : (
                <div data-testid="about-display">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{about.title}</h3>
                  <p className="text-slate-600 whitespace-pre-wrap">{about.content}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Manage Availability</h2>
              <p className="text-slate-600 mb-6">Click dates to mark them as busy (red). Click again to mark as available.</p>
              <div className="flex justify-center mb-6" data-testid="admin-calendar">
                <Calendar
                  mode="multiple"
                  selected={busyDates}
                  onSelect={(dates) => setBusyDates(dates || [])}
                  className="rounded-xl border-2 border-slate-200"
                />
              </div>
              <Button onClick={handleSaveAvailability} className="w-full" data-testid="save-calendar-btn">
                Save Calendar
              </Button>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Submissions</h2>
              {contacts.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No contact submissions yet.</p>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="border rounded-lg p-4" data-testid={`contact-${contact.id}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900">{contact.name}</h3>
                          <p className="text-sm text-slate-600">{contact.email}</p>
                          {contact.phone && <p className="text-sm text-slate-600">{contact.phone}</p>}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(contact.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 mt-2">{contact.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
