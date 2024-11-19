import * as THREE from "three";
//import { OrbitControls } from "three/addons/controls/OrbitControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Stats from "three/addons/libs/stats.module.js";

// Create a stats object
const stats = new Stats();
stats.showPanel(0); // 0: FPS, 1: ms, 2: memory usage, etc.
stats.dom.style.position = 'absolute';
stats.dom.style.top = '10px';
stats.dom.style.left = '10px';

document.body.appendChild(stats.dom);

// Initialize GLTFLoader
const loader = new GLTFLoader();

// Declare drone variable globally
let drone;
let montain;
// Control state
const dronecontrols = {
    pitch: 0,
    yaw: 0,
    rollY: 0,
    rollX: 0,
    lift: 0
};

const speedMultiplier = 120;
const rotSpeedMultiplier = 170;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight,
    0.01, 
    10000
);

camera.position.set(0, 3, 3);
camera.lookAt(0, 0, 0);

//handeling resize
window.addEventListener('resize', () => {
    // Update the camera
    camera.aspect =  window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});

// Fetch the canvas element created in index.html, replace 'canvas' with the id of your canvas
const canvas = document.getElementById('canvas');

// Create a WebGLRenderer and set its width and height
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // Antialiasing is used to smooth the edges of what is rendered
    antialias: true,
    // Activate the support of transparency
    alpha: true
});

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap


// Load the drone model
loader.load(
    'models/drone.glb',
    (gltf) => {
        drone = gltf.scene; // Assign drone here to the globally declared variable

        // Traverse through the children and replace their material with MeshBasicMaterial
        drone.traverse((child) => {
            if (child.isMesh) {
                const originalMaterial = child.material;

                // Create a new MeshBasicMaterial that retains the original color or map (texture)
                child.material = new THREE.MeshBasicMaterial({
                    color: originalMaterial.color,
                    map: originalMaterial.map,
                    transparent: originalMaterial.transparent,
                    opacity: originalMaterial.opacity
                });
            }
        });

        drone.position.set(63, -12.5, 36);
        drone.scale.set(0.05, 0.05, 0.05);
        drone.rotation.set(0, Math.PI, 0);

        // Add the drone to the scene
        scene.add(drone);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the drone model:', error);
    }
);
//Load the cave model
// Load the cave model
loader.load(
    'models/montain.glb',
    (gltf) => {
        montain = gltf.scene;
        montain.position.set(0, -80, 0); 
        montain.scale.set(0.01,0.01,0.01); 
        scene.add(montain);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the cave model:', error);
    }
);


// Event listeners for keyboard
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'z': // Forward pitch
            dronecontrols.pitch = -0.1;
            break;
        case 's': // Backward pitch
            dronecontrols.pitch = 0.1;
            break;
        case 'q': // Left yaw
            dronecontrols.yaw = 0.1;
            break;
        case 'd': // Right yaw
            dronecontrols.yaw = -0.1;
            break;
        case ' ': // Lift up
            dronecontrols.lift = 0.1;
            break;
        case 'Shift': // Lift down
            dronecontrols.lift = -0.1;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'z':
        case 's':
            dronecontrols.pitch = 0;
            break;
        case 'q':
        case 'd':
            dronecontrols.yaw = 0;
            break;
        case ' ':
        case 'Shift':
            dronecontrols.lift = 0;
            break;
    }
});

// Event listener for mouse movement (for rollY control)
window.addEventListener('mousemove', (event) => {
    const rollYSpeedFactor = 0.00002; // Adjust this value to fine-tune rollY sensitivity

    // Calculate the center of the screen
    const screenCenterX = window.innerWidth / 2;

    // Calculate how far the mouse is from the center of the screen on the X axis
    const distanceFromCenterX = event.clientX - screenCenterX;

    // Determine the rollY value based on the distance from the center
    dronecontrols.rollY = distanceFromCenterX * rollYSpeedFactor;

    // Optional: You can also clamp the value to limit max rollY speed
    const maxrollYSpeed = 0.1;
    dronecontrols.rollY = Math.max(Math.min(dronecontrols.rollY, maxrollYSpeed), -maxrollYSpeed);
});

