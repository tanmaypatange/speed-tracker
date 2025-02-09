function updateMetrics() {
    // Check if the Network Information API is supported
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
        // Only update metrics if values are available
        const downloadSpeed = connection.downlink ?? 'Unavailable';
        const latency = connection.rtt ?? 'Unavailable';

        document.getElementById('download-speed').textContent = 
            downloadSpeed !== 'Unavailable' ? `${downloadSpeed.toFixed(2)} Mbps` : downloadSpeed;

        document.getElementById('latency').textContent = 
            latency !== 'Unavailable' ? `${latency} ms` : latency;
    }
}

// Check for API support ONCE and start updates
if ('connection' in navigator) {
    // Initial update and auto-refresh
    updateMetrics();
    setInterval(updateMetrics, 5000);
    
    // Detect network changes (per API spec)
    navigator.connection.addEventListener('change', updateMetrics);
}
