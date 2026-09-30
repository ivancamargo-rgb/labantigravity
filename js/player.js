/**
 * Antigravity 3D Soccer - 3D Player Models, Animations & AI Engine
 */

class SoccerPlayer {
    constructor(scene, team, playerData, isHome, isUser = false) {
        this.scene = scene;
        this.team = team;
        this.data = playerData;
        this.isHome = isHome;
        this.isUser = isUser;
        this.role = playerData.role;

        // Attributes
        this.speed = (playerData.speed || 1.1) * 11.5;
        this.power = (playerData.power || 1.1) * 22;
        this.stamina = 100;
        this.basePos = new THREE.Vector2(playerData.pos[0], playerData.pos[1]);
        if (!isHome) {
            // Away team mirrors pitch positions
            this.basePos.x = -this.basePos.x;
            this.basePos.y = -this.basePos.y;
        }

        this.position = new THREE.Vector3(this.basePos.x, 0, this.basePos.y);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.targetPos = new THREE.Vector3().copy(this.position);

        this.isMoving = false;
        this.isSprinting = false;
        this.isKicking = false;
        this.isDiving = false;
        this.kickAnimTimer = 0;
        this.diveAnimTimer = 0;
        this.diveDir = 0;
        this.animCycle = Math.random() * Math.PI * 2;

        this.mesh = this.createPlayerMesh();
        this.scene.add(this.mesh);

        // Active Player Arrow / Ring Marker
        this.marker = this.createMarker();
        this.scene.add(this.marker);
        this.marker.visible = this.isUser;
    }

