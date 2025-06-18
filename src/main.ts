import * as THREE from "three";
import {
  CSS2DRenderer,
  EffectComposer,
  Line2,
  LineGeometry,
  LineMaterial,
  OrbitControls,
  RenderPass,
  RoundedBoxGeometry,
  ShaderPass,
} from "three/examples/jsm/Addons.js";
import { LineMaterial as FatLineMaterial } from "three-fatline";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { degToRad } from "three/src/math/MathUtils.js";
import {
  colors,
  dashedLineMaterial,
  dashedLineMaterialBlack,
  platform,
  rootPlatformCircleGeometry,
  rootPlatformCircleMaterial,
} from "./constants";
import { randIn } from "./utils";

class MyScene {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
  camera = new THREE.OrthographicCamera();

  width = window.innerWidth;
  height = window.innerHeight;

  stats = new Stats();
  controls = new OrbitControls(this.camera, this.canvas);

  settings: Record<string, any> = {};
  mouse = new THREE.Vector2(0, 0);
  prevMouse = new THREE.Vector2(0, 0);

  labelRenderer = new CSS2DRenderer();

  constructor() {
    //this.addHtmlElemens();
    this.setupRenderer();
    this.setupCamera();
    this.setupResize();
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.trackMouse();
    this.addObjects();
    this.initSettings();

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  initSettings() {}

  setupLabelRenderer() {
    this.labelRenderer.setSize(this.width, this.height);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0";
    this.labelRenderer.domElement.style.left = "0";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(this.labelRenderer.domElement);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  setupCamera() {
    let frustrum = this.height;
    let aspect = this.width / this.height;
    this.camera = new THREE.OrthographicCamera(
      (frustrum * aspect) / -2,
      (frustrum * aspect) / 2,
      frustrum / 2,
      frustrum / -2,
      -1000,
      1000
    );
    this.camera.position.set(2, 1, 2);
    this.camera.zoom = 10;
    this.camera.updateProjectionMatrix();
  }

  setupResize() {
    window.addEventListener("resize", () => {
      // Update sizes
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Update camera
      this.camera.updateProjectionMatrix();

      // Update renderer
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  trackMouse() {
    window.addEventListener("mousemove", (event) => {
      this.mouse.x = event.clientX - this.width / 2;
      this.mouse.y = this.height / 2 - event.clientY;
    });
  }

  addRootPlatform() {
    const group = new THREE.Group();

    const geometry = new RoundedBoxGeometry(
      platform.size,
      platform.size,
      0.5,
      20,
      20
    );
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: colors.darkGray,
    });

    const plane = new THREE.Mesh(geometry, planeMaterial);
    plane.rotation.x = degToRad(90);
    plane.scale.set(0.98, 0.98, 0.98);

    // Add border
    const edges = new THREE.EdgesGeometry(geometry);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: colors.green,
      linejoin: "round",
      linewidth: 1,
    });
    const border = new THREE.LineSegments(edges, borderMaterial);
    border.position.set(0, 0, 0.05);
    border.rotation.x = degToRad(90);
    border.position.y += 0.1;

    group.add(plane);
    group.add(border);
    this.scene.add(group);

    // Add dashed lines
    const dashGroup = new THREE.Group();
    group.add(dashGroup);
    this.addDashedLines(dashGroup);
  }

  addDashedLine(
    group: THREE.Group,
    args: { x: number; y: number; z: number },
    to: { x: number; y: number; z: number },
    { material }: { material: FatLineMaterial }
  ) {
    let points = [];

    points.push(new THREE.Vector3(args.x, args.y, args.z));
    points.push(new THREE.Vector3(to.x, to.y, to.z));
    const geometry = new LineGeometry();
    geometry.setFromPoints(points);
    const line = new Line2(geometry, material as LineMaterial);
    line.computeLineDistances(); // Required for dashed lines

    group.add(line);
  }

  rootPlatformSpheres: Array<{ delay: number; mesh: THREE.Mesh }> = [];

  addRootPlatformSpheres(group: THREE.Group, args: { x: number; z: number }) {
    const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: colors.green,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(args.x, 0, args.z);
    this.rootPlatformSpheres.push({ mesh: sphere, delay: randIn(10, 500) });
    group.add(sphere);
  }

  moveRootPlatformSpheres() {
    for (const sphere of this.rootPlatformSpheres) {
      if (sphere.delay) {
        sphere.delay--;
        continue;
      }

      if (sphere.mesh.position.y > platform.gap) {
        sphere.mesh.position.y = 0;
      } else {
        sphere.mesh.position.y += 0.1;
      }
    }
  }

  addCircleLine(group: THREE.Group, args: { x: number; z: number }) {
    const spacing = platform.size / platform.numLines; // Space between lines

    for (let i = 0; i < platform.numLines; i++) {
      if (i === platform.numLines - 1) continue;

      const circle = new THREE.Mesh(
        rootPlatformCircleGeometry,
        rootPlatformCircleMaterial
      );
      circle.position.set(args.x, 0.3, args.z);
      circle.rotateX(degToRad(-90));
      group.add(circle);
      args.z -= spacing;
    }
  }

  addDashedLines(group: THREE.Group) {
    const spacing = platform.size / platform.numLines; // Space between lines

    for (let i = 0; i < platform.numLines; i++) {
      if (i === 0) continue;

      const x1 = -platform.size / 2 + i * spacing;
      const z1 = platform.size / 2 - spacing;

      const x2 = platform.size / 2 - spacing;
      const z2 = -platform.size / 2 + i * spacing;

      this.addDashedLine(
        group,
        { x: x1, y: 0, z: z1 },
        { x: x1, y: platform.gap, z: z1 },
        { material: dashedLineMaterial }
      );
      this.addDashedLine(
        group,
        { x: x2, y: 0, z: z2 },
        { x: x2, y: platform.gap, z: z2 },
        { material: dashedLineMaterial }
      );
      this.addCircleLine(group, { x: x1, z: z1 });

      this.addRootPlatformSpheres(group, { x: x1, z: z1 });
      this.addRootPlatformSpheres(group, { x: x2, z: z2 });
    }
  }

  addMidPlatform() {
    const group = new THREE.Group();

    const geometry = new RoundedBoxGeometry(
      platform.size,
      platform.size,
      0.5,
      20,
      20
    );
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: colors.darkGray,
    });

