let ws;

// -------------------------------
// WebSocket Connection
// -------------------------------

function connectWS() {
    ws = new WebSocket("ws://PI_IP_HERE:8765");

    ws.onopen = () => {
        const c = document.getElementById("connection");
        c.textContent = "● Connected";
        c.style.color = "lime";
    };

    ws.onclose = () => {
        const c = document.getElementById("connection");
        c.textContent = "● Disconnected";
        c.style.color = "red";

        // reconnect every 2 seconds
        setTimeout(connectWS, 2000);
    };

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
            case "system":
                updateSystem(msg);
                break;

            case "command_result":
                updateCommandResult(msg);
                break;

            case "spectrum":
                updateSpectrum(msg.samples);
                break;
        }
    };
}

connectWS();

// -------------------------------
// Panel switching
// -------------------------------

function showPanel(name) {
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.getElementById(`panel-${name}`).classList.add("active");
}

// -------------------------------
// System Stats
// -------------------------------

function updateSystem(msg) {
    document.getElementById("cpu").textContent = msg.cpu + "%";
    document.getElementById("ram").textContent = msg.ram + "%";
    document.getElementById("temp").textContent = msg.temp + "°C";
}

// -------------------------------
// Commands
// -------------------------------

function sendCommand() {
    const cmd = document.getElementById("cmd").value;
    ws.send(JSON.stringify({
        type: "command",
        run: cmd
    }));
}

function updateCommandResult(msg) {
    document.getElementById("cmd-output").textContent =
        msg.stdout + "\n" + msg.stderr;
}

// -------------------------------
// Spectrum Rendering
// -------------------------------

function updateSpectrum(samples) {
    const canvas = document.getElementById("spectrumCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    samples.forEach((v, i) => {
        const x = (i / samples.length) * canvas.width;
        const y = canvas.height - (v * canvas.height);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#44ddee";
    ctx.lineWidth = 2;
    ctx.stroke();
}
