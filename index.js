//Load a gltf / glb model and add annotations

import {
  Scene,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  PerspectiveCamera,
  WebGLRenderer,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils,
  DirectionalLight,
  AmbientLight,
  MOUSE,
  Clock,
  AxesHelper,
  GridHelper,
  BufferGeometry,
  LineSegments,
  LineBasicMaterial,
  //LineDashedMaterial
} from "three";

import CameraControls from "camera-controls";

import { FlyControls } from "three/examples/jsm/controls/FlyControls";

import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

import Stats from "stats.js/src/Stats";

//import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { toolbar } from "./overlay.js";

svgPaths = [
  "M10 9h-6l8-9 8 9h-6v11h-4v-11zm11 11v2h-18v-2h-2v4h22v-4h-2z",
  "m11.998 5c-4.078 0-7.742 3.093-9.853 6.483-.096.159-.145.338-.145.517s.048.358.144.517c2.112 3.39 5.776 6.483 9.854 6.483 4.143 0 7.796-3.09 9.864-6.493.092-.156.138-.332.138-.507s-.046-.351-.138-.507c-2.068-3.403-5.721-6.493-9.864-6.493zm8.413 7c-1.837 2.878-4.897 5.5-8.413 5.5-3.465 0-6.532-2.632-8.404-5.5 1.871-2.868 4.939-5.5 8.404-5.5 3.518 0 6.579 2.624 8.413 5.5zm-8.411-4c2.208 0 4 1.792 4 4s-1.792 4-4 4-4-1.792-4-4 1.792-4 4-4zm0 1.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z",
  "M12 0l-11 6v12.131l11 5.869 11-5.869v-12.066l-11-6.065zm7.91 6.646l-7.905 4.218-7.872-4.294 7.862-4.289 7.915 4.365zm-16.91 1.584l8 4.363v8.607l-8-4.268v-8.702zm10 12.97v-8.6l8-4.269v8.6l-8 4.269z",
  "M0 18.343l5.656 5.657 18.344-18.343-5.657-5.657-18.343 18.343zm21.171-12.686l-15.514 15.514-2.829-2.829 1.04-1.008 2.122 2.122.707-.707-2.122-2.122 1.414-1.414 1.414 1.414.708-.708-1.414-1.414 1.414-1.414 1.414 1.414.707-.707-1.414-1.414 1.414-1.414 2.122 2.122.707-.708-2.121-2.122 1.414-1.414 1.414 1.414.707-.707-1.414-1.414 1.414-1.414 1.414 1.414.707-.707-1.414-1.414 1.414-1.415 2.121 2.122.707-.707-2.121-2.122 1.039-1.071 2.829 2.83z",
];

const subsetOfTHREE = {
  MOUSE,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  //Line,
  MathUtils: {
    DEG2RAD: MathUtils.DEG2RAD,
    clamp: MathUtils.clamp,
  },
};

const canvas = document.getElementById("three-canvas");

//1 The scene
const scene = new Scene();

// The Camera

const camera = new PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight
);
scene.add(camera);

//using CSS2DRenderer
// Set up 2d renderer

const renderer = new WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});

renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.xr.enabled = true;

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.pointerEvents = "none";
labelRenderer.domElement.style.top = "0px";
document.body.appendChild(labelRenderer.domElement);

// Set up resize event

window.addEventListener("resize", () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
});

// Lights

const light = new DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 0.5);
const baseLight = new AmbientLight(0xffffff, 1);
scene.add(light, baseLight);

// Controls

const clock = new Clock();

//Axes and grid

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 2;
scene.add(axes);

const grid = new GridHelper(50, 50);
grid.material.depthTest = false;
grid.renderOrder = 1;
scene.add(grid);

//default view
function setCameraControls() {

  CameraControls.install({ THREE: subsetOfTHREE });

  const cameraControls = new CameraControls(camera, canvas);
  cameraControls.setLookAt(15, 15, 15, 0, 10, 0);

  grid.visible = true;
  axes.visible = true;

  return cameraControls;
}

//for 1st person view
function setFirstPersonCameraControls() {

  const textInstr = document.createElement('p');
  textInstr.textContent = 'Basic glb/gltf file viewer. 1 Load a model';

 // document.appendChild(textInstr);

  const cameraControls = new FirstPersonControls(camera, canvas);

  cameraControls.lookSpeed = 0.25;
  cameraControls.movementSpeed = 2;

  camera.position.x = 0;
  camera.position.y = 2;
  camera.position.z = 0;

  grid.visible = false;
  axes.visible = false;

  return cameraControls;
}