// Event listener for mouse movement (for rollY control)
window.addEventListener('mousemove', (event) => {
    const rollXSpeedFactor = 0.00002; // Adjust this value to fine-tune rollY sensitivity

    // Calculate the center of the screen
    const screenCenterY = window.innerHeight / 2;

    // Calculate how far the mouse is from the center of the screen on the X axis
    const distanceFromCenterY = event.clientY - screenCenterY;

    // Determine the rollY value based on the distance from the center
    dronecontrols.rollX = distanceFromCenterY * rollXSpeedFactor;

    // Optional: You can also clamp the value to limit max rollY speed
    const maxrollXSpeed = 0.1;
    dronecontrols.rollX = Math.max(Math.min(dronecontrols.rollX, maxrollXSpeed), -maxrollXSpeed);
});

// Set to store collided targets
let collidedTargets = new Set();

// List of all target spheres
let targetSpheres = [];

// Track game state
let isGameRunning = false;
let startTime = 0;
let bestTime = NaN;

// Function to start the game
function startGame() {
    // Hide overlays
    document.getElementById('startOverlay').style.display = 'none';
    document.getElementById('deathOverlay').style.display = 'none';
    document.getElementById('completionOverlay').style.display = 'none';

    // Reset game state
    startTime = performance.now();
    collidedTargets.clear();
    isGameRunning = true;
}

// Event listeners for overlay clicks
document.getElementById('startOverlay').addEventListener('click', startGame);
document.getElementById('deathOverlay').addEventListener('click', startGame);
document.getElementById('completionOverlay').addEventListener('click', startGame);



// Define target coordinates
const targetCoordinates = [
    { x: 64.45, y: -15.1, z: 26.24 },
    { x: 65.75, y: -17.01, z: 4.65 },
    { x: 81.83, y: -18.98, z: -26.26 },
    { x: 53.79, y: -15.94, z: -13.38 },
    { x: 23.83, y: -3.35, z: 25.3 },
    { x: 10.21, y: 4.14, z: 29.88 },
    { x: -2.79, y: -0.31, z: 33.47 },
    { x: -17.61, y: -10.76, z: 7.53 },
    { x: -10.51, y: -15.22, z: -18.98 },
    { x: -1.38, y: -17.77, z: -38.71 },
    { x: -7.44, y: -18.53, z: -50.75 },
    { x: -49.14, y: -18.46, z: -52.1 },
    { x: -65.96, y: -14.7, z: -25.38 },
    { x: -76.32, y: -10.9, z: -1.36 },
    { x: -65.34, y: -1.31, z: 36.26 }
];

const totalTargets = targetCoordinates.length;

// Function to create a target sphere with an ID
function createTargetSphere(position, id) {
    const geometry = new THREE.SphereGeometry(1, 16, 16); // Radius of 1 unit
    const material = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(position.x, position.y, position.z);
    sphere.userData.id = id; // Assign an identification ID
    scene.add(sphere);
    targetSpheres.push(sphere); // Add to list of targets
}

// Loop through the coordinates and create target spheres
targetCoordinates.forEach((coord, index) => {
    createTargetSphere(coord, `t${index}`); // Assign unique ID to each target (t0, t1, ...)
});

