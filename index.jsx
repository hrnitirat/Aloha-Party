import { useState, useRef, useEffect, useCallback } from "react";

// ─── Minimal QR Code Generator ───
const QR = (() => {
  // Simplified QR code generator for alphanumeric data
  function generateQRMatrix(text) {
    const size = 25;
    const matrix = Array.from({ length: size }, () => Array(size).fill(false));
    // Position patterns
    const drawFinder = (ox, oy) => {
      for (let y = 0; y < 7; y++)
        for (let x = 0; x < 7; x++)
          matrix[oy + y][ox + x] =
            y === 0 || y === 6 || x === 0 || x === 6 ||
            (y >= 2 && y <= 4 && x >= 2 && x <= 4);
    };
    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);
    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }
    // Data area - encode text as pattern
    let bitIndex = 0;
    const bytes = new TextEncoder().encode(text);
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col = 5;
      for (let row = 0; row < size; row++) {
        for (let c = 0; c < 2; c++) {
          const x = col - c;
          const y = row;
          if (matrix[y][x] !== false && matrix[y][x] !== true) continue;
          if (
            (x < 8 && y < 8) || (x >= size - 7 && y < 8) ||
            (x < 8 && y >= size - 7) || x === 6 || y === 6
          ) continue;
          const byteIdx = Math.floor(bitIndex / 8);
          const bitIdx = 7 - (bitIndex % 8);
          if (byteIdx < bytes.length) {
            matrix[y][x] = ((bytes[byteIdx] >> bitIdx) & 1) === 1;
          } else {
            matrix[y][x] = (bitIndex % 3 === 0);
          }
          bitIndex++;
        }
      }
    }
    return matrix;
  }
  return { generateQRMatrix };
})();

// ─── SVG QR Code Component ───
function QRCode({ url, size = 120, fg = "#000", bg = "#fff" }) {
  const matrix = QR.generateQRMatrix(url);
  const cellSize = size / matrix.length;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={bg} rx="4" />
      {matrix.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize + 0.5}
              height={cellSize + 0.5}
              fill={fg}
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Template Definitions ───
const TEMPLATES = [
  {
    id: 1,
    name: "Tropical Paradise",
    desc: "ดอกชบาและใบปาล์ม",
    accent: "#FF6B35",
    bg: "linear-gradient(180deg, #FF9A3C 0%, #FF6B35 40%, #E85D26 100%)",
    frameBorder: "#FFD700",
    frameStyle: "rounded",
  },
  {
    id: 2,
    name: "Ocean Breeze",
    desc: "คลื่นทะเลและหอยเปลือก",
    accent: "#00BCD4",
    bg: "linear-gradient(180deg, #81D4FA 0%, #00BCD4 40%, #00838F 100%)",
    frameBorder: "#FFF9C4",
    frameStyle: "wave",
  },
  {
    id: 3,
    name: "Tiki Night",
    desc: "ค่ำคืนในสวนสวรรค์",
    accent: "#AB47BC",
    bg: "linear-gradient(180deg, #1A0033 0%, #4A148C 40%, #AB47BC 100%)",
    frameBorder: "#FFD54F",
    frameStyle: "tiki",
  },
];

// ─── Photo positions in strip coordinate system ───
const STRIP_W = 600;
const STRIP_H = 1800;
const PHOTO_POSITIONS = [
  { x: 40, y: 180, w: 520, h: 390 },
  { x: 40, y: 600, w: 520, h: 390 },
  { x: 40, y: 1020, w: 520, h: 390 },
];

const DRIVE_URL = "https://drive.google.com/drive/folders/1fj4mcwhY9vQjASLgZzbEruam9xICPSxN?usp=sharing";

// ─── Decorative SVG Elements ───
function Plumeria({ x, y, size = 30, rotate = 0 }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${size / 30})`}>
      {[0, 72, 144, 216, 288].map((a, i) => (
        <ellipse
          key={i}
          cx="0"
          cy="-10"
          rx="5"
          ry="12"
          fill="white"
          stroke="#FFF9C4"
          strokeWidth="0.5"
          transform={`rotate(${a})`}
          opacity="0.95"
        />
      ))}
      <circle cx="0" cy="0" r="4" fill="#FFD54F" />
    </g>
  );
}

function PalmLeaf({ x, y, scale = 1, flip = false, rotate = 0 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale},${scale}) rotate(${rotate})`}>
      <path
        d="M0,0 Q20,-40 10,-80 Q25,-60 40,-90 Q30,-55 50,-70 Q35,-45 55,-50 Q35,-30 45,-20 Q25,-15 30,0 Z"
        fill="#2E7D32"
        opacity="0.85"
      />
      <path
        d="M0,0 Q15,-35 10,-70"
        stroke="#1B5E20"
        strokeWidth="1.5"
        fill="none"
      />
    </g>
  );
}

