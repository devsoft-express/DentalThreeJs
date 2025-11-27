import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2c3e50);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

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

// Materials
const teethMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 100,
    specular: 0x222222
});

const gumMaterial = new THREE.MeshPhongMaterial({
    color: 0xff9999,
    shininess: 30
});

const tongueMaterial = new THREE.MeshPhongMaterial({
    color: 0xff6666,
    shininess: 20
});

// Create a single tooth
function createTooth(type = 'molar') {
    const toothGroup = new THREE.Group();

    // Main tooth body (crown)
    let crownGeometry;
    if (type === 'incisor') {
        crownGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.6);
    } else if (type === 'canine') {
        crownGeometry = new THREE.ConeGeometry(0.4, 1.5, 8);
    } else { // molar
        crownGeometry = new THREE.BoxGeometry(1, 1, 0.8);
    }

    const crown = new THREE.Mesh(crownGeometry, teethMaterial.clone());
    crown.castShadow = true;
    crown.receiveShadow = true;
    toothGroup.add(crown);

    // Tooth root
    const rootGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.8, 8);
    const root = new THREE.Mesh(rootGeometry, teethMaterial.clone());
    root.position.y = -0.9;
    root.material.color.setHex(0xf5f5dc);
    toothGroup.add(root);

    toothGroup.userData.isSelectable = true;
    return toothGroup;
}

// Create upper teeth (16 teeth)
function createUpperTeeth() {
    const positions = [
        // Front incisors (4)
        { x: -1.2, z: 4, type: 'incisor', rot: 0 },
        { x: -0.4, z: 4, type: 'incisor', rot: 0 },
        { x: 0.4, z: 4, type: 'incisor', rot: 0 },
        { x: 1.2, z: 4, type: 'incisor', rot: 0 },
        // Canines (2)
        { x: -2.2, z: 3.5, type: 'canine', rot: -0.3 },
        { x: 2.2, z: 3.5, type: 'canine', rot: 0.3 },
        // Premolars (4)
        { x: -3.2, z: 2.5, type: 'molar', rot: -0.4 },
        { x: -4, z: 1.5, type: 'molar', rot: -0.5 },
        { x: 3.2, z: 2.5, type: 'molar', rot: 0.4 },
        { x: 4, z: 1.5, type: 'molar', rot: 0.5 },
        // Molars (6)
        { x: -4.5, z: 0.5, type: 'molar', rot: -0.6 },
        { x: -4.8, z: -0.5, type: 'molar', rot: -0.7 },
        { x: -5, z: -1.5, type: 'molar', rot: -0.8 },
        { x: 4.5, z: 0.5, type: 'molar', rot: 0.6 },
        { x: 4.8, z: -0.5, type: 'molar', rot: 0.7 },
        { x: 5, z: -1.5, type: 'molar', rot: 0.8 }
    ];

    positions.forEach((pos, index) => {
        const tooth = createTooth(pos.type);
        tooth.position.set(pos.x, 2, pos.z);
        tooth.rotation.y = pos.rot;
        tooth.userData.index = index;
        tooth.userData.jaw = 'upper';
        upperTeeth.push(tooth);
        upperJaw.add(tooth);
    });
}

// Create lower teeth (16 teeth)
function createLowerTeeth() {
    const positions = [
        // Front incisors (4)
        { x: -1, z: 3.8, type: 'incisor', rot: 0 },
        { x: -0.3, z: 3.8, type: 'incisor', rot: 0 },
        { x: 0.3, z: 3.8, type: 'incisor', rot: 0 },
        { x: 1, z: 3.8, type: 'incisor', rot: 0 },
        // Canines (2)
        { x: -2, z: 3.3, type: 'canine', rot: -0.3 },
        { x: 2, z: 3.3, type: 'canine', rot: 0.3 },
        // Premolars (4)
        { x: -3, z: 2.3, type: 'molar', rot: -0.4 },
        { x: -3.8, z: 1.3, type: 'molar', rot: -0.5 },
        { x: 3, z: 2.3, type: 'molar', rot: 0.4 },
        { x: 3.8, z: 1.3, type: 'molar', rot: 0.5 },
        // Molars (6)
        { x: -4.3, z: 0.3, type: 'molar', rot: -0.6 },
        { x: -4.6, z: -0.7, type: 'molar', rot: -0.7 },
        { x: -4.8, z: -1.7, type: 'molar', rot: -0.8 },
        { x: 4.3, z: 0.3, type: 'molar', rot: 0.6 },
        { x: 4.6, z: -0.7, type: 'molar', rot: 0.7 },
        { x: 4.8, z: -1.7, type: 'molar', rot: 0.8 }
    ];

    positions.forEach((pos, index) => {
        const tooth = createTooth(pos.type);
        tooth.position.set(pos.x, -2, pos.z);
        tooth.rotation.y = pos.rot;
        tooth.userData.index = index;
        tooth.userData.jaw = 'lower';
        lowerTeeth.push(tooth);
        lowerJaw.add(tooth);
    });
}

