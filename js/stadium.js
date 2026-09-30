/**
 * Antigravity 3D Soccer - 3D Stadium & Pitch Generator
 * Builds high-fidelity soccer pitch, goals, stands, floodlights and atmosphere.
 */

class StadiumBuilder {
    constructor(scene, stadiumConfig) {
        this.scene = scene;
        this.config = stadiumConfig || STADIUMS_DATA.bernabeu;
        this.pitchConfig = PITCH_CONFIG;
        this.stadiumGroup = new THREE.Group();
        this.adMeshes = [];
        this.floodlights = [];
        this.confettiParticles = null;
    }

    build() {
        this.createPitch();
        this.createGoals();
        this.createAdBoards();
        this.createGrandstands();
        this.createCornerFlags();
        this.createFloodlights();
        this.createAtmosphere();
        this.createConfettiSystem();

        this.scene.add(this.stadiumGroup);
        return this.stadiumGroup;
    }

    createPitch() {
        const { length, width } = this.pitchConfig;

        // Generate procedural high-res grass and field lines canvas
        const canvas = document.createElement("canvas");
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d");

        // Base green turf
        ctx.fillStyle = "#1e792c";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Striped grass mowing patterns
        const stripes = 14;
        const stripeWidth = canvas.width / stripes;
        for (let i = 0; i < stripes; i++) {
            ctx.fillStyle = i % 2 === 0 ? "#228b32" : "#1a6f27";
            ctx.fillRect(i * stripeWidth, 0, stripeWidth, canvas.height);
        }

        // Field Regulation Markings
        const marginX = 60;
        const marginY = 40;
        const pW = canvas.width - (marginX * 2);
        const pH = canvas.height - (marginY * 2);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 8;
        ctx.strokeRect(marginX, marginY, pW, pH);

        // Halfway line
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, marginY);
        ctx.lineTo(canvas.width / 2, canvas.height - marginY);
        ctx.stroke();

