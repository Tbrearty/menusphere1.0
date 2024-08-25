// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls for better interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 2;
controls.maxDistance = 10;

// Create spheres
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material1 = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
const material3 = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

const sphere1 = new THREE.Mesh(geometry, material1);
sphere1.scale.set(1, 1, 1);
scene.add(sphere1);

const sphere2 = new THREE.Mesh(geometry, material2);
sphere2.scale.set(1.5, 1.5, 1.5);
scene.add(sphere2);

const sphere3 = new THREE.Mesh(geometry, material3);
sphere3.scale.set(2, 2, 2);
scene.add(sphere3);

camera.position.z = 5;

// Create menu items
const menuItemGeometry = new THREE.PlaneGeometry(0.4, 0.2);
const menuItems = [
  { text: 'SDXL', sphere: sphere1 },
  { text: 'Stable Diffusion v1.5', sphere: sphere2 },
  { text: 'Stable Diffusion v2.1', sphere: sphere3 },
  { text: 'Prompt Builder', sphere: sphere2 },
  { text: 'LORA', sphere: sphere3 },
  { text: 'Schedulers', sphere: sphere3 },
];

// Position menu items evenly on the surface of each sphere
const radius1 = 1;
const radius2 = 1.5;
const radius3 = 2;
const angleStep = (Math.PI * 2) / menuItems.length;

menuItems.forEach((item, index) => {
  const radius = item.sphere.geometry.parameters.radius;
  const angle = index * angleStep;

  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.fillStyle = 'rgba(0, 0, 0, 0.5)';
  context.fillRect(0, 0, 256, 128);
  context.fillStyle = 'white';
  context.font = '20px Arial';
  context.fillText(item.text, 10, 50);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const plane = new THREE.Mesh(menuItemGeometry, material);
  plane.position.set(x, y, 0);
  plane.lookAt(new THREE.Vector3(0, 0, 0)); // Ensure the planes face outward
  item.sphere.add(plane);
});

// Rotation animation
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Responsive canvas
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

// Detect clicks
document.addEventListener('click', onDocumentClick, false);
function onDocumentClick(event) {
  event.preventDefault();
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    if (intersectedObject.geometry.type === 'PlaneGeometry') {
      const sphere = intersectedObject.parent;

      // Check if the sphere is fully opened
      if (sphere.scale.x > 1) {
        animateSphere(sphere, new THREE.Vector3(0.1, 0.1, 0.1), 500);
        alert(`Clicked on ${intersectedObject.material.map.image.text}`);
      } else {
        animateSphere(sphere, new THREE.Vector3(2, 2, 2), 500);
        alert(`Clicked on ${intersectedObject.material.map.image.text}`);
      }
    }
  }
}

// Animation function for opening and closing spheres
function animateSphere(sphere, targetScale, duration) {
  const startTime = Date.now();
  const initialScale = sphere.scale.clone();

  const animate = () => {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    sphere.scale.lerp(targetScale, progress);

    // Adjust the scale of the sphere based on progress
    const currentScale = sphere.scale.x; // Assuming uniform scaling
    if (currentScale >= 1) {
      sphere.scale.set(currentScale, currentScale, currentScale);
      // Show menu items on the sphere
      showMenuItems(sphere);
    } else if (currentScale <= 0.1) {
      sphere.scale.set(0.1, 0.1, 0.1);
      // Hide menu items on the sphere
      hideMenuItems(sphere);
      clearInterval(animationId);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  const animationId = setInterval(animate, 16); // Update at 60 FPS
}

// Functions to show and hide menu items
function showMenuItems(sphere) {
  // Get all menu items on the sphere
  const menuItems = sphere.children.filter(
    (child) => child.geometry.type === 'PlaneGeometry'
  );

  menuItems.forEach((item) => {
    item.visible = true;
  });
}

function hideMenuItems(sphere) {
  // Get all menu items on the sphere
  const menuItems = sphere.children.filter(
    (child) => child.geometry.type === 'PlaneGeometry'
  );

  menuItems.forEach((item) => {
    item.visible = false;
  });
}