let cameraControls = setCameraControls();

let tDown = false;

window.addEventListener("keydown", function (event) {
  if (event.key === "t" && tDown === false) {
    tDown = true;
    //console.log('T pressed');
    cameraControls = setFirstPersonCameraControls();
  } else if (event.key === "t" && tDown === true) {
    tDown = false;
    cameraControls = setCameraControls();
  }
});

textInstructions();

toolbar2();



// Load 3D Scan

const loader = new GLTFLoader();

// const loadingElem = document.querySelector('#loader-container');
// const loadingText = loadingElem.querySelector('p');

let gltfScene;

const pickableObjects = [];

const input = document.getElementById("file-input");
input.addEventListener(
  "change",
  (changed) => {
    //clear the scene first
    if (gltfScene) {
      scene.remove(gltfScene);

      // gltfScene.geometry.dispose();
      // gltfScene.material.dispose();
    }

    //add "loading" code here instead of html

    loadingTextF();
    const loadingElem = document.querySelector("#loader-container");
    const loadingText = loadingElem.querySelector("p");

    const modelURL = URL.createObjectURL(changed.target.files[0]);

    loader.load(
      // resource URL
      modelURL,
      // called when the resource is loaded
      (gltf) => {
        gltf.scene.traverse(function (child) {
          if (child.isMesh) {
            const m = child;
            pickableObjects.push(m);
          }
        });
        loadingElem.style.display = "none";
        scene.add(gltf.scene);
        gltfScene = gltf.scene;
      },
      // called while loading is progressing
      (progress) => {
        const current = (progress.loaded / progress.total) * 100;
        const result = Math.min(current, 100);
        const formatted = Math.trunc(result * 100) / 100;
        loadingText.textContent = `Loading: ${formatted}%`;
      },
      // called when loading has errors
      (error) => {
        console.log("An error happened: ", error);
      }
    );
  },
  false
);

// loader.load(
// 	// resource URL
// 	'police_station.glb',
// 	// called when the resource is loaded
// 	( gltf ) => {
//     gltf.scene.traverse(function(child)
//       {
//         if (child.isMesh){
//           const m = child;
//           pickableObjects.push(m);
//         }
//       })
//     loadingElem.style.display = 'none';
// 		scene.add( gltf.scene );
//     gltfScene = gltf.scene;

// 	},
// 	// called while loading is progressing
// 	( progress ) => {
//     const current = (progress.loaded /  progress.total) * 100;
//     const result = Math.min(current, 100);
//     const formatted = Math.trunc(result * 100) / 100;
//     loadingText.textContent = `Loading: ${formatted}%`;
// 	},
// 	// called when loading has errors
// 	( error ) => {

// 		console.log( 'An error happened: ', error );

// 	}
// );

// Set up raycasting

const raycaster = new Raycaster();
const mouse = new Vector2();

window.addEventListener("dblclick", (event) => {
  mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(gltfScene);

  if (!intersects.length) {
    return;
  }

  const firstIntersection = intersects[0];
  const location = firstIntersection.point;

  const result = window.prompt("Introduce message:"); //change to different window type

  const base = document.createElement("div");
  base.className = "base-label";

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "X";
  deleteButton.className = "delete-button hidden";
  base.appendChild(deleteButton);

  base.onmouseenter = () => deleteButton.classList.remove("hidden");
  base.onmouseleave = () => deleteButton.classList.add("hidden");

  const postit = document.createElement("div");
  postit.className = "label";
  postit.textContent = result;
  base.appendChild(postit);

  const ifcJsTitle = new CSS2DObject(base);
  ifcJsTitle.position.copy(location);
  scene.add(ifcJsTitle);

  deleteButton.onclick = () => {
    base.remove();
    ifcJsTitle.element = null;
    ifcJsTitle.removeFromParent();
  };
});

//Raycaster measurements https://sbcode.net/threejs/measurements/
let ctrlDown = false;
let lineId = 0;
let line;
let drawingLine = false;
const measurementLabels = {};

window.addEventListener("keydown", function (event) {
  if (event.key === "Control") {
    ctrlDown = true;
    cameraControls.enabled = false;
    renderer.domElement.style.cursor = "crosshair";
  }
});

window.addEventListener("keyup", function (event) {
  if (event.key === "Control") {
    ctrlDown = false;
    cameraControls.enabled = true;
    renderer.domElement.style.cursor = "pointer";
    if (drawingLine) {
      //delete the last line because it wasn't committed
      scene.remove(line);
      scene.remove(measurementLabels[lineId]);
      drawingLine = false;
    }
  }
});

