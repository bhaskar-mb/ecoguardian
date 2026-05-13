
import { Request, Response } from 'express';
import Report from '../../Database/models/Report.ts';
import User from '../../Database/models/User.ts';
import { inMemoryDB } from '../store.ts';


// Fail-safe In-Memory Store
let MOCK_REPORTS: any[] = [
  {
    id: 'R-1775541712358',
    type: 'Oil Spill',
    severity: 'high',
    description: 'water pollution',
    location: { lat: 45.523, lng: -122.676, address: "Nandyal, Industrial Sector" },
    timestamp: new Date(Date.now() - 7200000),
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    status: 'assigned',
    reporterId: 'user-001',
    assignedAuthorityId: 'Municipal Parks Dept',
    reportNumber: 1,
    aiInsights: 'Vision analysis confirms chemical runoff detected in tributary.',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 7200000), message: 'Incident reported. Dispatched to Global Command for triage.', actor: 'BOSS' },
      { status: 'assigned', timestamp: new Date(Date.now() - 3600000), message: 'Admin reassigned report to Municipal Parks Dept.', actor: 'ADMIN' }
    ]
  }
];

// Fixed: Using 'any' for req and res parameters to resolve environment-specific type errors 
// where standard Express properties (json, status, body, params) are not correctly detected 
// despite proper imports.
export const getAllReports = async (req: any, res: any) => {
  try {
    if (!req.app.get('isDbConnected')) {
       // Mock fallback numbering
       const mockWithNums = MOCK_REPORTS.map((r, idx) => ({
         ...r,
         reportNumber: r.reportNumber || (MOCK_REPORTS.length - idx)
       }));
       return res.json(mockWithNums);
    }
    
    // Fetch all reports ordered by timestamp
    let reports = await Report.find().sort({ timestamp: 1 }).lean();
    
    // AGGRESSIVE RE-INDEX: Ensure every report has a CORRECT sequential number
    for (let i = 0; i < reports.length; i++) {
      const targetNum = i + 1;
      if (reports[i].reportNumber !== targetNum) {
        await Report.updateOne({ _id: reports[i]._id }, { $set: { reportNumber: targetNum } });
        reports[i].reportNumber = targetNum;
      }
    }
    
    // Sort Newest First for the UI
    res.json(reports.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

import { sendAdminReportNotification } from '../services/mailService.ts';

// Fixed: Using 'any' for req and res parameters to bypass Request/Response type mismatch errors.
export const createReport = async (req: any, res: any) => {
  try {
    let savedReport;
    if (!req.app.get('isDbConnected')) {
      // For in-memory, just find the max reportNumber or use length
      const maxNum = MOCK_REPORTS.reduce((max, r) => Math.max(max, r.reportNumber || 0), 0);
      savedReport = { ...req.body, id: `MOCK-${Date.now()}`, timestamp: new Date(), reportNumber: maxNum + 1 };
      MOCK_REPORTS.unshift(savedReport);
    } else {
      // For database, find the highest reportNumber
      const lastReport = await Report.findOne().sort({ reportNumber: -1 });
      const nextNum = lastReport && lastReport.reportNumber ? lastReport.reportNumber + 1 : 1;
      const newReport = new Report({ ...req.body, reportNumber: nextNum });
      savedReport = await newReport.save();
    }
    
    // Real-time Update
    req.app.get('io').emit('newReport', savedReport);

    // AUTOMATED ADMIN NOTIFICATION
    // Fire and forget (don't wait for email to send before responding to user)
    sendAdminReportNotification(savedReport).catch(err => console.error('Email failed:', err));
    
    res.status(201).json(savedReport);
  } catch (error: any) {
    console.error("CRITICAL: Report Creation Failed:", error);
    res.status(400).json({ message: 'Error creating report', details: error.message });
  }
};

// Fixed: Using 'any' for req and res parameters to ensure properties like 'params' and 'body' are accessible.
export const updateReportStatus = async (req: any, res: any) => {
  const { id } = req.params;
  const { status, timelineEvent, resolutionDetails, resolvedImageUrl, assignedAuthorityId } = req.body;
  try {
    let updatedReport;
    if (!req.app.get('isDbConnected')) {
      const idx = MOCK_REPORTS.findIndex(r => r.id === id || r._id === id);
      if (idx !== -1) {
        MOCK_REPORTS[idx] = { 
          ...MOCK_REPORTS[idx], 
          status: status ?? MOCK_REPORTS[idx].status,
          assignedAuthorityId: assignedAuthorityId ?? MOCK_REPORTS[idx].assignedAuthorityId,
          timeline: [...MOCK_REPORTS[idx].timeline, timelineEvent],
          resolutionDetails: resolutionDetails ?? MOCK_REPORTS[idx].resolutionDetails,
          resolvedImageUrl: resolvedImageUrl ?? MOCK_REPORTS[idx].resolvedImageUrl
        };
        updatedReport = MOCK_REPORTS[idx];
      }
    } else {
      updatedReport = await Report.findByIdAndUpdate(
        id,
        { 
          $set: { status, resolutionDetails, resolvedImageUrl, assignedAuthorityId },
          $push: { timeline: timelineEvent }
        },
        { new: true }
      );
    }
    
    // Real-time Update
    if (updatedReport) {
      // AUTOMATIC POINT REWARD SYSTEM
      if (status === 'resolved' && updatedReport.reporterId) {
        const severity = (updatedReport.severity || 'low').toLowerCase();
        let pointsToAdd = 25;
        if (severity === 'medium') pointsToAdd = 50;
        if (severity === 'high') pointsToAdd = 75;
        if (severity === 'critical') pointsToAdd = 100;

        if (!req.app.get('isDbConnected')) {
          // Update In-Memory
          const user = inMemoryDB.users.find(u => u.id === updatedReport.reporterId || u._id === updatedReport.reporterId);
          if (user) {
            user.points = (user.points || 0) + pointsToAdd;
            user.reportsCount = (user.reportsCount || 0) + 1;
            console.log(`[REWARD] ${pointsToAdd} points awarded to in-memory user ${user.name}`);
          }
        } else {
          // Update MongoDB
          try {
            // Find user by either _id or id string (fallback)
            const userUpdate = await User.findOneAndUpdate(
              { $or: [{ _id: updatedReport.reporterId }, { id: updatedReport.reporterId }] },
              { $inc: { points: pointsToAdd, reportsCount: 1 } },
              { new: true }
            );
            if (userUpdate) {
              console.log(`[REWARD] ${pointsToAdd} points awarded to database user ${userUpdate.name}`);
            }
          } catch (rewardErr) {
            console.error('Error awarding points:', rewardErr);
          }
        }
      }

      req.app.get('io').emit('statusUpdate', updatedReport);
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating status' });
  }
};

export const deleteReport = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    if (!req.app.get('isDbConnected')) {
      MOCK_REPORTS = MOCK_REPORTS.filter(r => r.id !== id && r._id !== id);
    } else {
      await Report.findByIdAndDelete(id);
    }
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report' });
  }
};
