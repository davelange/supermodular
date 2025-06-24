import * as THREE from "three";

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
