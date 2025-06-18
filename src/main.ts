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
import GUI from "lil-gui";

class MyScene {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
  camera = new THREE.OrthographicCamera();

  width = window.innerWidth;
  height = window.innerHeight;

  stats = new Stats();
  controls: OrbitControls | null = null;

  mouse = new THREE.Vector2(0, 0);
  prevMouse = new THREE.Vector2(0, 0);
  settings: Record<string, any> = {
    orbitControls: false,
    midPlatformY: platform.gap,
  };

  htmlElements: HTMLDivElement[] = [];

  constructor() {
    this.setupRenderer();
    this.setupCamera();
    this.setupResize();
    this.addObjects();
    this.initSettings();
    this.setupHtmlElements();

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  setupHtmlElements() {
    const els = document.querySelectorAll(".mid-square-label");
    els.forEach((el) => {
      this.htmlElements.push(el as HTMLDivElement);
    });
  }

  initSettings() {
    const gui = new GUI();

    gui.add(this.settings, "orbitControls").onFinishChange(() => {
      if (this.settings.orbitControls) {
        this.controls = new OrbitControls(this.camera, this.canvas);
      } else {
        this.controls = null;
      }
    });
    gui.add(this.settings, "midPlatformY", 0, this.settings.midPlatformY, 0.01);
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
    this.camera.lookAt(0, 0, 0);
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

  /* Scene objects */
  rootPlatform: THREE.Group = new THREE.Group();
  rootPlatformSpheres: Array<{ delay: number; mesh: THREE.Mesh }> = [];
  rootPlatformLines: Array<{ mesh: Line2; startY: THREE.Vector3 }> = [];
  midPlatform: THREE.Group = new THREE.Group();
  midPlatformSquares: Array<THREE.Mesh> = [];

  addRootPlatform() {
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

    this.rootPlatform.add(plane);
    this.rootPlatform.add(border);
    this.scene.add(this.rootPlatform);

    // Add dashed lines
    const dashGroup = new THREE.Group();
    this.rootPlatform.add(dashGroup);
    this.addVerticalLinesFromRootPlatform(dashGroup);
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

    return line;
  }

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

      if (sphere.mesh.position.y > this.settings.midPlatformY - 1) {
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

  addVerticalLinesFromRootPlatform(group: THREE.Group) {
    const spacing = platform.size / platform.numLines; // Space between lines

    for (let i = 0; i < platform.numLines; i++) {
      if (i === 0) continue;

      const x1 = -platform.size / 2 + i * spacing;
      const z1 = platform.size / 2 - spacing;

      const x2 = platform.size / 2 - spacing;
      const z2 = -platform.size / 2 + i * spacing;

      const line1 = this.addDashedLine(
        group,
        { x: x1, y: 0, z: z1 },
        { x: x1, y: this.settings.midPlatformY, z: z1 },
        { material: dashedLineMaterial }
      );
      const line2 = this.addDashedLine(
        group,
        { x: x2, y: 0, z: z2 },
        { x: x2, y: this.settings.midPlatformY, z: z2 },
        { material: dashedLineMaterial }
      );
      this.rootPlatformLines.push(
        { mesh: line1, startY: new THREE.Vector3(x1, 0, z1) },
        { mesh: line2, startY: new THREE.Vector3(x2, 0, z2) }
      );

      this.addCircleLine(group, { x: x1, z: z1 });
      this.addRootPlatformSpheres(group, { x: x1, z: z1 });
      this.addRootPlatformSpheres(group, { x: x2, z: z2 });
    }
  }

  addMidPlatform() {
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
    //plane.position.y = this.settings.midPlatformY;
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
    //border.position.y = this.settings.midPlatformY;

    this.midPlatform.position.y = this.settings.midPlatformY;
    this.midPlatform.add(plane);
    this.midPlatform.add(border);
    this.scene.add(this.midPlatform);

    this.addMidPlatformDashedLines(this.midPlatform);
    this.addMidPlatformSquares(this.midPlatform);
  }

  addMidPlatformDashedLines(group: THREE.Group) {
    const spacing = platform.size / platform.numLines;
    const offsetY = 0.5;

    for (let i = 0; i < platform.numLines; i++) {
      if (i === 0) continue;

      const x1 = -platform.size / 2 + i * spacing;
      const z1 = platform.size / 2;

      const x2 = platform.size / 2;
      const z2 = -platform.size / 2 + i * spacing;

      this.addDashedLine(
        group,
        { x: x1, y: offsetY, z: z1 },
        { x: x1, y: offsetY, z: z1 - platform.size },
        { material: dashedLineMaterialBlack }
      );

      this.addDashedLine(
        group,
        { x: x2, y: offsetY, z: z2 },
        { x: x2 - platform.size, y: offsetY, z: z2 },
        { material: dashedLineMaterialBlack }
      );
    }
  }

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

    const geometry = new THREE.PlaneGeometry(squareSize, squareSize);
    const material = new THREE.MeshBasicMaterial({
      color: colors.black,
      side: THREE.DoubleSide,
    });

    squarePositions.map((pos) => {
      const square = new THREE.Mesh(geometry, material);
      square.position.set(pos.x, 0.5, pos.z);
      square.rotation.x = degToRad(90);
      this.midPlatformSquares.push(square);
      group.add(square);
    });
  }

  updateHtmlElementPositions() {
    for (let i = 0; i < this.midPlatformSquares.length; i++) {
      const mesh = this.midPlatformSquares[i];
      const el = this.htmlElements[i];
      if (!mesh || !el) continue;

      // Get the 3D position of the mesh
      const pos = mesh.position.clone().add(this.midPlatform.position);

      // Project to normalized device coordinates (NDC)
      pos.project(this.camera);

      // Convert NDC to screen coordinates
      const x = (pos.x * 0.5 + 0.5) * this.width;
      const y = (1 - (pos.y * 0.5 + 0.5)) * this.height;

      // Position the HTML element
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      el.style.opacity = "1";
    }
  }

  moveMidPlatform() {
    this.midPlatform.position.y = this.settings.midPlatformY;
    this.rootPlatformLines.map((line) => {
      line.mesh.geometry.setFromPoints([
        line.startY,
        line.startY.clone().setY(this.settings.midPlatformY),
      ]);
      line.mesh.computeLineDistances();
    });
  }

  addObjects() {
    this.addRootPlatform();
    this.addMidPlatform();
  }

  clock = new THREE.Clock();

  render() {
    const elapsedTime = this.clock.getElapsedTime();

    this.controls?.update();

    this.moveRootPlatformSpheres();
    this.moveMidPlatform();
    this.updateHtmlElementPositions();

    // Render
    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

let myScene = new MyScene();
myScene.render();
