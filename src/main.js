import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 5, 5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 0.5);
dir.position.set(10, 10, 0);
scene.add(dir);

const BLOCK_SIZE = 1;
const blocks = new THREE.Group();
scene.add(blocks);

const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
const material = new THREE.MeshLambertMaterial({ color: 0x8bc34a });

for (let x = -5; x <= 5; x++) {
  for (let z = -5; z <= 5; z++) {
    const cube = new THREE.Mesh(geometry, material.clone());
    cube.position.set(x, 0, z);
    blocks.add(cube);
  }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function addBlock(position) {
  const cube = new THREE.Mesh(geometry, material.clone());
  cube.position.copy(position).divideScalar(BLOCK_SIZE).floor().multiplyScalar(BLOCK_SIZE);
  blocks.add(cube);
}

function removeBlock(cube) {
  blocks.remove(cube);
}

function onPointerDown(event) {
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(blocks.children, false);
  if (intersects.length > 0) {
    const intersect = intersects[0];
    if (event.button === 2) {
      removeBlock(intersect.object);
    } else {
      const pos = intersect.point
        .add(intersect.face.normal)
        .divideScalar(BLOCK_SIZE)
        .floor()
        .multiplyScalar(BLOCK_SIZE);
      addBlock(pos);
    }
  }
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
