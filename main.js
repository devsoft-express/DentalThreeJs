import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.Fog(0x1a1a2e, 20, 50);

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 2, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 10;
controls.maxDistance = 40;

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Mouth group
const mouthGroup = new THREE.Group();
scene.add(mouthGroup);

// Upper and lower jaw groups
const upperJaw = new THREE.Group();
const lowerJaw = new THREE.Group();
mouthGroup.add(upperJaw);
mouthGroup.add(lowerJaw);

// Arrays to store teeth
const upperTeeth = [];
const lowerTeeth = [];
let selectedTooth = null;

// Improved Materials
const teethMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff8f0,
    roughness: 0.3,
    metalness: 0.1,
    envMapIntensity: 0.5
});

const gumMaterial = new THREE.MeshStandardMaterial({
    color: 0xffb3ba,
    roughness: 0.7,
    metalness: 0.0,
    envMapIntensity: 0.3
});

const tongueMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6b7a,
    roughness: 0.8,
    metalness: 0.0,
    envMapIntensity: 0.2
});

const innerMouthMaterial = new THREE.MeshStandardMaterial({
    color: 0xff9ba3,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
});

// Create realistic tooth with proper shape
function createTooth(type = 'molar', scale = 1) {
    const toothGroup = new THREE.Group();

    let crownGeometry;

    if (type === 'incisor') {
        // Incisor - flat and blade-like
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0.4, 0.1);
        shape.quadraticCurveTo(0.45, 0.6, 0.4, 1.1);
        shape.quadraticCurveTo(0.3, 1.4, 0, 1.5);
        shape.quadraticCurveTo(-0.3, 1.4, -0.4, 1.1);
        shape.quadraticCurveTo(-0.45, 0.6, -0.4, 0.1);
        shape.lineTo(0, 0);

        const extrudeSettings = {
            steps: 1,
            depth: 0.6,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.08,
            bevelSegments: 5
        };

        crownGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        crownGeometry.translate(0, 0, -0.3);

    } else if (type === 'canine') {
        // Canine - pointed
        const points = [];
        for (let i = 0; i < 10; i++) {
            const t = i / 9;
            const radius = 0.35 * Math.sin(t * Math.PI);
            points.push(new THREE.Vector2(radius, t * 1.8));
        }
        crownGeometry = new THREE.LatheGeometry(points, 12);

    } else if (type === 'premolar') {
        // Premolar - medium with two cusps
        const shape = new THREE.Shape();
        shape.moveTo(-0.4, 0);
        shape.quadraticCurveTo(-0.5, 0.3, -0.4, 0.6);
        shape.lineTo(-0.2, 1.1);
        shape.quadraticCurveTo(0, 1.2, 0.2, 1.1);
        shape.lineTo(0.4, 0.6);
        shape.quadraticCurveTo(0.5, 0.3, 0.4, 0);
        shape.quadraticCurveTo(0, -0.1, -0.4, 0);

        const extrudeSettings = {
            steps: 2,
            depth: 0.7,
            bevelEnabled: true,
            bevelThickness: 0.12,
            bevelSize: 0.1,
            bevelSegments: 5
        };

        crownGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        crownGeometry.translate(0, 0, -0.35);

    } else { // molar
        // Molar - large with multiple cusps
        const shape = new THREE.Shape();
        shape.moveTo(-0.5, 0);
        shape.quadraticCurveTo(-0.55, 0.2, -0.5, 0.4);
        shape.lineTo(-0.3, 0.9);
        shape.lineTo(-0.1, 1.0);
        shape.lineTo(0.1, 1.0);
        shape.lineTo(0.3, 0.9);
        shape.lineTo(0.5, 0.4);
        shape.quadraticCurveTo(0.55, 0.2, 0.5, 0);
        shape.quadraticCurveTo(0, -0.1, -0.5, 0);

        const extrudeSettings = {
            steps: 2,
            depth: 0.9,
            bevelEnabled: true,
            bevelThickness: 0.15,
            bevelSize: 0.12,
            bevelSegments: 5
        };

        crownGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        crownGeometry.translate(0, 0, -0.45);
    }

    // Apply scale
    crownGeometry.scale(scale, scale, scale);

    const crown = new THREE.Mesh(crownGeometry, teethMaterial.clone());
    crown.castShadow = true;
    crown.receiveShadow = true;
    toothGroup.add(crown);

    // Tooth root (hidden in gum)
    const rootPoints = [];
    rootPoints.push(new THREE.Vector2(0.25 * scale, 0));
    rootPoints.push(new THREE.Vector2(0.28 * scale, -0.3 * scale));
    rootPoints.push(new THREE.Vector2(0.22 * scale, -0.7 * scale));
    rootPoints.push(new THREE.Vector2(0.15 * scale, -1.2 * scale));
    rootPoints.push(new THREE.Vector2(0, -1.5 * scale));

    const rootGeometry = new THREE.LatheGeometry(rootPoints, 8);
    const rootMaterial = teethMaterial.clone();
    rootMaterial.color.setHex(0xf5f0e8);
    const root = new THREE.Mesh(rootGeometry, rootMaterial);
    root.position.y = -0.1;
    toothGroup.add(root);

    toothGroup.userData.isSelectable = true;
    return toothGroup;
}

