/**
 * Antigravity 3D Soccer - 3D Ball Physics & Trajectory Engine
 */

class SoccerBall {
    constructor(scene) {
        this.scene = scene;
        this.radius = 0.44;
        this.position = new THREE.Vector3(0, this.radius, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.angularVelocity = new THREE.Vector3(0, 0, 0);
        this.holder = null; // Player currently dribbling/holding ball
        this.lastKickedBy = null;

        this.pitchConfig = PITCH_CONFIG;
        this.gravity = -24.0;
        this.restitution = 0.68;
        this.friction = 0.986;
        this.airResistance = 0.997;

        this.mesh = this.createMesh();
        this.scene.add(this.mesh);

        // Ground shadow blob
        const shadowGeo = new THREE.CircleGeometry(this.radius * 1.3, 16);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.45
        });
        this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        this.shadowMesh.rotation.x = -Math.PI / 2;
        this.shadowMesh.position.y = 0.02;
        this.scene.add(this.shadowMesh);
    }

    createMesh() {
        const geo = new THREE.SphereGeometry(this.radius, 24, 24);

        // Procedural classic soccer ball texture
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#111111";
        // Draw pentagons
        const pentagons = [
            [64, 64], [192, 64], [320, 64], [448, 64],
            [128, 192], [256, 192], [384, 192]
        ];

        pentagons.forEach(([px, py]) => {
            ctx.beginPath();
            const r = 24;
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
                const x = px + r * Math.cos(angle);
                const y = py + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        });

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.35,
            metalness: 0.1
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.position.copy(this.position);
        return mesh;
    }

    reset(pos = new THREE.Vector3(0, this.radius, 0)) {
        this.position.copy(pos);
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        this.holder = null;
        this.mesh.position.copy(this.position);
        this.shadowMesh.position.set(this.position.x, 0.02, this.position.z);
    }

    kick(dir, power, loft = 0.2, kicker = null) {
        this.holder = null;
        this.lastKickedBy = kicker;

        const normDir = dir.clone().normalize();
        this.velocity.x = normDir.x * power;
        this.velocity.z = normDir.z * power;
        this.velocity.y = Math.max(0.5, loft * power * 0.7);

        // Spin
        this.angularVelocity.set(
            (Math.random() - 0.5) * power * 2,
            (Math.random() - 0.5) * power * 2,
            (Math.random() - 0.5) * power * 2
        );

        if (window.soundEngine) {
            window.soundEngine.playKick(Math.min(1.5, power / 25));
        }
    }

    update(dt) {
        if (this.holder) {
            // When dribbled, stick in front of player
            const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.holder.mesh.rotation.y);
            const targetPos = this.holder.position.clone().add(forward.multiplyScalar(0.95));
            targetPos.y = this.radius;

            this.position.lerp(targetPos, 0.35);
            this.velocity.set(0, 0, 0);

            // Ball roll with player movement
            if (this.holder.isMoving) {
                this.mesh.rotation.x += 0.25;
            }
        } else {
            // Apply gravity
            this.velocity.y += this.gravity * dt;

            // Apply air resistance
            this.velocity.x *= this.airResistance;
            this.velocity.z *= this.airResistance;

            // Integrate position
            this.position.addScaledVector(this.velocity, dt);

            // Ground collision & bouncing
            if (this.position.y <= this.radius) {
                this.position.y = this.radius;
                if (Math.abs(this.velocity.y) > 0.8) {
                    this.velocity.y = -this.velocity.y * this.restitution;
                    this.velocity.x *= this.friction;
                    this.velocity.z *= this.friction;
                } else {
                    this.velocity.y = 0;
                    this.velocity.x *= this.friction;
                    this.velocity.z *= this.friction;
                }
            }

            // Ball roll rotation
            const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
            if (speed > 0.05 && this.position.y <= this.radius + 0.05) {
                const rotAxis = new THREE.Vector3(-this.velocity.z, 0, this.velocity.x).normalize();
                this.mesh.rotateOnWorldAxis(rotAxis, (speed / this.radius) * dt);
            }

            // Pitch boundary limits (bounces back if hits stadium wall / edge)
            const boundX = (this.pitchConfig.width / 2) + 2.5;
            const boundZ = (this.pitchConfig.length / 2) + 4.5;
            if (Math.abs(this.position.x) > boundX) {
                this.position.x = Math.sign(this.position.x) * boundX;
                this.velocity.x = -this.velocity.x * 0.5;
            }
            if (Math.abs(this.position.z) > boundZ) {
                this.position.z = Math.sign(this.position.z) * boundZ;
                this.velocity.z = -this.velocity.z * 0.5;
            }

            // Goalposts and Crossbar collision check
            this.checkGoalCollisions();
        }

        this.mesh.position.copy(this.position);

        // Update ground shadow
        this.shadowMesh.position.set(this.position.x, 0.02, this.position.z);
        const heightScale = Math.max(0.3, 1.0 - (this.position.y / 15));
        this.shadowMesh.scale.set(heightScale, heightScale, 1);
        this.shadowMesh.material.opacity = Math.max(0.1, 0.5 * heightScale);
    }

    checkGoalCollisions() {
        const { goalWidth, goalHeight, length } = this.pitchConfig;
        const halfGoal = goalWidth / 2;

        [-1, 1].forEach(dir => {
            const goalZ = (length / 2) * dir;
            // Near goal line
            if (Math.abs(this.position.z - goalZ) < 0.6) {
                // Left post
                const dLeft = this.position.distanceTo(new THREE.Vector3(-halfGoal, this.position.y, goalZ));
                // Right post
                const dRight = this.position.distanceTo(new THREE.Vector3(halfGoal, this.position.y, goalZ));

                if (dLeft < this.radius + 0.22 || dRight < this.radius + 0.22) {
                    this.velocity.z = -this.velocity.z * 0.8;
                    this.velocity.x = (Math.random() - 0.5) * 12;
                    if (window.soundEngine) window.soundEngine.playPostHit();
                }

                // Crossbar
                if (Math.abs(this.position.x) < halfGoal && Math.abs(this.position.y - goalHeight) < this.radius + 0.22) {
                    this.velocity.y = -Math.abs(this.velocity.y) * 0.7;
                    this.velocity.z = -this.velocity.z * 0.75;
                    if (window.soundEngine) window.soundEngine.playPostHit();
                }
            }
        });
    }

    // Check if goal scored: crosses goal line within posts and under crossbar
    checkGoal() {
        const { goalWidth, goalHeight, length } = this.pitchConfig;
        const halfLen = length / 2;
        const halfGoal = goalWidth / 2;

        if (Math.abs(this.position.x) < halfGoal && this.position.y < goalHeight) {
            if (this.position.z > halfLen + 0.3) {
                return "home"; // Scored in Away goal (Home team gets point)
            } else if (this.position.z < -halfLen - 0.3) {
                return "away"; // Scored in Home goal (Away team gets point)
            }
        }
        return null;
    }
}
