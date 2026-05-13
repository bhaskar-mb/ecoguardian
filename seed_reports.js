
import fetch from 'node-fetch'; // Fallback to global fetch if node-fetch is not there, or use axios if it was there (but I didn't see it).

// Actually, I'll use native fetch as of Node 18+
const reportTypes = ['Illegal Logging', 'Water Pollution', 'Air Quality', 'Poaching', 'Wildfire', 'Illegal Dumping', 'Ocean Plastic', 'Soil Contamination'];
const severities = ['Low', 'Medium', 'High', 'Critical'];
const locations = [
    { lat: 45.523, lng: -122.676, address: "Northern Ridge Biosphere, Sector 7" },
    { lat: 45.512, lng: -122.658, address: "Coastal Basin, Sector Beta" },
    { lat: 45.501, lng: -122.682, address: "Eastern Wetlands, Area 5" },
    { lat: 45.535, lng: -122.641, address: "Southern Forest Reserve" }
];

const images = [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800'
];

async function addReports() {
    for (let i = 0; i < 100; i++) {
        const type = reportTypes[Math.floor(Math.random() * reportTypes.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const imageUrl = images[Math.floor(Math.random() * images.length)];
        
        const report = {
            reportNumber: i + 1,
            type,
            severity,
            description: `[AUTO-SENTINEL] Persistent environmental anomaly detected. Analysis reveals ${type} in ${location.address}. Automated alert #${i + 1}.`,
            location: {
                ...location,
                lat: location.lat + (Math.random() - 0.5) * 0.1,
                lng: location.lng + (Math.random() - 0.5) * 0.1
            },
            imageUrl,
            status: 'pending',
            reporterId: 'system-gen',
            timeline: [
                { status: 'pending', timestamp: new Date().toISOString(), message: 'Incident reported. Dispatched to Global Command for triage.', actor: 'Sentinel AI' }
            ]
        };

        try {
            await fetch('http://localhost:5000/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            });
            if ((i + 1) % 10 === 0) console.log(`Added ${i + 1}/100 reports...`);
        } catch (error) {
            console.error(`Error adding report ${i + 1}:`, error.message);
        }
    }
    console.log('Successfully added 100 reports.');
}

addReports();