// Create upper teeth with proper dental arch
function createUpperTeeth() {
    const teethConfig = [
        // Central incisors
        { angle: -0.15, radius: 5.5, type: 'incisor', scale: 1.1, tilt: 0.1 },
        { angle: 0.15, radius: 5.5, type: 'incisor', scale: 1.1, tilt: -0.1 },
        // Lateral incisors
        { angle: -0.35, radius: 5.3, type: 'incisor', scale: 0.95, tilt: 0.15 },
        { angle: 0.35, radius: 5.3, type: 'incisor', scale: 0.95, tilt: -0.15 },
        // Canines
        { angle: -0.6, radius: 5.0, type: 'canine', scale: 1.0, tilt: 0.2 },
        { angle: 0.6, radius: 5.0, type: 'canine', scale: 1.0, tilt: -0.2 },
        // First premolars
        { angle: -0.85, radius: 4.7, type: 'premolar', scale: 0.95, tilt: 0.25 },
        { angle: 0.85, radius: 4.7, type: 'premolar', scale: 0.95, tilt: -0.25 },
        // Second premolars
        { angle: -1.1, radius: 4.4, type: 'premolar', scale: 1.0, tilt: 0.3 },
        { angle: 1.1, radius: 4.4, type: 'premolar', scale: 1.0, tilt: -0.3 },
        // First molars
        { angle: -1.4, radius: 4.0, type: 'molar', scale: 1.1, tilt: 0.35 },
        { angle: 1.4, radius: 4.0, type: 'molar', scale: 1.1, tilt: -0.35 },
        // Second molars
        { angle: -1.7, radius: 3.5, type: 'molar', scale: 1.05, tilt: 0.4 },
        { angle: 1.7, radius: 3.5, type: 'molar', scale: 1.05, tilt: -0.4 },
        // Third molars (wisdom teeth)
        { angle: -2.0, radius: 3.0, type: 'molar', scale: 0.9, tilt: 0.45 },
        { angle: 2.0, radius: 3.0, type: 'molar', scale: 0.9, tilt: -0.45 }
    ];

    teethConfig.forEach((config, index) => {
        const tooth = createTooth(config.type, config.scale);
        const x = Math.sin(config.angle) * config.radius;
        const z = Math.cos(config.angle) * config.radius;

        tooth.position.set(x, 1.5, z);
        tooth.rotation.y = -config.angle;
        tooth.rotation.z = config.tilt;
        tooth.userData.index = index;
        tooth.userData.jaw = 'upper';

        upperTeeth.push(tooth);
        upperJaw.add(tooth);
    });
}