    createPlayerMesh() {
        const group = new THREE.Group();
        const isGK = this.role === "GK";

        const jerseyColor = parseInt((isGK ? this.team.gkColor : this.team.color).replace("#", "0x"));
        const shortsColor = parseInt(this.team.shortsColor.replace("#", "0x"));
        const socksColor = parseInt(this.team.socksColor.replace("#", "0x"));

        const skinColors = [0xd6a374, 0xb07d56, 0x8a5538, 0xe8be99];
        const skinColor = skinColors[(this.data.num + (this.isHome ? 1 : 2)) % skinColors.length];

        const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
        const jerseyMat = new THREE.MeshStandardMaterial({ color: jerseyColor, roughness: 0.6 });
        const shortsMat = new THREE.MeshStandardMaterial({ color: shortsColor, roughness: 0.7 });
        const socksMat = new THREE.MeshStandardMaterial({ color: socksColor, roughness: 0.7 });
        const bootMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });

        // 1. Torso & Jersey
        const torsoGeo = new THREE.BoxGeometry(0.85, 1.05, 0.45);
        this.torso = new THREE.Mesh(torsoGeo, jerseyMat);
        this.torso.position.y = 1.7;
        this.torso.castShadow = true;
        group.add(this.torso);

        // 2. Head & Hair
        const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 0.8;
        this.torso.add(head);

        const hairGeo = new THREE.SphereGeometry(0.29, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x221711, roughness: 0.9 });
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 0.05;
        head.add(hair);

        // 3. Pelvis & Shorts
        const hipsGeo = new THREE.BoxGeometry(0.8, 0.4, 0.42);
        this.hips = new THREE.Mesh(hipsGeo, shortsMat);
        this.hips.position.y = 1.05;
        group.add(this.hips);

        // 4. Limbs: Left & Right Legs
        this.leftLeg = new THREE.Group();
        this.rightLeg = new THREE.Group();
        this.leftLeg.position.set(-0.25, 0.95, 0);
        this.rightLeg.position.set(0.25, 0.95, 0);

        const legGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.85, 12);
        const lLegMesh = new THREE.Mesh(legGeo, socksMat);
        const rLegMesh = new THREE.Mesh(legGeo, socksMat);
        lLegMesh.position.y = -0.42;
        rLegMesh.position.y = -0.42;
        lLegMesh.castShadow = true;
        rLegMesh.castShadow = true;
        this.leftLeg.add(lLegMesh);
        this.rightLeg.add(rLegMesh);

        // Boots
        const bootGeo = new THREE.BoxGeometry(0.2, 0.15, 0.42);
        const lBoot = new THREE.Mesh(bootGeo, bootMat);
        const rBoot = new THREE.Mesh(bootGeo, bootMat);
        lBoot.position.set(0, -0.85, 0.1);
        rBoot.position.set(0, -0.85, 0.1);
        this.leftLeg.add(lBoot);
        this.rightLeg.add(rBoot);

        group.add(this.leftLeg);
        group.add(this.rightLeg);

        // 5. Arms
        this.leftArm = new THREE.Group();
        this.rightArm = new THREE.Group();
        this.leftArm.position.set(-0.52, 0.4, 0);
        this.rightArm.position.set(0.52, 0.4, 0);

        const armGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.75, 12);
        const lArmMesh = new THREE.Mesh(armGeo, skinMat);
        const rArmMesh = new THREE.Mesh(armGeo, skinMat);
        lArmMesh.position.y = -0.32;
        rArmMesh.position.y = -0.32;
        lArmMesh.castShadow = true;
        rArmMesh.castShadow = true;

        this.leftArm.add(lArmMesh);
        this.rightArm.add(rArmMesh);
        this.torso.add(this.leftArm);
        this.torso.add(this.rightArm);

        // Set initial orientation
        const targetRot = this.isHome ? 0 : Math.PI;
        group.rotation.y = targetRot;
        group.position.copy(this.position);

        return group;
    }

    createMarker() {
        const group = new THREE.Group();

        // 3D Neon Ring on ground
        const ringGeo = new THREE.RingGeometry(0.9, 1.15, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00ffcc,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.04;
        group.add(ring);

        // Floating 3D triangle arrow above player
        const arrowGeo = new THREE.ConeGeometry(0.35, 0.65, 4);
        const arrowMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.rotation.x = Math.PI;
        arrow.position.y = 3.2;
        group.add(arrow);

        return group;
    }

    setUserControl(isUser) {
        this.isUser = isUser;
        if (this.marker) {
            this.marker.visible = isUser;
        }
    }

    kick() {
        this.isKicking = true;
        this.kickAnimTimer = 0.28;
    }

    dive(dir) {
        if (this.isDiving) return;
        this.isDiving = true;
        this.diveDir = dir; // -1: left, 1: right
        this.diveAnimTimer = 0.65;
    }

    update(dt, ball, teammates, opponents) {
        // Handle kicking animation
        if (this.isKicking) {
            this.kickAnimTimer -= dt;
            const progress = (0.28 - this.kickAnimTimer) / 0.28;
            if (progress < 0.4) {
                this.rightLeg.rotation.x = -Math.PI / 2.5; // Wind up
            } else {
                this.rightLeg.rotation.x = Math.PI / 2.2; // Snap forward
            }
            if (this.kickAnimTimer <= 0) {
                this.isKicking = false;
                this.rightLeg.rotation.x = 0;
            }
        }

        // Handle goalkeeper dive animation
        if (this.isDiving) {
            this.diveAnimTimer -= dt;
            this.mesh.position.y = 0.7;
            this.mesh.rotation.z = this.diveDir * (Math.PI / 2.5);
            this.position.x += this.diveDir * 18 * dt;
            if (this.diveAnimTimer <= 0) {
                this.isDiving = false;
                this.mesh.rotation.z = 0;
                this.mesh.position.y = 0;
            }
        }

        // User controlled player vs AI Player
        if (!this.isUser) {
            this.updateAI(dt, ball, teammates, opponents);
        }

        // Running procedural limb animation
        if (this.isMoving && !this.isKicking && !this.isDiving) {
            this.animCycle += dt * (this.isSprinting ? 18 : 12);
            const legAngle = Math.sin(this.animCycle) * 0.75;
            const armAngle = -legAngle * 0.7;

            this.leftLeg.rotation.x = legAngle;
            this.rightLeg.rotation.x = -legAngle;
            this.leftArm.rotation.x = armAngle;
            this.rightArm.rotation.x = -armAngle;

            // Subtle body bounce
            this.mesh.position.y = Math.abs(Math.sin(this.animCycle * 2)) * 0.12;
        } else if (!this.isKicking && !this.isDiving) {
            // Idle stance
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            this.leftArm.rotation.x = 0;
            this.rightArm.rotation.x = 0;
            this.mesh.position.y = 0;
        }

        // Keep player inside pitch
        const halfW = (PITCH_CONFIG.width / 2) + 1.0;
        const halfL = (PITCH_CONFIG.length / 2) + 1.0;
        this.position.x = Math.max(-halfW, Math.min(halfW, this.position.x));
        this.position.z = Math.max(-halfL, Math.min(halfL, this.position.z));

        this.mesh.position.set(this.position.x, this.mesh.position.y, this.position.z);

        // Update active marker position
        if (this.marker && this.marker.visible) {
            this.marker.position.set(this.position.x, 0, this.position.z);
            this.marker.rotation.y += 2.0 * dt;
        }

        // Dribble capture check
        const distToBall = this.position.distanceTo(ball.position);
        if (!ball.holder && distToBall < 1.4 && ball.position.y < 1.2) {
            ball.holder = this;
        }
    }

    updateAI(dt, ball, teammates, opponents) {
        const targetGoalZ = this.isHome ? (PITCH_CONFIG.length / 2) : -(PITCH_CONFIG.length / 2);
        const ownGoalZ = -targetGoalZ;
        const distToBall = this.position.distanceTo(ball.position);

        if (this.role === "GK") {
            // Goalkeeper AI
            const goalX = Math.max(-PITCH_CONFIG.goalWidth / 2.3, Math.min(PITCH_CONFIG.goalWidth / 2.3, ball.position.x * 0.65));
            const goalZ = ownGoalZ + (this.isHome ? 2.5 : -2.5);

            this.targetPos.set(goalX, 0, goalZ);

            // Dive if shot is heading towards own goal
            const ballSpeed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.z ** 2);
            const isHeadingToOwnGoal = (this.isHome && ball.velocity.z < -8) || (!this.isHome && ball.velocity.z > 8);
            if (ballSpeed > 10 && isHeadingToOwnGoal && Math.abs(ball.position.z - ownGoalZ) < 22 && !this.isDiving) {
                const diveSide = ball.position.x > this.position.x ? 1 : -1;
                this.dive(diveSide);
            }
        } else {
            // Outfield Player AI
            const teamHasBall = ball.holder && ball.holder.isHome === this.isHome;
            const hasBall = ball.holder === this;

            if (hasBall) {
                // In possession: dribble towards goal, shoot if in range, or pass
                const dirToGoal = new THREE.Vector3(0, 0, targetGoalZ).sub(this.position);
                const distToGoal = dirToGoal.length();

                this.targetPos.set(
                    (Math.random() - 0.5) * 8,
                    0,
                    this.position.z + (this.isHome ? 22 : -22)
                );

                // Shoot when inside shooting zone (< 28m)
                if (distToGoal < 28) {
                    this.kick();
                    const shotDir = new THREE.Vector3((Math.random() - 0.5) * 6, 0, targetGoalZ).sub(this.position).normalize();
                    setTimeout(() => {
                        ball.kick(shotDir, this.power * (0.85 + Math.random() * 0.3), 0.25, this);
                    }, 120);
                } else if (Math.random() < 0.015) {
                    // Occasional smart forward pass to teammate
                    const bestTeammate = this.findBestPassTarget(teammates, targetGoalZ);
                    if (bestTeammate) {
                        this.kick();
                        const passDir = bestTeammate.position.clone().sub(this.position).normalize();
                        setTimeout(() => {
                            ball.kick(passDir, 16, 0.1, this);
                        }, 120);
                    }
                }
            } else if (teamHasBall) {
                // Team is attacking: make forward runs and support
                const forwardShift = (ball.position.z - this.basePos.y) * 0.45;
                this.targetPos.set(
                    this.basePos.x + ((ball.position.x - this.basePos.x) * 0.25),
                    0,
                    this.basePos.y + forwardShift
                );
            } else {
                // Defending: mark opponent or press ball if closest
                const isClosest = teammates.every(t => t === this || t.role === "GK" || t.position.distanceTo(ball.position) >= distToBall);

                if (isClosest && distToBall < 26) {
                    // Press the ball directly!
                    this.targetPos.copy(ball.position);
                } else {
                    // Hold defensive shape
                    const retreatShift = (ball.position.z - this.basePos.y) * 0.5;
                    this.targetPos.set(this.basePos.x, 0, this.basePos.y + retreatShift);
                }
            }
        }

        // Steer towards target position
        const moveVec = this.targetPos.clone().sub(this.position);
        moveVec.y = 0;
        const dist = moveVec.length();

        if (dist > 0.4) {
            this.isMoving = true;
            moveVec.normalize();
            this.position.addScaledVector(moveVec, this.speed * dt);

            // Rotate towards direction of movement
            const angle = Math.atan2(moveVec.x, moveVec.z);
            this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, angle, 0.18);
        } else {
            this.isMoving = false;
        }
    }

    findBestPassTarget(teammates, targetGoalZ) {
        let best = null;
        let bestScore = -9999;

        teammates.forEach(t => {
            if (t === this || t.role === "GK") return;
            const dist = this.position.distanceTo(t.position);
            if (dist < 4 || dist > 35) return;

            // Higher score if closer to opponent's goal
            const advanceScore = this.isHome ? (t.position.z - this.position.z) : (this.position.z - t.position.z);
            if (advanceScore > bestScore) {
                bestScore = advanceScore;
                best = t;
            }
        });
        return best;
    }
}
