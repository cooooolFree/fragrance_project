import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(8, 5, 0);

const glassBackMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#0000ff"),
  metalness: 1,
  roughness: 0,

  side: THREE.BackSide,
  transparent: true,
  opacity: 0.3,
  envMapIntensity: 2,
  premultipliedAlpha: true,
  reflectivity: 1,
});

const glassFrontMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#0000ff"),
  metalness: 1,
  roughness: 0,
  side: THREE.FrontSide,

  transparent: true,
  opacity: 0.65,
  envMapIntensity: 8,
  premultipliedAlpha: true,
  reflectivity: 1,
});
const exrLoader = new EXRLoader();

const objects = [];

exrLoader.load("/textures/studio_small_09_4k.exr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  glassFrontMaterial.envMap = glassBackMaterial.envMap = texture;
  glassFrontMaterial.needsUpdate = glassBackMaterial.needsUpdate = true;
});

const gltfLoader = new GLTFLoader();
gltfLoader.load("textures/marble_bust_01_2k.gltf", (gltf) => {
  scene.add(gltf.scene);

  gltf.scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.scale.set(5, 5, 5);
      child.material = glassBackMaterial;
      const second = child.clone();
      second.material = glassFrontMaterial;
      const parent = new THREE.Group();
      parent.add(second);
      parent.add(child);
      scene.add(parent);
      objects.push(parent);
    }
  });
});
const canvas = document.querySelector("canvas.webgl");
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.setClearColor("#0a3cce");
renderer.toneMappingExposure = 0.6;

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const size = 10;
const divisions = 10;

// const gridHelper = new THREE.GridHelper(size, divisions);
// const axesHelper = new THREE.AxesHelper(1);

// scene.add(gridHelper, axesHelper);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 0;
controls.maxDistance = 200;
controls.enableDamping = true;
controls.enableZoom = true;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  controls.update();

  for (let i = 0; i < objects.length; i++) {
    objects[i].rotation.y += 0.03;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
