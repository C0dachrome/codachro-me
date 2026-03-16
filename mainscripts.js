const boxOfSecrets = document.getElementById('boxOfSecrets');

const logo = document.getElementById('logo');
const overlay = document.getElementById('gameOverlay');
const countdownEl = document.getElementById('countdown');
const scoreDisplay = document.getElementById('scoreDisplay'); // Added Score Element
const body = document.body;
const contentContainer = document.getElementById('content-container');

// Global Variables
let logoCopy;

// Game State
let gameState = 'waiting'; // 'waiting', 'counting', 'playing', 'gameOver'
let gameLoopId;
let obstacleIntervalId;

// --- FPS Control Variables (Added) ---
let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS; // approx 16.67ms

// Physics & Dimensions
let velocity = 0;
const gravity = 0.5;
let positionY = 0; // FIX: Declared only once now
let elementHeight;
let elementWidth;
let groundLevel;

// Ragdoll Physics
let angularVelocity = 0;
let rotation = 0;
const angularDrag = 0.9;
const bounceFactor = 0.6;

// Obstacles & Score
const OBSTACLE_WIDTH = 80;
const PIPE_GAP = 180;
const OBSTACLE_SPEED = 8;
let obstacles = [];
let score = 0;
const logoRectInitialX = 14; // Matches CSS left: 14px

// --- Event Listeners ---

boxOfSecrets.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        if (boxOfSecrets.value.toLowerCase() === "warp") {
            window.location.href = "prxy.html"
        }  else if (boxOfSecrets.value.toLowerCase() === "ultrasound"){
            window.location.href = "ultrasound.html"
        }
        // Space to add more secrets in the future 
    }
});

// Unified Logo Click Listener (Handles Start and Reset)
logo.addEventListener('click', (e) => {
    e.preventDefault();
    if (gameState === 'waiting') {
        initializeGame();
    } else if (gameState === 'playing' || gameState === 'gameOver') {
        resetGame();
    }
});

