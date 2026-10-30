import * as THREE from "three";
import { TweenMax, Power2 } from "gsap";

const palettes = {
  home: { clear: 0x041c16, fog: 0x08251a },
  science: { clear: 0x17140e, fog: 0x21180f },
  field: { clear: 0x071b15, fog: 0x0d2418 },
  result: { clear: 0x17120c, fog: 0x281b0d },
};

export class CornWorld {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.gammaOutput = true;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x08251a, 0.045);
    this.camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0.35, 10.7);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.currentVisual = "corn";
    this.time = 0;
    this.pointer = new THREE.Vector2();
    this.buildLights();
    this.buildAmbientParticles();
    this.visuals = {
      corn: this.buildCorn(),
      helix: this.buildHelix(),
      field: this.buildField(),
      plant: this.buildCorn({ close: true }),
      kernels: this.buildKernels(),
    };
    Object.keys(this.visuals).forEach((key) => {
      this.visuals[key].visible = false;
      this.root.add(this.visuals[key]);
    });
    this.bindPointer();
    this.animate();
  }

  buildLights() {
    const ambient = new THREE.AmbientLight(0x8cae8c, 0.47);
    const key = new THREE.DirectionalLight(0xf9d997, 0.84);
    key.position.set(-3.8, 5, 5);
    const rim = new THREE.DirectionalLight(0x3bbd98, 1.05);
    rim.position.set(4, 0, -4);
    const fill = new THREE.PointLight(0xe2a73d, 0.42, 14);
    fill.position.set(1.4, 2, 4.2);
    this.scene.add(ambient, key, rim, fill);
  }

  buildAmbientParticles() {
    const count = 1150;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < count; i += 1) {
      const radius = 3.1 + Math.random() * 8.5;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7 - 2;
      color.setHSL(0.23 + Math.random() * 0.14, 0.42 + Math.random() * 0.34, 0.3 + Math.random() * 0.43);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({ size: 0.026, vertexColors: THREE.VertexColors, transparent: true, opacity: 0.7, sizeAttenuation: true, depthWrite: false });
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  buildCorn({ close = false } = {}) {
    const group = new THREE.Group();
    const size = close ? 1.3 : 0.86;
    group.scale.set(size, size, size);
    group.position.set(close ? 2.25 : 0.15, close ? -0.05 : -0.48, close ? -0.3 : 0);

    const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x35683b, specular: 0x718e59, shininess: 22 });
    const stem = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.11, 0.22, 5.8, 14, 8), stemMaterial);
    stem.position.y = -0.6;
    group.add(stem);

    const leafColors = [0x285a31, 0x3f7138, 0x537f42, 0x254c2c];
    const leafPositions = [
      [-0.03, 0.2, 0.05, -1], [0.05, -0.65, 0.08, 1], [-0.04, -1.45, 0.03, -1], [0.05, -2.15, 0.1, 1],
      [0.03, 0.75, -0.02, 1], [-0.05, -0.25, -0.02, -1], [0.04, -1.0, -0.06, 1],
    ];
    leafPositions.forEach(([x, y, z, direction], index) => {
      const leaf = this.makeLeaf(2.35 + Math.random() * 0.45, 0.34, leafColors[index % leafColors.length]);
      leaf.position.set(x, y, z);
      leaf.rotation.y = direction * (0.2 + Math.random() * 0.25);
      leaf.rotation.z = direction * (0.13 + Math.random() * 0.26);
      group.add(leaf);
    });

    const ear = new THREE.Group();
    ear.position.set(0.42, 1.25, 0.09);
    ear.rotation.z = -0.12;
    const points = [
      new THREE.Vector2(0, -1.05), new THREE.Vector2(0.16, -0.89), new THREE.Vector2(0.36, -0.45),
      new THREE.Vector2(0.42, 0.06), new THREE.Vector2(0.31, 0.57), new THREE.Vector2(0.12, 0.96), new THREE.Vector2(0, 1.13),
    ];
    const cob = new THREE.Mesh(new THREE.LatheBufferGeometry(points, 28), new THREE.MeshPhongMaterial({ color: 0xca9d42, specular: 0xe8c878, shininess: 30 }));
    ear.add(cob);
    const kernelMaterial = new THREE.MeshPhongMaterial({ color: 0xe1b656, specular: 0xffdf8f, shininess: 34 });
    const kernelGeometry = new THREE.SphereBufferGeometry(0.047, 8, 7);
    for (let row = 0; row < 17; row += 1) {
      const y = -0.82 + row * 0.102;
      const width = 0.18 + 0.23 * Math.sin((row / 17) * Math.PI);
      for (let col = 0; col < 8; col += 1) {
        const angle = (col / 8) * Math.PI * 2;
        const kernel = new THREE.Mesh(kernelGeometry, kernelMaterial);
        kernel.position.set(Math.cos(angle) * width, y, Math.sin(angle) * width);
        kernel.scale.set(0.94, 1, 0.54);
        ear.add(kernel);
      }
    }
    const silk = this.makeLeaf(0.55, 0.12, 0x9a9a56);
    silk.position.y = 1.1;
    silk.rotation.x = 0.8;
    ear.add(silk);
    group.add(ear);

    const huskA = this.makeLeaf(1.65, 0.42, 0x365e30);
    huskA.position.set(0.2, 0.18, 0.1);
    huskA.rotation.z = 0.34;
    huskA.rotation.y = -0.14;
    const huskB = this.makeLeaf(1.82, 0.38, 0x567a36);
    huskB.position.set(0.32, 0.12, 0.07);
    huskB.rotation.z = -0.39;
    huskB.rotation.y = 0.22;
    group.add(huskA, huskB);
    return group;
  }

  makeLeaf(length, width, color) {
    const segments = 24;
    const across = 6;
    const vertices = [];
    const indices = [];
    for (let i = 0; i <= segments; i += 1) {
      const u = i / segments;
      const taper = Math.pow(Math.sin(Math.PI * u), 0.72);
      const bladeWidth = Math.max(0.006, width * taper);
      const rise = Math.sin(u * Math.PI) * 0.2 + u * 0.12;
      for (let j = 0; j <= across; j += 1) {
        const v = j / across * 2 - 1;
        const ridge = (1 - Math.abs(v)) * 0.075;
        vertices.push(u * length, rise + ridge, v * bladeWidth);
        if (i < segments && j < across) {
          const a = i * (across + 1) + j;
          const b = a + across + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const material = new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide, specular: 0x63894a, shininess: 24 });
    const leaf = new THREE.Mesh(geometry, material);
    leaf.rotation.y = -0.18;
    return leaf;
  }

  buildHelix() {
    const group = new THREE.Group();
    group.position.set(0.15, -0.08, -0.4);
    const count = 1180;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const strand = new Float32Array(count * 3);
    const total = count / 2;
    const gold = new THREE.Color(0xd79a4f);
    const teal = new THREE.Color(0x43b79a);
    for (let i = 0; i < total; i += 1) {
      const t = i / total;
      const angle = t * Math.PI * 13;
      const y = (t - 0.5) * 7.7;
      const radius = 1.15 + Math.sin(t * Math.PI) * 0.18;
      const offset = i * 3;
      positions[offset] = Math.cos(angle) * radius;
      positions[offset + 1] = y;
      positions[offset + 2] = Math.sin(angle) * radius;
      colors[offset] = gold.r; colors[offset + 1] = gold.g; colors[offset + 2] = gold.b;
      const second = total + i;
      const secondOffset = second * 3;
      positions[secondOffset] = Math.cos(angle + Math.PI) * radius;
      positions[secondOffset + 1] = y;
      positions[secondOffset + 2] = Math.sin(angle + Math.PI) * radius;
      colors[secondOffset] = teal.r; colors[secondOffset + 1] = teal.g; colors[secondOffset + 2] = teal.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.034, vertexColors: THREE.VertexColors, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false }));
    group.add(points);
    const rungs = new THREE.Group();
    const rungMaterial = new THREE.LineBasicMaterial({ color: 0x87816a, transparent: true, opacity: 0.3 });
    for (let i = 0; i < 34; i += 1) {
      const t = i / 34;
      const angle = t * Math.PI * 13;
      const y = (t - 0.5) * 7.7;
      const radius = 1.15 + Math.sin(t * Math.PI) * 0.18;
      const a = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      const b = new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
      const rungGeometry = new THREE.Geometry();
      rungGeometry.vertices.push(a, b);
      rungs.add(new THREE.Line(rungGeometry, rungMaterial));
    }
    group.add(rungs);
    return group;
  }

  buildField() {
    const group = new THREE.Group();
    group.position.set(0, -1.7, -1.9);
    const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x244a29, transparent: true, opacity: 0.9 });
    const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x4c7435, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const rowCount = 12;
    const plantCount = 11;
    for (let row = 0; row < rowCount; row += 1) {
      const depth = row / rowCount;
      const z = -depth * 7.5;
      const spread = 2.3 + depth * 6.3;
      const height = 0.9 + depth * 2.15;
      for (let col = 0; col < plantCount; col += 1) {
        const x = (col / (plantCount - 1) - 0.5) * spread;
        const sway = Math.sin(col * 12.3 + row * 4.2) * 0.05;
        const stem = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.018 + depth * 0.02, 0.025 + depth * 0.025, height, 5), stemMaterial);
        stem.position.set(x, height / 2 - 0.2, z);
        stem.rotation.z = sway;
        group.add(stem);
        for (let side = 0; side < 2; side += 1) {
          const length = 0.38 + depth * 0.85;
          const leafGeo = new THREE.BufferGeometry();
          const leafPoints = [0,0,0, length,0.05,0, length * 0.72,0.28 + depth * 0.18,0.035, 0,0,0, length * 0.72,0.28 + depth * 0.18,0.035, 0.04,0.06,0.11];
          leafGeo.addAttribute("position", new THREE.Float32BufferAttribute(leafPoints, 3));
          leafGeo.computeVertexNormals();
          const leaf = new THREE.Mesh(leafGeo, leafMaterial);
          leaf.position.set(x, -0.15 + height * (0.35 + side * 0.32), z);
          leaf.rotation.y = (side ? -1 : 1) * (0.25 + col * 0.07);
          leaf.rotation.z = side ? -0.2 : 0.21;
          group.add(leaf);
        }
      }
    }
    return group;
  }

  buildKernels() {
    const group = new THREE.Group();
    group.position.set(0.1, 0.1, -0.3);
    const count = 320;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const gold = new THREE.Color(0xdca847);
    const pale = new THREE.Color(0xf4d38a);
    for (let i = 0; i < count; i += 1) {
      const t = i / count;
      const angle = t * Math.PI * 21;
      const radius = 0.5 + t * 3.1;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (t - 0.5) * 6.5 + Math.sin(angle * 2) * 0.18;
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.28;
      const color = i % 4 ? gold : pale;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3));
    group.add(new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.095, vertexColors: THREE.VertexColors, transparent: true, opacity: 0.9, sizeAttenuation: true })));
    return group;
  }

  bindPointer() {
    window.addEventListener("pointermove", (event) => {
      this.pointer.x = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      this.pointer.y = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    }, { passive: true });
  }

  setScene(name, { condition = "wind", instant = false } = {}) {
    const target = this.visuals[name] || this.visuals.corn;
    const palette = name === "helix" ? palettes.science : name === "kernels" ? palettes.result : name === "field" || name === "plant" ? palettes.field : palettes.home;
    this.scene.fog.color.setHex(palette.fog);
    this.scene.fog.density = name === "field" ? 0.058 : 0.045;
    this.particles.material.opacity = name === "field" ? 0.27 : 0.7;
    this.visuals.plant.position.x = condition === "drought" ? 2.05 : 2.25;
    this.visuals.plant.rotation.z = condition === "wind" ? -0.04 : 0;
    if (target === this.activeGroup) return;
    const previous = this.activeGroup;
    if (previous) {
      if (instant) previous.visible = false;
      else TweenMax.to(previous.scale, 0.48, { x: 0.82, y: 0.82, z: 0.82, ease: Power2.easeIn, onComplete: () => { previous.visible = false; } });
    }
    target.visible = true;
    if (instant) target.scale.set(1, 1, 1);
    else {
      target.scale.set(0.84, 0.84, 0.84);
      TweenMax.to(target.scale, 0.85, { x: 1, y: 1, z: 1, ease: Power2.easeOut });
    }
    this.activeGroup = target;
    if (name === "helix") {
      target.position.x = 0.12;
      target.position.y = -0.12;
    } else if (name === "corn") {
      target.rotation.set(0, 0, 0);
      target.position.set(0.1, -0.48, 0);
    } else if (name === "field") {
      target.position.set(0, -1.7, -1.9);
    }
  }

  resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    this.renderer.setSize(width, height, false);
  }

  animate() {
    this.frame = requestAnimationFrame(() => this.animate());
    this.time += 0.01;
    this.root.rotation.y += (this.pointer.x * 0.06 - this.root.rotation.y) * 0.018;
    this.root.rotation.x += (-this.pointer.y * 0.025 - this.root.rotation.x) * 0.016;
    this.particles.rotation.y = Math.sin(this.time * 0.14) * 0.035;
    if (this.activeGroup) {
      if (this.activeGroup === this.visuals.helix) this.activeGroup.rotation.y += 0.0018;
      else if (this.activeGroup === this.visuals.kernels) this.activeGroup.rotation.y += 0.0022;
      else if (this.activeGroup === this.visuals.corn || this.activeGroup === this.visuals.plant) this.activeGroup.rotation.z = Math.sin(this.time * 0.32) * 0.012;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
