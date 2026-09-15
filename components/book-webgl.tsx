"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import gsap from "gsap";
import * as THREE from "three";

import { backTexture, pageTexture, spineTexture } from "./book-textures";

/* Trade hardback proportions, in world units. The front cover art is 2:3, so
   width:height is fixed at 1:1.5 and only the depth is a judgement call —
   0.4 against a width of 2 is a ~1.2in spine on a 6in book. */
const W = 2;
const H = 3;
const D = 0.4;

/** Case board thickness, and how far the boards overhang the text block. */
const BOARD = 0.035;
const SQUARE = 0.045;

/* Resting pose in radians. Positive Y swings the right edge away and brings the
   spine forward; negative X drops the top edge back so we look slightly down
   and the head of the page block grazes into view. */
const REST_Y = 0.4;
const REST_X = -0.09;

/** Pitch ceiling. Past ~30deg the book reads as a floating slab, not a book. */
const PITCH = 0.55;

/** Radians of rotation per pixel dragged. */
const SPEED = 0.0075;

/**
 * Fraction of the canvas height the book's height fills. The canvas has to
 * overhang the flat cover it replaces — perspective magnifies the near corner of
 * a book mid-spin well past the cover box — so the framing is locked to this
 * instead of to the container. That is what makes the crossfade land: the WebGL
 * book comes up at the same on-screen size as the still it takes over from.
 */
const FILL = 0.74;

/* Half the extra canvas, as a fraction of the cover box. Aspect is preserved, so
   one figure is correct on both axes. book-3d.tsx reserves the matching room —
   it deliberately does not import this, because a static import of this module
   would pull three.js into the first chunk and undo the lazy load. */
const OVERHANG = `${(((1 / FILL - 1) / 2) * 100).toFixed(1)}%`;

/** Quiet time before the book eases back into a composed pose. */
const IDLE_MS = 2200;

const TAU = Math.PI * 2;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/**
 * Nearest yaw that reads as a deliberate three-quarter pose — front or back,
 * whichever the reader left closer. Snapping to the closest one, rather than
 * always unwinding to the front, is what lets the idle return tidy the pose up
 * without undoing a reader who turned the book over on purpose.
 */
