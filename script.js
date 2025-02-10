// Create test file for download/upload measurements
const createTestFile = (sizeMB) => {
    const size = sizeMB * 1024 * 1024; // Convert MB to bytes
    const data = new Uint8Array(size);
    return new Blob([data], { type: 'application/octet-stream' });
};

// Measure download speed
const measureDownload = async () => {
    const testFile = createTestFile(1); // 1MB test file
    const fileURL = URL.createObjectURL(testFile);
    const startTime = Date.now();
    
    try {
        await fetch(fileURL);
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000; // in seconds
        const speed = (1 * 8) / duration; // Convert MBps to Mbps (1MB * 8 = 8Mb)
        return speed;
    } finally {
        URL.revokeObjectURL(fileURL);
    }
};

// Measure upload speed
const measureUpload = async () => {
    const testFile = createTestFile(0.5); // 0.5MB test file
    const formData = new FormData();
    formData.append('file', testFile, 'test.bin');

    const startTime = Date.now();
    
    try {
        await fetch('https://httpbin.org/post', {
            method: 'POST',
            body: formData
        });
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000; // in seconds
        const speed = (0.5 * 8) / duration; // Convert MBps to Mbps
        return speed;
    } catch (error) {
        return 0;
    }
};

// Measure latency
const measureLatency = async () => {
    const startTime = Date.now();
    try {
        await fetch('https://httpbin.org/get', {
            method: 'HEAD',
            cache: 'no-cache'
        });
        return Date.now() - startTime;
    } catch (error) {
        return 0;
    }
};

// Update display with new measurements
const updateDisplay = (download, upload, latency) => {
    document.getElementById('downloadSpeed').textContent = 
        download > 0 ? `${download.toFixed(2)} Mbps` : 'N/A';
    document.getElementById('uploadSpeed').textContent = 
        upload > 0 ? `${upload.toFixed(2)} Mbps` : 'N/A';
    document.getElementById('latency').textContent = 
        latency > 0 ? `${latency} ms` : 'N/A';
};

// Main function that runs all tests
const runSpeedTest = async () => {
    try {
        const [download, upload, latency] = await Promise.all([
            measureDownload(),
            measureUpload(),
            measureLatency()
        ]);
        updateDisplay(download, upload, latency);
    } catch (error) {
        updateDisplay(0, 0, 0);
    }
};

// Run initial test and repeat every 5 seconds
runSpeedTest();
setInterval(runSpeedTest, 5000);
