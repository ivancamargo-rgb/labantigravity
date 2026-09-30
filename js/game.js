/**
 * Antigravity 3D Soccer - Match Controller & Main Game Loop
 */

class SoccerGame {
    constructor() {
        this.container = document.getElementById("canvas-container");
        this.radarCanvas = document.getElementById("radar-canvas");
        this.radarCtx = this.radarCanvas ? this.radarCanvas.getContext("2d") : null;

        // Game setup
        this.homeTeamData = TEAMS_DATA.real_madrid;
        this.awayTeamData = TEAMS_DATA.barcelona;
        this.stadiumData = STADIUMS_DATA.bernabeu;

        // Match state
        this.homeScore = 0;
        this.awayScore = 0;
        this.matchTime = 0; // In match minutes
        this.matchDuration = 90;
        this.timeScale = 15; // 90 mins in 6 real minutes
        this.isPaused = false;
        this.isGoalSequence = false;
        this.cameraMode = "tele"; // "tele", "action", "tactical"

        // Three.js instances
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.stadium = null;
        this.ball = null;

        // Players
        this.homePlayers = [];
        this.awayPlayers = [];
        this.userPlayer = null;

        // Input & Controls
        this.keys = {};
        this.shotPower = 0;
        this.isChargingShot = false;
        this.clock = new THREE.Clock();

        this.initThree();
        this.setupEventListeners();
    }

