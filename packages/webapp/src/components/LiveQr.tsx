const liveQrSquares = [0, 1, 2, 4, 6, 8, 10, 12, 13, 15, 18, 20, 22, 24, 27, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 47, 48];

export const LiveQr = () => (
  <div aria-label="Live poll QR code" className="shrink-0 rounded-app bg-app-surface p-2 shadow-lg" role="img">
    <div className="grid grid-cols-7 gap-px" style={{ width: 84 }}>
      {Array.from({ length: 49 }, (_, index) => (
        <span className={liveQrSquares.includes(index) ? "aspect-square bg-app-text" : "aspect-square bg-app-subtle"} key={index} />
      ))}
    </div>
  </div>
);
