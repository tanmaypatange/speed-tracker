class NetworkMonitor {
    constructor() {
        this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!this.connection) {
            this.handleUnsupportedBrowser();
            return;
        }
        
        this.initialize();
        this.startTracking();
    }

    initialize() {
        this.updateSpeed = this.updateSpeed.bind(this);
        this.domElements = {
            download: document.getElementById('download-speed'),
            upload: document.getElementById('upload-speed'),
            latency: document.getElementById('latency'),
            connectionType: document.getElementById('connection-type'),
            maxSpeed: document.getElementById('max-speed'),
            lastUpdated: document.getElementById('last-updated')
        };
    }

    startTracking() {
        // Immediate first update
        this.updateNetworkInfo();
        
        // Regular updates every 3 seconds
        setInterval(() => this.updateNetworkInfo(), 3000);
        
        // Listen for network changes
        this.connection.addEventListener('change', this.updateNetworkInfo.bind(this));
    }

    updateNetworkInfo() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        try {
            this.updateDownloadSpeed();
            this.updateLatency();
            this.updateMetaInfo();
            this.domElements.lastUpdated.textContent = `Last updated: ${timeString}`;
        } catch (error) {
            console.error('Error updating network info:', error);
        }
    }

    updateDownloadSpeed() {
        const rawSpeed = this.connection.downlink;
        const formattedSpeed = rawSpeed ? 
            `${this.roundToDecimal(rawSpeed, 2)} Mbps` : 
            'Unavailable';
        
        this.domElements.download.textContent = formattedSpeed;
    }

    updateLatency() {
        const rawLatency = this.connection.rtt;
        const formattedLatency = rawLatency ? 
            `${this.roundToNearest(rawLatency, 25)} ms` : 
            'Unavailable';
        
        this.domElements.latency.textContent = formattedLatency;
    }

    updateMetaInfo() {
        const formattedType = this.connection.effectiveType.toUpperCase();
        const maxSpeed = this.connection.downlinkMax ? 
            `${this.connection.downlinkMax} Mbps*` : 
            'Calculating...';
        
        this.domElements.connectionType.textContent = 
            `Connection type: ${formattedType} (${this.getNetworkGeneration()})`;
        
        this.domElements.maxSpeed.textContent = 
            `Max theoretical speed: ${maxSpeed}`;
    }

    getNetworkGeneration() {
        const speed = this.connection.downlink;
        if (!speed) return 'Unknown';
        
        if (speed >= 100) return '5G+';
        if (speed >= 30) return '4G LTE';
        if (speed >= 10) return '4G';
        if (speed >= 3) return '3G';
        return '2G/EDGE';
    }

    roundToDecimal(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    roundToNearest(value, multiple) {
        return Math.round(value / multiple) * multiple;
    }

    handleUnsupportedBrowser() {
        this.domElements.connectionType.textContent = 
            'Network info unavailable - Requires modern browser (Chrome/Edge)';
        [this.domElements.download, this.domElements.upload].forEach(element => {
            element.textContent = 'N/A';
        });
    }
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => new NetworkMonitor());