function nearestPose(y: number) {
  let best = y;
  let bestDistance = Infinity;
  for (const offset of [REST_Y, Math.PI - REST_Y]) {
    const candidate = offset + TAU * Math.round((y - offset) / TAU);
    const distance = Math.abs(y - candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
}

type Tuning = {
  hemi: THREE.HemisphereLight;
  fill: THREE.DirectionalLight;
  invalidate: () => void;
};

interface BookWebGLProps {
  /** Fires true once the first frame is on screen, false if the context dies. */
  onReady?: (ready: boolean) => void;
  className?: string;
}

export default function BookWebGL({ onReady, className }: BookWebGLProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const tuning = useRef<Tuning | null>(null);
  const reduceRef = useRef(false);
  /* The scene is built once, so it cannot close over a prop. Kept current
     through an effect rather than assigned in the render body, which would be a
     write during render. */
  const readyRef = useRef(onReady);

  const { resolvedTheme } = useTheme();

  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reduceRef.current = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      /* No WebGL. The shell never hears "ready", so its flat cover stays. */
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    /* No shadow map. The camera sits nearly level with the book, so a ground
       plane is seen at a grazing angle and its projected shadow stretches into a
       hard trapezoid off to one side — a slab, not contact. The book's contact
       shadow is a soft CSS ellipse in the shell instead, which also survives the
       crossfade and costs no depth pass. */
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    /* A long lens. Wide-angle perspective on an object this close reads as a
       cartoon; 26deg is roughly a product photographer's 85mm. */
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 40);
    camera.position.set(0, 0.34, 8);
    camera.lookAt(0, -0.04, 0);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x9c907e, 1.15);
    scene.add(hemi);

    /* Key from the upper right, because at rest the cover faces that way and
       the spine falls into its own shade — which is what separates the two
       planes on a book that is one flat cream all over. */
    const key = new THREE.DirectionalLight(0xfff7ec, 2.4);
    key.position.set(4, 5.2, 5);
    scene.add(key);

    /* Carries the far face. The key barely grazes the back board once the book
       is turned over — its normal points away from the key by then — so without a
       strong fill a flipped book reads grey instead of cream. This is deliberately
       stronger than a conventional fill ratio for exactly that reason: it lands
       mostly on whichever face the key has abandoned. */
    const fill = new THREE.DirectionalLight(0xdde7f4, 1.25);
    fill.position.set(-4.4, 1.1, 3.2);
    scene.add(fill);

    /* Grazes the fore-edge from behind so the page block separates from the
       board instead of merging into one cream mass. */
    const rim = new THREE.DirectionalLight(0xffffff, 0.5);
    rim.position.set(2.4, 1.6, -4.2);
    scene.add(rim);

    let disposed = false;
    const owned: { dispose: () => void }[] = [];

    const asTexture = (el: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(el);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      owned.push(t);
      return t;
    };

    const matte = (extra: THREE.MeshStandardMaterialParameters) => {
      const m = new THREE.MeshStandardMaterial({ metalness: 0, ...extra });
      owned.push(m);
      return m;
    };

    /* Cloth-wrapped board, a shade under the printed cream so the wrap reads as
       a different material from the paper it carries. */
    const caseMat = matte({ color: 0xefe3d3, roughness: 0.82 });
    const linerMat = matte({ color: 0xf2ebdf, roughness: 0.95 });
    /* Cream until the JPEG lands, so the first frame is never a white slab.
       The map multiplies by color, so the tint has to clear when it arrives. */
    const coverMat = matte({ color: 0xfaf1e9, roughness: 0.6 });
    const spineMat = matte({ color: 0xfaf1e9, roughness: 0.68 });
    const backMat = matte({ color: 0xfaf1e9, roughness: 0.62 });
    const foreMat = matte({ map: asTexture(pageTexture("vertical")), roughness: 0.9 });
    const headMat = matte({ map: asTexture(pageTexture("horizontal")), roughness: 0.9 });

    const board = new THREE.BoxGeometry(W, H, BOARD);
    const spineGeo = new THREE.BoxGeometry(BOARD, H, D);
    const blockGeo = new THREE.BoxGeometry(W - SQUARE - BOARD, H - 2 * SQUARE, D - 2 * BOARD);
    owned.push(board, spineGeo, blockGeo);

    /* BoxGeometry takes its six materials as [+x, -x, +y, -y, +z, -z]. */
    const front = new THREE.Mesh(board, [caseMat, caseMat, caseMat, caseMat, coverMat, linerMat]);
    front.position.z = D / 2 - BOARD / 2;

    const back = new THREE.Mesh(board, [caseMat, caseMat, caseMat, caseMat, linerMat, backMat]);
    back.position.z = -(D / 2 - BOARD / 2);

    const spine = new THREE.Mesh(spineGeo, [linerMat, spineMat, caseMat, caseMat, caseMat, caseMat]);
    spine.position.x = -(W / 2 - BOARD / 2);

    /* Text block, inset by the square on the three open edges and butted
       against the spine board, which is why its centre shifts off zero. */
    const block = new THREE.Mesh(blockGeo, [foreMat, linerMat, headMat, headMat, linerMat, linerMat]);
    block.position.x = (BOARD - SQUARE) / 2;

    const bookGroup = new THREE.Group();
    /* Yaw about world up, then pitch in the book's own frame — turntable order.
       The default XYZ would tilt the spin axis as soon as it is pitched. */
    bookGroup.rotation.order = "YXZ";
    for (const mesh of [front, back, spine, block]) bookGroup.add(mesh);
    scene.add(bookGroup);

    /* Under reduced motion there is no intro, so the book opens already posed.
       Otherwise it starts near flat-on to match the still cover the shell is
       crossfading out from, and the tween into the pose is the reveal. */
    const rot = { x: REST_X, y: reduceRef.current ? REST_Y : 0.02 };

    let frame = 0;
    const draw = () => {
      frame = 0;
      bookGroup.rotation.x = rot.x;
      bookGroup.rotation.y = rot.y;
      renderer.render(scene, camera);
    };
    /* Rendering is on demand. A hero that has finished settling should cost the
       GPU nothing, so there is no standing animation loop — every mutation
       coalesces into at most one frame. */
    const invalidate = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(draw);
    };
    tuning.current = { hemi, fill, invalidate };

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      /* Height-locked, so the book's size on screen is set by the cover it
         replaces rather than by the container's aspect. The width check only
         binds on a short or narrow box, and it measures the footprint diagonal
         because that — not the cover width — is the widest the book ever gets. */
      const half = Math.tan(((camera.fov * Math.PI) / 180) / 2);
      camera.position.z = Math.max(
        H / (2 * half * FILL),
        Math.hypot(W, D) / (2 * half * camera.aspect * 0.92)
      );
      camera.lookAt(0, -0.04, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      invalidate();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    /* Tidy the pose back up once the reader lets go, but to whichever face they
       left showing — snapping always to the front would undo a deliberate flip. */
    const idle = () => {
      clearTimeout(idleTimer);
      if (reduceRef.current) return;
      idleTimer = setTimeout(() => {
        gsap.to(rot, {
          x: REST_X,
          y: nearestPose(rot.y),
          duration: 1.25,
          ease: "power3.inOut",
          onUpdate: invalidate,
        });
      }, IDLE_MS);
    };

    let announced = false;
    const announce = () => {
      if (announced || disposed) return;
      announced = true;
      readyRef.current?.(true);
      if (reduceRef.current) return;
      gsap.to(rot, {
        y: REST_Y,
        duration: 1.35,
        ease: "power3.out",
        onUpdate: invalidate,
        onComplete: idle,
      });
    };

    /* The real printed cover. Ready is announced from here rather than on mount,
       so the shell never crossfades to a book whose face has not arrived. */
    new THREE.TextureLoader().load(
      "/images/the-new-way-of-work-cover.jpg",
      (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        owned.push(tex);
        coverMat.map = tex;
        coverMat.color.set(0xffffff);
        coverMat.needsUpdate = true;
        /* Render synchronously so the frame is in the buffer before the shell is
           told to start fading the flat cover out. */
        draw();
        requestAnimationFrame(announce);
      },
      undefined,
      /* Cover unreachable. A cream book is still better than no book, and the
         shell has already been told to hand over. */
      announce
    );

    /* Spine and back are set in the page's own Newsreader, so they wait for the
       webfont instead of baking a fallback serif into a canvas. */
    document.fonts.ready
      .then(() => {
        if (disposed) return;
        for (const [mat, tex] of [
          [spineMat, spineTexture()],
          [backMat, backTexture()],
        ] as const) {
          mat.map = asTexture(tex);
          mat.color.set(0xffffff);
          mat.needsUpdate = true;
        }
        invalidate();
      })
      .catch(() => {});

    /* Drag to rotate. Momentum on release, because a book you have shoved
       should keep going for a moment rather than stopping dead under your
       finger. */
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velX = 0;
    let velY = 0;
    let yawOnly = false;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      /* Touch and pen get yaw only. Vertical drag has to stay the page's, and
         touch-action cannot give back a gesture we have already consumed. */
      yawOnly = e.pointerType !== "mouse";
      lastX = e.clientX;
      lastY = e.clientY;
      velX = 0;
      velY = 0;
      gsap.killTweensOf(rot);
      clearTimeout(idleTimer);
      host.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      rot.y += dx * SPEED;
      /* Smoothed so the throw follows the arc of the drag rather than whatever
         single jittery event happened to land last. */
      velY = velY * 0.7 + dx * SPEED * 0.3;
      if (!yawOnly) {
        rot.x = clamp(rot.x + dy * SPEED, -PITCH, PITCH);
        velX = velX * 0.7 + dy * SPEED * 0.3;
      }
      invalidate();
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      const thrown = Math.abs(velY) > 0.012 || Math.abs(velX) > 0.012;
      if (reduceRef.current || !thrown) {
        idle();
        return;
      }
      gsap.to(rot, {
        y: rot.y + velY * 9,
        x: clamp(rot.x + velX * 9, -PITCH, PITCH),
        duration: 0.95,
        ease: "power2.out",
        onUpdate: invalidate,
        onComplete: idle,
      });
    };

    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);

    /* A lost context leaves a blank canvas, so hand the hero back to the flat
       cover. preventDefault is what allows a restore to be attempted at all. */
    const onLost = (e: Event) => {
      e.preventDefault();
      readyRef.current?.(false);
    };
    renderer.domElement.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      clearTimeout(idleTimer);
      gsap.killTweensOf(rot);
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      for (const item of owned) item.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      tuning.current = null;
    };
  }, []);

  useEffect(() => {
    const t = tuning.current;
    if (!t) return;
    const dark = resolvedTheme === "dark";
    /* The hemisphere drops on dark, otherwise a fully lit cream book floats on a
       near-black background like a cutout. The fill comes down with it and keeps
       the same ratio to the key, so a flipped book stays cream in both themes. */
    t.hemi.intensity = dark ? 0.78 : 1.15;
    t.fill.intensity = dark ? 0.85 : 1.25;
    t.invalidate();
  }, [resolvedTheme]);

  return (
    <div className={className}>
      {/* The canvas is decorative to assistive tech, and nothing here is the
          only route to any content: the flat cover <img> in the shell keeps its
          alt text through the crossfade, and the words the rotation uncovers —
          the spine's title and author, the back board's blurb — are already in
          the page as text. So turning the book is pointer-only by design, with
          no keyboard equivalent to withhold.

          It overhangs the cover box because a book turning past 3/4 sweeps
          wider and taller than the cover face does. */}
      <div
        ref={hostRef}
        aria-hidden="true"
        className="absolute cursor-grab active:cursor-grabbing [&>canvas]:block"
        style={{
          inset: `-${OVERHANG}`,
          /* Vertical drag stays the page's on touch; the book takes horizontal. */
          touchAction: "pan-y",
        }}
      />
    </div>
  );
}