// Function to show the selected tab and hide others
function handleTabSwitch(targetId) {
    // 1. Get all tab content sections
    const tabPanels = document.querySelectorAll('.tab-panel');
    // 2. Get all nav links
    const navLinks = document.querySelectorAll('.tab-link');
    // 3. Get the commits container (New selector added)
    const homeCommits = document.querySelector('.home-commits');

    // Hide all content panels
    tabPanels.forEach(panel => {
        panel.style.display = 'none';
    });

    // Deactivate all navigation links
    navLinks.forEach(link => {
        link.classList.remove('active');
        link.setAttribute('aria-selected', 'false');
    });

    // Show the target content panel
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
        targetPanel.style.display = 'block';
    }

    // Activate the clicked link
    const activeLink = document.querySelector(`.tab-link[data-target="${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        activeLink.setAttribute('aria-selected', 'true');
    }

    // ** NEW LOGIC: Manage the Latest Site Commits section **
    if (homeCommits) {
        if (targetId === 'home') {
            // If switching TO the home tab, make sure the commits sidebar is visible
            homeCommits.style.display = 'block';
        } else {
            // If switching AWAY from the home tab, hide the commits sidebar
            homeCommits.style.display = 'none';
        }
    }
}

// Event listener for navigation links
document.querySelectorAll('a[data-link-type="nav"]').forEach(link => {
    // Preserve the existing resetGame handler AND add the tab switch handler
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Stop the link from changing the URL

        // Get the target ID from the data-target attribute
        const targetId = link.getAttribute('data-target');

        // Handle the tab change
        handleTabSwitch(targetId);

        // Call the existing reset game logic (this is kept from your original code)
        resetGame();
    });
});

// Handle initial load: Show the tab marked 'active' or the first one
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayCommits();
    // Find the link that is initially marked as active in the HTML
    const initialLink = document.querySelector('.tab-link.active');
    if (initialLink) {
        const initialTarget = initialLink.getAttribute('data-target');
        handleTabSwitch(initialTarget);
    } else {
        // Fallback: activate the first link found
        const firstLink = document.querySelector('.tab-link');
        if (firstLink) {
            firstLink.click(); // Programmatically click the first link to set its state
        }
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'h' || event.key === 'H') {
        const hopper = document.getElementById('hopper-card');

        // Toggle the display property
        if (hopper.style.display === 'none') {
            hopper.style.display = 'block';
        } else {
            hopper.style.display = 'none';
        }
    }
});

const GITHUB_REPO_OWNER = 'C0dachrome';
const GITHUB_REPO_NAME = 'codachro-me';
const commitList = document.getElementById('homeCommitList');

function fetchAndDisplayCommits() {
    if (!commitList) return; // Exit if the element doesn't exist

    // Clear any existing list items
    commitList.innerHTML = '<li>Loading latest commits...</li>';

    // Construct the API URL to fetch the last 5 commits
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits?per_page=5`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(commits => {
            commitList.innerHTML = ''; // Clear loading message

            if (commits.length === 0) {
                commitList.innerHTML = '<li>No commits found.</li>';
                return;
            }

            commits.forEach(commitData => {
                const li = document.createElement('li');

                // Format the date
                const date = new Date(commitData.commit.author.date);
                const formattedDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Get the short SHA hash
                const shortSha = commitData.sha.substring(0, 7);

                li.innerHTML = `
                        <p class="commit-message">
                            <strong>${commitData.commit.message.split('\n')[0]}</strong>
                        </p>
                        <span class="commit-details">
                            <a href="${commitData.html_url}" target="_blank" title="View commit on GitHub">${shortSha}</a> 
                            by ${commitData.commit.author.name} on ${formattedDate}
                        </span>
                    `;
                commitList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error fetching commits:", error);
            commitList.innerHTML = `<li>Error loading commits: ${error.message}. Please check your repository name.</li>`;
        });
}

function initializeGame() {
    if (gameState !== 'waiting') return;

    gameState = 'counting';
    body.classList.add('blurred-background', 'game-mode');
    overlay.classList.add('is-active');
    countdownEl.style.display = 'block';

    // Create clone
    logoCopy = logo.cloneNode(true);
    logoCopy.id = 'logo-copy';
    overlay.appendChild(logoCopy);

    // Set initial inline styles
    logoCopy.style.position = 'absolute';
    logoCopy.style.top = '10px';
    logoCopy.style.left = '14px';

    // Allow clicking the bird to reset if dead/playing
    logoCopy.addEventListener('click', (e) => {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'gameOver') {
            resetGame();
        }
    });

    startCountdown();
}

function resetGame() {
    if (gameState === 'waiting') return;

    // Remove DOM elements
    if (logoCopy) logoCopy.remove();
    obstacles.forEach(o => {
        o.elementTop.remove();
        o.elementBottom.remove();
    });
    obstacles = [];

    // Clear Loops
    clearInterval(obstacleIntervalId);
    cancelAnimationFrame(gameLoopId);
    document.removeEventListener('keydown', handleKeyPress);
    window.removeEventListener('resize', updateGroundLevel);

    // Reset UI
    body.classList.remove('blurred-background', 'game-mode');
    overlay.classList.remove('is-active');
    countdownEl.style.display = 'none';
    scoreDisplay.style.display = 'none'; // Hide Score

    // Reset Logic
    gameState = 'waiting';
    velocity = 0;
    positionY = 0;
    score = 0;
    rotation = 0;
    angularVelocity = 0;
    lastTime = 0; // Reset Throttling Timer
}

function startCountdown() {
    let count = 3;
    countdownEl.textContent = count;

    const timer = setInterval(() => {
        count--;
        countdownEl.textContent = count;

        if (count === 0) {
            clearInterval(timer);
            countdownEl.style.display = 'none';
            startGameLoop();
        }
    }, 1000);
}

function startGameLoop() {
    gameState = 'playing';

    // Score Reset
    score = 0;
    scoreDisplay.textContent = score;
    scoreDisplay.style.display = 'block';

    // Dimensions
    elementHeight = logoCopy.offsetHeight;
    elementWidth = logoCopy.offsetWidth;

    updateGroundLevel();
    window.addEventListener('resize', updateGroundLevel);

    document.addEventListener('keydown', handleKeyPress);

    // Start Obstacles
    obstacleIntervalId = setInterval(createObstacle, 2500);

    // Initialize Time for Throttling
    lastTime = performance.now();
    gameLoopId = requestAnimationFrame(render);
}

function updateGroundLevel() {
    groundLevel = window.innerHeight - elementHeight - 20;
}

function handleKeyPress(event) {
    if (event.keyCode === 32 && gameState === 'playing') {
        event.preventDefault();
        velocity = -10;
    }
}

function render(currentTime) {
    if (gameState !== 'playing') return;

    // Keep the loop alive
    gameLoopId = requestAnimationFrame(render);

    // --- FPS Throttling Logic ---
    const elapsed = currentTime - lastTime;

    // Only update physics if enough time has passed (approx 16ms)
    if (elapsed > frameInterval) {
        // Adjust lastTime to account for execution drift
        lastTime = currentTime - (elapsed % frameInterval);

        // --- Physics Updates (Run only at Target FPS) ---
        velocity += gravity;
        positionY += velocity;

        // Floor Check
        if (positionY >= groundLevel) {
            positionY = groundLevel;
            velocity = 0;
            gameOver();
            return;
        } else if (positionY < 0) {
            positionY = 0;
            velocity = 0;
        }

        // Move Bird
        logoCopy.style.transform = `translateY(${positionY}px)`;

        // Move Obstacles
        moveObstacles();

        // Collisions
        if (checkCollisions()) {
            gameOver();
        }
    }
}

function gameOver() {
    if (gameState === 'gameOver') return;
    gameState = 'gameOver';

    // Stop the main render loop explicitly
    cancelAnimationFrame(gameLoopId);
    clearInterval(obstacleIntervalId);

    // Init Ragdoll Physics
    velocity = 6;
    angularVelocity = (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 15);

    // Reset timer for tumble loop
    lastTime = performance.now();
    gameLoopId = requestAnimationFrame(tumbleLoop);
}

function tumbleLoop(currentTime) {
    if (gameState !== 'gameOver') return;

    gameLoopId = requestAnimationFrame(tumbleLoop);

    // --- FPS Throttling for Ragdoll ---
    const elapsed = currentTime - lastTime;

    if (elapsed > frameInterval) {
        lastTime = currentTime - (elapsed % frameInterval);

        // Ragdoll Physics
        velocity += gravity;
        positionY += velocity;
        rotation += angularVelocity;
        angularVelocity *= angularDrag;

        // Floor Bounce
        if (positionY >= groundLevel) {
            positionY = groundLevel;
            velocity *= -bounceFactor;
            angularVelocity *= -bounceFactor;

            if (Math.abs(velocity) < 1) velocity = 0;
            if (Math.abs(angularVelocity) < 0.5) angularVelocity = 0;
        }

        logoCopy.style.transform = `translateY(${positionY}px) rotate(${rotation}deg)`;

        // Stop loop when still
        if (positionY === groundLevel && velocity === 0 && angularVelocity === 0) {
            cancelAnimationFrame(gameLoopId);
            return;
        }
    }
}

function createObstacle() {
    const minHeight = 20;
    const maxHeight = window.innerHeight - PIPE_GAP - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const bottomHeight = window.innerHeight - topHeight - PIPE_GAP;

    const topPipe = document.createElement('div');
    topPipe.classList.add('obstacle');
    topPipe.style.height = `${topHeight}px`;
    topPipe.style.top = '0px';
    topPipe.style.left = `${window.innerWidth}px`;

    const bottomPipe = document.createElement('div');
    bottomPipe.classList.add('obstacle');
    bottomPipe.style.height = `${bottomHeight}px`;
    bottomPipe.style.bottom = '0px';
    bottomPipe.style.left = `${window.innerWidth}px`;

    overlay.appendChild(topPipe);
    overlay.appendChild(bottomPipe);

    obstacles.push({
        elementTop: topPipe,
        elementBottom: bottomPipe,
        x: window.innerWidth,
        passed: false // Scoring flag
    });
}

function moveObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacle.x -= OBSTACLE_SPEED;

        obstacle.elementTop.style.left = `${obstacle.x}px`;
        obstacle.elementBottom.style.left = `${obstacle.x}px`;

        if (obstacle.x + OBSTACLE_WIDTH < 0) {
            obstacle.elementTop.remove();
            obstacle.elementBottom.remove();
            obstacles.splice(i, 1);
            i--;
        }
    }
}

