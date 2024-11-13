import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import {
  calculateMetrics,
  calculateDailyGrowth,
  calculateTrend,
  calculateReportingPeriod,
  calculateAverageReportInterval
} from './helperfunction';
import '../pages/employeedash.css';

function Employeedash() {
  const { userEmail } = useContext(AuthContext);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('animals');
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [reportForm, setReportForm] = useState({
    diagnosis: '',
    treatment: '',
    reportDate: new Date().toISOString().split('T')[0],
    height: '',
    weight: ''
  });
  const [employeeId, setEmployeeId] = useState(null);
  const [healthReports, setHealthReports] = useState([]);
  const [reportQuery, setReportQuery] = useState({
    animalId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        const response = await fetch(`https://coogzootestbackend-phi.vercel.app/employee-id?email=${userEmail}`);
        const data = await response.json();
        setEmployeeId(data.employeeId);
      } catch (error) {
        console.error("Error fetching employee ID:", error);
      }
    };

    const fetchAnimals = async () => {
      try {
        const response = await fetch(`https://coogzootestbackend-phi.vercel.app/employee-animals?email=${userEmail}`);
        const data = await response.json();
        setAnimals(data);
      } catch (error) {
        console.error("Error fetching animal data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeId();
    fetchAnimals();
  }, [userEmail]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/add-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          animalId: selectedAnimal.Animal_ID,
          employeeId: employeeId,
          diagnosis: reportForm.diagnosis,
          treatment: reportForm.treatment,
          reportDate: reportForm.reportDate,
          height: reportForm.height,
          weight: reportForm.weight
        }),
      });

      if (response.ok) {
        setShowReportModal(false);
        setReportForm({
          diagnosis: '',
          treatment: '',
          reportDate: new Date().toISOString().split('T')[0],
          height: '',
          weight: ''
        });
        // Optionally refresh the reports if you're viewing them
        if (activeTab === 'health-reports') {
          handleHealthReportFetch(new Event('submit'));
        }
      } else {
        console.error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const handleHealthReportFetch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/health-reports?animalId=${reportQuery.animalId}&startDate=${reportQuery.startDate}&endDate=${reportQuery.endDate}`);
      const data = await response.json();
      setHealthReports(data);
    } catch (error) {
      console.error("Error fetching health reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (activeTab === 'animals') {
      return (
        <div className="emp-animals-table">
          {loading ? (
            <div className="emp-loading">Loading...</div>
          ) : animals.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Species</th>
                  <th>Cage ID</th>
                  <th>Location</th>
                  <th>Cage Type</th>
                  <th>Feeding Time</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((animal) => (
                  <tr key={animal.Animal_ID}>
                    <td>{animal.Name}</td>
                    <td>{animal.Species}</td>
                    <td>{animal.Cage_ID}</td>
                    <td>{animal.Location}</td>
                    <td>{animal.Type}</td>
                    <td>{animal.Feeding_Time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="emp-no-data">No animals assigned to this exhibit.</div>
          )}
        </div>
      );
    } else if (activeTab === 'reports') {
      return (
        <div className="emp-animals-table">
          <h2>Add Animal Report</h2>
          {loading ? (
            <div className="emp-loading">Loading...</div>
          ) : animals.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Animal ID</th>
                  <th>Name</th>
                  <th>Cage ID</th>
                  <th>Species</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((animal) => (
                  <tr key={animal.Animal_ID}>
                    <td>{animal.Animal_ID}</td>
                    <td>{animal.Name}</td>
                    <td>{animal.Cage_ID}</td>
                    <td>{animal.Species}</td>
                    <td>{animal.Location}</td>
                    <td>
                      <button 
                        className="emp-add-report-btn"
                        onClick={() => {
                          setSelectedAnimal(animal);
                          setShowReportModal(true);
                        }}
                      >
                        Add Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="emp-no-data">No animals available for reports.</div>
          )}
        </div>
      );
    } else if (activeTab === 'health-reports') {
      const metrics = healthReports.length > 0 ? calculateMetrics(healthReports) : null;
      
      return (
        <div className="emp-health-reports">
          <h2>Retrieve Health Reports</h2>
          <form onSubmit={handleHealthReportFetch}>
            <div className="emp-form-group">
              <label>Animal ID:</label>
              <input
                type="text"
                value={reportQuery.animalId}
                onChange={(e) => setReportQuery({ ...reportQuery, animalId: e.target.value })}
                required
              />
            </div>
            <div className="emp-form-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={reportQuery.startDate}
                onChange={(e) => setReportQuery({ ...reportQuery, startDate: e.target.value })}
                required
              />
            </div>
            <div className="emp-form-group">
              <label>End Date:</label>
              <input
                type="date"
                value={reportQuery.endDate}
                onChange={(e) => setReportQuery({ ...reportQuery, endDate: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="emp-submit-btn">Retrieve Reports</button>
          </form>
          {loading ? (
            <div className="emp-loading">Loading...</div>
          ) : healthReports.length > 0 ? (
            <>
              <div className="emp-animals-table">
                <table>
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Employee ID</th>
                      <th>Diagnosis</th>
                      <th>Treatment</th>
                      <th>Current Height (cm)</th>
                      <th>Current Weight (kg)</th>
                      <th>Report Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthReports.map((report) => (
                      <tr key={report.Report_ID}>
                        <td>{report.Report_ID}</td>
                        <td>{report.Employee_ID}</td>
                        <td>{report.Diagnosis}</td>
                        <td>{report.Treatment}</td>
                        <td>{report.Height}</td>
                        <td>{report.Weight}</td>
                        <td>{report.Report_Date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="emp-summary-box">
                <h3>Animal Health Analysis</h3>
                <div className="emp-summary-grid">
                  <div className="emp-summary-section">
                    <h4>Basic Measurements</h4>
                    <div className="emp-summary-item">
                      <label>Original Height:</label>
                      <span>{metrics.originalHeight} cm</span>
                    </div>
                    <div className="emp-summary-item">
                      <label>Original Weight:</label>
                      <span>{metrics.originalWeight} kg</span>
                    </div>
                    <div className="emp-summary-item">
                      <label>Average Height:</label>
                      <span>{metrics.heightAverage} cm</span>
                    </div>
                    <div className="emp-summary-item">
                      <label>Average Weight:</label>
                      <span>{metrics.weightAverage} kg</span>
                    </div>
                  </div>

                  <div className="emp-summary-section">
                    <h4>Growth Analysis</h4>
                    <div className="emp-summary-item">
                      <label>Total Weight Gain:</label>
                      <span>{metrics.totalWeightGain} kg ({metrics.weightGrowthPercent}%)</span>
                    </div>
                    <div className="emp-summary-item">
                      <label>Total Height Gain:</label>
                      <span>{metrics.totalHeightGain} cm ({metrics.heightGrowthPercent}%)</span>
                    </div>
                    <div className="emp-summary-item">
                      <label>Daily Weight Growth:</label>
                      <span>{metrics.dailyWeightGrowth} kg/day</span>
                    </div>
                    <div className="emp-summary-item">
                      <label>Daily Height Growth:</label>
                      <span>{metrics.dailyHeightGrowth} cm/day</span>
                    </div>
                  </div>

                  <div className="emp-summary-section">
                    <h4>Range Analysis</h4>
                    <div className="emp-summary-item">
                      <label>Weight Range:</label>
                      <span>{metrics.minWeight} - {metrics.maxWeight} kg</span>
                    </div>
                    <div className="emp-summary-item">
                      <label>Height Range:</label>
                      <span>{metrics.minHeight} - {metrics.maxHeight} cm</span>
                    </div>
                    <div className="emp-summary-item">
                      <label>Weight Trend:</label>
                      <span>{metrics.weightTrend}</span>
                    </div>
                    <div className="emp-summary-item">
                      <label>Height Trend:</label>
                      <span>{metrics.heightTrend}</span>
                    </div>
                  </div>

                  <div className="emp-summary-section">
                    <h4>Reporting Statistics</h4>
                    <div className="emp-summary-item">
                      <label>Total Reports:</label>
                      <span>{metrics.totalReports}</span>
                    </div>
                    <div className="emp-summary-item">
                      <label>Reporting Period:</label>
                      <span>{metrics.reportingPeriod}</span>
                    </div>
                    <div className="emp-summary-item">
                      <label>Average Interval:</label>
                      <span>{metrics.averageReportInterval}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="emp-no-data">No reports found for the specified criteria.</div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="emp-dashboard">
      <div className={`emp-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="emp-sidebar-toggle" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? '→' : '←'}
        </button>
        <div className="emp-sidebar-header">
          <h2>Zoo Dashboard</h2>
        </div>
        <div className="emp-sidebar-nav">
          <div 
            className={`emp-nav-item ${activeTab === 'animals' ? 'active' : ''}`}
            onClick={() => setActiveTab('animals')}
          >
            <i className="fas fa-paw"></i>
            <span>Animals In Your Exhibit</span>
          </div>
          <div 
            className={`emp-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className="fas fa-file-medical"></i>
            <span>Animal Reports</span>
          </div>
          <div 
            className={`emp-nav-item ${activeTab === 'health-reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('health-reports')}
          >
            <i className="fas fa-notes-medical"></i>
            <span>Retrieve Health Reports</span>
          </div>
        </div>
      </div>

      <div className="emp-main-content">
        <h1>
          {activeTab === 'animals'
            ? 'Animal Management'
            : activeTab === 'reports'
            ? 'Animal Reports'
            : 'Retrieve Health Reports'}
        </h1>
        {renderContent()}
      </div>

      {showReportModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal">
            <div className="emp-modal-header">
              <h2>Add Report for {selectedAnimal?.Name}</h2>
              <button 
                className="emp-close-button"
                onClick={() => setShowReportModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleReportSubmit}>
  <div className="emp-form-group">
    <label>Diagnosis:</label>
    <textarea
      value={reportForm.diagnosis}
      onChange={(e) => setReportForm({
        ...reportForm,
        diagnosis: e.target.value
      })}
      required
    />
  </div>
  <div className="emp-form-group">
    <label>Treatment:</label>
    <textarea
      value={reportForm.treatment}
      onChange={(e) => setReportForm({
        ...reportForm,
        treatment: e.target.value
      })}
      required
    />
  </div>
  <div className="emp-form-group">
    <label>Height (cm):</label>
    <input
      type="number"
      step="0.01"
      value={reportForm.height}
      onChange={(e) => setReportForm({
        ...reportForm,
        height: e.target.value
      })}
      required
    />
  </div>
  <div className="emp-form-group">
    <label>Weight (kg):</label>
    <input
      type="number"
      step="0.01"
      value={reportForm.weight}
      onChange={(e) => setReportForm({
        ...reportForm,
        weight: e.target.value
      })}
      required
    />
  </div>
  <div className="emp-form-group">
    <label>Report Date:</label>
    <input
      type="date"
      value={reportForm.reportDate}
      onChange={(e) => setReportForm({
        ...reportForm,
        reportDate: e.target.value
      })}
      required
    />
  </div>
  <div className="emp-modal-footer">
    <button type="submit" className="emp-submit-btn">
      Submit Report
    </button>
    <button 
      type="button" 
      className="emp-cancel-btn"
      onClick={() => setShowReportModal(false)}
    >
      Cancel
    </button>
  </div>
</form>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  export default Employeedash;