import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useActiveCommunication } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#000000', '#ffffff'];
const STROKE_SIZES = [2, 5, 10, 20];

const Whiteboard = () => {
  const { roomId } = useParams();
  const navigate   = useNavigate();
  const { socket } = useActiveCommunication();
  const { user }   = useAuth();

  const canvasRef = useRef(null);
  const ctxRef    = useRef(null);

  const [isDrawing, setIsDrawing]     = useState(false);
  const [tool,      setTool]          = useState('pen');    // pen | eraser
  const [color,     setColor]         = useState('#3b82f6');
  const [strokeSize, setStrokeSize]   = useState(5);
  const [activeUsers, setActiveUsers] = useState([]);

  const lastPoint = useRef(null);

  // ── Init canvas ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.lineCap   = 'round';
    ctx.lineJoin  = 'round';
    ctxRef.current = ctx;

    const handleResize = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';
      ctx.putImageData(imageData, 0, 0);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Join whiteboard socket room ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.emit('whiteboard:join', { roomId });

    const handleDraw = ({ stroke }) => drawStroke(stroke, false);
    const handleClear = () => {
      const canvas = canvasRef.current;
      ctxRef.current?.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on('whiteboard:draw',  handleDraw);
    socket.on('whiteboard:clear', handleClear);
    return () => {
      socket.off('whiteboard:draw',  handleDraw);
      socket.off('whiteboard:clear', handleClear);
    };
  }, [socket, roomId]);

  // ── Draw a stroke on canvas ─────────────────────────────────────────────────
  const drawStroke = useCallback((stroke, emit = true) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth   = stroke.size;
    ctx.beginPath();
    ctx.moveTo(stroke.x0, stroke.y0);
    ctx.lineTo(stroke.x1, stroke.y1);
    ctx.stroke();

    if (emit && socket) {
      socket.emit('whiteboard:draw', { roomId, stroke });
    }
  }, [socket, roomId]);

  // ── Pointer events ──────────────────────────────────────────────────────────
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const client = e.touches?.[0] || e;
    return { x: client.clientX - rect.left, y: client.clientY - rect.top };
  };

  const onPointerDown = (e) => {
    setIsDrawing(true);
    lastPoint.current = getPos(e);
  };

  const onPointerMove = (e) => {
    if (!isDrawing || !lastPoint.current) return;
    const current = getPos(e);
    const stroke = {
      x0: lastPoint.current.x, y0: lastPoint.current.y,
      x1: current.x,           y1: current.y,
      color, size: strokeSize, tool,
    };
    drawStroke(stroke, true);
    lastPoint.current = current;
  };

  const onPointerUp = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  // ── Clear canvas ─────────────────────────────────────────────────────────────
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctxRef.current?.clearRect(0, 0, canvas.width, canvas.height);
    socket?.emit('whiteboard:clear', { roomId });
  };

  // ── Download ─────────────────────────────────────────────────────────────────
  const downloadCanvas = () => {
    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <Navbar />

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">

        {/* Tool select */}
        <div className="flex rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
          {['pen', 'eraser'].map(t => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition ${
                tool === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
            >
              {t === 'pen' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              )}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Color palette */}
        <div className="flex items-center gap-1.5">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('pen'); }}
              style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${color === c && tool === 'pen' ? 'border-blue-500 scale-110' : 'border-white dark:border-neutral-600'}`}
            />
          ))}
        </div>

        {/* Stroke size */}
        <div className="flex items-center gap-1.5">
          {STROKE_SIZES.map(s => (
            <button
              key={s}
              onClick={() => setStrokeSize(s)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg border transition ${strokeSize === s ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'}`}
            >
              <div className="rounded-full bg-neutral-800 dark:bg-white" style={{ width: s, height: s }} />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="ml-auto flex gap-2">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg font-medium border border-red-200 dark:border-red-800 transition"
          >
            Clear
          </button>
          <button
            onClick={downloadCanvas}
            className="px-4 py-2 text-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg font-medium border border-green-200 dark:border-green-800 transition"
          >
            Download
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* ── Canvas ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-neutral-950">
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full ${tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={e => { e.preventDefault(); onPointerDown(e); }}
          onTouchMove={e => { e.preventDefault(); onPointerMove(e); }}
          onTouchEnd={onPointerUp}
        />

        {/* Room info badge */}
        <div className="absolute top-4 left-4 bg-black/20 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full">
          Room: {roomId?.slice(0, 8)}…
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