// Create lower teeth with proper dental arch
function createLowerTeeth() {
    const teethConfig = [
        // Central incisors (smaller)
        { angle: -0.12, radius: 4.8, type: 'incisor', scale: 0.85, tilt: -0.08 },
        { angle: 0.12, radius: 4.8, type: 'incisor', scale: 0.85, tilt: 0.08 },
        // Lateral incisors
        { angle: -0.3, radius: 4.7, type: 'incisor', scale: 0.9, tilt: -0.12 },
        { angle: 0.3, radius: 4.7, type: 'incisor', scale: 0.9, tilt: 0.12 },
        // Canines
        { angle: -0.55, radius: 4.5, type: 'canine', scale: 0.95, tilt: -0.18 },
        { angle: 0.55, radius: 4.5, type: 'canine', scale: 0.95, tilt: 0.18 },
        // First premolars
        { angle: -0.8, radius: 4.2, type: 'premolar', scale: 0.9, tilt: -0.22 },
        { angle: 0.8, radius: 4.2, type: 'premolar', scale: 0.9, tilt: 0.22 },
        // Second premolars
        { angle: -1.05, radius: 3.9, type: 'premolar', scale: 0.95, tilt: -0.27 },
        { angle: 1.05, radius: 3.9, type: 'premolar', scale: 0.95, tilt: 0.27 },
        // First molars
        { angle: -1.35, radius: 3.5, type: 'molar', scale: 1.0, tilt: -0.32 },
        { angle: 1.35, radius: 3.5, type: 'molar', scale: 1.0, tilt: 0.32 },
        // Second molars
        { angle: -1.65, radius: 3.0, type: 'molar', scale: 0.95, tilt: -0.37 },
        { angle: 1.65, radius: 3.0, type: 'molar', scale: 0.95, tilt: 0.37 },
        // Third molars
        { angle: -1.95, radius: 2.5, type: 'molar', scale: 0.85, tilt: -0.42 },
        { angle: 1.95, radius: 2.5, type: 'molar', scale: 0.85, tilt: 0.42 }
    ];

    teethConfig.forEach((config, index) => {
        const tooth = createTooth(config.type, config.scale);
        const x = Math.sin(config.angle) * config.radius;
        const z = Math.cos(config.angle) * config.radius;

        tooth.position.set(x, -1.5, z);
        tooth.rotation.y = -config.angle;
        tooth.rotation.z = config.tilt;
        tooth.userData.index = index;
        tooth.userData.jaw = 'lower';

        lowerTeeth.push(tooth);
        lowerJaw.add(tooth);
    });
}

// Create realistic gums using curved geometry
function createGums() {
    // Upper gum
    const upperGumCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.5, 2.5, 2),
        new THREE.Vector3(-5.0, 2.3, 0),
        new THREE.Vector3(-4.5, 2.2, -3),
        new THREE.Vector3(0, 2.4, -4),
        new THREE.Vector3(4.5, 2.2, -3),
        new THREE.Vector3(5.0, 2.3, 0),
        new THREE.Vector3(3.5, 2.5, 2),
        new THREE.Vector3(0, 2.6, 3.5),
        new THREE.Vector3(-3.5, 2.5, 2)
    ], true);

    const upperGumShape = new THREE.Shape();
    upperGumShape.moveTo(0, 0);
    upperGumShape.lineTo(1.5, 0);
    upperGumShape.quadraticCurveTo(1.6, 0.8, 1.4, 1.5);
    upperGumShape.lineTo(0.5, 2.2);
    upperGumShape.quadraticCurveTo(0, 2.3, -0.5, 2.2);
    upperGumShape.lineTo(-1.4, 1.5);
    upperGumShape.quadraticCurveTo(-1.6, 0.8, -1.5, 0);
    upperGumShape.lineTo(0, 0);

    const upperGumGeometry = new THREE.ExtrudeGeometry(upperGumShape, {
        steps: 80,
        bevelEnabled: false,
        extrudePath: upperGumCurve
    });

    const upperGum = new THREE.Mesh(upperGumGeometry, gumMaterial);
    upperGum.castShadow = true;
    upperGum.receiveShadow = true;
    upperJaw.add(upperGum);

    // Lower gum
    const lowerGumCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.0, -2.3, 1.5),
        new THREE.Vector3(-4.5, -2.1, -0.5),
        new THREE.Vector3(-4.0, -2.0, -2.5),
        new THREE.Vector3(0, -2.2, -3.5),
        new THREE.Vector3(4.0, -2.0, -2.5),
        new THREE.Vector3(4.5, -2.1, -0.5),
        new THREE.Vector3(3.0, -2.3, 1.5),
        new THREE.Vector3(0, -2.4, 3),
        new THREE.Vector3(-3.0, -2.3, 1.5)
    ], true);

    const lowerGumGeometry = new THREE.ExtrudeGeometry(upperGumShape, {
        steps: 80,
        bevelEnabled: false,
        extrudePath: lowerGumCurve
    });

    const lowerGum = new THREE.Mesh(lowerGumGeometry, gumMaterial);
    lowerGum.castShadow = true;
    lowerGum.receiveShadow = true;
    lowerJaw.add(lowerGum);
}