        // Center circle & spot
        const cRadius = (this.pitchConfig.centerCircleRadius / this.pitchConfig.length) * pW;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, cRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 7, 0, Math.PI * 2);
        ctx.fill();

        // Penalty Boxes
        const boxLengthPx = (this.pitchConfig.penaltyDepth / this.pitchConfig.length) * pW;
        const boxWidthPx = (this.pitchConfig.penaltyWidth / this.pitchConfig.width) * pH;
        const smallBoxLengthPx = (this.pitchConfig.smallBoxDepth / this.pitchConfig.length) * pW;
        const smallBoxWidthPx = (this.pitchConfig.smallBoxWidth / this.pitchConfig.width) * pH;

        // Left Penalty Box
        ctx.strokeRect(marginX, (canvas.height - boxWidthPx) / 2, boxLengthPx, boxWidthPx);
        ctx.strokeRect(marginX, (canvas.height - smallBoxWidthPx) / 2, smallBoxLengthPx, smallBoxWidthPx);
        // Left Penalty spot
        const penSpotDistPx = (this.pitchConfig.penaltySpotDist / this.pitchConfig.length) * pW;
        ctx.beginPath();
        ctx.arc(marginX + penSpotDistPx, canvas.height / 2, 6, 0, Math.PI * 2);
        ctx.fill();

        // Right Penalty Box
        ctx.strokeRect(canvas.width - marginX - boxLengthPx, (canvas.height - boxWidthPx) / 2, boxLengthPx, boxWidthPx);
        ctx.strokeRect(canvas.width - marginX - smallBoxLengthPx, (canvas.height - smallBoxWidthPx) / 2, smallBoxLengthPx, smallBoxWidthPx);
        // Right Penalty spot
        ctx.beginPath();
        ctx.arc(canvas.width - marginX - penSpotDistPx, canvas.height / 2, 6, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        const pitchGeo = new THREE.PlaneGeometry(width, length);
        const pitchMat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.85,
            metalness: 0.1
        });

        const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
        pitchMesh.rotation.x = -Math.PI / 2;
        pitchMesh.rotation.z = Math.PI / 2;
        pitchMesh.receiveShadow = true;
        this.stadiumGroup.add(pitchMesh);

        // Pitch apron (grass perimeter run-off area)
        const apronGeo = new THREE.PlaneGeometry(width + 24, length + 24);
        const apronMat = new THREE.MeshStandardMaterial({
            color: 0x165b21,
            roughness: 0.95
        });
        const apronMesh = new THREE.Mesh(apronGeo, apronMat);
        apronMesh.rotation.x = -Math.PI / 2;
        apronMesh.position.y = -0.05;
        apronMesh.receiveShadow = true;
        this.stadiumGroup.add(apronMesh);
    }

    createGoals() {
        const { goalWidth, goalHeight, goalDepth, length } = this.pitchConfig;
        const postRadius = 0.18;
        const postMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.4
        });

        const netMat = new THREE.MeshBasicMaterial({
            color: 0xe0e0e0,
            wireframe: true,
            transparent: true,
            opacity: 0.45
        });

        [-1, 1].forEach(dir => {
            const zPos = (length / 2) * dir;
            const goalGroup = new THREE.Group();
            goalGroup.position.set(0, 0, zPos);

            // Left & Right upright posts
            const postGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 16);
            const leftPost = new THREE.Mesh(postGeo, postMat);
            leftPost.position.set(-goalWidth / 2, goalHeight / 2, 0);
            leftPost.castShadow = true;

            const rightPost = new THREE.Mesh(postGeo, postMat);
            rightPost.position.set(goalWidth / 2, goalHeight / 2, 0);
            rightPost.castShadow = true;

            // Crossbar
            const barGeo = new THREE.CylinderGeometry(postRadius, postRadius, goalWidth + (postRadius * 2), 16);
            const crossbar = new THREE.Mesh(barGeo, postMat);
            crossbar.rotation.z = Math.PI / 2;
            crossbar.position.set(0, goalHeight, 0);
            crossbar.castShadow = true;

            // Goal Net Backing
            const netBackGeo = new THREE.BoxGeometry(goalWidth, goalHeight, goalDepth);
            const netBack = new THREE.Mesh(netBackGeo, netMat);
            netBack.position.set(0, goalHeight / 2, (goalDepth / 2) * dir);

            goalGroup.add(leftPost);
            goalGroup.add(rightPost);
            goalGroup.add(crossbar);
            goalGroup.add(netBack);

            this.stadiumGroup.add(goalGroup);
        });
    }

    createAdBoards() {
        const { length, width } = this.pitchConfig;
        const adHeight = 1.4;

        // Dynamic LED banner texture
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, "#001f3f");
        gradient.addColorStop(0.25, "#0074d9");
        gradient.addColorStop(0.5, "#111111");
        gradient.addColorStop(0.75, "#ff4136");
        gradient.addColorStop(1, "#001f3f");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ANTIGRAVITY FC  ★  FIFA 3D  ★  VIRTUAL LEAGUE  ★  GOOGLE AI", canvas.width / 2, 42);

        const adTexture = new THREE.CanvasTexture(canvas);
        adTexture.wrapS = THREE.RepeatWrapping;
        adTexture.repeat.set(4, 1);

        const adMat = new THREE.MeshBasicMaterial({ map: adTexture });

        // Sideline Ad boards (East & West)
        const sideGeo = new THREE.BoxGeometry(0.4, adHeight, length + 8);
        const eastAd = new THREE.Mesh(sideGeo, adMat);
        eastAd.position.set((width / 2) + 3.5, adHeight / 2, 0);
        const westAd = new THREE.Mesh(sideGeo, adMat);
        westAd.position.set(-(width / 2) - 3.5, adHeight / 2, 0);

        // Behind Goals Ad boards (North & South)
        const endGeo = new THREE.BoxGeometry(width + 4, adHeight, 0.4);
        const northAd = new THREE.Mesh(endGeo, adMat);
        northAd.position.set(0, adHeight / 2, (length / 2) + 6);
        const southAd = new THREE.Mesh(endGeo, adMat);
        southAd.position.set(0, adHeight / 2, -(length / 2) - 6);

        this.stadiumGroup.add(eastAd, westAd, northAd, southAd);
        this.adTexture = adTexture;
    }

    createGrandstands() {
        const { length, width } = this.pitchConfig;
        const standColor = parseInt(this.config.standColor.replace("#", "0x"));
        const chairColor = parseInt(this.config.chairColor.replace("#", "0x"));

        const standMat = new THREE.MeshStandardMaterial({
            color: standColor,
            roughness: 0.9
        });

        // Crowd texture generator
        const crowdCanvas = document.createElement("canvas");
        crowdCanvas.width = 512;
        crowdCanvas.height = 256;
        const cCtx = crowdCanvas.getContext("2d");
        const crowdPalette = ["#ff3b30", "#007aff", "#ffffff", "#ffcc00", "#111111", "#4cd964", "#5856d6"];
        for (let y = 0; y < crowdCanvas.height; y += 4) {
            for (let x = 0; x < crowdCanvas.width; x += 4) {
                cCtx.fillStyle = crowdPalette[Math.floor(Math.random() * crowdPalette.length)];
                cCtx.fillRect(x, y, 4, 4);
            }
        }
        const crowdTexture = new THREE.CanvasTexture(crowdCanvas);
        crowdTexture.wrapS = THREE.RepeatWrapping;
        crowdTexture.wrapT = THREE.RepeatWrapping;
        crowdTexture.repeat.set(10, 4);

        const crowdMat = new THREE.MeshBasicMaterial({
            map: crowdTexture
        });

        // Create tiered stands on 4 sides
        const createStandTier = (w, d, h, x, y, z, rotY) => {
            const group = new THREE.Group();
            group.position.set(x, y, z);
            group.rotation.y = rotY;

            // Slanted seating slope
            const steps = 12;
            for (let i = 0; i < steps; i++) {
                const stepH = (h / steps);
                const stepD = (d / steps);
                const stepGeo = new THREE.BoxGeometry(w, stepH * (i + 1), stepD);
                const stepMesh = new THREE.Mesh(stepGeo, i % 2 === 0 ? crowdMat : standMat);
                stepMesh.position.set(0, (stepH * (i + 1)) / 2, i * stepD);
                stepMesh.castShadow = true;
                stepMesh.receiveShadow = true;
                group.add(stepMesh);
            }

            // Upper tier canopy roof
            const roofGeo = new THREE.BoxGeometry(w, 1.5, d * 1.2);
            const roofMat = new THREE.MeshStandardMaterial({
                color: parseInt(this.config.roofColor.replace("#", "0x")),
                metalness: 0.6,
                roughness: 0.3
            });
            const roof = new THREE.Mesh(roofGeo, roofMat);
            roof.position.set(0, h * 1.6, (d * 1.2) / 2);
            group.add(roof);

            this.stadiumGroup.add(group);
        };

        const standDepth = 30;
        const standHeight = 22;

        // Long sides (East & West)
        createStandTier(length + 10, standDepth, standHeight, (width / 2) + 18, 0, 0, -Math.PI / 2);
        createStandTier(length + 10, standDepth, standHeight, -(width / 2) - 18, 0, 0, Math.PI / 2);

        // Short sides behind goals (North & South)
        createStandTier(width + 36, standDepth, standHeight, 0, 0, (length / 2) + 20, Math.PI);
        createStandTier(width + 36, standDepth, standHeight, 0, 0, -(length / 2) - 20, 0);
    }

    createCornerFlags() {
        const { length, width } = this.pitchConfig;
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const flagMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, side: THREE.DoubleSide });

        const corners = [
            [-width / 2, -length / 2],
            [width / 2, -length / 2],
            [-width / 2, length / 2],
            [width / 2, length / 2]
        ];

        corners.forEach(([cx, cz]) => {
            const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.set(cx, 1, cz);

            const flagGeo = new THREE.PlaneGeometry(0.8, 0.5);
            const flag = new THREE.Mesh(flagGeo, flagMat);
            flag.position.set(0.4, 0.6, 0);
            pole.add(flag);

            this.stadiumGroup.add(pole);
        });
    }

    createFloodlights() {
        const { length, width } = this.pitchConfig;
        const towerHeight = 38;
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });

        const towerCoords = [
            [-width - 10, -length - 5],
            [width + 10, -length - 5],
            [-width - 10, length + 5],
            [width + 10, length + 5]
        ];

        towerCoords.forEach(([tx, tz]) => {
            const towerGeo = new THREE.CylinderGeometry(0.8, 1.8, towerHeight, 8);
            const tower = new THREE.Mesh(towerGeo, towerMat);
            tower.position.set(tx, towerHeight / 2, tz);
            this.stadiumGroup.add(tower);

            // Light head fixture
            const headGeo = new THREE.BoxGeometry(6, 4, 2);
            const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const head = new THREE.Mesh(headGeo, headMat);
            head.position.set(tx, towerHeight, tz);
            head.lookAt(0, 5, 0);
            this.stadiumGroup.add(head);

            // High-power stadium spotlight
            const spotLight = new THREE.SpotLight(0xfff8ee, 1.6);
            spotLight.position.set(tx, towerHeight, tz);
            spotLight.target.position.set(0, 0, 0);
            spotLight.angle = Math.PI / 4;
            spotLight.penumbra = 0.5;
            spotLight.distance = 200;
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;

            this.stadiumGroup.add(spotLight);
            this.stadiumGroup.add(spotLight.target);
            this.floodlights.push(spotLight);
        });
    }

    createAtmosphere() {
        // Ambient soft lighting
        const ambientLight = new THREE.AmbientLight(this.config.ambient, 0.95);
        this.stadiumGroup.add(ambientLight);

        // Directional overhead main sunlight
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.7);
        mainLight.position.set(30, 60, 40);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 10;
        mainLight.shadow.camera.far = 150;
        const d = 60;
        mainLight.shadow.camera.left = -d;
        mainLight.shadow.camera.right = d;
        mainLight.shadow.camera.top = d;
        mainLight.shadow.camera.bottom = -d;

        this.stadiumGroup.add(mainLight);
    }

    createConfettiSystem() {
        const count = 600;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        const palette = [
            [1, 0.8, 0], [1, 0.2, 0.2], [0.2, 0.5, 1], [0.1, 0.9, 0.3], [1, 1, 1]
        ];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = -50; // Hidden below ground initially
            positions[i * 3 + 2] = (Math.random() - 0.5) * 90;

            const c = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = c[0];
            colors[i * 3 + 1] = c[1];
            colors[i * 3 + 2] = c[2];

            velocities[i * 3] = (Math.random() - 0.5) * 0.4;
            velocities[i * 3 + 1] = 0.5 + Math.random() * 0.8;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.9
        });

        this.confettiParticles = new THREE.Points(geometry, material);
        this.confettiVelocities = velocities;
        this.confettiActive = false;
        this.stadiumGroup.add(this.confettiParticles);
    }

    triggerCelebration() {
        this.confettiActive = true;
        const posAttr = this.confettiParticles.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            posAttr.setY(i, 2 + Math.random() * 15);
            posAttr.setX(i, (Math.random() - 0.5) * 40);
            posAttr.setZ(i, (Math.random() - 0.5) * 60);
        }
        posAttr.needsUpdate = true;
    }

    update(dt) {
        // Animate LED Ad banners scrolling
        if (this.adTexture) {
            this.adTexture.offset.x += 0.08 * dt;
        }

        // Animate Confetti falling
        if (this.confettiActive && this.confettiParticles) {
            const posAttr = this.confettiParticles.geometry.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                let y = posAttr.getY(i) - (4.5 * dt);
                let x = posAttr.getX(i) + (this.confettiVelocities[i * 3] * dt * 8);
                let z = posAttr.getZ(i) + (this.confettiVelocities[i * 3 + 2] * dt * 8);
                if (y < 0) y = 25; // Reset to top
                posAttr.setY(i, y);
                posAttr.setX(i, x);
                posAttr.setZ(i, z);
            }
            posAttr.needsUpdate = true;
        }
    }
}
