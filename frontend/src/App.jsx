import { useState, useEffect } from 'react';
import { Search, Download, Filter, BarChart3, Users, TrendingUp, Target } from 'lucide-react';

export default function LeadManagementDashboard() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    role: '',
    location: '',
    min_score: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch leads from backend
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.industry) params.append('industry', filters.industry);
      if (filters.role) params.append('role', filters.role);
      if (filters.location) params.append('location', filters.location);
      if (filters.min_score > 0) params.append('min_score', filters.min_score);

      const response = await fetch(`http://localhost:5000/api/leads?${params}`);
      const data = await response.json();
      setLeads(data);
      setFilteredLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export leads as CSV
  const exportLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.min_score > 0) params.append('min_score', filters.min_score);

      const response = await fetch(`http://localhost:5000/api/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'filtered_leads.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting leads:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchLeads();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      industry: '',
      role: '',
      location: '',
      min_score: 0
    });
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 0.8) return '#10b981';
    if (score >= 0.6) return '#f59e0b';
    if (score >= 0.4) return '#ef4444';
    return '#6b7280';
  };

  // Calculate stats
  const stats = {
    total: leads.length,
    highQuality: leads.filter(lead => lead.PredictedScore >= 0.8).length,
    avgScore: leads.length > 0 ? (leads.reduce((sum, lead) => sum + lead.PredictedScore, 0) / leads.length).toFixed(2) : 0,
    converted: leads.filter(lead => lead.Status === 'Converted').length
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '1rem 2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Target size={32} color="white" />
            <h1 style={{
              color: 'white',
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Lead Management Dashboard
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              <Filter size={16} />
              Filters
            </button>
            <button
              onClick={exportLeads}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem'
              }}
              onMouseOver={(e) => e.target.style.background = '#059669'}
              onMouseOut={(e) => e.target.style.background = '#10b981'}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            { icon: Users, label: 'Total Leads', value: stats.total, color: '#3b82f6' },
            { icon: TrendingUp, label: 'High Quality', value: stats.highQuality, color: '#10b981' },
            { icon: BarChart3, label: 'Avg Score', value: stats.avgScore, color: '#f59e0b' },
            { icon: Target, label: 'Converted', value: stats.converted, color: '#8b5cf6' }
          ].map((stat, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>{stat.label}</p>
                  <p style={{ color: '#1f2937', margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>
                    {stat.value}
                  </p>
                </div>
                <div style={{
                  background: stat.color,
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon size={24} color="white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'slideDown 0.3s ease'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              alignItems: 'end'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500' }}>
                  Industry
                </label>
                <input
                  type="text"
                  value={filters.industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                  placeholder="e.g., Technology"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500' }}>
                  Role
                </label>
                <input
                  type="text"
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  placeholder="e.g., CEO"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500' }}>
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="e.g., New York"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '500' }}>
                  Min Score ({filters.min_score})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.min_score}
                  onChange={(e) => handleFilterChange('min_score', parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    height: '0.5rem',
                    borderRadius: '0.25rem',
                    background: '#e5e7eb',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={applyFilters}
                  style={{
                    flex: 1,
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#2563eb'}
                  onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  style={{
                    flex: 1,
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#4b5563'}
                  onMouseOut={(e) => e.target.style.background = '#6b7280'}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.25rem', fontWeight: '600' }}>
              Lead Database ({leads.length} leads)
            </h2>
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Loading...
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Company', 'Contact', 'Industry', 'Role', 'Location', 'Size', 'Score', 'Status'].map((header) => (
                    <th key={header} style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr key={index} style={{
                    transition: 'background 0.3s ease',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem', color: '#1f2937', fontWeight: '500' }}>
                      {lead.Company}
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>
                      {lead.ContactName}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {lead.Industry}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>
                      {lead.Role}
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>
                      {lead.Location}
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>
                      {lead.CompanySize}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '40px',
                          height: '6px',
                          background: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(lead.PredictedScore || 0) * 100}%`,
                            height: '100%',
                            background: getScoreColor(lead.PredictedScore || 0),
                            transition: 'width 0.5s ease'
                          }}></div>
                        </div>
                        <span style={{
                          color: getScoreColor(lead.PredictedScore || 0),
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {((lead.PredictedScore || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: lead.Status === 'Converted' ? '#dcfce7' : 
                                  lead.Status === 'Contacted' ? '#fef3c7' : '#f3f4f6',
                        color: lead.Status === 'Converted' ? '#16a34a' : 
                               lead.Status === 'Contacted' ? '#d97706' : '#6b7280',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {lead.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}