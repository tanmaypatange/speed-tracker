// Configuration
const CONFIG = {
    testInterval: 10000, // 10 seconds
    download: {
        url: 'https://sin-speed.hetzner.com/100MB.bin',
        sizeMB: 100 // Actual file size
    },
    upload: {
        url: 'https://speed.hetzner.de/',
        sizeMB: 5
    },
    latency: {
        url: 'https://www.google.com',
        timeout: 5000
    }
};

// Connection status indicator
const connectionStatus = document.getElementById('connectionStatus');

// Create temporary upload file (in memory only)
const createUploadFile = (sizeMB) => {
    const size = sizeMB * 1024 * 1024;
    return new Blob([new Uint8Array(size)], { type: 'application/octet-stream' });
};

// Measure download speed (no local storage)
const measureDownload = async () => {
    const start = performance.now();
    let bytesReceived = 0;
    
    try {
        // Add cache-buster to prevent cached results
        const url = `${CONFIG.download.url}?rand=${Math.random()}`;
        
        const response = await fetch(url);
        const reader = response.body.getReader();
        
        while(true) {
            const { done, value } = await reader.read();
            if(done) break;
            bytesReceived += value.length;
        }
        
        const duration = (performance.now() - start) / 1000;
        return (bytesReceived * 8) / (1024 * 1024) / duration; // Mbps
    } catch {
        return 0;
    }
};

// Measure upload speed (clean memory afterwards)
const measureUpload = async () => {
    const file = createUploadFile(CONFIG.upload.sizeMB);
    const formData = new FormData();
    formData.append('file', file, 'test.bin');

    const start = performance.now();
    
    try {
        await fetch(CONFIG.upload.url, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });
        
        const duration = (performance.now() - start) / 1000;
        return (CONFIG.upload.sizeMB * 8) / duration; // Mbps
    } catch {
        return 0;
    } finally {
        // Clean up FormData
        formData.delete('file');
    }
};

// Measure latency with proper cleanup
const measureLatency = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.latency.timeout);

    try {
        const start = performance.now();
        await fetch(CONFIG.latency.url, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal
        });
        return Math.round(performance.now() - start);
    } catch {
        return 0;
    } finally {
        clearTimeout(timeout);
    }
};

// Update UI with connection status
const updateConnectionStatus = (connected) => {
    connectionStatus.classList.toggle('connected', connected);
};

// Validate results
const sanitizeResults = (download, upload, latency) => {
    return [
        download < 1000 ? download : 0,  // Sanity check
        upload < 1000 ? upload : 0,
        latency < 10000 ? latency : 0
    ];
};

// Update display
const updateDisplay = (download, upload, latency) => {
    document.getElementById('downloadSpeed').textContent = 
        download > 0 ? `${download.toFixed(2)} Mbps` : 'Error';
    document.getElementById('uploadSpeed').textContent = 
        upload > 0 ? `${upload.toFixed(2)} Mbps` : 'Error';
    document.getElementById('latency').textContent = 
        latency > 0 ? `${latency} ms` : 'Error';
};

// Main test runner
const runSpeedTest = async () => {
    try {
        const [download, upload, latency] = await Promise.all([
            measureDownload(),
            measureUpload(),
            measureLatency()
        ]);
        
        const [validDownload, validUpload, validLatency] = 
            sanitizeResults(download, upload, latency);
            
        updateConnectionStatus(validDownload > 0 || validUpload > 0);
        updateDisplay(validDownload, validUpload, validLatency);
    } catch {
        updateConnectionStatus(false);
        updateDisplay(0, 0, 0);
    }
};

// Initial run and interval
const init = () => {
    runSpeedTest();
    setInterval(runSpeedTest, CONFIG.testInterval);
    window.addEventListener('offline', () => updateConnectionStatus(false));
    window.addEventListener('online', () => runSpeedTest());
};

// Start application
init();
