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
  platformGeometry,
  rootPlatformCircleGeometry,
  rootPlatformCircleMaterial,
  rootPlatformSphereGeometry,
  upperMidPlatformSphereGeometry,
  upperMidPlatformSphereMaterial,
  upperMidPlatformSpheres,
} from "./constants";
import { getObjectByName, getObjectsByProperty, randIn } from "./utils";
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
    upperMidPlatformY: platform.gap,
    progress: 0,
  };

  htmlElements: HTMLDivElement[] = [];
  container: THREE.Group = new THREE.Group();

  sceneState = {
    phase: 0,
  };

  constructor() {
    this.setupRenderer();
    this.setupCamera();
    this.setupResize();
    this.addObjects();
    this.initSettings();
    this.setupHtmlElements();

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
    this.scene.add(this.container);

    this.onProgressChange(this.settings.progress);
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
    gui
      .add(this.settings, "progress", 0, 4, 0.01)
      .onChange((val: number) => this.onProgressChange(val));
  }

  onProgressChange(val: number) {
    if (val <= 1) {
      this.sceneState.phase = 0;
      this.settings.midPlatformY = platform.gap * Math.max(0.15, 1 - val);
    }

    if (val > 0.95) {
      this.sceneState.phase = 1;

      this.revealUpperMidPlatform();
      this.updateRootPlatformColors();
      this.updateMidPlatformColors();
    }

    if (val > 1) {
      this.sceneState.phase = 2;

      this.settings.upperMidPlatformY =
        (platform.gap + 5) * Math.max(0.25, 1 - (val - 1));
    }

    if (val > 1.9) {
      this.sceneState.phase = 3;
      this.updateUpperMidPlatformColors();
    }
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
    const dist = 6;
    this.camera.position.set(dist, dist - 2, dist);
    this.camera.zoom = 7;
    this.camera.lookAt(0, 0, 0);
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

  upperMidPlatform: THREE.Group = new THREE.Group();
  upperMidPlatformIsVisible = false;
  upperMidPlatformSphereGroup = new THREE.Group();
  upperMidPlatformSpheres: Array<{ delay: number; mesh: THREE.Mesh }> = [];

  upperPlatform: THREE.Group = new THREE.Group();

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

  // Root Platform
  addRootPlatform() {
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: colors.darkGray,
    });

    const plane = new THREE.Mesh(platformGeometry, planeMaterial);
    plane.rotation.x = degToRad(90);
    plane.scale.set(0.98, 0.98, 0.98);

    // Add border
    const edges = new THREE.EdgesGeometry(platformGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: colors.green,
      linejoin: "round",
      linewidth: 1,
    });
    const border = new THREE.LineSegments(edges, borderMaterial);
    border.position.set(0, 0, 0.05);
    border.rotation.x = degToRad(90);
    border.name = "borderMaterial";

    this.rootPlatform.add(plane);
    this.rootPlatform.add(border);
    this.container.add(this.rootPlatform);

    // Add dashed lines
    const dashGroup = new THREE.Group();
    this.rootPlatform.add(dashGroup);
    this.addVerticalLinesFromRootPlatform(dashGroup);
  }

  addRootPlatformSpheres(group: THREE.Group, args: { x: number; z: number }) {
    const sphere = new THREE.Mesh(
      rootPlatformSphereGeometry,
      rootPlatformCircleMaterial
    );
    sphere.name = "sphere";
    sphere.position.set(args.x, 0, args.z);
    this.rootPlatformSpheres.push({ mesh: sphere, delay: randIn(10, 500) });
    group.add(sphere);
  }

  moveRootPlatformSpheres() {
    if (this.sceneState.phase !== 0) return;

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

  updateRootPlatformColors() {
    getObjectsByProperty(this.rootPlatform, "name", "circleMaterial").forEach(
      (mesh) => {
        mesh.material.color.set(colors.lightGray);
      }
    );
    getObjectsByProperty(this.rootPlatform, "name", "sphere").forEach(
      (mesh) => {
        mesh.material.color.set(colors.lightGray);
      }
    );
    getObjectByName(this.rootPlatform, "borderMaterial").material.color.set(
      colors.darkGray
    );
  }

  addRootPlatformCircles(group: THREE.Group, args: { x: number; z: number }) {
    const spacing = platform.size / platform.numLines; // Space between lines

    for (let i = 0; i < platform.numLines; i++) {
      if (i === platform.numLines - 1) continue;

      const circle = new THREE.Mesh(
        rootPlatformCircleGeometry,
        rootPlatformCircleMaterial
      );
      circle.name = "circleMaterial";
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

      this.addRootPlatformCircles(group, { x: x1, z: z1 });
      this.addRootPlatformSpheres(group, { x: x1, z: z1 });
      this.addRootPlatformSpheres(group, { x: x2, z: z2 });
    }
  }

  // Mid Platform
  addMidPlatform() {
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: colors.darkGray,
    });

    const plane = new THREE.Mesh(platformGeometry, planeMaterial);
    plane.rotation.x = degToRad(90);
    plane.scale.set(0.98, 0.98, 0.98);

    // Add border
    const edges = new THREE.EdgesGeometry(platformGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: colors.black,
      linejoin: "round",
      linewidth: 1,
    });
    const border = new THREE.LineSegments(edges, borderMaterial);
    border.name = "borderMaterial";
    border.position.set(0, 0, 0.05);
    border.rotation.x = degToRad(90);

    this.midPlatform.position.y = this.settings.midPlatformY;
    this.midPlatform.add(plane);
    this.midPlatform.add(border);
    this.container.add(this.midPlatform);

    this.addMidPlatformDashedLines(this.midPlatform);
    this.addMidPlatformSquares(this.midPlatform);
  }

  addMidPlatformDashedLines(group: THREE.Group) {
    const spacing = platform.size / platform.numLines;
    const offsetY = 0.5;

    const material = dashedLineMaterialBlack.clone();

    for (let i = 0; i < platform.numLines; i++) {
      if (i === 0) continue;

      const x1 = -platform.size / 2 + i * spacing;
      const z1 = platform.size / 2;

      const x2 = platform.size / 2;
      const z2 = -platform.size / 2 + i * spacing;

      const line1 = this.addDashedLine(
        group,
        { x: x1, y: offsetY, z: z1 },
        { x: x1, y: offsetY, z: z1 - platform.size },
        { material }
      );
      line1.name = "dashedLine";

      const line2 = this.addDashedLine(
        group,
        { x: x2, y: offsetY, z: z2 },
        { x: x2 - platform.size, y: offsetY, z: z2 },
        { material }
      );
      line2.name = "dashedLine";
    }
  }

  updateMidPlatformColors() {
    getObjectsByProperty(this.midPlatform, "name", "square").forEach((mesh) => {
      mesh.material.color.set(colors.yellow);
    });
    getObjectsByProperty(this.midPlatform, "name", "borderMaterial").forEach(
      (mesh) => {
        mesh.material.color.set(colors.yellow);
      }
    );
    getObjectsByProperty(this.midPlatform, "name", "dashedLine").forEach(
      (mesh) => {
        mesh.material.linewidth = 0.3;
        mesh.material.color.set(colors.yellow);
      }
    );
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
      square.name = "square";
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
      const pos = mesh.position
        .clone()
        .add(this.midPlatform.position)
        .add(this.container.position);

      // Project to normalized device coordinates (NDC)
      pos.project(this.camera);

      // Convert NDC to screen coordinates
      const x = (pos.x * 0.5 + 0.5) * this.width;
      const y = (1 - (pos.y * 0.5 + 0.5)) * this.height;

      // Position the HTML element
      el.setAttribute("data-phase", this.sceneState.phase.toString());
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

  // Upper Mid Platform
  addUpperMidPlatform() {
    const platformGroup = new THREE.Group();
    platformGroup.name = "platformGroup";

    const planeMaterial = new THREE.MeshBasicMaterial({
      color: colors.darkGray,
      transparent: true,
      opacity: 0,
    });

    const plane = new THREE.Mesh(platformGeometry, planeMaterial);
    plane.name = "planeMaterial";
    plane.rotation.x = degToRad(90);
    plane.scale.set(0.98, 0.98, 0.98);

    // Add border
    const edges = new THREE.EdgesGeometry(platformGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: colors.black,
      linejoin: "round",
      linewidth: 1,
      transparent: true,
      opacity: 0,
    });
    const border = new THREE.LineSegments(edges, borderMaterial);
    border.name = "borderMaterial";
    border.position.set(0, 0, 0.05);
    border.rotation.x = degToRad(90);

    platformGroup.add(plane);
    platformGroup.add(border);
    platformGroup.position.y = this.settings.upperMidPlatformY;

    this.upperMidPlatform.add(platformGroup);
    this.upperMidPlatform.add(this.upperMidPlatformSphereGroup);
    this.container.add(this.upperMidPlatform);

    this.addUpperMidPlatformSpheres(this.upperMidPlatformSphereGroup);
    this.addMidPlatformDashedLines(platformGroup);
    this.addMidPlatformSquares(platformGroup);
  }

  addUpperMidPlatformSpheres(group: THREE.Group) {
    this.upperMidPlatformSphereGroup.rotation.y = degToRad(45);

    upperMidPlatformSpheres.map((v) => {
      const sphere = new THREE.Mesh(
        upperMidPlatformSphereGeometry,
        upperMidPlatformSphereMaterial
      );
      sphere.position.copy(v);
      sphere.name = "sphere";
      sphere.material.transparent = true;
      sphere.material.opacity = 0;
      this.upperMidPlatformSpheres.push({
        mesh: sphere,
        delay: randIn(0, 100),
      });
      group.add(sphere);
    });
  }

  revealUpperMidPlatform() {
    if (this.upperMidPlatformIsVisible) return;
    this.upperMidPlatformIsVisible = true;

    getObjectByName(
      this.upperMidPlatform,
      "planeMaterial"
    ).material.opacity = 1;
    getObjectByName(
      this.upperMidPlatform,
      "borderMaterial"
    ).material.opacity = 1;
    getObjectByName(this.upperMidPlatform, "sphere").material.opacity = 1;
    getObjectByName(this.upperPlatform, "planeMaterial").material.opacity = 1;
    getObjectByName(this.upperPlatform, "borderMaterial").material.opacity = 1;
  }

  moveUpperMidPlatform() {
    getObjectByName(this.upperMidPlatform, "platformGroup").position.y =
      this.settings.upperMidPlatformY;
  }

  moveUpperMidPlatformSpheres() {
    if (this.sceneState.phase === 0) return;

    if (this.sceneState.phase === 3) {
      for (const sphere of this.upperMidPlatformSpheres) {
        sphere.mesh.position.y = 8;
      }
      return;
    }

    for (const sphere of this.upperMidPlatformSpheres) {
      if (sphere.delay) {
        sphere.delay--;
        continue;
      }

      if (sphere.mesh.position.y > this.settings.upperMidPlatformY - 3) {
        sphere.mesh.position.y = 5;
      } else {
        sphere.mesh.position.y += 0.1;
      }
    }
  }

  updateUpperMidPlatformColors() {
    getObjectsByProperty(this.upperMidPlatform, "name", "square").forEach(
      (mesh) => {
        mesh.material.color.set(colors.yellow);
      }
    );
    getObjectsByProperty(this.upperMidPlatform, "name", "dashedLine").forEach(
      (mesh) => {
        mesh.material.color.set(colors.yellow);
        mesh.material.linewidth = 0.3;
      }
    );
    getObjectByName(this.upperMidPlatform, "borderMaterial").material.color.set(
      colors.yellow
    );

    // make mid platform gray
    getObjectsByProperty(this.midPlatform, "name", "dashedLine").forEach(
      (mesh) => {
        mesh.material.color.set(colors.lightGray);
        mesh.material.linewidth = 0.5;
      }
    );
    getObjectByName(this.midPlatform, "borderMaterial").material.color.set(
      colors.black
    );
  }

  // Upper Platform
  addUpperPlatform() {
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: colors.darkGray,
      transparent: true,
      opacity: 0,
    });

    const plane = new THREE.Mesh(platformGeometry, planeMaterial);
    plane.name = "planeMaterial";
    plane.rotation.x = degToRad(90);
    plane.scale.set(0.98, 0.98, 0.98);

    // Add border
    const edges = new THREE.EdgesGeometry(platformGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: colors.black,
      linejoin: "round",
      linewidth: 1,
      transparent: true,
      opacity: 0,
    });
    const border = new THREE.LineSegments(edges, borderMaterial);
    border.name = "borderMaterial";
    border.position.set(0, 0, 0.05);
    border.rotation.x = degToRad(90);

    this.upperPlatform.position.y = platform.gap + 10;

    this.upperPlatform.add(plane);
    this.upperPlatform.add(border);
    this.container.add(this.upperPlatform);
  }

  addObjects() {
    this.container.position.y = -platform.topOffset;

    this.addRootPlatform();
    this.addMidPlatform();
    this.addUpperMidPlatform();
    //this.addUpperPlatform();
  }

  clock = new THREE.Clock();

  render() {
    const elapsedTime = this.clock.getElapsedTime();

    this.controls?.update();

    this.moveRootPlatformSpheres();
    this.moveMidPlatform();
    this.moveUpperMidPlatform();
    this.moveUpperMidPlatformSpheres();
    this.updateHtmlElementPositions();

    // Render
    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

let myScene = new MyScene();
myScene.render();