    const plane = new THREE.Mesh(geometry, planeMaterial);
    plane.position.y = platform.gap;
    plane.rotation.x = degToRad(90);
    plane.scale.set(0.98, 0.98, 0.98);

    // Add border
    const edges = new THREE.EdgesGeometry(geometry);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: colors.black,
      linejoin: "round",
      linewidth: 1,
    });
    const border = new THREE.LineSegments(edges, borderMaterial);
    border.position.set(0, 0, 0.05);
    border.rotation.x = degToRad(90);
    border.position.y = platform.gap;

    group.add(plane);
    group.add(border);
    this.scene.add(group);

    this.addMidPlatformDashedLines(group);
    this.addMidPlatformSquares(group);
  }

  addMidPlatformDashedLines(group: THREE.Group) {
    const spacing = platform.size / platform.numLines;

    for (let i = 0; i < platform.numLines; i++) {
      if (i === 0) continue;

      const x1 = -platform.size / 2 + i * spacing;
      const z1 = platform.size / 2;

      const x2 = platform.size / 2;
      const z2 = -platform.size / 2 + i * spacing;

      this.addDashedLine(
        group,
        { x: x1, y: platform.gap + 1, z: z1 },
        { x: x1, y: platform.gap + 1, z: z1 - platform.size },
        { material: dashedLineMaterialBlack }
      );

      this.addDashedLine(
        group,
        { x: x2, y: platform.gap + 1, z: z2 },
        { x: x2 - platform.size, y: platform.gap + 2, z: z2 },
        { material: dashedLineMaterialBlack }
      );
    }
  }

  midPlatformSquares: Array<THREE.Mesh> = [];

  addMidPlatformSquares(group: THREE.Group) {
    const squareSize = 5;
    const squarePositions = [
      { x: -20, z: -20 },
      { x: 0, z: -20 },
      { x: 20, z: -20 },
      { x: -20, z: 0 },
      { x: -20, z: 20 },
      { x: 15, z: 15 },
    ];

    squarePositions.map((pos, idx) => {
      //this.htmlElements[idx]?.position.set(pos.x, platform.gap + 1, pos.z);

      const geometry = new THREE.PlaneGeometry(squareSize, squareSize);
      const material = new THREE.MeshBasicMaterial({
        color: colors.black,
        side: THREE.DoubleSide,
      });
      const square = new THREE.Mesh(geometry, material);
      square.position.set(pos.x, platform.gap + 1, pos.z);
      square.rotation.x = degToRad(90);
      this.midPlatformSquares.push(square);
      group.add(square);
    });
  }

  addObjects() {
    this.addRootPlatform();
    this.addMidPlatform();
  }

  clock = new THREE.Clock();

  render() {
    const elapsedTime = this.clock.getElapsedTime();

    this.controls.update();

    this.moveRootPlatformSpheres();

    // Render
    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

let myScene = new MyScene();
myScene.render();
