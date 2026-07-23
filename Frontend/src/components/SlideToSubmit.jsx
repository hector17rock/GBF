import { useEffect, useRef, useState } from "react";

const EDGE_PX = 6;
const HANDLE_OVERHANG_PX = 10;
const COMPLETE_THRESHOLD = 0.92;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function SlideToSubmit({
  label,
  disabledLabel,
  disabled = false,
  onComplete,
  className = "",
}) {
  const trackRef = useRef(null);
  const handleRef = useRef(null);

  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startOffset: 0,
    max: 0,
  });

  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [handleW, setHandleW] = useState(36);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    const handleEl = handleRef.current;
    if (!handleEl) return;
    const w = handleEl.getBoundingClientRect().width;
    if (w) setHandleW(w);
  }, []);

  function beginDrag(e) {
    if (disabled) return;

    const trackEl = trackRef.current;
    const handleEl = handleRef.current;
    if (!trackEl || !handleEl) return;

    e.preventDefault();

    const trackRect = trackEl.getBoundingClientRect();
    const handleRect = handleEl.getBoundingClientRect();

    const max = Math.max(
      0,
      trackRect.width - handleRect.width - EDGE_PX * 2 + HANDLE_OVERHANG_PX * 2
    );

    try {
      handleEl.setPointerCapture(e.pointerId);
    } catch {
      // no-op
    }

    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startOffset: offsetRef.current,
      max,
    };

    setHandleW(handleRect.width || 44);

    setDragging(true);
  }

  function moveDrag(e) {
    const d = dragRef.current;
    if (!d.active) return;
    if (d.pointerId != null && e.pointerId !== d.pointerId) return;

    e.preventDefault();

    const dx = e.clientX - d.startX;
    const next = clamp(d.startOffset + dx, 0, d.max);
    setOffset(next);
  }

  function endDrag(e) {
    const d = dragRef.current;
    if (!d.active) return;
    if (d.pointerId != null && e.pointerId !== d.pointerId) return;

    e.preventDefault();

    const current = offsetRef.current;
    const complete = d.max > 0 && current >= d.max * COMPLETE_THRESHOLD;

    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    setDragging(false);
    setOffset(0);

    if (complete && typeof onComplete === "function") {
      onComplete();
    }
  }

  const fillW = Math.max(0, EDGE_PX - HANDLE_OVERHANG_PX + offset + handleW);

  const shownLabel = disabled ? disabledLabel || label : label;

  return (
    <div
      className={["relative h-11 w-full overflow-visible", className].filter(Boolean).join(" ")}
      aria-disabled={disabled ? "true" : "false"}
    >
      <div
        ref={trackRef}
        className={
          [
            "relative h-11 w-full select-none overflow-hidden rounded-2xl border border-zinc-200",
            "bg-white shadow-sm",
            disabled ? "opacity-60" : "",
          ]
            .filter(Boolean)
            .join(" ")
        }
      >
        <div
          className="absolute left-0 top-0 h-full rounded-2xl bg-[#355E3B]/10"
          style={{ width: `${fillW}px` }}
          aria-hidden="true"
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pr-4 pl-16">
          <span className="text-sm font-semibold text-zinc-900">{shownLabel}</span>
        </div>
      </div>

      {/* Handle is outside the overflow-hidden track so it can overhang + keep its shadow */}
      <button
        ref={handleRef}
        type="button"
        disabled={disabled}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={
          [
            "absolute top-1/2",
            "h-9 w-9 rounded-full",
            "bg-[#355E3B] text-white shadow-lg",
            "grid place-items-center",
            "touch-none",
            dragging ? "transition-none" : "transition-transform duration-200",
            disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
          ]
            .filter(Boolean)
            .join(" ")
        }
        style={{
          left: EDGE_PX - HANDLE_OVERHANG_PX,
          transform: `translate(${offset}px, -50%)`,
        }}
        aria-label={shownLabel}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