// Create gums
function createGums() {
    // Upper gum
    const upperGumShape = new THREE.Shape();
    upperGumShape.moveTo(-6, 4);
    upperGumShape.quadraticCurveTo(-5.5, 4.5, -5, 4);
    upperGumShape.quadraticCurveTo(-2, 5, 0, 5);
    upperGumShape.quadraticCurveTo(2, 5, 5, 4);
    upperGumShape.quadraticCurveTo(5.5, 4.5, 6, 4);
    upperGumShape.quadraticCurveTo(6, -2, 5, -2);
    upperGumShape.quadraticCurveTo(2, -1, 0, -1);
    upperGumShape.quadraticCurveTo(-2, -1, -5, -2);
    upperGumShape.quadraticCurveTo(-6, -2, -6, 4);

    const upperGumGeometry = new THREE.ExtrudeGeometry(upperGumShape, {
        depth: 2,
        bevelEnabled: true,
        bevelThickness: 0.3,
        bevelSize: 0.3,
        bevelSegments: 3
    });

    const upperGum = new THREE.Mesh(upperGumGeometry, gumMaterial);
    upperGum.position.set(0, 1.5, -1);
    upperGum.receiveShadow = true;
    upperJaw.add(upperGum);

    // Lower gum
    const lowerGumGeometry = upperGumGeometry.clone();
    const lowerGum = new THREE.Mesh(lowerGumGeometry, gumMaterial);
    lowerGum.position.set(0, -1.5, -1);
    lowerGum.receiveShadow = true;
    lowerJaw.add(lowerGum);
}

// Create tongue
function createTongue() {
    const tongueGeometry = new THREE.SphereGeometry(3, 32, 32);
    tongueGeometry.scale(1, 0.4, 1.2);

    const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
    tongue.position.set(0, -2, -0.5);
    tongue.castShadow = true;
    tongue.receiveShadow = true;
    lowerJaw.add(tongue);

    // Add tongue bumps for realism
    const bumpGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    for (let i = 0; i < 20; i++) {
        const bump = new THREE.Mesh(bumpGeometry, tongueMaterial);
        bump.position.set(
            (Math.random() - 0.5) * 4,
            -1.7 + Math.random() * 0.3,
            (Math.random() - 0.5) * 3
        );
        lowerJaw.add(bump);
    }
}

// Lighting
function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 10, 5);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.camera.left = -10;
    directionalLight1.shadow.camera.right = 10;
    directionalLight1.shadow.camera.top = 10;
    directionalLight1.shadow.camera.bottom = -10;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);
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
                child.material.emissive.setHex(0x000000);
            }
        });
    }

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const tooth = clickedObject.parent;

        if (tooth.userData.isSelectable) {
            selectedTooth = tooth;
            // Highlight the tooth
            tooth.children.forEach(child => {
                if (child instanceof THREE.Mesh) {
                    child.material.emissive.setHex(0x00ff00);
                }
            });

            console.log(`Dente selezionato: ${tooth.userData.jaw} jaw, index ${tooth.userData.index}`);
        }
    }
}

// Mouth animation
let mouthOpen = false;
let mouthOpenAmount = 0;
const maxMouthOpen = Math.PI / 6; // 30 degrees

function openMouth() {
    mouthOpen = true;
}

function closeMouth() {
    mouthOpen = false;
}

function animateMouth() {
    const speed = 0.05;

    if (mouthOpen && mouthOpenAmount < maxMouthOpen) {
        mouthOpenAmount += speed;
        if (mouthOpenAmount > maxMouthOpen) mouthOpenAmount = maxMouthOpen;
    } else if (!mouthOpen && mouthOpenAmount > 0) {
        mouthOpenAmount -= speed;
        if (mouthOpenAmount < 0) mouthOpenAmount = 0;
    }

    // Rotate lower jaw around hinge point
    lowerJaw.rotation.x = -mouthOpenAmount;
    lowerJaw.position.y = -Math.sin(mouthOpenAmount) * 2;
}

// Reset view
function resetView() {
    camera.position.set(0, 0, 15);
    controls.reset();
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
setupLighting();

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    animateMouth();
    controls.update();

    renderer.render(scene, camera);
}

animate();

console.log('Bocca 3D caricata! Clicca sui denti per selezionarli.');
