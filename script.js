const CONFIG = {
    testInterval: 10000,
    download: {
        url: 'https://id1.newmediaexpress.com/100MB_1.test',
        sizeMB: 100,
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
    
    const start = performance.now();
    let bytesReceived = 0;
    
    try {
        const url = `${CONFIG.download.url}?t=${Date.now()}`;
        const timeout = setTimeout(() => controller.abort(), CONFIG.download.timeout);
        
        const response = await fetch(url, {
            signal: controller.signal
        });
        const reader = response.body.getReader();
        
        while(true) {
            const { done, value } = await reader.read();
            if(done) break;
            bytesReceived += value.length;
            
            // Cancel previous test if new one starts
            if(activeController !== controller) {
                controller.abort();
                return 0;
            }
        }
        
        clearTimeout(timeout);
        const duration = (performance.now() - start) / 1000;
        return (bytesReceived * 8) / (1024 * 1024) / duration;
    } catch {
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
    window.addEventListener('offline', () => updateConnectionStatus(false));
    window.addEventListener('online', () => runSpeedTest());
    
    // Clean up on exit
    window.addEventListener('beforeunload', () => {
        clearInterval(interval);
        activeController?.abort();
    });
};

init();