//const raycaster = new THREE.Raycaster()
let intersects;
//const mouse = new THREE.Vector2()

renderer.domElement.addEventListener("pointerdown", onClick, false);
function onClick() {
  if (ctrlDown) {
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(pickableObjects, false);
    if (intersects.length > 0) {
      if (!drawingLine) {
        //start the line
        const points = [];
        points.push(intersects[0].point);
        points.push(intersects[0].point.clone());
        const geometry = new BufferGeometry().setFromPoints(points);
        line = new LineSegments(
          geometry,
          new LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
            // linecap: 'butt',
            // linejoin: 'miter',
            transparent: true,
            opacity: 0.75,
            // depthTest: false,
            // depthWrite: false
          })
        );
        line.frustumCulled = false;
        scene.add(line);

        const measurementDiv = document.createElement("div");
        measurementDiv.className = "measurementLabel";
        measurementDiv.innerText = "0.0m";
        const measurementLabel = new CSS2DObject(measurementDiv);
        measurementLabel.position.copy(intersects[0].point);
        measurementLabels[lineId] = measurementLabel;
        scene.add(measurementLabels[lineId]);
        drawingLine = true;
      } else {
        //finish the line
        const positions = line.geometry.attributes.position.array;
        positions[3] = intersects[0].point.x;
        positions[4] = intersects[0].point.y;
        positions[5] = intersects[0].point.z;
        line.geometry.attributes.position.needsUpdate = true;
        lineId++;
        drawingLine = false;
      }
    }
  }
}

document.addEventListener("mousemove", onDocumentMouseMove, false);
function onDocumentMouseMove(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (drawingLine) {
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(pickableObjects, false);
    if (intersects.length > 0) {
      const positions = line.geometry.attributes.position.array;
      const v0 = new Vector3(positions[0], positions[1], positions[2]);
      const v1 = new Vector3(
        intersects[0].point.x,
        intersects[0].point.y,
        intersects[0].point.z
      );
      positions[3] = intersects[0].point.x;
      positions[4] = intersects[0].point.y;
      positions[5] = intersects[0].point.z;
      line.geometry.attributes.position.needsUpdate = true;
      const distance = v0.distanceTo(v1);
      measurementLabels[lineId].element.innerText = distance.toFixed(2) + "m";
      measurementLabels[lineId].position.lerpVectors(v0, v1, 0.5);
    }
  }
}
//Raycaster measurements

//Stats

// const stats = new Stats();
// stats.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom
//document.body.appendChild( stats.dom );

// const statsContainer = document.createElement('div');
// statsContainer.className = "stats-container";

// statsContainer.appendChild(stats.dom);
// document.body.appendChild( statsContainer );

//statsGUI();

// VR

//document.body.appendChild( VRButton.createButton( renderer ) );

// Animation

// renderer.setAnimationLoop( function () {

// 	renderer.render( scene, camera );

// } );

//Animation

function animate() {
  // stats.begin();

  const delta = clock.getDelta();
  cameraControls.update(delta);

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

  // stats.end();

  requestAnimationFrame(animate); //won't work with VR?
}

animate();

//helper functions
function loadingTextF() {
  if (!document.querySelector("#loader-container")) {
    const loaderContainer = document.createElement("div");
    loaderContainer.id = "loader-container";

    const svgViewBox = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgViewBox.setAttribute("viewBox", "25 25 50 50");

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("r", "20");
    circle.setAttribute("cy", "50");
    circle.setAttribute("cx", "50");

    const p = document.createElement("p");

    p.textContent = "Loading: 100%";

    svgViewBox.appendChild(circle);
    loaderContainer.appendChild(svgViewBox);
    loaderContainer.appendChild(p);

    document.body.appendChild(loaderContainer);
  }

  //return loaderContainer;
}

function statsGUI() {
  // not working??
  const statsContainer = document.createElement("div");
  statsContainer.className = "stats-container";

  const stats = new Stats();

  stats.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom

  statsContainer.appendChild(stats.dom);

  document.body.appendChild(statsContainer);

  return stats;
}

function uploadButton() {
  //upload - no svg? - how to remove choose file box? - svg not working???
  const uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.id = "file-input";
  uploadInput.className = "button";

  const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgEl.setAttribute("width", "15");
  svgEl.setAttribute("height", "15");
  svgEl.setAttribute("viewBox", "0 0 24 24");

  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("d", svgPaths[0]);

  svgEl.appendChild(path1);
  uploadInput.appendChild(svgEl);

  return uploadInput;
}

