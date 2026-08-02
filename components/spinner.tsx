type SpinnerProps = {
  /** Diameter in pixels. */
  size?: number;
  label?: string;
};

/**
 * Material-style indeterminate circular progress: the whole SVG rotates while the arc grows and
 * shrinks, so the motion never appears to stall. Both animations live in globals.css.
 */
export function Spinner({ size = 17, label = "Sending" }: SpinnerProps) {
  return (
    <span className="spinner" role="progressbar" aria-label={label} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <circle className="spinner-track" cx="12" cy="12" r="9.5" fill="none" strokeWidth="2.6" />
        <circle className="spinner-arc" cx="12" cy="12" r="9.5" fill="none" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}