function Hibiscus({ x, y, size = 35 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${size / 35})`}>
      {[0, 72, 144, 216, 288].map((a, i) => (
        <ellipse
          key={i}
          cx="0"
          cy="-12"
          rx="8"
          ry="14"
          fill="#E53935"
          stroke="#C62828"
          strokeWidth="0.5"
          transform={`rotate(${a})`}
        />
      ))}
      <circle cx="0" cy="0" r="3" fill="#FFEB3B" />
      <line x1="0" y1="0" x2="0" y2="-8" stroke="#FFEB3B" strokeWidth="1.5" />
      <circle cx="0" cy="-9" r="1.5" fill="#FF8F00" />
    </g>
  );
}

// ─── Strip Overlay SVGs ───
function TemplateOverlay({ template, width, height }) {
  const scaleX = width / STRIP_W;
  const scaleY = height / STRIP_H;

  if (template.id === 1) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${STRIP_W} ${STRIP_H}`}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {/* Top decoration */}
        <PalmLeaf x={0} y={20} scale={1.8} rotate={-10} />
        <PalmLeaf x={STRIP_W} y={10} scale={1.5} flip rotate={15} />
        <Hibiscus x={300} y={60} size={45} />
        <Plumeria x={100} y={100} size={25} />
        <Plumeria x={480} y={90} size={20} rotate={30} />

        {/* Between photos */}
        <Plumeria x={60} y={585} size={22} rotate={-15} />
        <Plumeria x={540} y={590} size={18} rotate={20} />
        <Plumeria x={80} y={1005} size={20} rotate={10} />
        <Plumeria x={520} y={1010} size={22} rotate={-20} />

        {/* Bottom decoration */}
        <PalmLeaf x={-10} y={1700} scale={1.3} rotate={160} />
        <PalmLeaf x={STRIP_W + 10} y={1720} scale={1.2} flip rotate={-170} />
        <Hibiscus x={100} y={1750} size={30} />
        <Plumeria x={500} y={1760} size={25} rotate={45} />

        {/* Photo frame borders */}
        {PHOTO_POSITIONS.map((p, i) => (
          <rect
            key={i}
            x={p.x - 4}
            y={p.y - 4}
            width={p.w + 8}
            height={p.h + 8}
            fill="none"
            stroke="#FFD700"
            strokeWidth="3"
            rx="8"
          />
        ))}
      </svg>
    );
  }

  if (template.id === 2) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${STRIP_W} ${STRIP_H}`}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        {/* Wave patterns */}
        <path
          d="M0,160 Q150,140 300,160 Q450,180 600,160"
          stroke="#B2EBF2"
          strokeWidth="3"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M0,580 Q150,560 300,580 Q450,600 600,580"
          stroke="#B2EBF2"
          strokeWidth="3"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M0,1000 Q150,980 300,1000 Q450,1020 600,1000"
          stroke="#B2EBF2"
          strokeWidth="3"
          fill="none"
          opacity="0.7"
        />

        {/* Starfish & shells */}
        <text x="50" y="80" fontSize="40" opacity="0.8">🌊</text>
        <text x={STRIP_W - 90} y="100" fontSize="35" opacity="0.8">⭐</text>
        <text x="30" y={595} fontSize="28" opacity="0.7">🐚</text>
        <text x={STRIP_W - 60} y={1005} fontSize="28" opacity="0.7">🦀</text>

        {/* Plumerias */}
        <Plumeria x={300} y={70} size={30} />
        <Plumeria x={520} y={590} size={22} rotate={20} />
        <Plumeria x={80} y={1010} size={22} rotate={-15} />

        {/* Bottom */}
        <path
          d="M0,1750 Q100,1730 200,1750 Q300,1770 400,1750 Q500,1730 600,1750 L600,1800 L0,1800Z"
          fill="#B2EBF2"
          opacity="0.3"
        />

        {/* Photo frames */}
        {PHOTO_POSITIONS.map((p, i) => (
          <rect
            key={i}
            x={p.x - 4}
            y={p.y - 4}
            width={p.w + 8}
            height={p.h + 8}
            fill="none"
            stroke="#FFF9C4"
            strokeWidth="3"
            rx="12"
          />
        ))}
      </svg>
    );
  }

  // Template 3: Tiki Night
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${STRIP_W} ${STRIP_H}`}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {/* Stars */}
      {[
        [50, 30], [150, 60], [250, 20], [350, 50], [450, 35], [540, 55],
        [80, 590], [520, 585], [60, 1008], [540, 1012],
        [100, 1470], [300, 1450], [500, 1465],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={1.5 + (i % 3)} fill="#FFF9C4" opacity={0.5 + (i % 3) * 0.15} />
      ))}

      {/* Tiki torch left */}
      <rect x="15" y="120" width="8" height="60" fill="#8D6E63" rx="2" />
      <ellipse cx="19" cy="115" rx="10" ry="14" fill="#FF9800" opacity="0.7" />
      <ellipse cx="19" cy="110" rx="6" ry="10" fill="#FFEB3B" opacity="0.6" />

      {/* Tiki torch right */}
      <rect x={STRIP_W - 23} y="120" width="8" height="60" fill="#8D6E63" rx="2" />
      <ellipse cx={STRIP_W - 19} cy="115" rx="10" ry="14" fill="#FF9800" opacity="0.7" />
      <ellipse cx={STRIP_W - 19} cy="110" rx="6" ry="10" fill="#FFEB3B" opacity="0.6" />

      <Plumeria x={300} y={80} size={35} />
      <Plumeria x={100} y={590} size={20} rotate={-20} />
      <Plumeria x={500} y={1010} size={20} rotate={15} />

      {/* Bottom palm silhouettes */}
      <path
        d="M0,1780 Q50,1720 100,1760 Q130,1740 160,1780 L0,1800Z"
        fill="#1A0033"
        opacity="0.5"
      />
      <path
        d="M440,1780 Q490,1720 540,1760 Q570,1740 600,1780 L600,1800 L440,1800Z"
        fill="#1A0033"
        opacity="0.5"
      />

      {/* Photo frames with tiki border */}
      {PHOTO_POSITIONS.map((p, i) => (
        <g key={i}>
          <rect
            x={p.x - 6}
            y={p.y - 6}
            width={p.w + 12}
            height={p.h + 12}
            fill="none"
            stroke="#FFD54F"
            strokeWidth="3"
            rx="4"
            strokeDasharray="12 4"
          />
        </g>
      ))}
    </svg>
  );
}