function toggleViewButton() {
  let mouseDown = false;

  const viewButton = document.createElement("a");
  viewButton.className = "button";
  viewButton.type = "button";
  //viewButton.value = "Switch between views";

  //document.body.appendChild(viewButton);

  const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgEl.setAttribute("width", "15");
  svgEl.setAttribute("height", "15");
  svgEl.setAttribute("viewBox", "0 0 24 24");

  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("d", svgPaths[1]);

  svgEl.appendChild(path1);
  viewButton.appendChild(svgEl);

  //events to switch between views
  viewButton.addEventListener(
    "click",
    function () {
      if (mouseDown === false) {
        mouseDown = true;
        cameraControls = setFirstPersonCameraControls();
      } else if (mouseDown === true) {
        mouseDown = false;
        cameraControls = setCameraControls();
      }
    },
    false
  );

  return viewButton;
}

function gridButton() {
  const gridButton = document.createElement("a");
  gridButton.className = "button";

  const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgEl.setAttribute("width", "15");
  svgEl.setAttribute("height", "15");
  svgEl.setAttribute("viewBox", "0 0 24 24");

  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("d", svgPaths[2]);

  svgEl.appendChild(path1);
  gridButton.appendChild(svgEl);

  let gridAxes = true;

  gridButton.addEventListener("click", function () {
    if (gridAxes) {
      gridAxes = false;
      grid.visible = false;
      axes.visible = false;
    } else if (gridAxes === false) {
      gridAxes = true;
      grid.visible = true;
      axes.visible = true;
    }
  });

  return gridButton;
}

function measurementsButton() {
  const measurementsButton = document.createElement("a");
  measurementsButton.className = "button";

  const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgEl.setAttribute("width", "15");
  svgEl.setAttribute("height", "15");
  svgEl.setAttribute("viewBox", "0 0 24 24");

  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("d", svgPaths[3]);

  svgEl.appendChild(path1);
  measurementsButton.appendChild(svgEl);

  measurementsButton.addEventListener("click", function () {
    // needs to remove all lines and also labels...

    for (let threeLine in typeof(LineSegments)) {
      console.log(threeLine);
      scene.remove(threeLine);
    }

    let labels = document.querySelectorAll(".measurementLabel");
    console.log(labels);

    for (const label of labels) {
      label.innerHTML = '';
    }

  });

  return measurementsButton;
}

function toolbar2() {
  const cardContainer = document.createElement("div");
  cardContainer.className = "simple-card-container bottom";

  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";

  //upload - no svg? - how to remove choose file box? - svg not working???
  const uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.id = "file-input";
  uploadInput.className = "button";

  toolbar.appendChild(uploadButton());
  toolbar.appendChild(toggleViewButton());
  //toolbar.appendChild(gridButton()); //dont need this
  toolbar.appendChild(measurementsButton());

  cardContainer.appendChild(toolbar);

  document.body.appendChild(cardContainer);
}

//fix CSS...
function textInstructions() {

  const textDiv = document.createElement('div');
  textDiv.className = 'toolbar';


  const textInstr = document.createElement('p');
  textInstr.id = 'info';
  textInstr.textContent = 'Basic glb/gltf file viewer';

  const listInstr = document.createElement('ol');
  listInstr.id = 'info';

  let listItems = ['Load a model', 'Toggle between views', 'Hold Ctrl and press the left mouse button to start a measurement', 'Double click on mesh to add a annotation'];

  // for (let listItem in listItems){
  //   listInstr.innerHTML += listItem;
  // }

  let listItem1 = document.createElement('li');
  listItem1.id = 'info';
  listItem1.textContent = listItems[0];

  let listItem2 = document.createElement('li');
  listItem2.id = 'info';
  listItem2.textContent = listItems[1];

  let listItem3 = document.createElement('li');
  listItem3.id = 'info';
  listItem3.textContent = listItems[2];

  let listItem4 = document.createElement('li');
  listItem4.id = 'info';
  listItem4.textContent = listItems[3];

  //const 

  listInstr.appendChild(listItem1);
  listInstr.appendChild(listItem2);
  listInstr.appendChild(listItem3);
  listInstr.appendChild(listItem4);
  //...
  
  textDiv.appendChild(textInstr);
  textDiv.appendChild(listInstr);
  document.body.appendChild(textDiv);


}