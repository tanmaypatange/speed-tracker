class NetworkMonitor {
    constructor() {
        this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (!this.connection) {
            this.handleUnsupportedBrowser();
            return;
        }

        this.initialize();
        this.startMonitoring();
    }

    initialize() {
        this.elements = {
            type: document.getElementById('type'),
            effectiveType: document.getElementById('effectiveType'),
            downlink: document.getElementById('downlink'),
            rtt: document.getElementById('rtt'),
            downlinkMax: document.getElementById('downlinkMax')
        };
    }

    startMonitoring() {
        // Initial update
        this.updateMetrics();
        
        // Set up periodic updates
        this.interval = setInterval(() => this.updateMetrics(), 3000);
        
        // Listen for connection changes
        this.connection.addEventListener('change', () => this.updateMetrics());
    }

    updateMetrics() {
        try {
            // Per spec section 6.5: Downlink rounded to 25 kbps multiples
            const downlink = this.connection.downlink.toFixed(2);
            
            // Per spec section 6.6: RTT rounded to 25 ms multiples
            const rtt = Math.round(this.connection.rtt / 25) * 25;

            // Per spec section 6.7: Maximum downlink from connection table
            const maxDownlink = this.getMaxDownlink();

            this.elements.type.textContent = this.connection.type;
            this.elements.effectiveType.textContent = this.connection.effectiveType;
            this.elements.downlink.textContent = downlink;
            this.elements.rtt.textContent = rtt;
            this.elements.downlinkMax.textContent = maxDownlink;
            
        } catch (error) {
            console.error('Error updating metrics:', error);
        }
    }

    getMaxDownlink() {
        if (!this.connection.downlinkMax) return 'N/A';
        
        // Per table in spec section 6.7
        const speeds = {
            'wifi': {
                '802.11b': 11,
                '802.11g': 54,
                '802.11n': 600,
                '802.11ac': 6933
            },
            'cellular': {
                '2G': 0.384,
                '3G': 2,
                '4G': 100,
                '5G': 1000
            }
        };
        
        return `${this.connection.downlinkMax} Mbps (${this.getGeneration()})`;
    }

    getGeneration() {
        const speed = this.connection.downlinkMax;
        if (speed >= 1000) return '5G+';
        if (speed >= 100) return '4G/LTE';
        if (speed >= 2) return '3G';
        return '2G';
    }

    handleUnsupportedBrowser() {
        document.body.innerHTML = `
            <h1>Compatibility Error</h1>
            <p>This browser doesn't support the Network Information API (Chrome/Edge required)</p>
        `;
    }
}

// Initialize when page loads
window.addEventListener('load', () => new NetworkMonitor());
