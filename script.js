const CONFIG = {
    testInterval: 10000,
    download: {
        url: 'https://id1.newmediaexpress.com/100MB_1.test',
        timeout: 9500 // Abort after 9.5 seconds
    },
    latency: {
        url: 'https://www.google.com',
        timeout: 2000
    }
};

const connectionStatus = document.getElementById('connectionStatus');
let activeController = null;

const measureDownload = async () => {
    const controller = new AbortController();
    activeController = controller;
    
    let startTime, endTime;
    try {
        const url = `${CONFIG.download.url}?t=${Date.now()}`;
        const timeout = setTimeout(() => controller.abort(), CONFIG.download.timeout);
        
        startTime = performance.now();
        const response = await fetch(url, { 
            signal: controller.signal,
            cache: 'no-cache'
        });
        
        // Get the total size from headers if available
        const contentLength = response.headers.get('content-length') || 100 * 1024 * 1024;
        const reader = response.body.getReader();
        
        let received = 0;
        while(true) {
            const { done, value } = await reader.read();
            if(done) break;
            received += value.length;
            
            // Abort if a new test has started
            if(activeController !== controller) {
                controller.abort();
                return 0;
            }
        }
        
        clearTimeout(timeout);
        endTime = performance.now();
        const durationSeconds = (endTime - startTime) / 1000;
        return (received * 8) / (1024 * 1024) / durationSeconds; // Convert to Mbps
    } catch (error) {
        if(endTime && startTime) {
            const durationSeconds = (endTime - startTime) / 1000;
            const received = (endTime - startTime) * CONFIG.download.timeout / 1000;
            return Math.min((received * 8) / (1024 * 1024) / durationSeconds, 0);
        }
        return 0;
    }
};

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

const updateConnectionStatus = (connected) => {
    connectionStatus.classList.toggle('connected', connected);
};

const updateDisplay = (download, latency) => {
    document.getElementById('downloadSpeed').textContent = 
        download > 0 ? `${download.toFixed(2)} Mbps` : 'Measuring...';
    document.getElementById('latency').textContent = 
        latency > 0 ? `${latency} ms` : 'Testing...';
};

const runSpeedTest = async () => {
    try {
        activeController?.abort();
        
        const [download, latency] = await Promise.all([
            measureDownload(),
            measureLatency()
        ]);
        
        updateConnectionStatus(download > 0);
        updateDisplay(
            download < 1000 ? download : 0,
            latency < 1000 ? latency : 0
        );
    } catch {
        updateConnectionStatus(false);
        updateDisplay(0, 0);
    }
};

const init = () => {
    runSpeedTest();
    const interval = setInterval(runSpeedTest, CONFIG.testInterval);
    window.addEventListener('beforeunload', () => {
        clearInterval(interval);
        activeController?.abort();
    });
};

init();