// Collision detection function
function detectCollisions() {
    targetSpheres.forEach(target => {
        // Calculate the distance between the drone and the target
        const distance = drone.position.distanceTo(target.position);

        // Check if the distance is less than the sum of the radii (both are radius 1 here)
        if (distance < 2) {
            const targetId = target.userData.id;

            // Add the target to the set if it's not already there
            if (!collidedTargets.has(targetId)) {
                collidedTargets.add(targetId);
                console.log(`Collision detected with target: ${targetId}`);
            }
        }
    });

    // Check if all targets have been collected
    if (collidedTargets.size === totalTargets) {
        const finishTime = (performance.now() - startTime) / 1000;
        console.log('All targets collected! You win!');

        // Update the best time if this run is better
        if (isNaN(bestTime) || finishTime < bestTime) {
            bestTime = finishTime;
        }
        // Restart the run
        //startTime = performance.now();
        collidedTargets.clear();
        // Reset drone position and rotation
        drone.position.set(63, -12.5, 36);
        drone.rotation.set(0, Math.PI, 0);

        // Show completion overlay
        const completionOverlay = document.getElementById('completionOverlay');
        completionOverlay.style.display = 'flex';
        document.getElementById('completionMessage').textContent =
            `What a skilled player!\nYou finished the race in ${finishTime.toFixed(2)}s!\nClick to Play Again`;

        // Stop the game
        isGameRunning = false;

    }
}

// Function to handle game-over (crash) state
function gameOver() {
    document.getElementById('deathOverlay').style.display = 'flex';
    isGameRunning = false;
}

// Function to update the HUD
function updateHUD() {
    const elapsedTime = ((performance.now() - startTime) / 1000).toFixed(2);
    document.getElementById('time').textContent = `Time: ${elapsedTime}s`;
    document.getElementById('targets').textContent = `Targets: ${collidedTargets.size} / ${totalTargets}`;
    document.getElementById('bestTime').textContent = `Best Run Time: ${isNaN(bestTime) ? 'NAN' : bestTime.toFixed(2) + 's'}`;
}

// Update camera to follow the drone in a third-person view
const updateCamera = () => {
    // Set the camera offset in the drone's local space (e.g., behind and slightly above)
    const cameraOffset = new THREE.Vector3(0, 2, -5); // Adjust these values to change the camera's relative position to the drone

    // Apply the drone's quaternion to the camera offset to get the correct position in world space
    const worldCameraOffset = cameraOffset.applyQuaternion(drone.quaternion);

    // Set the camera position relative to the drone's position, using the rotated offset
    const cameraPosition = drone.position.clone().add(worldCameraOffset);
    camera.position.copy(cameraPosition);

    // Make the camera look at the drone's current position
    camera.lookAt(drone.position);
};

//check if out of bound
const outOfBound = () => {
    if (drone.position.x > 91 || drone.position.x < -81) {
        return true;
    }
    
    if (drone.position.z > 41 || drone.position.z < -56) {
        return true;
    }
    return false;
};


//##lights
//ambient light
const ambientlight = new THREE.AmbientLight( 0xffffff, 1);
scene.add( ambientlight );

const raycaster = new THREE.Raycaster();
const rayDirections = {
    front: new THREE.Vector3(0, 0, -1),
    back: new THREE.Vector3(0, 0, 1),
    right: new THREE.Vector3(1, 0, 0),
    left: new THREE.Vector3(-1, 0, 0),
    down: new THREE.Vector3(0, -1, 0)
};
const rayLength = 0.5; // Length of each ray 
let count = 0;

let previousTime = performance.now(); // Initial time