    initThree() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.stadiumData.skyColor);
        this.scene.fog = new THREE.FogExp2(this.stadiumData.skyColor, 0.0035);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.5,
            400
        );
        this.camera.position.set(0, 32, -65);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener("resize", () => this.onWindowResize());
    }

    startMatch(homeKey = "real_madrid", awayKey = "barcelona", stadiumKey = "bernabeu") {
        this.homeTeamData = TEAMS_DATA[homeKey] || TEAMS_DATA.real_madrid;
        this.awayTeamData = TEAMS_DATA[awayKey] || TEAMS_DATA.barcelona;
        this.stadiumData = STADIUMS_DATA[stadiumKey] || STADIUMS_DATA.bernabeu;

        // Clear existing scene
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }

        this.scene.background = new THREE.Color(this.stadiumData.skyColor);

        // Build 3D Stadium
        this.stadium = new StadiumBuilder(this.scene, this.stadiumData);
        this.stadium.build();

        // Build 3D Ball
        this.ball = new SoccerBall(this.scene);

        // Spawn Players
        this.homePlayers = [];
        this.awayPlayers = [];

        this.homeTeamData.players.forEach((pData, idx) => {
            const player = new SoccerPlayer(this.scene, this.homeTeamData, pData, true, idx === 9); // Index 9 is ST (user)
            this.homePlayers.push(player);
        });

        this.awayTeamData.players.forEach(pData => {
            const player = new SoccerPlayer(this.scene, this.awayTeamData, pData, false, false);
            this.awayPlayers.push(player);
        });

        // Set active user player (Striker)
        this.userPlayer = this.homePlayers[9];
        this.userPlayer.setUserControl(true);

        this.homeScore = 0;
        this.awayScore = 0;
        this.matchTime = 0;
        this.isGoalSequence = false;

        this.updateScoreboard();

        if (window.soundEngine) {
            window.soundEngine.init();
            window.soundEngine.playWhistle("short");
        }

        // Start animation loop
        this.clock.start();
        this.animate();
    }

    setupEventListeners() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;

            // Shot charging start
            if ((e.code === "Space" || e.code === "KeyJ") && !this.isChargingShot) {
                this.isChargingShot = true;
                this.shotPower = 0;
            }

            // Short Pass
            if (e.code === "KeyK" || e.code === "KeyX") {
                this.handlePass();
            }

            // Through Pass / Long Ball
            if (e.code === "KeyL" || e.code === "KeyC") {
                this.handleThroughPass();
            }

            // Switch active player
            if (e.code === "KeyQ" || e.code === "KeyE") {
                this.switchUserPlayer();
            }

            // Toggle Camera
            if (e.code === "KeyV") {
                this.cycleCamera();
            }

            // Toggle Audio Mute
            if (e.code === "KeyM") {
                if (window.soundEngine) {
                    const muted = window.soundEngine.toggleMute();
                    const audioBtn = document.getElementById("audio-toggle-btn");
                    if (audioBtn) audioBtn.textContent = muted ? "🔇" : "🔊";
                }
            }
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;

            // Shoot release
            if ((e.code === "Space" || e.code === "KeyJ") && this.isChargingShot) {
                this.handleShoot();
                this.isChargingShot = false;
                this.shotPower = 0;
                this.updatePowerBar(0);
            }
        });
    }

    handleShoot() {
        if (!this.userPlayer) return;
        const ball = this.ball;

        // Check if user is holding ball or nearby
        const dist = this.userPlayer.position.distanceTo(ball.position);
        if (ball.holder === this.userPlayer || dist < 2.0) {
            this.userPlayer.kick();

            // Calculate shot direction toward away goal (Z = 55)
            const targetGoal = new THREE.Vector3(0, 1.2, PITCH_CONFIG.length / 2);
            // Add aiming offset based on user left/right key inputs
            if (this.keys["KeyA"] || this.keys["ArrowLeft"]) targetGoal.x = -PITCH_CONFIG.goalWidth / 2.3;
            else if (this.keys["KeyD"] || this.keys["ArrowRight"]) targetGoal.x = PITCH_CONFIG.goalWidth / 2.3;

            const shotDir = targetGoal.sub(this.userPlayer.position).normalize();
            const power = 14 + (this.shotPower * 18);
            const loft = 0.15 + (this.shotPower * 0.35);

            setTimeout(() => {
                ball.kick(shotDir, power, loft, this.userPlayer);
            }, 100);
        }
    }

    handlePass() {
        if (!this.userPlayer) return;
        const ball = this.ball;
        const dist = this.userPlayer.position.distanceTo(ball.position);

        if (ball.holder === this.userPlayer || dist < 2.0) {
            // Find closest teammate in forward angle
            const bestTarget = this.userPlayer.findBestPassTarget(this.homePlayers, PITCH_CONFIG.length / 2);
            if (bestTarget) {
                this.userPlayer.kick();
                const passDir = bestTarget.position.clone().sub(this.userPlayer.position).normalize();
                setTimeout(() => {
                    ball.kick(passDir, 18, 0.08, this.userPlayer);
                    this.userPlayer = bestTarget;
                    this.homePlayers.forEach(p => p.setUserControl(p === bestTarget));
                }, 80);
            }
        }
    }

    handleThroughPass() {
        if (!this.userPlayer) return;
        const ball = this.ball;
        const dist = this.userPlayer.position.distanceTo(ball.position);

        if (ball.holder === this.userPlayer || dist < 2.0) {
            this.userPlayer.kick();
            const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.userPlayer.mesh.rotation.y);
            const passTarget = this.userPlayer.position.clone().add(forward.multiplyScalar(22));

            // Lead pass into open space
            const passDir = passTarget.sub(this.userPlayer.position).normalize();
            setTimeout(() => {
                ball.kick(passDir, 24, 0.2, this.userPlayer);
                this.autoSelectClosestTeammate(passTarget);
            }, 100);
        }
    }

    switchUserPlayer() {
        // Switch to the outfield player closest to the ball
        let closest = null;
        let minDist = 9999;
        this.homePlayers.forEach(p => {
            if (p.role === "GK") return;
            const d = p.position.distanceTo(this.ball.position);
            if (d < minDist) {
                minDist = d;
                closest = p;
            }
        });

        if (closest && closest !== this.userPlayer) {
            this.userPlayer.setUserControl(false);
            this.userPlayer = closest;
            this.userPlayer.setUserControl(true);
        }
    }

    autoSelectClosestTeammate(targetPos) {
        let closest = null;
        let minDist = 9999;
        this.homePlayers.forEach(p => {
            if (p.role === "GK") return;
            const d = p.position.distanceTo(targetPos);
            if (d < minDist) {
                minDist = d;
                closest = p;
            }
        });
        if (closest) {
            this.userPlayer.setUserControl(false);
            this.userPlayer = closest;
            this.userPlayer.setUserControl(true);
        }
    }

    cycleCamera() {
        const modes = ["tele", "action", "tactical"];
        const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
        this.cameraMode = modes[nextIdx];

        const camBadge = document.getElementById("cam-badge");
        if (camBadge) {
            camBadge.textContent = `CAM: ${this.cameraMode.toUpperCase()}`;
        }
    }

    updateUserInput(dt) {
        if (!this.userPlayer || this.isGoalSequence) return;

        // Charge shot power gauge
        if (this.isChargingShot) {
            this.shotPower = Math.min(1.0, this.shotPower + (dt * 1.5));
            this.updatePowerBar(this.shotPower);
        }

        // Movement Direction
        const moveDir = new THREE.Vector3(0, 0, 0);
        if (this.keys["KeyW"] || this.keys["ArrowUp"]) moveDir.z += 1;
        if (this.keys["KeyS"] || this.keys["ArrowDown"]) moveDir.z -= 1;
        if (this.keys["KeyA"] || this.keys["ArrowLeft"]) moveDir.x -= 1;
        if (this.keys["KeyD"] || this.keys["ArrowRight"]) moveDir.x += 1;

        const isSprinting = this.keys["ShiftLeft"] || this.keys["ShiftRight"];
        this.userPlayer.isSprinting = isSprinting;

        if (moveDir.lengthSq() > 0) {
            moveDir.normalize();
            this.userPlayer.isMoving = true;
            const currentSpeed = this.userPlayer.speed * (isSprinting ? 1.4 : 1.0);
            this.userPlayer.position.addScaledVector(moveDir, currentSpeed * dt);

            // Rotate towards movement direction
            const targetAngle = Math.atan2(moveDir.x, moveDir.z);
            this.userPlayer.mesh.rotation.y = THREE.MathUtils.lerp(
                this.userPlayer.mesh.rotation.y,
                targetAngle,
                0.22
            );
        } else {
            this.userPlayer.isMoving = false;
        }
    }

    updateCamera(dt) {
        if (!this.ball || !this.userPlayer) return;

        if (this.isGoalSequence) {
            // Cinematic 360-degree celebration orbit around scorer
            const angle = Date.now() * 0.0015;
            const focus = this.ball.position;
            this.camera.position.x = focus.x + Math.sin(angle) * 14;
            this.camera.position.z = focus.z + Math.cos(angle) * 14;
            this.camera.position.y = 7;
            this.camera.lookAt(focus.x, 1.5, focus.z);
            return;
        }

        if (this.cameraMode === "tele") {
            // Classic FIFA Broadcast Tele camera
            const targetX = this.ball.position.x * 0.4;
            const targetZ = this.ball.position.z * 0.75;
            const camPos = new THREE.Vector3(targetX + 46, 32, targetZ);

            this.camera.position.lerp(camPos, 0.06);
            this.camera.lookAt(targetX, 0, targetZ);
        } else if (this.cameraMode === "action") {
            // Over-the-shoulder action camera following user
            const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.userPlayer.mesh.rotation.y);
            const camPos = this.userPlayer.position.clone().sub(forward.multiplyScalar(10));
            camPos.y += 5.5;

            this.camera.position.lerp(camPos, 0.1);
            const lookTarget = this.userPlayer.position.clone().add(forward.multiplyScalar(8));
            lookTarget.y += 1.8;
            this.camera.lookAt(lookTarget);
        } else if (this.cameraMode === "tactical") {
            // Bird's-eye Tactical camera
            this.camera.position.lerp(new THREE.Vector3(0, 68, 0), 0.08);
            this.camera.lookAt(0, 0, 0);
        }
    }

    checkGoalEvent() {
        if (this.isGoalSequence) return;

        const goalResult = this.ball.checkGoal();
        if (goalResult) {
            this.isGoalSequence = true;
            if (goalResult === "home") {
                this.homeScore++;
            } else {
                this.awayScore++;
            }

            this.updateScoreboard();
            this.showGoalBanner(goalResult === "home" ? this.homeTeamData.name : this.awayTeamData.name);

            if (this.stadium) {
                this.stadium.triggerCelebration();
            }
            if (window.soundEngine) {
                window.soundEngine.playGoalCelebration();
            }

            // Reset kickoff after 3.8 seconds
            setTimeout(() => {
                this.resetKickoff(goalResult === "home" ? "away" : "home");
            }, 3800);
        }
    }

    resetKickoff(kickingTeam = "away") {
        this.isGoalSequence = false;
        this.hideGoalBanner();

        // Reset ball to center circle
        this.ball.reset(new THREE.Vector3(0, this.ball.radius, 0));

        // Reset players to base formation
        this.homePlayers.forEach(p => {
            p.position.set(p.basePos.x, 0, p.basePos.y);
            p.mesh.rotation.y = 0;
        });
        this.awayPlayers.forEach(p => {
            p.position.set(p.basePos.x, 0, p.basePos.y);
            p.mesh.rotation.y = Math.PI;
        });

        // Give ball to kicking striker
        const kicker = kickingTeam === "home" ? this.homePlayers[9] : this.awayPlayers[9];
        this.ball.holder = kicker;

        if (window.soundEngine) {
            window.soundEngine.playWhistle("short");
        }
    }

    updateMatchTime(dt) {
        if (this.isPaused || this.isGoalSequence) return;

        this.matchTime += (dt * this.timeScale) / 60;
        const displayMin = Math.min(90, Math.floor(this.matchTime));
        const timerElem = document.getElementById("match-timer");
        if (timerElem) {
            timerElem.textContent = `${displayMin}:00`;
        }

        if (this.matchTime >= 90) {
            this.matchTime = 90;
            this.isPaused = true;
            if (window.soundEngine) window.soundEngine.playWhistle("double");
            alert(`¡FINAL DEL PARTIDO!\n${this.homeTeamData.name} ${this.homeScore} - ${this.awayScore} ${this.awayTeamData.name}`);
        }
    }

    updateRadar() {
        if (!this.radarCtx) return;
        const ctx = this.radarCtx;
        const rW = this.radarCanvas.width;
        const rH = this.radarCanvas.height;

        ctx.clearRect(0, 0, rW, rH);

        // Pitch outline
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(4, 4, rW - 8, rH - 8);

        // Halfway line
        ctx.beginPath();
        ctx.moveTo(rW / 2, 4);
        ctx.lineTo(rW / 2, rH - 4);
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(rW / 2, rH / 2, 12, 0, Math.PI * 2);
        ctx.stroke();

        const mapX = (pz) => ((pz + (PITCH_CONFIG.length / 2)) / PITCH_CONFIG.length) * (rW - 8) + 4;
        const mapY = (px) => ((px + (PITCH_CONFIG.width / 2)) / PITCH_CONFIG.width) * (rH - 8) + 4;

        // Draw Home Players
        ctx.fillStyle = this.homeTeamData.color;
        this.homePlayers.forEach(p => {
            const rx = mapX(p.position.z);
            const ry = mapY(p.position.x);
            ctx.beginPath();
            ctx.arc(rx, ry, p === this.userPlayer ? 4.5 : 2.8, 0, Math.PI * 2);
            ctx.fill();

            if (p === this.userPlayer) {
                ctx.strokeStyle = "#00ffcc";
                ctx.lineWidth = 1.8;
                ctx.stroke();
            }
        });

        // Draw Away Players
        ctx.fillStyle = this.awayTeamData.color;
        this.awayPlayers.forEach(p => {
            const rx = mapX(p.position.z);
            const ry = mapY(p.position.x);
            ctx.beginPath();
            ctx.arc(rx, ry, 2.8, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Ball
        if (this.ball) {
            const bx = mapX(this.ball.position.z);
            const by = mapY(this.ball.position.x);
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ff0000";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    updateScoreboard() {
        const homeScoreElem = document.getElementById("home-score");
        const awayScoreElem = document.getElementById("away-score");
        const homeNameElem = document.getElementById("home-name");
        const awayNameElem = document.getElementById("away-name");

        if (homeScoreElem) homeScoreElem.textContent = this.homeScore;
        if (awayScoreElem) awayScoreElem.textContent = this.awayScore;
        if (homeNameElem) homeNameElem.textContent = this.homeTeamData.shortName;
        if (awayNameElem) awayNameElem.textContent = this.awayTeamData.shortName;

        // Update player info badge
        if (this.userPlayer) {
            const pBadge = document.getElementById("player-name-badge");
            if (pBadge) pBadge.textContent = `${this.userPlayer.data.num}. ${this.userPlayer.data.name} (${this.userPlayer.role})`;
        }
    }

    updatePowerBar(percent) {
        const bar = document.getElementById("power-bar-fill");
        if (bar) {
            bar.style.width = `${percent * 100}%`;
        }
    }

    showGoalBanner(teamName) {
        const banner = document.getElementById("goal-banner");
        const teamText = document.getElementById("goal-team-name");
        if (banner) {
            if (teamText) teamText.textContent = teamName;
            banner.classList.add("active");
        }
    }

    hideGoalBanner() {
        const banner = document.getElementById("goal-banner");
        if (banner) banner.classList.remove("active");
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = Math.min(this.clock.getDelta(), 0.1);

        // Update Match logic
        this.updateUserInput(dt);
        this.updateMatchTime(dt);

        if (this.ball) {
            this.ball.update(dt);
            this.checkGoalEvent();
        }

        // Update all players
        this.homePlayers.forEach(p => p.update(dt, this.ball, this.homePlayers, this.awayPlayers));
        this.awayPlayers.forEach(p => p.update(dt, this.ball, this.awayPlayers, this.homePlayers));

        // Update stadium effects (ad boards, confetti)
        if (this.stadium) {
            this.stadium.update(dt);
        }

        // Dynamic crowd excitement audio
        if (window.soundEngine && this.ball) {
            const distToGoal = Math.min(
                this.ball.position.distanceTo(new THREE.Vector3(0, 0, PITCH_CONFIG.length / 2)),
                this.ball.position.distanceTo(new THREE.Vector3(0, 0, -PITCH_CONFIG.length / 2))
            );
            const tension = Math.max(0, 1.0 - (distToGoal / 35));
            window.soundEngine.setCrowdTension(tension);
        }

        this.updateCamera(dt);
        this.updateRadar();

        this.renderer.render(this.scene, this.camera);
    }
}

window.SoccerGame = SoccerGame;
