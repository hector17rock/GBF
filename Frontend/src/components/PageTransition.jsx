export default function PageTransition({ routeKey, render, className = "" }) {
  return (
    <div
      className={`gbf-route ${className}`.trim()}
      style={{ viewTransitionName: "gbf-route" }}
    >
      <div key={routeKey} className="gbf-page-in">
        {typeof render === "function" ? render(routeKey) : null}
      </div>
    </div>
  );
}
