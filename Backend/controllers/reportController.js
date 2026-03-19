import Report from '../../Database/models/Report.js';

let MOCK_REPORTS = [
  {
    id: 'R-902',
    type: 'Illegal Logging',
    severity: 'High',
    description: 'Fresh tree stumps and heavy tire marks detected in the protected buffer zone.',
    location: { lat: 45.523, lng: -122.676, address: "Northern Ridge Biosphere, Sector 7" },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    status: 'assigned',
    reporterId: 'user-001',
    assignedAuthorityId: 'Forestry Commission',
    aiInsights: 'Vision analysis confirms recent logging activity in a restricted zone.',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 7200000).toISOString(), message: 'Incident reported by Sentinel.', actor: 'John Sentinel' },
      { status: 'assigned', timestamp: new Date(Date.now() - 3600000).toISOString(), message: 'Admin assigned case to Forestry Commission.', actor: 'Chief Warden' }
    ]
  },
  {
    id: 'R-905',
    type: 'Water Pollution',
    severity: 'Critical',
    description: 'Chemical discharge detected near the river mouth and wildlife sanctuary entrance.',
    location: { lat: 45.512, lng: -122.658, address: "Coastal Basin, Sector Beta" },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=800',
    status: 'assigned',
    reporterId: 'user-001',
    assignedAuthorityId: 'Municipal Parks Dept',
    aiInsights: 'Infrared sensors show abnormal chemical concentrations in the waterway.',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 3600000).toISOString(), message: 'Incident reported. Chemical spill detected.', actor: 'Sentinel AI' },
      { status: 'assigned', timestamp: new Date(Date.now() - 1800000).toISOString(), message: 'Urgent assignment to Municipal Parks Dept.', actor: 'Chief Warden' }
    ]
  }
];

export const getAllReports = async (req, res) => {
  try {
    if (!req.app.get('isDbConnected')) {
      return res.json(MOCK_REPORTS);
    }
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (error) {
    console.error("GET reports error:", error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

export const createReport = async (req, res) => {
  try {
    let savedReport;
    if (!req.app.get('isDbConnected')) {
      savedReport = { ...req.body, id: `MOCK-${Date.now()}`, timestamp: new Date() };
      MOCK_REPORTS.unshift(savedReport);
    } else {
      const newReport = new Report(req.body);
      savedReport = await newReport.save();
    }
    req.app.get('io').emit('newReport', savedReport);
    res.status(201).json(savedReport);
  } catch (error) {
    console.error("POST reports error:", error);
    res.status(400).json({ message: 'Error creating report' });
  }
};

export const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status, timelineEvent } = req.body;
  try {
    let updatedReport;
    if (!req.app.get('isDbConnected')) {
      const idx = MOCK_REPORTS.findIndex(r => r.id === id);
      if (idx !== -1) {
        MOCK_REPORTS[idx] = { 
          ...MOCK_REPORTS[idx], 
          status, 
          timeline: [...MOCK_REPORTS[idx].timeline, timelineEvent] 
        };
        updatedReport = MOCK_REPORTS[idx];
      }
    } else {
      updatedReport = await Report.findByIdAndUpdate(
        id,
        { $set: { status }, $push: { timeline: timelineEvent } },
        { new: true }
      );
    }
    if (updatedReport) {
      req.app.get('io').emit('statusUpdate', updatedReport);
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    console.error("PATCH reports error:", error);
    res.status(400).json({ message: 'Error updating status' });
  }
};
