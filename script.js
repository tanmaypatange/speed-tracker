// Check if the browser supports the Network Information API
if ('connection' in navigator && 'effectiveType' in navigator.connection) {
    // Initial check
    updateMetrics();

    // Update every 5 seconds
    setInterval(updateMetrics, 5000);

    // Listen for network changes
    navigator.connection.addEventListener('change', updateMetrics);
} else {
    alert("Your browser doesn't support the Network Information API. Try Chrome or Edge.");
}

function updateMetrics() {
    const connection = navigator.connection;

    // Download speed (in Mbps)
    const downloadSpeed = connection.downlink || 0;
    document.getElementById('download-speed').textContent = `${downloadSpeed.toFixed(2)} Mbps`;

    // Latency (in milliseconds)
    const latency = connection.rtt || 0;
    document.getElementById('latency').textContent = `${latency} ms`;

    // Estimate upload speed (not directly supported; hacky workaround)
    // Note: This is a simplified placeholder. Real upload tests require server-side code.
    const uploadSpeed = Math.random() * 5; // Simulate a small value
    document.getElementById('upload-speed').textContent = `${uploadSpeed.toFixed(2)} Mbps`;
}
