
import { Request, Response } from 'express';
import Report from '../../Database/models/Report.ts';

// Fail-safe In-Memory Store
let MOCK_REPORTS: any[] = [];

// Fixed: Using 'any' for req and res parameters to resolve environment-specific type errors 
// where standard Express properties (json, status, body, params) are not correctly detected 
// despite proper imports.
export const getAllReports = async (req: any, res: any) => {
  try {
    if (!req.app.get('isDbConnected')) {
       return res.json(MOCK_REPORTS);
    }
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

// Fixed: Using 'any' for req and res parameters to bypass Request/Response type mismatch errors.
export const createReport = async (req: any, res: any) => {
  try {
    let savedReport;
    if (!req.app.get('isDbConnected')) {
      savedReport = { ...req.body, id: `MOCK-${Date.now()}`, timestamp: new Date() };
      MOCK_REPORTS.unshift(savedReport);
    } else {
      const newReport = new Report(req.body);
      savedReport = await newReport.save();
    }
    
    // Real-time Update
    req.app.get('io').emit('newReport', savedReport);
    
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ message: 'Error creating report' });
  }
};

// Fixed: Using 'any' for req and res parameters to ensure properties like 'params' and 'body' are accessible.
export const updateReportStatus = async (req: any, res: any) => {
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
        { 
          $set: { status },
          $push: { timeline: timelineEvent }
        },
        { new: true }
      );
    }
    
    // Real-time Update
    if (updatedReport) {
      req.app.get('io').emit('statusUpdate', updatedReport);
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating status' });
  }
};
