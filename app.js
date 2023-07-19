//Variables for setup

let container;
let camera;
let renderer;
let scene;
let ship;
let mouseX, mouseY, targetX, targetY, windowX, windowY, angle;

// 3d image mouse
const cursor = {
  x: 0,
  y: 0,
  lerpX: 0,
  lerpY: 0,
  }

init();

function init() {
  container = document.querySelector(".scene");

  //Create scene
  scene = new THREE.Scene();

  const fov = 35;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1;
  const far = 1000;

  //Camera setup
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 1, 30);

  const ambient = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(50, 50, 100);
  scene.add(light);

  //Renderer
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true 
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  container.appendChild(renderer.domElement);

  //Load Model
  let loader = new THREE.GLTFLoader();
  loader.load("./ship/scene.gltf", function(gltf) {
    scene.add(gltf.scene);
    ship = gltf.scene.children[0];
    //ship.position.y = 15;
    //ship.position.z = -50;

    ship.rotateX(0.75);  // topdown/iso view of ship
  });
}

window.addEventListener("resize", onWindowResize);

// dynamic mouse orientation Initialized
document.addEventListener('mousemove', onDocumentMouseMove);
document.addEventListener('mouseout', onDocumentMouseOut);
mouseX = 0;
mouseY = 0;
targetX = 0;
targetY = 0;
windowX = window.innerWidth / 2;
windowY = window.innerHeight / 2;

// dynamic mouse movement interaction Function					
function onDocumentMouseMove(event) {

  mouseX = (event.clientX - windowX);
  mouseY = (event.clientY - windowY);
  cursor.x = event.clientX / windowX - 0.5;
  cursor.y = event.clientY / windowY - 0.5;
}

// dynamic mouse movement interaction Function					
function onDocumentMouseOut(event) {
  cursor.x = 0;
  cursor.y = 0;
}

// Control Keys  (needs testing *********************************************************)
const keysPressed = {};

document.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true
}, false);

document.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false
}, false);

const clock = new THREE.Clock();  // clock

function animate() {
  requestAnimationFrame(animate);

  //ship.rotation.z -= 0.001;
  //ship.rotation.y += 0.005;
  //ship.rotation.x += 0.005;

  ship.position.y;
  ship.position.x;

  // 3d image parallaxing 
  const elapsedTime = clock.getElapsedTime();

  // Y-tilt animation * speed , * tolerance 
  ship.rotateY(Math.sin(elapsedTime*2.0 + 1.0) * 0.0004);

  // X-tilt animation
  ship.rotateX(Math.sin(elapsedTime*2.0) * -0.0010);

  // Z(oom) position bounce - * speed , * tolerance -starting Z 
  //ship.position.z = Math.sin(elapsedTime*2.0) * 0.2 - 30;
  ship.position.z = Math.sin(elapsedTime*2.0 + 0.5) * 0.2 +8;

  //ship.position.y += 0.01;

  // turn ship with cursor/mouse
  angle = Math.atan2(mouseY - ship.position.y, mouseX - ship.position.x);
  ship.rotation.z = -angle - Math.PI;
  //ship.rotate(angle);
  //ship.rotation.z += .011 * (targetY - ship.rotation.z);
  //ship.rotation.z += .011 * (targetX - ship.rotation.z);

  // turn (look) ship TEST
  //ship.rotation.z += 0.0008;

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio( window.devicePixelRatio );
}

animate();