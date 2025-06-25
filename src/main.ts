import * as THREE from "three";
import {
  Line2,
  LineGeometry,
  LineMaterial,
} from "three/examples/jsm/Addons.js";
import type { LineMaterial as FatLineMaterial } from "three-fatline";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { degToRad } from "three/src/math/MathUtils.js";

// Constants moved from constants.ts
export const colors = {
  green: "#b8ff9e",
  yellow: "#F6FF9A",
  darkGray: "#191919",
  black: "#020202",
  lightGray: "#6b6b6b",
};

export const platform = {
  gap: 50,
  size: 70,
  numLines: 14,
  topOffset: 30,
};

export const dashedLineMaterial = new LineMaterial({
  color: colors.lightGray as any as number,
  linewidth: 1, // px
  resolution: new THREE.Vector2(640, 480), // resolution of the viewport
  dashed: true,
  dashScale: 1,
  dashSize: 1,
  gapSize: 1,
});

export const dashedLineMaterialBlack = new LineMaterial({
  color: colors.black as any as number,
  linewidth: 1, // px
  resolution: new THREE.Vector2(640, 480), // resolution of the viewport
  dashed: true,
  dashScale: 1,
  dashSize: 1,
  gapSize: 1,
});

export const platformGeometry = new THREE.BoxGeometry(
  platform.size,
  platform.size,
  0.5
);
export const rootPlatformCircleGeometry = new THREE.CircleGeometry(0.5, 16);
export const rootPlatformCircleMaterial = new THREE.MeshBasicMaterial({
  color: colors.green,
});
export const rootPlatformSphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
export const rootPlatformSphereMaterial = new THREE.MeshBasicMaterial({
  color: colors.green,
});
export const upperMidPlatformSphereGeometry = new THREE.SphereGeometry(
  1.8,
  16,
  16
);
export const upperMidPlatformSphereMaterial = new THREE.MeshBasicMaterial({
  color: colors.yellow,
});

export const upperMidPlatformSpheres = [
  new THREE.Vector3(-30, 5, 10),
  new THREE.Vector3(-20, 5, 20),
  new THREE.Vector3(-15, 5, -15),
  new THREE.Vector3(-25, 5, 15),

  new THREE.Vector3(30, 5, 10),
  new THREE.Vector3(20, 5, 20),
  new THREE.Vector3(15, 5, -15),
  new THREE.Vector3(25, 5, 15),
];

export const rootSquarePositions = [
  { x: -20, z: -20 },
  { x: 0, z: -20 },
  { x: 20, z: -20 },
  { x: -20, z: 0 },
  { x: -20, z: 20 },
  { x: 15, z: 15 },
];

const lineDist = 20;
export const upperMidSquarePositions = [
  {
    position: { x: -15, z: -15 },
    lineDirection: new THREE.Vector3(0, 0, -lineDist),
  },
  {
    position: { x: -15, z: 15 },
    lineDirection: new THREE.Vector3(-lineDist, 0, 0),
  },
  {
    position: { x: 15, z: -15 },
    lineDirection: new THREE.Vector3(lineDist, 0, 0),
  },
  {
    position: { x: 15, z: 15 },
    lineDirection: new THREE.Vector3(lineDist, 0, 0),
  },
];

export const dashedLineMaterialSolid = new LineMaterial({
  color: colors.yellow as any as number,
  linewidth: 1, // px
  resolution: new THREE.Vector2(640, 480), // resolution of the viewport
  dashed: false,
  transparent: true,
  opacity: 0,
});

export const upperSquarePositions = [
  { x: -15, z: 15 },
  { x: 15, z: -15 },
  { x: 15, z: 15 },
];

export const plat1Labels = [
  {
    label: "Objectives",
    subKeywords: ["OKR", "Business Outcome"],
    icon: "label_objectives.svg",
    align: "right",
  },
  {
    label: "architecture",
    subKeywords: ["Solution Patterns", "Governance"],
    icon: "label_arch.svg",
    align: "left",
  },
  {
    label: "security",
    subKeywords: ["Dependencies", "Cost", "Compliance"],
    icon: "label_security.svg",
    align: "left",
  },
  {
    label: "technology stack",
    subKeywords: ["Cloud Platforms", "Enterprise Systems", "API's", "Tools"],
    icon: "label_tech.svg",
    align: "right",
  },
  {
    label: "project management",
    subKeywords: ["Methodologies,", "Frameworks"],
    icon: "label_proj.svg",
    align: "right",
  },
  {
    label: "organization",
    subKeywords: ["Teams", "Roles", "Ownership"],
    icon: "label_org.svg",
    align: "left",
  },
];

