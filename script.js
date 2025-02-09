class NetworkMonitor {
    constructor() {
        this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        this.init();
    }

    init() {
        if (!this.connection) {
            this.handleUnsupportedBrowser();
            return;
        }

        this.setupEventListeners();
        this.updateMetrics();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        this.connection.addEventListener('change', () => {
            this.updateMetrics();
            this.animateMetricUpdate();
        });
    }

    startAutoRefresh() {
        setInterval(() => {
            this.updateMetrics();
        }, 3000);  // Update every 3 seconds
    }

    updateMetrics() {
        const now = new Date().toLocaleTimeString();
        document.getElementById('update-status').textContent = `Last updated: ${now}`;
        
        // Core metrics from Network API
        const downloadSpeed = this.connection.downlink;
        const latency = this.connection.rtt;
        const connectionType = this.connection.effectiveType.toUpperCase();

        document.getElementById('download-speed').textContent = downloadSpeed.toFixed(2);
        document.getElementById('latency').textContent = latency;
        document.getElementById('connection-type').textContent = 
            `Connection type: ${connectionType} (${this.getNetworkGeneration()})`;

        // Simulate upload speed measurement
        this.estimateUploadSpeed();
    }

    getNetworkGeneration() {
        const speed = this.connection.downlink;
        if (speed >= 100) return '5G';
        if (speed >= 30) return '4G LTE';
        if (speed >= 10) return '4G';
        if (speed >= 3) return '3G';
        return '2G';
    }

    animateMetricUpdate() {
        const cards = document.querySelectorAll('.metric-card');
        cards.forEach(card => {
            card.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                card.style.transform = 'translateY(0)';
            }, 300);
        });
    }

    async estimateUploadSpeed() {
        try {
            const startTime = Date.now();
            const fileSize = 500000; // 500KB test payload
            const dummyFile = new Blob([new ArrayBuffer(fileSize)], {type: 'application/octet-stream'});
            
            await fetch('https://httpbin.org/post', {
                method: 'POST',
                body: dummyFile,
                mode: 'no-cors'
            });

            const duration = (Date.now() - startTime) / 1000;
            const bitsLoaded = fileSize * 8;
            const uploadSpeed = (bitsLoaded / duration / 1000000).toFixed(2);
            
            document.getElementById('upload-speed').textContent = uploadSpeed;
        } catch (error) {
            document.getElementById('upload-speed').textContent = 'ERR';
        }
    }

    handleUnsupportedBrowser() {
        document.getElementById('connection-type').textContent = 
            'Network API not supported - Switch to Chrome/Edge for full features';
        document.querySelectorAll('.metric-value').forEach(el => {
            el.textContent = '-';
        });
    }
}

// Initialize when page loads
window.addEventListener('load', () => new NetworkMonitor());