// Create realistic tongue
function createTongue() {
    // Main tongue body
    const tongueShape = new THREE.Shape();
    tongueShape.moveTo(0, 0);
    tongueShape.bezierCurveTo(1.5, 0.5, 2.5, 1.5, 2.8, 3);
    tongueShape.bezierCurveTo(2.5, 4, 1.5, 4.5, 0, 4.8);
    tongueShape.bezierCurveTo(-1.5, 4.5, -2.5, 4, -2.8, 3);
    tongueShape.bezierCurveTo(-2.5, 1.5, -1.5, 0.5, 0, 0);

    const tongueGeometry = new THREE.ExtrudeGeometry(tongueShape, {
        depth: 1.2,
        bevelEnabled: true,
        bevelThickness: 0.4,
        bevelSize: 0.3,
        bevelSegments: 10
    });

    tongueGeometry.rotateX(Math.PI / 2);
    tongueGeometry.translate(0, -3.5, 0);

    const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
    tongue.castShadow = true;
    tongue.receiveShadow = true;
    lowerJaw.add(tongue);

    // Add tongue papillae (taste buds texture)
    const papillaeGeometry = new THREE.SphereGeometry(0.08, 6, 6);
    for (let i = 0; i < 100; i++) {
        const papilla = new THREE.Mesh(papillaeGeometry, tongueMaterial.clone());
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 2;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance + 1;

        papilla.position.set(x, -3.0 + Math.random() * 0.2, z);
        papilla.scale.set(0.8 + Math.random() * 0.4, 1, 0.8 + Math.random() * 0.4);
        lowerJaw.add(papilla);
    }
}

// Create inner mouth cavity (palate and throat)
function createInnerMouth() {
    // Hard palate (roof of mouth)
    const palateShape = new THREE.Shape();
    palateShape.moveTo(-4, 3);
    palateShape.quadraticCurveTo(-5, 1, -4.5, -1);
    palateShape.quadraticCurveTo(-3, -2.5, 0, -3);
    palateShape.quadraticCurveTo(3, -2.5, 4.5, -1);
    palateShape.quadraticCurveTo(5, 1, 4, 3);
    palateShape.quadraticCurveTo(2, 3.5, 0, 3.5);
    palateShape.quadraticCurveTo(-2, 3.5, -4, 3);

    const palateGeometry = new THREE.ExtrudeGeometry(palateShape, {
        depth: 0.3,
        bevelEnabled: true,
        bevelThickness: 0.2,
        bevelSize: 0.1,
        bevelSegments: 5
    });

    palateGeometry.rotateX(-Math.PI / 2);
    const palate = new THREE.Mesh(palateGeometry, innerMouthMaterial);
    palate.position.y = 3.5;
    palate.position.z = 0;
    palate.receiveShadow = true;
    upperJaw.add(palate);

    // Soft palate / uvula area
    const uvulaGeometry = new THREE.ConeGeometry(0.4, 1.5, 8);
    const uvula = new THREE.Mesh(uvulaGeometry, innerMouthMaterial);
    uvula.position.set(0, 2.5, -3);
    uvula.rotation.x = Math.PI;
    upperJaw.add(uvula);

    // Inner cheeks
    const createCheek = (side) => {
        const cheekCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(side * 4, 2, 3),
            new THREE.Vector3(side * 6, 0, 0),
            new THREE.Vector3(side * 4, -2, -3)
        );

        const cheekShape = new THREE.Shape();
        cheekShape.moveTo(0, 0);
        cheekShape.lineTo(2, 0);
        cheekShape.lineTo(2, 1);
        cheekShape.lineTo(0, 1);

        const cheekGeometry = new THREE.ExtrudeGeometry(cheekShape, {
            steps: 20,
            bevelEnabled: false,
            extrudePath: cheekCurve
        });

        const cheek = new THREE.Mesh(cheekGeometry, innerMouthMaterial);
        cheek.receiveShadow = true;
        mouthGroup.add(cheek);
    };

    createCheek(1);
    createCheek(-1);

    // Back of throat
    const throatGeometry = new THREE.CylinderGeometry(2.5, 2, 3, 16);
    const throat = new THREE.Mesh(throatGeometry, innerMouthMaterial);
    throat.position.set(0, 0.5, -5);
    throat.rotation.x = Math.PI / 6;
    throat.receiveShadow = true;
    mouthGroup.add(throat);
}