function checkCollisions() {
    const logoRect = logoCopy.getBoundingClientRect();
    // Calculate X position of bird's right edge for scoring
    const logoRightEdge = logoRectInitialX + elementWidth;

    for (const obstacle of obstacles) {
        const topRect = obstacle.elementTop.getBoundingClientRect();
        const bottomRect = obstacle.elementBottom.getBoundingClientRect();

        // Collision Logic
        if (
            logoRect.right > topRect.left &&
            logoRect.left < topRect.right &&
            logoRect.bottom > topRect.top &&
            logoRect.top < topRect.bottom
        ) return true;

        if (
            logoRect.right > bottomRect.left &&
            logoRect.left < bottomRect.right &&
            logoRect.bottom > bottomRect.top &&
            logoRect.top < bottomRect.bottom
        ) return true;

        // Scoring Logic
        if (obstacle.x + OBSTACLE_WIDTH < logoRightEdge && !obstacle.passed) {
            score++;
            scoreDisplay.textContent = score;
            obstacle.passed = true;
        }
    }
    return false;
}


// Global physics variables
let engine, rnder, runner;
let isPhysicsEnabled = false;

// --- Matter.js Aliases (Keep these for clean code) ---
const { Engine, Rnder, Runner, Bodies, Composite, Events, Body, Vector } = Matter;