// ─── Main App ───
export default function AlohaPhotobooth() {
  const [screen, setScreen] = useState("start"); // start | select | camera | review | postcard
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [currentShot, setCurrentShot] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);
  const [postcardRevealed, setPostcardRevealed] = useState(false);
  const [compositeDataUrl, setCompositeDataUrl] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ─── Camera ───
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setCameraError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้อง");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = 520;
    canvas.height = 390;
    const ctx = canvas.getContext("2d");

    // Mirror + crop to 4:3
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const targetRatio = 520 / 390;
    const videoRatio = vw / vh;
    let sx = 0, sy = 0, sw = vw, sh = vh;
    if (videoRatio > targetRatio) {
      sw = vh * targetRatio;
      sx = (vw - sw) / 2;
    } else {
      sh = vw / targetRatio;
      sy = (vh - sh) / 2;
    }

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 520, 390);
    ctx.restore();

    return canvas.toDataURL("image/jpeg", 0.92);
  }, []);

  // ─── Countdown & Capture Flow ───
  const startCountdown = useCallback(() => {
    setCountdown(3);
    let count = 3;
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(null);

        // Flash effect
        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        // Capture
        const dataUrl = capturePhoto();
        if (dataUrl) {
          setPhotos((prev) => {
            const next = [...prev, dataUrl];
            if (next.length >= 3) {
              // All photos taken
              setTimeout(() => {
                stopCamera();
                setScreen("review");
              }, 600);
            } else {
              // Next shot after delay
              setCurrentShot((s) => s + 1);
              setTimeout(() => startCountdown(), 1200);
            }
            return next;
          });
        }
      }
    }, 1000);
  }, [capturePhoto, stopCamera]);

  // ─── Composite Strip ───
  useEffect(() => {
    if (screen === "review" && photos.length === 3 && selectedTemplate) {
      composeStrip();
    }
  }, [screen, photos, selectedTemplate]);

  const composeStrip = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = STRIP_W;
    canvas.height = STRIP_H;
    const ctx = canvas.getContext("2d");

    // Background gradient
    const tpl = selectedTemplate;
    const grd = ctx.createLinearGradient(0, 0, 0, STRIP_H);
    if (tpl.id === 1) {
      grd.addColorStop(0, "#FF9A3C");
      grd.addColorStop(0.4, "#FF6B35");
      grd.addColorStop(1, "#E85D26");
    } else if (tpl.id === 2) {
      grd.addColorStop(0, "#81D4FA");
      grd.addColorStop(0.4, "#00BCD4");
      grd.addColorStop(1, "#00838F");
    } else {
      grd.addColorStop(0, "#1A0033");
      grd.addColorStop(0.4, "#4A148C");
      grd.addColorStop(1, "#AB47BC");
    }
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, STRIP_W, STRIP_H);

    // Title text
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 56px 'Georgia', serif";
    ctx.fillText("Aloha", STRIP_W / 2, 80);
    ctx.font = "bold 32px 'Georgia', serif";
    ctx.fillText("THANK YOU PARTY", STRIP_W / 2, 130);

    // Draw photos
    for (let i = 0; i < 3; i++) {
      const pos = PHOTO_POSITIONS[i];
      // Frame border
      ctx.strokeStyle = tpl.frameBorder;
      ctx.lineWidth = 4;
      if (tpl.id === 3) ctx.setLineDash([12, 4]);
      else ctx.setLineDash([]);
      ctx.strokeRect(pos.x - 4, pos.y - 4, pos.w + 8, pos.h + 8);
      ctx.setLineDash([]);

      // Photo
      const img = new Image();
      img.src = photos[i];
      await new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
      ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h);
    }

    // Bottom text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 30px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ขอขอบคุณสำหรับ", STRIP_W / 2, 1480);
    ctx.fillText("ความทุ่มเทในไตรมาสที่ผ่านมา", STRIP_W / 2, 1520);

    // Date
    ctx.font = "22px sans-serif";
    ctx.fillText("3 April 2026 | WanDeeDee Cafe", STRIP_W / 2, 1570);

    // Plumeria decorations (simple circles as stand-in)
    ctx.fillStyle = "#FFFFFF";
    [
      [60, 590], [540, 590], [80, 1010], [520, 1010],
      [120, 1610], [480, 1610],
    ].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    setCompositeDataUrl(canvas.toDataURL("image/png"));
    setTimeout(() => setPostcardRevealed(true), 400);
  };

  const downloadStrip = () => {
    if (!compositeDataUrl) return;
    const a = document.createElement("a");
    a.href = compositeDataUrl;
    a.download = "aloha-photobooth.png";
    a.click();
  };

  const reset = () => {
    setScreen("start");
    setSelectedTemplate(null);
    setPhotos([]);
    setCurrentShot(0);
    setCountdown(null);
    setFlash(false);
    setPostcardRevealed(false);
    setCompositeDataUrl(null);
    setCameraError(null);
    stopCamera();
  };

  // ─── Styles ───
  const styles = {
    app: {
      width: "100%",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #FF9A3C 0%, #FF6B35 50%, #E85D26 100%)",
      fontFamily: "'Georgia', 'Sarabun', serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
    },
    container: {
      width: "100%",
      maxWidth: 480,
      padding: "20px 16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      zIndex: 1,
    },
  };

  // ═══════════════════════════════════════════
  //  START SCREEN
  // ═══════════════════════════════════════════
  if (screen === "start") {
    return (
      <div style={styles.app}>
        {/* Floating decorations */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "hidden" }}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${10 + (i * 12) % 80}%`,
                top: `${5 + (i * 17) % 70}%`,
                fontSize: `${20 + (i % 3) * 10}px`,
                opacity: 0.15 + (i % 4) * 0.05,
                transform: `rotate(${i * 45}deg)`,
                animation: `float${i % 3} ${3 + i % 4}s ease-in-out infinite`,
              }}
            >
              🌺
            </div>
          ))}
        </div>

        <div style={styles.container}>
          <div style={{
            marginTop: 60,
            textAlign: "center",
            animation: "fadeInDown 0.8s ease-out",
          }}>
            {/* Tiki face */}
            <div style={{ fontSize: 72, marginBottom: 8, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>
              🗿
            </div>
            <h1 style={{
              fontSize: 52,
              color: "#FFF",
              textShadow: "3px 3px 6px rgba(0,0,0,0.3)",
              margin: "0 0 4px 0",
              fontStyle: "italic",
              letterSpacing: 2,
            }}>
              Aloha
            </h1>
            <h2 style={{
              fontSize: 20,
              color: "#FFF9C4",
              textTransform: "uppercase",
              letterSpacing: 6,
              margin: "0 0 24px 0",
              fontWeight: 700,
            }}>
              Thank You Party
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 16,
              margin: "0 0 8px 0",
            }}>
              Virtual Photobooth
            </p>
            <p style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              margin: "0 0 48px 0",
            }}>
              3 April 2026 • WanDeeDee Cafe x Restaurant
            </p>
          </div>

          <button
            onClick={() => setScreen("select")}
            style={{
              background: "rgba(255,255,255,0.95)",
              color: "#E85D26",
              border: "none",
              borderRadius: 50,
              padding: "18px 56px",
              fontSize: 20,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              letterSpacing: 1,
              transition: "all 0.2s",
              animation: "fadeInUp 1s ease-out 0.3s both",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)";
            }}
          >
            📸 เริ่มถ่ายรูป
          </button>

          <div style={{
            marginTop: 40,
            display: "flex",
            gap: 16,
            fontSize: 28,
            opacity: 0.6,
            animation: "fadeInUp 1s ease-out 0.6s both",
          }}>
            🌴 🌺 🍍 🌊 🌴
          </div>
        </div>

        <style>{`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float0 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-15px) rotate(10deg)} }
          @keyframes float1 { 0%,100%{transform:translateY(0) rotate(45deg)} 50%{transform:translateY(-20px) rotate(55deg)} }
          @keyframes float2 { 0%,100%{transform:translateY(0) rotate(90deg)} 50%{transform:translateY(-10px) rotate(100deg)} }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  TEMPLATE SELECT SCREEN
  // ═══════════════════════════════════════════
  if (screen === "select") {
    return (
      <div style={styles.app}>
        <div style={styles.container}>
          <h2 style={{
            color: "#FFF",
            fontSize: 24,
            margin: "30px 0 8px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}>
            เลือก Template
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: "0 0 24px" }}>
            เลือกธีมสำหรับ Photo Strip ของคุณ
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => {
                  setSelectedTemplate(tpl);
                  setScreen("camera");
                  setTimeout(startCamera, 300);
                }}
                style={{
                  position: "relative",
                  background: tpl.bg,
                  border: "3px solid rgba(255,255,255,0.3)",
                  borderRadius: 16,
                  padding: "0",
                  cursor: "pointer",
                  overflow: "hidden",
                  transition: "all 0.25s",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                }}
              >
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Mini strip preview */}
                  <div style={{
                    width: 50,
                    height: 150,
                    background: tpl.bg,
                    borderRadius: 6,
                    border: `2px solid ${tpl.frameBorder}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    padding: 4,
                    flexShrink: 0,
                  }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 36,
                          height: 27,
                          background: "rgba(255,255,255,0.25)",
                          borderRadius: 3,
                          border: `1px solid ${tpl.frameBorder}`,
                          borderStyle: tpl.id === 3 ? "dashed" : "solid",
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ textAlign: "left" }}>
                    <div style={{
                      color: "#FFF",
                      fontSize: 18,
                      fontWeight: 700,
                      marginBottom: 4,
                      textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                    }}>
                      {tpl.name}
                    </div>
                    <div style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 14,
                    }}>
                      {tpl.desc}
                    </div>
                  </div>

                  <div style={{
                    marginLeft: "auto",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 24,
                  }}>
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setScreen("start")}
            style={{
              marginTop: 24,
              background: "transparent",
              border: "2px solid rgba(255,255,255,0.4)",
              borderRadius: 50,
              padding: "10px 32px",
              color: "#FFF",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ← กลับ
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  CAMERA SCREEN
  // ═══════════════════════════════════════════
  if (screen === "camera") {
    const tpl = selectedTemplate;
    return (
      <div style={{
        ...styles.app,
        background: tpl.bg,
      }}>
        <div style={styles.container}>
          <div style={{
            color: "#FFF",
            fontSize: 14,
            margin: "16px 0 8px",
            textTransform: "uppercase",
            letterSpacing: 3,
            opacity: 0.8,
          }}>
            📸 ถ่ายรูปที่ {currentShot + 1} / 3
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: i < photos.length ? 40 : 12,
                  height: 12,
                  borderRadius: 6,
                  background: i < photos.length
                    ? "#FFD700"
                    : i === currentShot
                    ? "rgba(255,215,0,0.5)"
                    : "rgba(255,255,255,0.3)",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>

          {/* Camera viewport */}
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 400,
            aspectRatio: "4/3",
            borderRadius: 16,
            overflow: "hidden",
            border: `4px solid ${tpl.frameBorder}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            background: "#000",
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)",
              }}
            />

            {/* Countdown overlay */}
            {countdown !== null && (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.4)",
                zIndex: 10,
              }}>
                <div
                  key={countdown}
                  style={{
                    fontSize: 120,
                    fontWeight: 900,
                    color: "#FFD700",
                    textShadow: "0 0 40px rgba(255,215,0,0.5)",
                    animation: "countPulse 1s ease-out",
                  }}
                >
                  {countdown}
                </div>
              </div>
            )}

            {/* Flash */}
            {flash && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "#FFF",
                zIndex: 20,
                animation: "flashAnim 0.3s ease-out forwards",
              }} />
            )}

            {cameraError && (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                textAlign: "center",
                color: "#FFF",
                fontSize: 14,
                background: "rgba(0,0,0,0.8)",
              }}>
                {cameraError}
              </div>
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Thumbnails of taken photos */}
          <div style={{
            display: "flex",
            gap: 8,
            marginTop: 16,
            minHeight: 60,
          }}>
            {photos.map((p, i) => (
              <div
                key={i}
                style={{
                  width: 76,
                  height: 57,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: `2px solid ${tpl.frameBorder}`,
                  animation: "popIn 0.3s ease-out",
                }}
              >
                <img src={p} alt={`Shot ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
            {[...Array(3 - photos.length)].map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  width: 76,
                  height: 57,
                  borderRadius: 8,
                  border: "2px dashed rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 12,
                }}
              >
                {photos.length + i + 1}
              </div>
            ))}
          </div>

          {/* Capture button */}
          {countdown === null && photos.length < 3 && (
            <button
              onClick={startCountdown}
              style={{
                marginTop: 24,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#FFF",
                border: `4px solid ${tpl.frameBorder}`,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                animation: "pulse 2s ease-in-out infinite",
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              <div style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: tpl.accent,
              }} />
            </button>
          )}

          <button
            onClick={reset}
            style={{
              marginTop: 16,
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              cursor: "pointer",
              padding: "8px 16px",
            }}
          >
            ยกเลิก
          </button>
        </div>

        <style>{`
          @keyframes countPulse {
            0% { transform: scale(0.3); opacity: 0; }
            40% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes flashAnim {
            0% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
            50% { box-shadow: 0 4px 30px rgba(255,215,0,0.5); }
          }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  REVIEW / POSTCARD SCREEN
  // ═══════════════════════════════════════════
  if (screen === "review") {
    const tpl = selectedTemplate;
    return (
      <div style={{
        ...styles.app,
        background: tpl.bg,
      }}>
        <div style={{
          ...styles.container,
          maxWidth: 420,
        }}>
          {!postcardRevealed ? (
            <div style={{
              marginTop: 80,
              textAlign: "center",
              animation: "fadeInUp 0.5s ease-out",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 2s linear infinite" }}>
                🌺
              </div>
              <p style={{ color: "#FFF", fontSize: 18 }}>กำลังสร้าง Photo Strip...</p>
            </div>
          ) : (
            <div style={{ animation: "postcardReveal 1s ease-out" }}>
              <h2 style={{
                color: "#FFF",
                fontSize: 20,
                textAlign: "center",
                margin: "20px 0 16px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}>
                🎉 Photo Strip ของคุณ!
              </h2>

              {/* Strip preview */}
              <div style={{
                position: "relative",
                width: "100%",
                maxWidth: 240,
                margin: "0 auto",
                aspectRatio: `${STRIP_W}/${STRIP_H}`,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
                background: tpl.bg,
              }}>
                {compositeDataUrl && (
                  <img
                    src={compositeDataUrl}
                    alt="Photo Strip"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>

              {/* Thank you message */}
              <div style={{
                marginTop: 24,
                padding: "20px 24px",
                background: "rgba(255,255,255,0.12)",
                borderRadius: 16,
                textAlign: "center",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}>
                <p style={{
                  color: "#FFD700",
                  fontSize: 18,
                  fontWeight: 700,
                  margin: "0 0 8px",
                }}>
                  Aloha Thank You Party
                </p>
                <p style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 14,
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  ขอขอบคุณสำหรับความทุ่มเทในไตรมาสที่ผ่านมา
                </p>
              </div>

              {/* Actions */}
              <div style={{
                marginTop: 24,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                alignItems: "center",
              }}>
                <button
                  onClick={downloadStrip}
                  style={{
                    width: "100%",
                    maxWidth: 280,
                    padding: "14px 24px",
                    background: "#FFD700",
                    color: "#5D4037",
                    border: "none",
                    borderRadius: 50,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(255,215,0,0.4)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.03)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                >
                  💾 ดาวน์โหลด Photo Strip
                </button>
              </div>

              {/* QR Code Section */}
              <div style={{
                marginTop: 24,
                padding: "20px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: 16,
                textAlign: "center",
                backdropFilter: "blur(10px)",
              }}>
                <p style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 13,
                  margin: "0 0 12px",
                }}>
                  สแกน QR Code เพื่อดาวน์โหลดรูป
                </p>
                <div style={{
                  display: "inline-block",
                  background: "#FFF",
                  padding: 12,
                  borderRadius: 12,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                }}>
                  <QRCode url={DRIVE_URL} size={140} />
                </div>
                <p style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 11,
                  margin: "12px 0 0",
                  wordBreak: "break-all",
                }}>
                  หรือเปิดลิงก์:{" "}
                  <a
                    href={DRIVE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#FFD700" }}
                  >
                    Google Drive
                  </a>
                </p>
              </div>

              {/* Retake */}
              <div style={{ textAlign: "center", marginTop: 20, paddingBottom: 32 }}>
                <button
                  onClick={reset}
                  style={{
                    background: "transparent",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderRadius: 50,
                    padding: "10px 32px",
                    color: "#FFF",
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = "rgba(255,255,255,0.7)"}
                  onMouseLeave={(e) => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
                >
                  🔄 ถ่ายใหม่
                </button>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes postcardReveal {
            0% {
              opacity: 0;
              transform: perspective(800px) rotateY(90deg) scale(0.5);
            }
            60% {
              opacity: 1;
              transform: perspective(800px) rotateY(-10deg) scale(1.02);
            }
            100% {
              transform: perspective(800px) rotateY(0deg) scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
