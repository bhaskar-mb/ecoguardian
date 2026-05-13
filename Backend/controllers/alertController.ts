
import Alert from '../../Database/models/Alert.ts';

export const getAllAlerts = async (req: any, res: any) => {
  try {
    if (!req.app.get('isDbConnected')) {
      return res.json([]);
    }
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts' });
  }
};

export const createAlert = async (req: any, res: any) => {
  try {
    if (!req.app.get('isDbConnected')) {
        return res.status(201).json({ id: 'MOCK-' + Date.now(), ...req.body, timestamp: new Date() });
    }
    const newAlert = new Alert(req.body);
    const savedAlert = await newAlert.save();
    res.status(201).json(savedAlert);
  } catch (error) {
    res.status(400).json({ message: 'Error creating alert' });
  }
};

export const deleteAlert = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    if (!req.app.get('isDbConnected')) {
        // No mock store for alerts yet, so just return success
    } else {
        await Alert.findByIdAndDelete(id);
    }
    res.json({ success: true, message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting alert' });
  }
};
