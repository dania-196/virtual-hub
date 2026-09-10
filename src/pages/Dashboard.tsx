import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './dashboard2.css';

interface Project {
  id: string;
  name: string;
  status: string;
  lab_tag?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [completedCount] = useState(0);
  const [hoursCount] = useState(0);
  const [reviewsCount] = useState(0);
  const [pendingCount] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedLabTag, setSelectedLabTag] = useState('Embedded');
  const [loadingProjects, setLoadingProjects] = useState(true);

  // قائمة مقترحات المشاريع الجاهزة للإضافة السريعة
  const suggestedProjects = [
    { name: 'RSA Encryption Tool', lab_tag: 'Network' },
    { name: 'DC Motor Speed Control', lab_tag: 'Embedded' },
    { name: 'OSPF Static Routing', lab_tag: 'Network' },
    { name: 'Logic Gate Simulator', lab_tag: 'Circuit' }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent, nameOverride?: string, tagOverride?: string) => {
    if (e) e.preventDefault();
    const nameToAdd = nameOverride || newProjectName;
    const tagToAdd = tagOverride || selectedLabTag;

    if (!nameToAdd.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
          name: nameToAdd, 
          user_id: user.id, 
          status: 'in-progress', 
          lab_tag: tagToAdd 
        }])
        .select();

      if (error) throw error;
      if (data) {
        setProjects([data[0], ...projects]);
        setNewProjectName('');
        setSelectedLabTag('Embedded');
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error adding project:', err);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const openProjectLab = (labTag?: string) => {
    if (labTag === 'Embedded') navigate('/lab/iot');
    else if (labTag === 'Assembly') navigate('/lab/assembly');
    else if (labTag === 'Circuit') navigate('/lab/circuit');
    else if (labTag === 'Network') navigate('/lab/network');
    else navigate('/dashboard');
  };

  // تصفية نتائج البحث الحي في الداشبورد
  const searchResultsList = projects.filter(p => 
    searchQuery.trim() === '' ? false : p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.lab_tag && p.lab_tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="dashboard">
      {/* ================= Sidebar ================= */}
      <aside className="sidebar">
        <h2 onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Go to Home">
          Virtual Hub
        </h2>
        <ul>
          <li className="active" role="link" tabIndex={0} onClick={() => navigate('/')}>
            <i className="fa-solid fa-house"></i>
            Home
          </li>
          <li role="link" tabIndex={0} onClick={() => navigate('/lab/iot')}>
            <i className="fa-solid fa-laptop-code"></i>
            Embedded Lab
          </li>
          <li role="link" tabIndex={0} onClick={() => navigate('/lab/assembly')}>
            <i className="fa-solid fa-code"></i>
            Assembly
          </li>
          <li role="link" tabIndex={0} onClick={() => navigate('/lab/circuit')}>
            <i className="fa-solid fa-bolt"></i>
            Circuit
          </li>
          <li role="link" tabIndex={0} onClick={() => navigate('/lab/network')}>
            <i className="fa-solid fa-microchip"></i>
            Network Lab
          </li>
          <li role="link" tabIndex={0} onClick={() => navigate('/edit-profile')}>
            <i className="fa-solid fa-user"></i>
            Profile
          </li>
          <li role="link" tabIndex={0} onClick={() => navigate('/settings')}>
            <i className="fa-solid fa-gear"></i>
            Settings
          </li>
        </ul>

        {/* AI Agent Widget in Sidebar */}
        <div className="ai-agent">
          <div className="ai-circle" title="AI Assistant Active">
            <img src="../images/robot-dashboard.png" alt="AI Assistant" />
          </div>
        </div>
      </aside>

      {/* ================= Main ================= */}
      <main className="main">
        {/* Top Bar */}
        <div className="topbar">
          <div className="search-wrapper">
            <label className="sr-only" htmlFor="searchInput">Search labs</label>
            <i className="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
            <input 
              type="search" 
              id="searchInput" 
              placeholder="Search Lab or Projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off" 
              aria-label="Search labs"
            />
            {/* Live Search Results Dropdown */}
            {searchQuery.trim() !== '' && (
              <div id="searchResults" className="search-results" style={{ display: 'block' }}>
                {searchResultsList.length === 0 ? (
                  <div className="search-item no-match">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <span>No matching projects found</span>
                  </div>
                ) : (
                  searchResultsList.map(item => (
                    <div 
                      key={item.id} 
                      className="search-item" 
                      onClick={() => openProjectLab(item.lab_tag)}
                    >
                      <i className="fa-solid fa-flask-conical"></i>
                      <span>{item.name}</span>
                      {item.lab_tag && <span className="lab-tag" style={{ marginLeft: 'auto' }}>{item.lab_tag}</span>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cards */}
        <section className="cards" aria-label="Dashboard statistics">
          <div className="card">
            <i className="fa-solid fa-flask"></i>
            <h3>Completed Labs</h3>
            <h1 id="completedCount">{completedCount}</h1>
          </div>
          <div className="card">
            <i className="fa-solid fa-clock"></i>
            <h3>Simulation Hours</h3>
            <h1 id="hoursCount">{hoursCount}</h1>
          </div>
          <div className="card">
            <i className="fa-solid fa-robot"></i>
            <h3>AI Reviews</h3>
            <h1 id="reviewsCount">{reviewsCount}</h1>
          </div>
          <div className="card">
            <i className="fa-solid fa-list-check"></i>
            <h3>Pending Labs</h3>
            <h1 id="pendingCount">{pendingCount}</h1>
          </div>
        </section>

        {/* ================= Hero ================= */}
        <div className="hero">
          <div className="welcome">
            <h1 id="welcomeTitle">Welcome to Virtual Hub</h1>
            <p id="welcomeMessage">
              Practice your engineering labs using AI-powered simulations with maximum efficiency.
            </p>
            <div className="welcome-meta" id="welcomeMeta"></div>
          </div>
          <div className="hero-image">
            <img src="../images/robot-dashboard.png" alt="Robot" />
          </div>
        </div>

        {/* ================= Bottom ================= */}
        <div className="bottom">
          {/* Projects */}
          <div className="projects">
            <div className="projects-header">
              <h2>My Projects</h2>
              <button className="add-project-btn" onClick={() => setIsModalOpen(true)}>+ Add Project</button>
            </div>
            <div id="myProjectsList">
              {loadingProjects ? (
                <p className="empty-note">Loading projects...</p>
              ) : projects.length === 0 ? (
                <p className="empty-note">No projects yet — add one or pick a suggestion below.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {projects.map((proj) => (
                    <div key={proj.id} className="project" style={{ cursor: 'pointer' }} onClick={() => openProjectLab(proj.lab_tag)}>
                      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                        <span className="project-name-link">{proj.name}</span>
                        {proj.lab_tag && <span className="lab-tag">{proj.lab_tag}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="status status-progress">{proj.status}</span>
                        <i 
                          className="fa-solid fa-trash-can delete-project-btn" 
                          title="Delete Project"
                          onClick={(e) => handleDeleteProject(e, proj.id)}
                        ></i>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h3 className="suggestions-title">Suggested Projects</h3>
            <div id="suggestionsList">
              {suggestedProjects.map((sug, index) => (
                <div key={index} className="suggestion-item">
                  <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                    <span className="suggestion-name">{sug.name}</span>
                    <span className="lab-tag">{sug.lab_tag}</span>
                  </div>
                  <button 
                    className="add-suggestion-btn" 
                    onClick={() => handleAddProject(null as any, sug.name, sug.lab_tag)}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity">
            <h2>Recent Lab Activity</h2>
            <div id="activityList">
              <p>No activity yet — complete a lab or run a simulation to see it tracked here live.</p>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div id="addProjectModal" className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-box">
              <button className="modal-close" type="button" onClick={() => setIsModalOpen(false)} aria-label="Close add project dialog">&times;</button>
              <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '18px' }}>Add New Project</h3>
              <form onSubmit={(e) => handleAddProject(e)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input 
                  type="text" 
                  placeholder="Project Name (e.g. RSA Tool)" 
                  value={newProjectName} 
                  onChange={(e) => setNewProjectName(e.target.value)}
                  style={{ padding: '12px 15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,.08)', background: 'rgba(26,0,48,.88)', color: '#fff', fontSize: '15px', outline: 'none' }}
                />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', color: '#bdbdbd' }}>Select Lab Category:</label>
                  <select 
                    value={selectedLabTag} 
                    onChange={(e) => setSelectedLabTag(e.target.value)}
                    style={{ padding: '12px 15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,.08)', background: 'rgba(26,0,48,.88)', color: '#fff', fontSize: '15px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Embedded">Embedded Lab</option>
                    <option value="Assembly">Assembly</option>
                    <option value="Circuit">Circuit</option>
                    <option value="Network">Network Lab</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <button type="submit" className="add-project-btn" style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '6px' }}>
                  Save Project
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}