function startChaos() {
    if (isPhysicsEnabled) {
        // Optional: If you want to stop and reset the physics, uncomment this:
        // resetChaos(); 
        // return;
        return; // Exit if already running to prevent duplicates
    }
    isPhysicsEnabled = true;

    // 1. Setup Engine & World
    engine = Engine.create();
    const world = engine.world;

    // Set global gravity (Matter.js default is 1, let's keep it that way for realism)
    world.gravity.y = 0;

    // 2. Select ALL elements with the specific class inside the container
    // Note: You MUST add class="physics-element" to every tag you want to fall.
    const container = document.getElementById('content-container');
    // Selects ALL descendants of the container that have the physics-element class
    const elements = Array.from(container.querySelectorAll('.physics-element'));

    const physicsBodies = [];

    // 3. Convert HTML elements to Physics Bodies
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();

        // Ignore elements with zero size (e.g., hidden or spacing elements)
        if (rect.width === 0 || rect.height === 0) return;

        // Calculate center
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Create a physics body
        const body = Bodies.rectangle(x, y, rect.width, rect.height, {
            restitution: 1, // Bounciness (0-1)
            friction: 0.1,
            // Chamfer helps elements roll better
            chamfer: { radius: 5 },
            // Give it a slightly custom mass based on its area
            mass: (rect.width * rect.height) / 1000
        });

        // Attach the DOM element to the body
        body.domElement = el;

        // Prepare the DOM element for absolute positioning
        el.style.position = 'absolute';
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.width = rect.width + 'px';
        el.style.height = rect.height + 'px';
        el.style.margin = '0';
        el.style.transformOrigin = "50% 50%";
        el.style.pointerEvents = 'none'; // Optional: makes them non-clickable in physics mode

        physicsBodies.push(body);
    });

    // 4. Create Walls (Boundary)
    const wallOptions = { isStatic: true, rnnder: { visible: false } };
    const width = window.innerWidth;
    const height = window.innerHeight;
    const wallThick = 100;

    const floor = Bodies.rectangle(width / 2, height + wallThick / 2, width, wallThick, wallOptions);
    const ceiling = Bodies.rectangle(width / 2, -wallThick / 2, width, wallThick, wallOptions);
    const leftWall = Bodies.rectangle(0 - wallThick / 2, height / 2, wallThick, height * 5, wallOptions);
    const rightWall = Bodies.rectangle(width + wallThick / 2, height / 2, wallThick, height * 5, wallOptions);

    Composite.add(world, [...physicsBodies, floor, ceiling, leftWall, rightWall]);

    // 5. Run the Engine
    runner = Runner.create();
    Runner.run(runner, engine);

    // 6. The "Game Loop": Sync DOM elements to Physics Bodies & Mouse Repulsion
    Events.on(engine, 'afterUpdate', function () {
        physicsBodies.forEach(body => {
            const el = body.domElement;
            if (el) {
                // Move the HTML element to match the physics body
                const x = body.position.x - el.offsetWidth / 2;
                const y = body.position.y - el.offsetHeight / 2;

                // Use CSS transform for performance
                el.style.transform = `translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
            }
        });

        // Apply Mouse Repulsion
        if (mousePosition) {
            physicsBodies.forEach(body => {
                const bodyPos = body.position;
                const distance = Vector.magnitude(Vector.sub(mousePosition, bodyPos));

                // If mouse is close (within 150px)
                if (distance < 150) {
                    // Apply a force proportional to the body's mass
                    const forceMagnitude = 0.05 * body.mass;
                    const forceVector = Vector.sub(bodyPos, mousePosition);
                    const normalized = Vector.normalise(forceVector);
                    const force = Vector.mult(normalized, forceMagnitude);

                    Body.applyForce(body, body.position, force);
                }
            });
        }
    });
}

// Mouse Tracker
let mousePosition = null;
document.addEventListener('mousemove', (e) => {
    mousePosition = { x: e.clientX, y: e.clientY };
});

// Optional: Cleanup function if you want a reset button
function resetChaos() {
    if (!isPhysicsEnabled) return;

    // Stop the engine runner
    Runner.stop(runner);

    // Remove all physics bodies from the world
    Composite.clear(engine.world);

    // Reset the style of all elements back to their original state (or just remove the absolute positioning)
    const elements = document.querySelectorAll('.physics-element');
    elements.forEach(el => {
        el.style.position = ''; // Remove inline style
        el.style.transform = '';
        el.style.width = '';
        el.style.height = '';
        el.style.margin = '';
        el.style.transformOrigin = '';
        el.style.pointerEvents = '';
    });

    isPhysicsEnabled = false;
    engine = null;
    runner = null;
}

//matrix page

// matrix animation removed — background handled in CSS for a subtle effect

(function () {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav-list');
    if (!toggle) return;

    function closeNav() {
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
    }

    function openNav() {
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');
    }

    toggle.addEventListener('click', (e) => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        if (expanded) closeNav(); else openNav();
    });

    // Close when resizing to desktop
    window.addEventListener('resize', () => { if (window.innerWidth > 800) closeNav(); });

    // Close when clicking a nav link (good for single-page navigation)
    if (nav) nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!document.body.classList.contains('nav-open')) return;
        if (toggle.contains(e.target) || (nav && nav.contains(e.target))) return;
        closeNav();
    });
})();
