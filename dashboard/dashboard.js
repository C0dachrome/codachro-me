let ws;

// -------------------------------
// WebSocket Connection
// -------------------------------

function connectWS() {
    ws = new WebSocket("wss://eye.codachro.me");


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

function showPanel(name) {
    document.querySelectorAll('.panel').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById('panel-' + name).classList.add('active');

    document.querySelectorAll('#sidebar button').forEach(b => {
        b.classList.remove('active');
    });
    event.target.classList.add('active');
}
