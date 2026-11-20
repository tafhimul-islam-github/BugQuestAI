import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface ThreeSandboxSculptureProps {
  /** Active pipeline stage index (0..5) */
  stageIndex: number;
  /** Hex accent color for the active stage */
  accentHex: string;
  /** Target Y rotation in radians driven by scroll or stage selection */
  targetRotationY: number;
  /** Target X rotation in radians */
  targetRotationX?: number;
  /** Callback when user clicks the 3D sculpture to advance stage */
  onCycleStage?: () => void;
}

/**
 * Precision Three.js Architectural Wireframe Polyhedron & Orbital Telemetry Assembly.
 * Inspired by high-craft developer observability visualizers, tuned for a crisp light studio canvas:
 * - Nested wireframe cube + inner wireframe icosahedron + translucent glass core
 * - Dual concentric dashed orbital tick rings with orbiting satellite nodes
 * - Smooth real-time stage color morphing (Cyan/Cobalt -> Indigo -> Coral -> Violet -> Teal -> Emerald)
 * - Container-aware ResizeObserver, DPR capped at 2, IntersectionObserver offscreen pause, full GPU dispose
 */
export const ThreeSandboxSculpture: React.FC<ThreeSandboxSculptureProps> = ({
  stageIndex,
  accentHex,
  targetRotationY,
  targetRotationX = 0.32,
  onCycleStage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const targetRotYRef = useRef(targetRotationY);
  const targetRotXRef = useRef(targetRotationX);
  const targetColorRef = useRef(new THREE.Color(accentHex));
  const stageIndexRef = useRef(stageIndex);

  useEffect(() => {
    targetRotYRef.current = targetRotationY;
  }, [targetRotationY]);

  useEffect(() => {
    targetRotXRef.current = targetRotationX;
  }, [targetRotationX]);

  useEffect(() => {
    targetColorRef.current.set(accentHex);
    stageIndexRef.current = stageIndex;
  }, [accentHex, stageIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    THREE.ColorManagement.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const initW = Math.max(container.clientWidth, 280);
    const initH = Math.max(container.clientHeight, 260);
    renderer.setSize(initW, initH, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, initW / initH, 0.1, 100);
    camera.position.set(0, 0.1, 6.4);

    // Root assembly
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Outer Precision Wireframe Cube (razor-sharp edges)
    const outerBoxGeo = new THREE.BoxGeometry(1.92, 1.92, 1.92);
    const outerEdgesGeo = new THREE.EdgesGeometry(outerBoxGeo);
    const outerEdgesMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(accentHex),
      transparent: true,
      opacity: 0.85,
    });
    const outerCubeWire = new THREE.LineSegments(outerEdgesGeo, outerEdgesMat);
    rootGroup.add(outerCubeWire);

    // Subtle frosted translucent inner tint faces
    const outerTintMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentHex),
      transparent: true,
      opacity: 0.045,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const outerCubeFill = new THREE.Mesh(outerBoxGeo, outerTintMat);
    rootGroup.add(outerCubeFill);

    // 2. Corner Vertex Accent Dots (8 crisp vertices on the cube)
    const vertexGeo = new THREE.SphereGeometry(0.048, 14, 14);
    const vertexMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentHex),
    });
    const half = 0.96;
    const cornerPositions = [
      [-half, -half, -half],
      [half, -half, -half],
      [-half, half, -half],
      [half, half, -half],
      [-half, -half, half],
      [half, -half, half],
      [-half, half, half],
      [half, half, half],
    ];
    cornerPositions.forEach(([cx, cy, cz]) => {
      const dot = new THREE.Mesh(vertexGeo, vertexMat);
      dot.position.set(cx, cy, cz);
      outerCubeWire.add(dot);
    });

    // 3. Inner Nested Wireframe Icosahedron (counter-rotating core)
    const innerIcoGeo = new THREE.IcosahedronGeometry(0.82, 0);
    const innerEdgesGeo = new THREE.EdgesGeometry(innerIcoGeo);
    const innerEdgesMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(accentHex),
      transparent: true,
      opacity: 0.9,
    });
    const innerPoly = new THREE.LineSegments(innerEdgesGeo, innerEdgesMat);
    rootGroup.add(innerPoly);

    const innerFillMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentHex),
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    const innerPolyFill = new THREE.Mesh(innerIcoGeo, innerFillMat);
    innerPoly.add(innerPolyFill);

    // 4. Concentric Dashed Orbital Ring 1 (Primary tilted halo)
    const createOrbitRing = (radius: number, segments: number, dashed: boolean) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      if (dashed) {
        const mat = new THREE.LineDashedMaterial({
          color: new THREE.Color(accentHex),
          dashSize: 0.14,
          gapSize: 0.11,
          transparent: true,
          opacity: 0.55,
        });
        const line = new THREE.Line(geo, mat);
        line.computeLineDistances();
        return { line, geo, mat };
      }
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(accentHex),
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(geo, mat);
      return { line, geo, mat };
    };

    const orbit1 = createOrbitRing(1.72, 128, true);
    orbit1.line.rotation.x = Math.PI / 2.75;
    orbit1.line.rotation.y = 0.25;
    rootGroup.add(orbit1.line);

    const orbit2 = createOrbitRing(2.08, 128, false);
    orbit2.line.rotation.x = -Math.PI / 3.1;
    orbit2.line.rotation.z = 0.45;
    rootGroup.add(orbit2.line);

    // 5. Precision Tick Marks around Outer Ring (Instrument dial feel)
    const tickPts: THREE.Vector3[] = [];
    const tickCount = 48;
    for (let i = 0; i < tickCount; i++) {
      const a = (i / tickCount) * Math.PI * 2;
      const rIn = i % 4 === 0 ? 1.98 : 2.02;
      const rOut = 2.08;
      tickPts.push(new THREE.Vector3(Math.cos(a) * rIn, Math.sin(a) * rIn, 0));
      tickPts.push(new THREE.Vector3(Math.cos(a) * rOut, Math.sin(a) * rOut, 0));
    }
    const ticksGeo = new THREE.BufferGeometry().setFromPoints(tickPts);
    const ticksMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(accentHex),
      transparent: true,
      opacity: 0.42,
    });
    const tickSegments = new THREE.LineSegments(ticksGeo, ticksMat);
    orbit2.line.add(tickSegments);

    // 6. 3 Orbiting Satellite Telemetry Nodes on Orbit 1
    const satGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const satMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(accentHex) });
    for (let i = 0; i < 3; i++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      const a = (i / 3) * Math.PI * 2;
      sat.position.set(Math.cos(a) * 1.72, Math.sin(a) * 1.72, 0);
      orbit1.line.add(sat);
    }

    // 7. Interactive Drag-to-Orbit + Hover Parallax
    let isDragging = false;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let dragDeltaY = 0;
    let dragDeltaX = 0;
    let dragMovedDist = 0;
    let hoverX = 0;
    let hoverY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      dragMovedDist = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      hoverX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.28;
      hoverY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.22;

      if (!isDragging) return;
      const dx = e.clientX - prevPointerX;
      const dy = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      dragMovedDist += Math.hypot(dx, dy);
      dragDeltaY += dx * 0.0095;
      dragDeltaX = THREE.MathUtils.clamp(dragDeltaX + dy * 0.007, -0.75, 0.75);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        // already released
      }
      const totalMove = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      if (totalMove < 6 && dragMovedDist < 8 && onCycleStage) {
        onCycleStage();
      }
    };

    const onPointerLeave = () => {
      hoverX = 0;
      hoverY = 0;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = Math.max(Math.floor(entry.contentRect.width), 1);
      const height = Math.max(Math.floor(entry.contentRect.height), 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    });
    ro.observe(container);

    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    io.observe(container);

    let rafId = 0;
    const clock = new THREE.Clock();
    const currentColor = new THREE.Color(accentHex);

    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      if (!isVisible) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Smoothly morph semantic stage color across all wireframe & orbital elements
      currentColor.lerp(targetColorRef.current, Math.min(dt * 6, 1));
      outerEdgesMat.color.copy(currentColor);
      outerTintMat.color.copy(currentColor);
      vertexMat.color.copy(currentColor);
      innerEdgesMat.color.copy(currentColor);
      innerFillMat.color.copy(currentColor);
      orbit1.mat.color.copy(currentColor);
      orbit2.mat.color.copy(currentColor);
      ticksMat.color.copy(currentColor);
      satMat.color.copy(currentColor);

      if (!isDragging) {
        dragDeltaY = THREE.MathUtils.lerp(dragDeltaY, 0, Math.min(dt * 1.8, 1));
        dragDeltaX = THREE.MathUtils.lerp(dragDeltaX, 0, Math.min(dt * 1.8, 1));
      }

      const desiredY = targetRotYRef.current + dragDeltaY + hoverX;
      const desiredX = targetRotXRef.current + dragDeltaX + hoverY;

      rootGroup.rotation.y = THREE.MathUtils.lerp(rootGroup.rotation.y, desiredY, Math.min(dt * 6.5, 1));
      rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, desiredX, Math.min(dt * 6.5, 1));

      if (!prefersReducedMotion) {
        rootGroup.position.y = Math.sin(elapsed * 1.4) * 0.07;
        innerPoly.rotation.y = -elapsed * 0.52;
        innerPoly.rotation.x = elapsed * 0.34;
        orbit1.line.rotation.z = elapsed * 0.25;
        orbit2.line.rotation.z = -elapsed * 0.18;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);

      outerBoxGeo.dispose();
      outerEdgesGeo.dispose();
      outerEdgesMat.dispose();
      outerTintMat.dispose();
      vertexGeo.dispose();
      vertexMat.dispose();
      innerIcoGeo.dispose();
      innerEdgesGeo.dispose();
      innerEdgesMat.dispose();
      innerFillMat.dispose();
      orbit1.geo.dispose();
      orbit1.mat.dispose();
      orbit2.geo.dispose();
      orbit2.mat.dispose();
      ticksGeo.dispose();
      ticksMat.dispose();
      satGeo.dispose();
      satMat.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglUnavailable) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-3xl bg-slate-50 border border-slate-200">
        <span className="font-mono text-xs text-slate-500">Interactive 3D Visualizer</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Interactive 3D wireframe architecture polyhedron. Drag to orbit or click to advance stage."
      className="w-full h-full cursor-grab active:cursor-grabbing touch-pan-y"
    />
  );
};

export default ThreeSandboxSculpture;
