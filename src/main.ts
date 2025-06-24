import * as THREE from "three";
import {
  Line2,
  LineGeometry,
  LineMaterial,
  OrbitControls,
} from "three/examples/jsm/Addons.js";
import { LineMaterial as FatLineMaterial } from "three-fatline";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { degToRad } from "three/src/math/MathUtils.js";
import {
  colors,
  dashedLineMaterial,
  dashedLineMaterialBlack,
  dashedLineMaterialSolid,
  platform,
  platformGeometry,
  rootPlatformCircleGeometry,
  rootPlatformCircleMaterial,
  rootPlatformSphereGeometry,
  rootSquarePositions,
  upperMidPlatformSphereGeometry,
  upperMidPlatformSphereMaterial,
  upperMidPlatformSpheres,
  upperMidSquarePositions,
  upperSquarePositions,
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
    upperPlatformY: platform.gap + 10,
    progress: 0,
  };

  previousProgress = 0;

  htmlElementsContainer: HTMLDivElement = document.querySelector(
    ".square-label-container"
  ) as HTMLDivElement;

  htmlElementsRoot: Array<HTMLDivElement> = [];
  htmlElementsUpperMid: Array<HTMLDivElement> = [];
  htmlElementsUpper: Array<HTMLDivElement> = [];

  // The allfather group
  container: THREE.Group = new THREE.Group();

  sceneState = {
    phase: -1,
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
    let els = document.querySelectorAll(".square-label.root");
    for (const el of els) {
      this.htmlElementsRoot.push(el as HTMLDivElement);
    }

    els = document.querySelectorAll(".square-label.upper-mid");
    for (const el of els) {
      this.htmlElementsUpperMid.push(el as HTMLDivElement);
    }

    els = document.querySelectorAll(".square-label.upper");
    for (const el of els) {
      this.htmlElementsUpper.push(el as HTMLDivElement);
    }
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

    // Add mouse scroll event listener for progress control
    window.addEventListener("wheel", (event) => {
      event.preventDefault();
      const scrollDelta = event.deltaY > 0 ? 0.1 : -0.1;
      this.settings.progress = Math.max(
        0,
        Math.min(4, this.settings.progress + scrollDelta)
      );
      this.onProgressChange(this.settings.progress);
    });
  }

  onProgressChange(progress: number) {
    // const isForward = progress > this.previousProgress;
    const isReverse = progress < this.previousProgress;

    // reverse animation for 4 -> 3
    if (isReverse && progress <= 2.9 && this.sceneState.phase === 4) {
      this.sceneState.phase = 3;
      this.htmlElementsContainer.setAttribute("data-phase", "3");
      this.hideUpperPlatformColors();
    }

    // reverse animation for 3 -> 2
    if (isReverse && progress <= 1.9 && this.sceneState.phase === 3) {
      this.sceneState.phase = 2;
      this.htmlElementsContainer.setAttribute("data-phase", "2");
      this.hideUpperPlatform();
      this.hideUpperMidPlatformColors();
    }

    // reverse animation for 2 -> 1
    if (isReverse && progress <= 1 && this.sceneState.phase === 2) {
      this.sceneState.phase = 1;
      this.htmlElementsContainer.setAttribute("data-phase", "1");
    }

    // reverse animation for 1 -> 0
    if (isReverse && progress <= 0.95 && this.sceneState.phase === 1) {
      this.sceneState.phase = 0;
      this.htmlElementsContainer.setAttribute("data-phase", "0");
      this.hideUpperMidPlatform();
      this.hideRootPlatformColors();
      this.hideMidPlatformColors();
    }

    // animation logic
    if (progress <= 1) {
      this.sceneState.phase = 0;
      this.settings.midPlatformY = platform.gap * Math.max(0.15, 1 - progress);

      if (this.sceneState.phase !== 0) {
        this.htmlElementsContainer.setAttribute("data-phase", "0");
      }
    }

    if (progress > 0.95 && this.sceneState.phase !== 1) {
      this.sceneState.phase = 1;
      this.htmlElementsContainer.setAttribute("data-phase", "1");
      this.revealUpperMidPlatform();
      this.updateRootPlatformColors();
      this.updateMidPlatformColors();
    }

    if (progress > 1) {
      this.settings.upperMidPlatformY =
        (platform.gap + 5) * Math.max(0.25, 1 - (progress - 1));

      if (this.sceneState.phase !== 2) {
        this.sceneState.phase = 2;
        this.htmlElementsContainer.setAttribute("data-phase", "2");
      }
    }

    if (progress > 1.9) {
      this.settings.upperPlatformY =
        (platform.gap + 5) * Math.max(0.38, 1 - (progress - 2));

      if (this.sceneState.phase !== 3) {
        this.sceneState.phase = 3;
        this.htmlElementsContainer.setAttribute("data-phase", "3");
        this.updateUpperMidPlatformColors();
        this.revealUpperPlatform();
      }
    }

    if (progress > 2.9) {
      if (this.sceneState.phase !== 4) {
        this.sceneState.phase = 4;
        this.htmlElementsContainer.setAttribute("data-phase", "4");
        this.updateUpperPlatformColors();
      }
    }

    this.previousProgress = progress;
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
  upperPlatformVerticalLines: Array<{ mesh: Line2; startPos: THREE.Vector3 }> =
    [];

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

  hideRootPlatformColors() {
    getObjectsByProperty(this.rootPlatform, "name", "circleMaterial").forEach(
      (mesh) => {
        mesh.material.color.set(colors.green);
      }
    );
    getObjectsByProperty(this.rootPlatform, "name", "sphere").forEach(
      (mesh) => {
        mesh.material.color.set(colors.green);
      }
    );
    getObjectByName(this.rootPlatform, "borderMaterial").material.color.set(
      colors.green
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
    const upperPlatformY = this.settings.upperMidPlatformY;

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

  hideMidPlatformColors() {
    getObjectsByProperty(this.midPlatform, "name", "square").forEach((mesh) => {
      mesh.material.color.set(colors.black);
    });
    getObjectsByProperty(this.midPlatform, "name", "borderMaterial").forEach(
      (mesh) => {
        mesh.material.color.set(colors.black);
      }
    );
    getObjectsByProperty(this.midPlatform, "name", "dashedLine").forEach(
      (mesh) => {
        mesh.material.linewidth = 1;
        mesh.material.color.set(colors.black);
      }
    );
  }

  addMidPlatformSquares(group: THREE.Group) {
    const squareSize = 5;

    const geometry = new THREE.PlaneGeometry(squareSize, squareSize);
    const material = new THREE.MeshBasicMaterial({
      color: colors.black,
      side: THREE.DoubleSide,
    });

    rootSquarePositions.map((pos) => {
      const square = new THREE.Mesh(geometry, material);
      square.position.set(pos.x, 0.5, pos.z);
      square.rotation.x = degToRad(90);
      square.name = "square";
      this.midPlatformSquares.push(square);
      group.add(square);
    });
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
    this.addUpperMidPlatformSquares(platformGroup);
  }

  addUpperMidPlatformSquares(group: THREE.Group) {
    const squareSize = 5;

    const geometry = new THREE.PlaneGeometry(squareSize, squareSize);
    const material = new THREE.MeshBasicMaterial({
      color: colors.black,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });

    upperMidSquarePositions.map(({ position, lineDirection }) => {
      const square = new THREE.Mesh(geometry, material);
      square.position.set(position.x, 0.5, position.z);
      square.rotation.x = degToRad(90);
      square.name = "square";
      this.midPlatformSquares.push(square);

      const line = this.addDashedLine(
        group,
        square.position,
        square.position.clone().add(lineDirection),
        { material: dashedLineMaterialSolid }
      );
      line.name = "lineFromSquare";

      const lineVertical = this.addDashedLine(
        group,
        square.position.clone().add(lineDirection),
        square.position
          .clone()
          .add(lineDirection)
          .add(new THREE.Vector3(0, this.settings.upperPlatformY, 0)),
        { material: dashedLineMaterialSolid }
      );
      line.name = "lineFromSquare";
      lineVertical.name = "lineFromSquareVertical";

      this.upperPlatformVerticalLines.push({
        mesh: lineVertical,
        startPos: square.position.clone().add(lineDirection),
      });

      group.add(square);
    });
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
    getObjectByName(this.upperMidPlatform, "square").material.opacity = 1;
  }

  hideUpperMidPlatform() {
    if (!this.upperMidPlatformIsVisible) return;
    this.upperMidPlatformIsVisible = false;

    getObjectByName(
      this.upperMidPlatform,
      "planeMaterial"
    ).material.opacity = 0;
    getObjectByName(
      this.upperMidPlatform,
      "borderMaterial"
    ).material.opacity = 0;
    getObjectByName(this.upperMidPlatform, "sphere").material.opacity = 0;
    getObjectByName(this.upperMidPlatform, "square").material.opacity = 0;
  }

  moveUpperMidPlatform() {
    getObjectByName(this.upperMidPlatform, "platformGroup").position.y =
      this.settings.upperMidPlatformY;
  }

  moveUpperMidPlatformSpheres() {
    if (this.sceneState.phase === 0 || this.sceneState.phase === 4) return;

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
    getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "lineFromSquare"
    ).forEach((mesh) => {
      mesh.material.color.set(colors.yellow);
      mesh.material.opacity = 1;
    });
    getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "lineFromSquareVertical"
    ).forEach((mesh) => {
      mesh.material.color.set(colors.yellow);
      mesh.material.opacity = 1;
    });

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

  hideUpperMidPlatformColors() {
    getObjectsByProperty(this.upperMidPlatform, "name", "square").forEach(
      (mesh) => {
        mesh.material.color.set(colors.black);
      }
    );
    getObjectsByProperty(this.upperMidPlatform, "name", "dashedLine").forEach(
      (mesh) => {
        mesh.material.color.set(colors.black);
        mesh.material.linewidth = 1;
      }
    );
    getObjectByName(this.upperMidPlatform, "borderMaterial").material.color.set(
      colors.black
    );
    getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "lineFromSquare"
    ).forEach((mesh) => {
      mesh.material.color.set(colors.yellow);
      mesh.material.opacity = 0;
    });
    getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "lineFromSquareVertical"
    ).forEach((mesh) => {
      mesh.material.color.set(colors.yellow);
      mesh.material.opacity = 0;
    });

    // restore mid platform colors
    getObjectsByProperty(this.midPlatform, "name", "dashedLine").forEach(
      (mesh) => {
        mesh.material.color.set(colors.black);
        mesh.material.linewidth = 1;
      }
    );
    getObjectByName(this.midPlatform, "borderMaterial").material.color.set(
      colors.black
    );
  }

  moveUpperPlatformVerticalLines() {
    this.upperPlatformVerticalLines.map((line) => {
      line.mesh.geometry.setFromPoints([
        line.startPos,
        line.startPos.clone().setY(this.settings.upperPlatformY - 15),
      ]);
      line.mesh.computeLineDistances();
    });
  }

  // Upper Platform
  addUpperPlatform() {
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

    this.upperPlatform.position.y = this.settings.upperPlatformY;

    this.upperPlatform.add(plane);
    this.upperPlatform.add(border);
    this.addUpperPlatformSquares(this.upperPlatform);
    this.addUpperPlatformLines(this.upperPlatform);
    this.container.add(this.upperPlatform);
  }

  addUpperPlatformSquares(group: THREE.Group) {
    const squareSize = 5;

    const geometry = new THREE.PlaneGeometry(squareSize, squareSize);
    const material = new THREE.MeshBasicMaterial({
      color: colors.black,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });

    upperSquarePositions.map((pos) => {
      const square = new THREE.Mesh(geometry, material);
      square.position.set(pos.x, 0.5, pos.z);
      square.rotation.x = degToRad(90);
      square.name = "square";
      group.add(square);
    });
  }

  addUpperPlatformLines(group: THREE.Group) {
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

  // Reveal Upper Platform
  revealUpperPlatform() {
    getObjectByName(this.upperPlatform, "planeMaterial").material.opacity = 1;
    getObjectByName(this.upperPlatform, "borderMaterial").material.opacity = 1;
    getObjectsByProperty(this.upperPlatform, "name", "square").forEach(
      (mesh) => {
        mesh.material.opacity = 1;
      }
    );
  }

  hideUpperPlatform() {
    getObjectByName(this.upperPlatform, "planeMaterial").material.opacity = 0;
    getObjectByName(this.upperPlatform, "borderMaterial").material.opacity = 0;
    getObjectsByProperty(this.upperPlatform, "name", "square").forEach(
      (mesh) => {
        mesh.material.opacity = 0;
      }
    );
  }

  updateUpperPlatformColors() {
    getObjectByName(this.upperPlatform, "borderMaterial").material.color.set(
      colors.yellow
    );

    const dashedLine = getObjectByName(this.upperPlatform, "dashedLine");
    dashedLine.material.color.set(colors.yellow);
    dashedLine.material.linewidth = 0.3;

    getObjectByName(this.upperPlatform, "square").material.color.set(
      colors.yellow
    );

    getObjectByName(this.upperMidPlatform, "borderMaterial").material.color.set(
      colors.black
    );
    getObjectByName(this.upperMidPlatform, "dashedLine").material.color.set(
      colors.lightGray
    );
  }

  hideUpperPlatformColors() {
    getObjectByName(this.upperPlatform, "borderMaterial").material.color.set(
      colors.black
    );

    const dashedLine = getObjectByName(this.upperPlatform, "dashedLine");
    dashedLine.material.color.set(colors.black);
    dashedLine.material.linewidth = 1;

    getObjectByName(this.upperPlatform, "square").material.color.set(
      colors.black
    );

    getObjectByName(this.upperMidPlatform, "borderMaterial").material.color.set(
      colors.yellow
    );
    getObjectByName(this.upperMidPlatform, "dashedLine").material.color.set(
      colors.yellow
    );
  }

  moveUpperPlatform() {
    this.upperPlatform.position.y = this.settings.upperPlatformY;
  }

  // html
  updateHtmlElementPositions() {
    const updateElements = (
      meshes: Array<THREE.Mesh>,
      els: Array<HTMLDivElement>,
      reference: THREE.Group
    ) => {
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        const el = els[i];
        if (!mesh || !el) continue;

        // Get the 3D position of the mesh
        const pos = mesh.position
          .clone()
          .add(this.container.position)
          .add(reference.position);

        // Project to normalized device coordinates (NDC)
        pos.project(this.camera);

        // Convert NDC to screen coordinates
        const x = (pos.x * 0.5 + 0.5) * this.width;
        const y = (1 - (pos.y * 0.5 + 0.5)) * this.height;

        // Position the HTML element
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        el.style.opacity = "1";
      }
    };

    updateElements(
      this.midPlatformSquares,
      this.htmlElementsRoot,
      this.midPlatform
    );

    updateElements(
      getObjectsByProperty(this.upperMidPlatform, "name", "square"),
      this.htmlElementsUpperMid,
      getObjectByName<"group">(this.upperMidPlatform, "platformGroup")
    );

    updateElements(
      getObjectsByProperty(this.upperPlatform, "name", "square"),
      this.htmlElementsUpper,
      this.upperPlatform
    );
  }

  addObjects() {
    this.container.position.y = -platform.topOffset;

    this.addRootPlatform();
    this.addMidPlatform();
    this.addUpperMidPlatform();
    this.addUpperPlatform();
  }

  clock = new THREE.Clock();

  render() {
    //const elapsedTime = this.clock.getElapsedTime();

    this.controls?.update();

    this.moveRootPlatformSpheres();
    this.moveMidPlatform();
    this.moveUpperMidPlatform();
    this.moveUpperMidPlatformSpheres();
    this.moveUpperPlatform();
    this.moveUpperPlatformVerticalLines();
    this.updateHtmlElementPositions();

    // Render
    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

let myScene = new MyScene();
myScene.render();
