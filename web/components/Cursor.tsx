'use client';

import { useEffect, useRef } from 'react';

/**
 * Smooth custom cursor for the public site.
 *
 * A crisp dot tracks the pointer 1:1 while a larger ring trails it with an
 * eased (lerp) follow, giving the classic "smooth" agency-site feel. The ring
 * expands and the dot hides when hovering interactive elements (links, buttons,
 * inputs, .cursor-hover) so the cursor reads as a focus indicator.
 *
 * Everything runs on a single requestAnimationFrame loop writing only
 * `transform` (compositor-only, no layout/paint), so it stays at 60fps.
 * Disabled on touch / coarse pointers and when the visitor prefers reduced
 * motion — there the native cursor is left untouched.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip entirely on touch devices or when motion is not wanted.
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add('has-custom-cursor');

    // Target = real pointer position. Ring = eased position chasing the target.
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let hovering = false;
    let visible = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      // Dot is pinned exactly to the pointer — no lag, so clicks feel precise.
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      if (!visible) {
        visible = true;
        document.body.classList.add('cursor-active');
      }
      // Grow the ring over anything interactive.
      const overInteractive = !!(e.target as Element | null)?.closest(
        'a, button, input, textarea, select, label, [role="button"], .cursor-hover',
      );
      if (overInteractive !== hovering) {
        hovering = overInteractive;
        ring.classList.toggle('cursor-ring--hover', hovering);
        dot.classList.toggle('cursor-dot--hover', hovering);
      }
    };

    const onLeave = () => {
      visible = false;
      document.body.classList.remove('cursor-active');
    };
    const onDown = () => ring.classList.add('cursor-ring--down');
    const onUp = () => ring.classList.remove('cursor-ring--down');

    const loop = () => {
      // Exponential smoothing — ring eases toward the pointer each frame.
      rx += (tx - rx) * 0.18;
      ry += (ty - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      document.body.classList.remove('has-custom-cursor', 'cursor-active');
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  );
}