// Enhanced lighting setup
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Key light
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    keyLight.position.set(8, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xe6f2ff, 0.6);
    fillLight.position.set(-6, 6, 6);
    scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 4, -10);
    scene.add(rimLight);

    // Internal mouth light (soft pink glow)
    const mouthLight = new THREE.PointLight(0xff9999, 0.5, 15);
    mouthLight.position.set(0, 0, 0);
    mouthGroup.add(mouthLight);

    // Front point lights for highlights
    const frontLight1 = new THREE.PointLight(0xffffff, 0.4, 20);
    frontLight1.position.set(5, 5, 15);
    scene.add(frontLight1);

    const frontLight2 = new THREE.PointLight(0xffffff, 0.4, 20);
    frontLight2.position.set(-5, 5, 15);
    scene.add(frontLight2);
}

// Mouse click handler
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const allTeeth = [...upperTeeth, ...lowerTeeth];
    const intersects = raycaster.intersectObjects(allTeeth, true);

    // Reset previously selected tooth
    if (selectedTooth) {
        selectedTooth.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
                child.material.emissive = new THREE.Color(0x000000);
                child.material.emissiveIntensity = 0;
            }
        });
    }

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const tooth = clickedObject.parent;

        if (tooth.userData.isSelectable) {
            selectedTooth = tooth;
            // Highlight the tooth with green glow
            tooth.children.forEach(child => {
                if (child instanceof THREE.Mesh) {
                    child.material.emissive = new THREE.Color(0x00ff00);
                    child.material.emissiveIntensity = 0.5;
                }
            });

            console.log(`Dente selezionato: ${tooth.userData.jaw} jaw, index ${tooth.userData.index}`);
        }
    }
}

// Mouth animation with realistic jaw movement
let mouthOpen = false;
let mouthOpenAmount = 0;
const maxMouthOpen = Math.PI / 4; // 45 degrees

function openMouth() {
    mouthOpen = true;
}

function closeMouth() {
    mouthOpen = false;
}

function animateMouth() {
    const speed = 0.03;

    if (mouthOpen && mouthOpenAmount < maxMouthOpen) {
        mouthOpenAmount += speed;
        if (mouthOpenAmount > maxMouthOpen) mouthOpenAmount = maxMouthOpen;
    } else if (!mouthOpen && mouthOpenAmount > 0) {
        mouthOpenAmount -= speed;
        if (mouthOpenAmount < 0) mouthOpenAmount = 0;
    }

    // Rotate lower jaw around hinge point with proper pivot
    lowerJaw.rotation.x = -mouthOpenAmount;
    // Move jaw down and back for realistic movement
    lowerJaw.position.y = -Math.sin(mouthOpenAmount) * 3;
    lowerJaw.position.z = -Math.cos(mouthOpenAmount) * 1.5 + 1.5;
}

// Reset view
function resetView() {
    camera.position.set(0, 2, 25);
    controls.target.set(0, 0, 0);
    controls.update();
    mouthGroup.rotation.set(0, 0, 0);
}

// Event listeners
window.addEventListener('click', onMouseClick);
document.getElementById('openMouth').addEventListener('click', openMouth);
document.getElementById('closeMouth').addEventListener('click', closeMouth);
document.getElementById('resetView').addEventListener('click', resetView);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize scene
createUpperTeeth();
createLowerTeeth();
createGums();
createTongue();
createInnerMouth();
setupLighting();

// Subtle idle animation
let time = 0;
function idleAnimation() {
    time += 0.01;
    // Subtle breathing-like movement
    mouthGroup.position.y = Math.sin(time) * 0.1;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    animateMouth();
    idleAnimation();
    controls.update();

    renderer.render(scene, camera);
}

animate();

console.log('🦷 Bocca 3D migliorata caricata! Clicca sui denti per selezionarli.');