export const plat2Labels = [
  {
    label: "Agentic system A",
    subKeywords: ["Compliance"],
    icon: "label_security.svg",
  },
  {
    label: "Agentic system B",
    subKeywords: ["Quality Control"],
    icon: "label_security.svg",
  },
  {
    label: "Agentic system C",
    subKeywords: ["IT Architecture"],
    icon: "label_security.svg",
  },
  {
    label: "Agentic system D",
    subKeywords: ["Project Manager"],
    icon: "label_security.svg",
  },
];

export const plat3Labels = [
  {
    label: "Solution 1",
    icon: "solution1.png",
    align: "left",
    subKeywords: ["Compliance"],
  },
  {
    label: "Solution 2",
    icon: "solution2.png",
    align: "left",
    subKeywords: ["Compliance"],
  },
  {
    label: "Solution 3",
    icon: "solution3.png",
    align: "left",
    subKeywords: ["Compliance"],
  },
];

// Utils moved from utils.ts
/**
 * Returns a random number between min and max (inclusive)
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A random number between min and max
 */
export function randIn(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type GetObjectReturnType = {
  mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  group: THREE.Group;
};

export function getObjectByName<T extends keyof GetObjectReturnType = "mesh">(
  group: THREE.Group,
  name: string
) {
  return group.getObjectByName(name) as GetObjectReturnType[T];
}

export function getObjectsByProperty<
  T extends keyof GetObjectReturnType = "mesh"
>(group: THREE.Group, name: string, value: string) {
  return group.getObjectsByProperty(
    name,
    value
  ) as unknown as GetObjectReturnType[T][];
}

export function createExpandableLabel({
  label,
  phase,
  subKeywords,
  icon,
  align,
  alt = false,
  onClick,
}: {
  label: string;
  phase: number;
  subKeywords: string[];
  icon: string;
  align: string;
  alt?: boolean;
  onClick: (e: MouseEvent & { currentTarget: HTMLDivElement }) => void;
}) {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("data-platform", phase.toString());
  el.classList.add("label", alt ? "alt" : "normal");

  const innerEl = document.createElement("div");
  innerEl.classList.add("inner");

  const titleEl = document.createElement("div");
  titleEl.classList.add("title-wrapper", align);
  const titleElText = document.createElement("p");
  titleElText.classList.add("title", align);
  titleElText.textContent = label;
  titleEl.appendChild(titleElText);
  innerEl.appendChild(titleEl);

  const eyeElWrapper = document.createElement("div");
  eyeElWrapper.classList.add("eye-wrapper");

  const eyeEl = document.createElement("img");
  eyeEl.classList.add("eye");
  eyeEl.src = "assets/eye.svg";
  eyeElWrapper.appendChild(eyeEl);

  const xEl = document.createElement("img");
  xEl.classList.add("cross");
  xEl.src = "assets/add.svg";
  eyeElWrapper.appendChild(xEl);

  titleElText.appendChild(eyeElWrapper);

  if (subKeywords.length) {
    for (const subKeyword of subKeywords) {
      const subKeywordEl = document.createElement("p");
      subKeywordEl.classList.add("sub-keyword", "title", align);
      subKeywordEl.textContent = subKeyword;
      titleEl.appendChild(subKeywordEl);
    }
    //innerEl.appendChild(subKeywordsEl);
  }

  const iconContainer = document.createElement("div");
  iconContainer.classList.add("icon-container");
  const iconEl = document.createElement("img");
  iconEl.src = `assets/${icon}`;
  iconContainer.appendChild(iconEl);
  innerEl.appendChild(iconContainer);

  el.appendChild(innerEl);

  el.addEventListener("click", onClick);

  return el;
}

class MyScene {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
  camera = new THREE.OrthographicCamera();

  width = window.innerWidth;
  height = window.innerHeight;

  stats = new Stats();

  mouse = new THREE.Vector2(0, 0);
  prevMouse = new THREE.Vector2(0, 0);
  settings: Record<string, any> = {
    midPlatformY: platform.gap,
    upperMidPlatformY: platform.gap,
    upperPlatformY: platform.gap + 10,
    progress: 0,
  };

  previousProgress = 0;
  targetProgress = 0;
  scrollSmoothness = 0.05;

  htmlElementsContainer: HTMLDivElement = document.querySelector(
    "[data-js='scene-label-container']"
  ) as HTMLDivElement;

  activeLabel = -1;
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

    // Initialize target progress to match current progress
    this.targetProgress = this.settings.progress;
    this.onProgressChange(this.settings.progress);
  }

  setupHtmlElements() {
    const onClick = (e: MouseEvent & { currentTarget: HTMLDivElement }) => {
      if (e.currentTarget.classList.contains("active")) {
        e.currentTarget.classList.remove("active");
        this.htmlElementsContainer.classList.remove("focused");
        return;
      }

      this.htmlElementsContainer.classList.add("focused");
      for (const child of this.htmlElementsContainer.childNodes) {
        if (child !== e.currentTarget) {
          (child as HTMLDivElement).classList.remove("active");
        }
      }
      e.currentTarget?.classList.toggle("active");
    };

    for (const label of plat1Labels) {
      const el = createExpandableLabel({
        label: label.label,
        phase: 1,
        subKeywords: label.subKeywords,
        icon: label.icon,
        align: label.align || "right",
        onClick,
      });
      this.htmlElementsContainer.appendChild(el);
      this.htmlElementsRoot.push(el);
    }

    for (const label of plat2Labels) {
      const el = createExpandableLabel({
        label: label.label,
        phase: 2,
        subKeywords: label.subKeywords,
        icon: label.icon,
        align: label.align || "right",
        onClick,
      });
      this.htmlElementsContainer.appendChild(el);
      this.htmlElementsUpperMid.push(el);
    }

    for (const label of plat3Labels) {
      const el = createExpandableLabel({
        label: label.label,
        phase: 3,
        subKeywords: [],
        icon: label.icon,
        align: label.align || "right",
        alt: true,
        onClick,
      });
      this.htmlElementsContainer.appendChild(el);
      this.htmlElementsUpper.push(el);
    }
  }

  toggleHtmlElementsEnable() {
    this.htmlElementsContainer.classList.add("enabled");
  }

  initSettings() {
    // Add mouse scroll
    window.addEventListener("wheel", (event) => {
      event.preventDefault();

      // Adjust scroll sensitivity based on device type
      let scrollDelta: number;
      if (this.width < 768) {
        // Mobile devices - more sensitive
        scrollDelta = event.deltaY > 0 ? 0.15 : -0.15;
      } else if (this.width < 1024) {
        // Tablet devices - medium sensitivity
        scrollDelta = event.deltaY > 0 ? 0.12 : -0.12;
      } else {
        // Desktop devices - standard sensitivity
        scrollDelta = event.deltaY > 0 ? 0.1 : -0.1;
      }

      this.targetProgress = Math.max(
        0,
        Math.min(4, this.targetProgress + scrollDelta)
      );
    });
    this.setupTouchEvents();
  }

  setupTouchEvents() {
    let touchStartY = 0;
    let touchStartProgress = 0;

    window.addEventListener(
      "touchstart",
      (event) => {
        event.preventDefault();
        touchStartY = event.touches[0].clientY;
        touchStartProgress = this.targetProgress;
      },
      { passive: false }
    );

    window.addEventListener(
      "touchmove",
      (event) => {
        event.preventDefault();
        const touchY = event.touches[0].clientY;
        const deltaY = touchStartY - touchY;

        let sensitivity: number;
        if (this.width < 768) {
          sensitivity = 2.5;
        } else if (this.width < 1024) {
          sensitivity = 2.0;
        } else {
          sensitivity = 1.5;
        }

        const progressDelta = (deltaY / this.height) * sensitivity;

        this.targetProgress = Math.max(
          0,
          Math.min(4, touchStartProgress + progressDelta)
        );
      },
      { passive: false }
    );

    window.addEventListener(
      "touchend",
      (event) => {
        event.preventDefault();
      },
      { passive: false }
    );
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

    if (progress > 2.9) {
      if (this.sceneState.phase !== 4) {
        this.sceneState.phase = 4;
        this.htmlElementsContainer.setAttribute("data-phase", "4");
        this.updateUpperPlatformColors();
      }
    } else if (progress > 1.9) {
      this.settings.upperPlatformY =
        (platform.gap + 5) * Math.max(0.38, 1 - (progress - 2));

      if (this.sceneState.phase !== 3) {
        this.sceneState.phase = 3;
        this.htmlElementsContainer.setAttribute("data-phase", "3");
        this.updateUpperMidPlatformColors();

        this.revealUpperPlatform();
      }
    } else if (progress > 1) {
      this.settings.upperMidPlatformY =
        (platform.gap + 5) * Math.max(0.25, 1 - (progress - 1));

      if (this.sceneState.phase !== 2) {
        this.sceneState.phase = 2;
        this.htmlElementsContainer.setAttribute("data-phase", "2");

        this.toggleHtmlElementsEnable();
      }
    } else if (progress > 0.95 && this.sceneState.phase !== 1) {
      this.sceneState.phase = 1;
      this.htmlElementsContainer.setAttribute("data-phase", "1");
      this.revealUpperMidPlatform();
      this.updateRootPlatformColors();
      this.updateMidPlatformColors();

      this.toggleHtmlElementsEnable();
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
    this.updateCameraFrustum();
    const dist = 6;
    this.camera.position.set(dist, dist - 2, dist);

    // Adjust zoom based on screen size for better mobile/tablet experience
    if (this.width < 768) {
      // Mobile devices
      this.camera.zoom = 5;
    } else if (this.width < 1024) {
      // Tablet devices
      this.camera.zoom = 6;
    } else {
      // Desktop devices
      this.camera.zoom = 7;
    }

    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }

  updateCameraFrustum() {
    const frustrum = this.height;
    const aspect = this.width / this.height;
    this.camera.left = (frustrum * aspect) / -2;
    this.camera.right = (frustrum * aspect) / 2;
    this.camera.top = frustrum / 2;
    this.camera.bottom = frustrum / -2;
    this.camera.near = -1000;
    this.camera.far = 1000;
  }

  setupResize() {
    window.addEventListener("resize", () => {
      // Update sizes
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      // Update camera frustum and projection matrix
      this.updateCameraFrustum();

      // Adjust zoom based on new screen size
      if (this.width < 768) {
        // Mobile devices
        this.camera.zoom = 5;
      } else if (this.width < 1024) {
        // Tablet devices
        this.camera.zoom = 6;
      } else {
        // Desktop devices
        this.camera.zoom = 7;
      }

      this.camera.updateProjectionMatrix();

      // Update renderer
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Handle orientation changes on mobile devices
    window.addEventListener("orientationchange", () => {
      // Add a small delay to ensure the orientation change is complete
      setTimeout(() => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.updateCameraFrustum();

        // Adjust zoom based on new screen size
        if (this.width < 768) {
          this.camera.zoom = 5;
        } else if (this.width < 1024) {
          this.camera.zoom = 6;
        } else {
          this.camera.zoom = 7;
        }

        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
      }, 100);
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
  rootPlatformSpheres: Array<{
    delay: number;
    mesh: THREE.Mesh;
    speed?: number;
  }> = [];
  rootPlatformLines: Array<{ mesh: Line2; startY: THREE.Vector3 }> = [];

  midPlatform: THREE.Group = new THREE.Group();
  midPlatformSquares: Array<THREE.Mesh> = [];

  upperMidPlatform: THREE.Group = new THREE.Group();
  upperMidPlatformIsVisible = false;
  upperMidPlatformSphereGroup = new THREE.Group();
  upperMidPlatformSpheres: Array<{
    delay: number;
    mesh: THREE.Mesh;
    speed?: number;
  }> = [];

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

      // Random vertical speed for each sphere
      const speed = sphere.speed || Math.random() * 0.15 + 0.05; // 0.05 to 0.2
      sphere.speed = speed;

      if (sphere.mesh.position.y > this.settings.midPlatformY - 1) {
        sphere.mesh.position.y = 0;
        // New random delay
        sphere.delay = Math.floor(Math.random() * 200) + 50;
      } else {
        sphere.mesh.position.y += speed;
      }
    }
  }

  updateRootPlatformColors() {
    for (const mesh of getObjectsByProperty(
      this.rootPlatform,
      "name",
      "circleMaterial"
    )) {
      mesh.material.color.set(colors.lightGray);
    }
    for (const mesh of getObjectsByProperty(
      this.rootPlatform,
      "name",
      "sphere"
    )) {
      mesh.material.color.set(colors.lightGray);
    }
    getObjectByName(this.rootPlatform, "borderMaterial").material.color.set(
      colors.darkGray
    );
  }

  hideRootPlatformColors() {
    for (const mesh of getObjectsByProperty(
      this.rootPlatform,
      "name",
      "circleMaterial"
    )) {
      mesh.material.color.set(colors.green);
    }
    for (const mesh of getObjectsByProperty(
      this.rootPlatform,
      "name",
      "sphere"
    )) {
      mesh.material.color.set(colors.green);
    }
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
    for (const mesh of getObjectsByProperty(
      this.midPlatform,
      "name",
      "square"
    )) {
      mesh.material.color.set(colors.yellow);
    }
    for (const mesh of getObjectsByProperty(
      this.midPlatform,
      "name",
      "borderMaterial"
    )) {
      mesh.material.color.set(colors.yellow);
    }
    for (const mesh of getObjectsByProperty(
      this.midPlatform,
      "name",
      "dashedLine"
    )) {
      (mesh.material as any).linewidth = 0.3;
      mesh.material.color.set(colors.yellow);
    }
  }

  hideMidPlatformColors() {
    for (const mesh of getObjectsByProperty(
      this.midPlatform,
      "name",
      "square"
    )) {
      mesh.material.color.set(colors.black);
    }
    for (const mesh of getObjectsByProperty(
      this.midPlatform,
      "name",
      "borderMaterial"
    )) {
      mesh.material.color.set(colors.black);
    }
    for (const mesh of getObjectsByProperty(
      this.midPlatform,
      "name",
      "dashedLine"
    )) {
      (mesh.material as any).linewidth = 1;
      mesh.material.color.set(colors.black);
    }
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

      // Random vertical speed for each sphere
      const speed = sphere.speed || Math.random() * 0.12 + 0.03; // 0.03 to 0.15
      sphere.speed = speed;

      if (sphere.mesh.position.y > this.settings.upperMidPlatformY - 3) {
        sphere.mesh.position.y = 5;
        // New random delay
        sphere.delay = Math.floor(Math.random() * 150) + 30;
      } else {
        sphere.mesh.position.y += speed;
      }
    }
  }

  updateUpperMidPlatformColors() {
    for (const mesh of getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "square"
    )) {
      mesh.material.color.set(colors.yellow);
    }
    for (const mesh of getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "dashedLine"
    )) {
      (mesh.material as any).linewidth = 0.3;
      mesh.material.color.set(colors.yellow);
    }
    getObjectByName(this.upperMidPlatform, "borderMaterial").material.color.set(
      colors.yellow
    );
    for (const mesh of getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "lineFromSquare"
    )) {
      mesh.material.color.set(colors.yellow);
      mesh.material.opacity = 1;
    }
    for (const mesh of getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "lineFromSquareVertical"
    )) {
      mesh.material.color.set(colors.yellow);
      mesh.material.opacity = 1;
    }

    // make mid platform gray
    for (const mesh of getObjectsByProperty(
      this.midPlatform,
      "name",
      "dashedLine"
    )) {
      (mesh.material as any).linewidth = 0.5;
      mesh.material.color.set(colors.lightGray);
    }
    getObjectByName(this.midPlatform, "borderMaterial").material.color.set(
      colors.black
    );
  }

  hideUpperMidPlatformColors() {
    for (const mesh of getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "square"
    )) {
      mesh.material.color.set(colors.black);
    }
    for (const mesh of getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "dashedLine"
    )) {
      (mesh.material as any).linewidth = 1;
      mesh.material.color.set(colors.black);
    }
    getObjectByName(this.upperMidPlatform, "borderMaterial").material.color.set(
      colors.black
    );
    for (const mesh of getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "lineFromSquare"
    )) {
      mesh.material.color.set(colors.yellow);
      mesh.material.opacity = 0;
    }
    for (const mesh of getObjectsByProperty(
      this.upperMidPlatform,
      "name",
      "lineFromSquareVertical"
    )) {
      mesh.material.color.set(colors.yellow);
      mesh.material.opacity = 0;
    }

    // restore mid platform colors
    for (const mesh of getObjectsByProperty(
      this.midPlatform,
      "name",
      "dashedLine"
    )) {
      (mesh.material as any).linewidth = 1;
      mesh.material.color.set(colors.black);
    }
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
    for (const mesh of getObjectsByProperty(
      this.upperPlatform,
      "name",
      "square"
    )) {
      mesh.material.opacity = 1;
    }
  }

  hideUpperPlatform() {
    getObjectByName(this.upperPlatform, "planeMaterial").material.opacity = 0;
    getObjectByName(this.upperPlatform, "borderMaterial").material.opacity = 0;
    for (const mesh of getObjectsByProperty(
      this.upperPlatform,
      "name",
      "square"
    )) {
      mesh.material.opacity = 0;
    }
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

    // Smooth scroll interpolation
    if (Math.abs(this.settings.progress - this.targetProgress) > 0.001) {
      this.settings.progress +=
        (this.targetProgress - this.settings.progress) * this.scrollSmoothness;
      this.onProgressChange(this.settings.progress);
    }

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
