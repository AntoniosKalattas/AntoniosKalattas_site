/**
 * SYSTEM CONTROLLER ENGINE v2.0.4
 * Antonios Kalattas - Portfolio Controller
 * Coordinates Canvas animations, clock widgets, typing systems, CLI terminals, and grid filters.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       01. CLOCKS & WIDGET UTILITIES
       ========================================================================== */
    
    // Cyprus Live Time Clock
    const updateCyprusTime = () => {
        const timeContainer = document.getElementById('cyprus-time');
        if (!timeContainer) return;
        
        const options = {
            timeZone: 'Europe/Nicosia',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        timeContainer.innerText = new Date().toLocaleTimeString('en-US', options);
    };
    setInterval(updateCyprusTime, 1000);
    updateCyprusTime();

    // Session Uptime Timer
    let uptimeSeconds = 0;
    const updateUptime = () => {
        const uptimeContainer = document.getElementById('uptime-counter');
        if (!uptimeContainer) return;
        
        uptimeSeconds++;
        const hrs = String(Math.floor(uptimeSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(uptimeSeconds % 60).padStart(2, '0');
        
        uptimeContainer.innerText = `${hrs}:${mins}:${secs}`;
    };
    setInterval(updateUptime, 1000);

    // Diagnostics Mock Generator
    const updateDiagnostics = () => {
        const cpuVal = document.getElementById('cpu-value');
        const memVal = document.getElementById('mem-value');
        const latVal = document.getElementById('lat-value');
        
        const cpuFill = document.querySelector('.cpu-fill');
        const memFill = document.querySelector('.mem-fill');
        const latFill = document.querySelector('.lat-fill');
        
        if (!cpuVal || !memVal || !latVal) return;

        // Generate values with natural variations
        const cpu = Math.floor(Math.random() * 20) + 12; // 12% - 32%
        const mem = Math.floor(Math.random() * 5) + 45;   // 45% - 50%
        const lat = Math.floor(Math.random() * 12) + 8;    // 8ms - 20ms

        cpuVal.innerText = `${cpu}%`;
        memVal.innerText = `${mem}%`;
        latVal.innerText = `${lat}ms`;

        cpuFill.style.width = `${cpu}%`;
        memFill.style.width = `${mem}%`;
        latFill.style.width = `${lat * 4}%`; // scale visual bar
    };
    setInterval(updateDiagnostics, 3000);
    updateDiagnostics();

    /* ==========================================================================
       02. PROFILE TYPING SYSTEM
       ========================================================================== */
    const roleText = document.getElementById('role-text');
    const roles = [
        "Software Developer", 
        "Computer Science Student",
        "Automation Architect",
        "Full-Stack Engineer"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const typeRole = () => {
        if (!roleText) return;
        
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            roleText.innerText = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Delete faster
        } else {
            roleText.innerText = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Type normal
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typingSpeed = 2500; // Wait before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500; // Delay before typing next role
        }

        setTimeout(typeRole, typingSpeed);
    };
    setTimeout(typeRole, 1000);

    /* ==========================================================================
       03. CONSOLE MODULE NAVIGATION
       ========================================================================== */
    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.panel-section');

    const switchTab = (tabName) => {
        tabs.forEach(t => {
            if (t.dataset.tab === tabName) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        panels.forEach(p => {
            if (p.id === tabName) {
                p.classList.add('active');
            } else {
                p.classList.remove('active');
            }
        });

        if (tabName === 'cli') {
            setTimeout(() => {
                const termInput = document.getElementById('terminal-input');
                if (termInput) termInput.focus();
            }, 100);
        }
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    /* ==========================================================================
       04. INTERACTIVE BACKGROUND RENDERING (CANVAS)
       ========================================================================== */
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationMode = localStorage.getItem('anim_mode') || 'mesh'; // Default mode
    let animationFrameId = null;

    // Canvas Resizing
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mouse Tracking Coordinates
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    /* --- MODE A: INTERACTIVE PARTICLES MESH GRID --- */
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            // Apply standard velocity
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off borders
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // Interactive attraction logic with mouse hover
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    // Attract slightly
                    this.x -= dx * force * 0.02;
                    this.y -= dy * force * 0.02;
                }
            }
        }

        draw() {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const particlesArray = [];
    const initParticles = () => {
        particlesArray.length = 0;
        const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
        for (let i = 0; i < count; i++) {
            particlesArray.push(new Particle());
        }
    };
    initParticles();

    const drawMeshGrid = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update & render particles
        particlesArray.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        for (let i = 0; i < particlesArray.length; i++) {
            for (let j = i + 1; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    const opacity = (100 - dist) / 100 * 0.15;
                    ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                }
            }

            // Connection to mouse
            if (mouse.x !== null && mouse.y !== null) {
                const dx = particlesArray[i].x - mouse.x;
                const dy = particlesArray[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const opacity = (mouse.radius - dist) / mouse.radius * 0.25;
                    ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    };

    /* --- MODE B: MATRIX FALLING DIGITAL CODE --- */
    const characters = "010110ABCDEF101011XYZ//$$==++--".split("");
    const fontSize = 12;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = [];

    const initMatrix = () => {
        columns = Math.floor(canvas.width / fontSize);
        drops = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = Math.random() * -100; // staggered drop release
        }
    };
    initMatrix();

    const drawMatrixRain = () => {
        // Semi-transparent overlay to create trailing fade effect
        ctx.fillStyle = 'rgba(7, 8, 12, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = characters[Math.floor(Math.random() * characters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Reset drop once offscreen
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    };

    /* --- LOOP ORCHESTRATOR --- */
    const renderLoop = () => {
        if (animationMode === 'mesh') {
            drawMeshGrid();
        } else if (animationMode === 'matrix') {
            drawMatrixRain();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return; // Exit loop completely on static mode
        }
        animationFrameId = requestAnimationFrame(renderLoop);
    };

    const updateAnimMode = (newMode) => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        animationMode = newMode;
        localStorage.setItem('anim_mode', newMode);

        // Update active class on buttons
        const modeButtons = ['btn-grid', 'btn-matrix', 'btn-static'];
        modeButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            if (btnId === `btn-${newMode}`) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Initialize variables depending on selection
        if (newMode === 'mesh') {
            initParticles();
            renderLoop();
        } else if (newMode === 'matrix') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            initMatrix();
            renderLoop();
        } else {
            // Static mode: clear screen
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    // Bind mode triggers
    const bindControl = (id, mode) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => updateAnimMode(mode));
        }
    };
    bindControl('btn-grid', 'mesh');
    bindControl('btn-matrix', 'matrix');
    bindControl('btn-static', 'static');

    // Run initial loop
    updateAnimMode(animationMode);

    /* ==========================================================================
       05. PORTFOLIO FILTERS DATABASE
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card-cyber');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle active classes on controls
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.filter;

            // Apply card filters
            projectCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'flex';
                    // Trigger fade in animation
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.style.opacity = '0';
                    card.style.display = 'none';
                }
            });
        });
    });

    /* ==========================================================================
       06. INTERACTIVE TERMINAL ENGINE
       ========================================================================== */
    const terminalHistory = document.getElementById('terminal-history');
    const terminalInput = document.getElementById('terminal-input');
    const shortcutButtons = document.querySelectorAll('.shortcut-btn');

    const printOutput = (text, type = '') => {
        if (!terminalHistory) return;
        const line = document.createElement('div');
        line.className = `output-line ${type}`;
        line.innerHTML = text;
        terminalHistory.appendChild(line);
        // Scroll to bottom
        terminalHistory.scrollTop = terminalHistory.scrollHeight;
    };

    const processCommand = (rawInput) => {
        const input = rawInput.trim().toLowerCase();
        if (!input) return;

        printOutput(`visitor@kalattas.dev:~$ ${rawInput}`, 'user-cmd');

        switch (input) {
            case 'help':
                printOutput(`--- AVAILABLE COMMANDS IN INTERACTIVE LOG ---`, 'label');
                printOutput(`&bull; <span class="cmd">about</span>    - Display comprehensive personal background info.`);
                printOutput(`&bull; <span class="cmd">skills</span>   - List programming skills and tool matrices.`);
                printOutput(`&bull; <span class="cmd">projects</span> - Display completed development project databank.`);
                printOutput(`&bull; <span class="cmd">journey</span>  - Print education and software work timelines.`);
                printOutput(`&bull; <span class="cmd">contact</span>  - Output direct communication links.`);
                printOutput(`&bull; <span class="cmd">matrix</span>   - Trigger Matrix Code digital falling background.`);
                printOutput(`&bull; <span class="cmd">mesh</span>     - Trigger interactive vector particle background.`);
                printOutput(`&bull; <span class="cmd">static</span>   - Disable background visuals (Low-Power Mode).`);
                printOutput(`&bull; <span class="cmd">clear</span>    - Wipe the terminal console history lines.`);
                break;
            case 'about':
            case 'bio':
                printOutput(`--- ACADEMIC SOFTWARE DEVELOPER PROFILE ---`, 'label');
                printOutput(`Antonios Kalattas is a CS Student studying at the University of Cyprus.`);
                printOutput(`He specializes in Cross-platform application deployment (Kotlin, Java, Swift),`);
                printOutput(`Backend API architectures (Python, Django, Node.js), and Pipeline Testing.`);
                printOutput(`Main goals are writing optimized algorithms and elegant GUI interfaces.`);
                break;
            case 'skills':
            case 'tech':
                printOutput(`--- TECH STACK CATALOGUE ---`, 'label');
                printOutput(`[LANGUAGES]  Kotlin, Python, JS/HTML/CSS, Java, C++, C, Swift, T-SQL`);
                printOutput(`[LIBRARIES]  Selenium, Django, ElectronJS, Cordova, Jetpack Compose, KMP`);
                printOutput(`[UTILITIES]  Git Version Control, NodeJS, REST APIs, OpenAI API, CI/CD`);
                break;
            case 'projects':
            case 'work':
                printOutput(`--- PROJECT DATABANK DIRECTORY ---`, 'label');
                printOutput(`&bull; <strong>FoodletAI</strong> (Kotlin/Android) - AI-driven daily nutrient tracker.`);
                printOutput(`&bull; <strong>UCY Reservation</strong> (Python/Selenium) - Booking automation runner.`);
                printOutput(`&bull; <strong>One-Stop Ride Hail</strong> (Node/TSQL) - Taxi database stored transactions.`);
                printOutput(`&bull; <strong>NewsFeed</strong> (Python Scraper/OpenAI) - Executive text summaries.`);
                printOutput(`&bull; <strong>ST-Dashboard</strong> (ElectronJS/HTML) - Personal habit tracking console.`);
                printOutput(`* Direct portal loaded: redirecting module view to /DATABASE.`);
                switchTab('projects');
                break;
            case 'journey':
            case 'timeline':
                printOutput(`--- CHRONOLOGICAL DIRECTORY ---`, 'label');
                printOutput(`1. [Active] Automation Tester - Bank Of Cyprus (April 2026 - Present)`);
                printOutput(`2. Software Developer Intern - PaleBlue (June 2025 - August 2025)`);
                printOutput(`3. CS Student - University of Cyprus (Sept 2023 - May 2027)`);
                printOutput(`4. Programming Apolytirion - Makarios Tech School (Sept 2019 - June 2022)`);
                printOutput(`* Direct portal loaded: redirecting module view to /JOURNEY.`);
                switchTab('journey');
                break;
            case 'contact':
            case 'social':
                printOutput(`--- DIRECT LINKS PORTAL ---`, 'label');
                printOutput(`&bull; EMAIL: <a href="mailto:akalattasmain@gmail.com" class="link">akalattasmain@gmail.com</a>`);
                printOutput(`&bull; PHONE: <a href="tel:+35799750483" class="link">+357 99750483</a>`);
                printOutput(`&bull; GITHUB: <a href="https://github.com/AntoniosKalattas" target="_blank" class="link">github.com/AntoniosKalattas</a>`);
                printOutput(`&bull; LINKEDIN: <a href="https://www.linkedin.com/in/antonios-kalattas-87891a20b/" target="_blank" class="link">linkedin.com/in/antonios-kalattas</a>`);
                break;
            case 'matrix':
                printOutput(`* Switching background to Matrix Digital Rain...`);
                updateAnimMode('matrix');
                break;
            case 'mesh':
                printOutput(`* Switching background to Vector Mesh Grid...`);
                updateAnimMode('mesh');
                break;
            case 'static':
                printOutput(`* Background animations disabled (Low Power Mode).`);
                updateAnimMode('static');
                break;
            case 'clear':
            case 'cls':
                if (terminalHistory) terminalHistory.innerHTML = '';
                break;
            default:
                printOutput(`system: command not found: <span class="error">${input}</span>. Type <span class="cmd">help</span> for system details.`, 'error-line');
        }
    };

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = terminalInput.value;
                processCommand(val);
                terminalInput.value = '';
            }
        });
    }

    // Trigger commands from shortcut clicks
    shortcutButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.dataset.cmd;
            processCommand(cmd);
        });
    });

    /* ==========================================================================
       07. CONTACT FORM TRANSMISSION DISPATCH
       ========================================================================== */
    const form = document.getElementById('cyber-message-form');
    const formInputs = form ? form.querySelectorAll('input, textarea') : [];
    const submitBtn = document.getElementById('submit-btn');

    if (form && submitBtn) {
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                if (form.checkValidity()) {
                    submitBtn.removeAttribute('disabled');
                } else {
                    submitBtn.setAttribute('disabled', '');
                }
            });
        });
    }

});