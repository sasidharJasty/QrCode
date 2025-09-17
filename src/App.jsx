import React, { useEffect, useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import "./styles.css";

export default function App() {
  const [value, setValue] = useState("https://");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [transparentBG, setTransparentBG] = useState(false);
  const [ecLevel, setEcLevel] = useState("M");
  const [size, setSize] = useState(256);

  // Logo
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoPercent, setLogoPercent] = useState(20); // % of QR size (width)
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [logoPadding, setLogoPadding] = useState(4);
  const [logoPaddingStyle, setLogoPaddingStyle] = useState("square");
  const [removeBehindLogo, setRemoveBehindLogo] = useState(true);

  // Style
  const [qrStyle, setQrStyle] = useState("squares"); // squares | dots | fluid
  const [quietZone, setQuietZone] = useState(10);
  const [eyeColor, setEyeColor] = useState("#000000");
  const [eyeCornerRadius, setEyeCornerRadius] = useState(0);

  const qrId = "app-qr-code";
  const canvasRef = useRef(null);

  useEffect(() => {
    if (transparentBG) setBgColor("transparent");
    else if (bgColor === "transparent") setBgColor("#FFFFFF");
  }, [transparentBG]);

  // Lock scroll & clean up
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const charCount = value.length;
  const maxChars = 2953;
  const tooLong = charCount > maxChars;
  const effectiveBG = transparentBG ? "transparent" : bgColor;

  const handleLogoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  // Base canvas getter
  const getCanvas = () => document.getElementById(qrId);

  const downloadNative = (type = "png") => {
    // Library exposes download via ref if using forwardRef in >=3.x
    // Fallback: manual from canvas
    const canvas = getCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-code.${type}`;
    link.href = canvas.toDataURL(`image/${type === "jpg" ? "jpeg" : type}`);
    link.click();
  };

  const downloadScaled = (scale = 2, type = "png") => {
    const canvas = getCanvas();
    if (!canvas) return;
    const scaled = document.createElement("canvas");
    scaled.width = canvas.width * scale;
    scaled.height = canvas.height * scale;
    const ctx = scaled.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
    const a = document.createElement("a");
    a.download = `qr-code-${scale}x.${type}`;
    a.href = scaled.toDataURL(`image/${type === "jpg" ? "jpeg" : type}`);
    a.click();
  };

  // Eye radius structure (three corners)
  const eyeRadius = [
    { outer: eyeCornerRadius, inner: 0 },
    { outer: eyeCornerRadius, inner: 0 },
    { outer: eyeCornerRadius, inner: 0 }
  ];

  const eyeColorArr = [
    { outer: eyeColor, inner: fgColor },
    { outer: eyeColor, inner: fgColor },
    { outer: eyeColor, inner: fgColor }
  ];

  const totalSize = size + quietZone * 2; // canvas dimension including quiet zone

  return (
    <div className="app-shell layout-padded">
      <header className="sticky top-0 z-10 header-bar">
        <div className="mx-auto max-w-5xl px-6 py-5 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="app-title">
              <span className="logo-mark" aria-hidden="true">
                ▩
              </span>
              <span className="title-text">
                QR<span className="title-accent">Code</span>
                <span className="title-thin"> Generator</span>
              </span>
            </h1>
            <p className="app-subtitle">
              Custom QR codes with logo, colors & styles
            </p>
          </div>
          <a
            className="repo-link"
            href="https://www.npmjs.com/package/react-qrcode-logo"
            target="_blank"
            rel="noreferrer"
          >
            react-qrcode-logo ↗
          </a>
        </div>
      </header>

      <main className="content-fit">
        <section className="card flex flex-col input-card">
          <h2>Input</h2>

          {/* Scroll container added */}
          <div className="input-scroll">
            <div className="input-grid">
              <div className="form-group full-span">
                <label className="field-label">URL or any text</label>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Paste a URL or type any data…"
                  className="field"
                />
                <div className="mt-2 flex items-center gap-2 helper-text">
                  <span className={tooLong ? "text-red-600" : ""}>
                    {charCount.toLocaleString()} / {maxChars.toLocaleString()} chars
                  </span>
                  {tooLong && <span className="text-red-600">Too long!</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">Error correction</label>
                <select value={ecLevel} onChange={(e) => setEcLevel(e.target.value)} className="field">
                  {["L", "M", "Q", "H"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">QR style</label>
                <select value={qrStyle} onChange={(e) => setQrStyle(e.target.value)} className="field">
                  {["squares", "dots", "fluid"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">Size (px)</label>
                <input
                  type="range"
                  min={128}
                  max={768}
                  step={16}
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                />
                <div className="helper-text">{size}px</div>
              </div>

              <div className="form-group">
                <label className="field-label">Quiet zone</label>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={quietZone}
                  onChange={(e) => setQuietZone(parseInt(e.target.value))}
                />
                <div className="helper-text">{quietZone}px</div>
              </div>

              <div className="form-group">
                <label className="field-label">Foreground</label>
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="color-input" />
              </div>

              <div className="form-group">
                <label className="field-label">Background</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={effectiveBG === "transparent" ? "#ffffff" : bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    disabled={transparentBG}
                    className="color-input"
                  />
                  <label className="mini-check">
                    <input
                      type="checkbox"
                      checked={transparentBG}
                      onChange={(e) => setTransparentBG(e.target.checked)}
                    />
                    Transparent
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">Eye color</label>
                <input type="color" value={eyeColor} onChange={(e) => setEyeColor(e.target.value)} className="color-input" />
              </div>

              <div className="form-group">
                <label className="field-label">Eye radius</label>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={eyeCornerRadius}
                  onChange={(e) => setEyeCornerRadius(parseInt(e.target.value))}
                />
                <div className="helper-text">{eyeCornerRadius}</div>
              </div>

              <div className="form-group">
                <label className="field-label">Logo image</label>
                <input type="file" accept="image/*" onChange={handleLogoFile} className="file-input" />
                {logoDataUrl && (
                  <button className="mini-button mt-2" onClick={() => setLogoDataUrl("")}>
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="field-label">Logo size %</label>
                <input
                  type="range"
                  min={10}
                  max={40}
                  value={logoPercent}
                  onChange={(e) => setLogoPercent(parseInt(e.target.value))}
                />
                <div className="helper-text">{logoPercent}%</div>
              </div>

              <div className="form-group">
                <label className="field-label">Logo opacity</label>
                <input
                  type="range"
                  min={0.2}
                  max={1}
                  step={0.05}
                  value={logoOpacity}
                  onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
                />
                <div className="helper-text">{logoOpacity.toFixed(2)}</div>
              </div>

              <div className="form-group">
                <label className="field-label">Logo padding</label>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={logoPadding}
                  onChange={(e) => setLogoPadding(parseInt(e.target.value))}
                />
                <div className="helper-text">{logoPadding}px</div>
              </div>

              <div className="form-group">
                <label className="field-label">Padding style</label>
                <select value={logoPaddingStyle} onChange={(e)=>setLogoPaddingStyle(e.target.value)} className="field">
                  <option value="square">square</option>
                  <option value="circle">circle</option>
                </select>
              </div>

              <div className="form-group">
                <label className="mini-check">
                  <input
                    type="checkbox"
                    checked={removeBehindLogo}
                    onChange={(e)=>setRemoveBehindLogo(e.target.checked)}
                  />
                  Remove cells behind logo
                </label>
              </div>
            </div>
          </div>

          <div className="helper-text mt-4">
            Tip: Use error level H when adding a bigger logo.
          </div>
        </section>

        <section className="card flex flex-col preview-card">
          <h2>Preview</h2>

          {/* Replaced the stretch container so the card height matches QR size */}
          <div className="qr-size-wrapper">
            <div
              className="qr-frame"
              style={{
                background: effectiveBG === "transparent" ? "transparent" : effectiveBG,
                width: totalSize,
                height: totalSize
              }}
            >
              <QRCode
                id={qrId}
                ref={canvasRef}
                value={tooLong ? "Value too long" : value || " "}
                ecLevel={ecLevel}
                size={size}
                quietZone={quietZone}
                bgColor={effectiveBG}
                fgColor={fgColor}
                logoImage={logoDataUrl || undefined}
                logoOpacity={logoOpacity}
                logoWidth={Math.round(size * (logoPercent / 100))}
                logoHeight={Math.round(size * (logoPercent / 100))}
                logoPadding={logoPadding || undefined}
                logoPaddingStyle={logoPaddingStyle}
                removeQrCodeBehindLogo={removeBehindLogo}
                qrStyle={qrStyle}
                eyeColor={eyeColorArr}
                eyeRadius={eyeCornerRadius > 0 ? eyeRadius : undefined}
                enableCORS
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3 buttons-grid">
            <button onClick={() => downloadNative("png")} className="btn-primary">
              PNG
            </button>
            <button onClick={() => downloadNative("jpg")}>JPG</button>
            <button onClick={() => downloadScaled(2)}>PNG 2x</button>
            <button onClick={() => downloadScaled(4)}>PNG 4x</button>
          </div>
        </section>
      </main>

      <footer className="footer footer-tight">
        Built with <code>react-qrcode-logo</code>.
      </footer>
    </div>
  );
}