const animate = () => {

    stats.begin(); // Begin stats recording

    requestAnimationFrame(animate);

    const currentTime = performance.now(); // Get the current time in milliseconds
    const deltaTime = (currentTime - previousTime) / 1000; // Convert milliseconds to seconds
    previousTime = currentTime;

    if (isGameRunning && drone && montain) {

        // Define local directions
        const localForward = new THREE.Vector3(0, 0, -1);
        const localUp = new THREE.Vector3(0, 1, 0);
        const localRight = new THREE.Vector3(1, 0, 0);

        // Convert local directions to world directions by applying drone's rotation
        const forward = localForward.clone().applyQuaternion(drone.quaternion);
        const up = localUp.clone().applyQuaternion(drone.quaternion);
        const right = localRight.clone().applyQuaternion(drone.quaternion);

        // Use controls to adjust position
        if (dronecontrols.pitch !== 0) {
            drone.position.add(forward.multiplyScalar(dronecontrols.pitch* deltaTime * speedMultiplier));
        }
        if (dronecontrols.lift !== 0) {
            drone.position.add(up.multiplyScalar(dronecontrols.lift* deltaTime * speedMultiplier/2));
        }
        if (dronecontrols.yaw !== 0) {
            drone.position.add(right.multiplyScalar(dronecontrols.yaw* deltaTime * speedMultiplier)); // Adjust the yaw angle directly
        }
        if (dronecontrols.rollY !== 0) {
            drone.rotateY(-dronecontrols.rollY* deltaTime * rotSpeedMultiplier); // Adjust rollY relative to the current forward direction
        }
        if (dronecontrols.rollX !== 0) {
            drone.rotateX(dronecontrols.rollX* deltaTime * rotSpeedMultiplier); 
        }

        //Perform raycasting for all directions
        const directions = ['front',  'down'];
        count++;
        count = count % 2;
        
        // Get the world-space direction of the ray
        const rayDirection = rayDirections[directions[count]].clone().applyQuaternion(drone.quaternion).normalize();
        
        // Set the raycaster to the drone's position and direction
        raycaster.set(drone.position, rayDirection);

        // Perform intersection check
        const intersects = raycaster.intersectObject(montain, true); // true for traversing children
        if (intersects.length > 0 && intersects[0].distance <= rayLength) {
            console.log(`Collision detected with the mountain in direction: ${directions[count]}`);
            
            // Reset drone position and rotation
            drone.position.set(63, -12.5, 36);
            drone.rotation.set(0, Math.PI, 0);
            collidedTargets = new Set();
            gameOver();
            
        }

        //check if out of bound
        if (outOfBound()) {
            console.log("Out of bound");
            drone.position.set(63, -12.5, 36);
            drone.rotation.set(0, Math.PI, 0);
            collidedTargets = new Set();
            gameOver();

        };
        

        updateCamera(); // Update the camera to follow the drone

        // Detect collisions with targets
        detectCollisions();

        // Update the HUD
        updateHUD();


        // console.log("X: ", parseFloat(drone.position.x.toFixed(2)), 
        //     "Y: ", parseFloat(drone.position.y.toFixed(2)), 
        //     "Z: ", parseFloat(drone.position.z.toFixed(2)));


    }



    

    renderer.render(scene, camera);
    stats.end(); // End stats recording
}

animate();


//!!!! don't put any code after this line it won't be rendered

//targets
/*
X:  64.45 Y:  -15.1 Z:  26.24
X:  65.75 Y:  -17.01 Z:  4.65
X:  81.83 Y:  -18.98 Z:  -26.26
X:  53.79 Y:  -15.94 Z:  -13.38
X:  23.83 Y:  -3.35 Z:  25.3
X:  10.21 Y:  4.14 Z:  29.88
X:  -2.79 Y:  -0.31 Z:  33.47
X:  -17.61 Y:  -10.76 Z:  7.53
X:  -10.51 Y:  -15.22 Z:  -18.98
X:  -1.38 Y:  -17.77 Z:  -38.71
X:  -7.44 Y:  -18.53 Z:  -50.75
X:  -49.14 Y:  -18.46 Z:  -52.1
X:  -65.96 Y:  -14.7 Z:  -25.38
X:  -76.32 Y:  -10.9 Z:  -1.36
//finish's on the X:  -65.34 Y:  -1.31 Z:  36.26
*/
//out of bound 
/*
X:  -81.23 Y:  0.4 Z:  42.26
X:  90.65 Y:  -9 Z:  43.03
X:  90.75 Y:  -14.69 Z:  -56.33
X:  -80.88 Y:  -11.08 Z:  -56.52
*/