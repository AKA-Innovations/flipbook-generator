import { useState, useRef } from 'react';
import { useBookStore } from '@/store/bookStore';
import { useAppStore } from '@/store/appStore';
import { uid } from '@/utils/format';
import { FiLink, FiVideo, FiTrash2, FiCheck, FiX, FiType, FiEdit } from 'react-icons/fi';

interface Props {
  pageNumber: number;
  width: number;
  height: number;
  left: number;
  top: number;
}

interface TempBox {
  startX: number;
  startY: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function OverlayEditor({ pageNumber, width, height, left, top }: Props) {
  const editMode = useBookStore((s) => s.editMode);
  const activeTool = useBookStore((s) => s.activeTool);
  const activeColor = useBookStore((s) => s.activeColor);
  const overlays = useBookStore((s) => s.overlays[pageNumber] || []);
  const addOverlay = useBookStore((s) => s.addOverlay);
  const removeOverlay = useBookStore((s) => s.removeOverlay);
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const trackLinkClick = useAppStore((s) => s.trackLinkClick);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Drag boxes (Link, Video, Highlight, Textbox)
  const [tempBox, setTempBox] = useState<TempBox | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [value, setValue] = useState('');

  // Pencil freehand points
  const [currentPath, setCurrentPath] = useState<string>('');

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!editMode || formOpen || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);

    if (activeTool === 'pencil') {
      const pctX = (x / width) * 100;
      const pctY = (y / height) * 100;
      setCurrentPath(`M ${pctX.toFixed(1)} ${pctY.toFixed(1)}`);
    } else {
      setTempBox({
        startX: x,
        startY: y,
        x,
        y,
        w: 0,
        h: 0,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = Math.min(Math.max(0, e.clientX - rect.left), width);
    const currentY = Math.min(Math.max(0, e.clientY - rect.top), height);

    if (activeTool === 'pencil') {
      const pctX = (currentX / width) * 100;
      const pctY = (currentY / height) * 100;
      setCurrentPath((prev) => `${prev} L ${pctX.toFixed(1)} ${pctY.toFixed(1)}`);
    } else if (tempBox) {
      const x = Math.min(tempBox.startX, currentX);
      const y = Math.min(tempBox.startY, currentY);
      const w = Math.abs(tempBox.startX - currentX);
      const h = Math.abs(tempBox.startY - currentY);
      setTempBox((prev) => prev ? { ...prev, x, y, w, h } : null);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === 'pencil') {
      if (currentPath.includes('L')) {
        addOverlay(pageNumber, {
          id: uid(),
          type: 'pencil',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          value: currentPath,
          color: activeColor,
        });
      }
      setCurrentPath('');
    } else if (tempBox) {
      if (tempBox.w > 15 && tempBox.h > 15) {
        if (activeTool === 'highlight') {
          // Highlight is saved instantly without prompting
          addOverlay(pageNumber, {
            id: uid(),
            type: 'highlight',
            x: (tempBox.x / width) * 100,
            y: (tempBox.y / height) * 100,
            w: (tempBox.w / width) * 100,
            h: (tempBox.h / height) * 100,
            value: '',
            color: activeColor,
          });
          setTempBox(null);
        } else {
          setFormOpen(true);
        }
      } else {
        setTempBox(null);
      }
    }
  };

  const handleSave = () => {
    if (!tempBox || !value.trim()) return;
    
    const pctX = (tempBox.x / width) * 100;
    const pctY = (tempBox.y / height) * 100;
    const pctW = (tempBox.w / width) * 100;
    const pctH = (tempBox.h / height) * 100;

    let finalValue = value.trim();
    if (activeTool === 'video') {
      const ytMatch = finalValue.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([^"&?/ ]{11})/i);
      if (ytMatch) finalValue = ytMatch[1];
    }

    addOverlay(pageNumber, {
      id: uid(),
      type: activeTool,
      x: pctX,
      y: pctY,
      w: pctW,
      h: pctH,
      value: finalValue,
      color: activeTool === 'textbox' ? activeColor : undefined,
    });

    setTempBox(null);
    setValue('');
    setFormOpen(false);
  };

  const handleCancel = () => {
    setTempBox(null);
    setValue('');
    setFormOpen(false);
  };

  const handleLinkClick = (url: string) => {
    if (activeProjectId) {
      trackLinkClick(activeProjectId, url);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`absolute select-none pointer-events-auto overflow-hidden ${editMode ? 'cursor-crosshair bg-accent/5 border border-dashed border-accent/25' : ''}`}
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: editMode ? 35 : 25,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* SVGs Container for Pencil Sketches (mounted in background of overlays) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {overlays.filter(item => item.type === 'pencil').map((item) => (
          <path
            key={item.id}
            d={item.value}
            fill="none"
            stroke={item.color || '#eab308'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {/* Current Drawing Stroke */}
        {activeTool === 'pencil' && currentPath && (
          <path
            d={currentPath}
            fill="none"
            stroke={activeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Render Other Overlays */}
      {overlays.map((item) => {
        const style = {
          left: `${item.x}%`,
          top: `${item.y}%`,
          width: `${item.w}%`,
          height: `${item.h}%`,
        };

        if (item.type === 'pencil') return null; // rendered in SVG block above

        if (editMode) {
          return (
            <div
              key={item.id}
              className={`absolute border flex items-center justify-center group ${
                item.type === 'highlight'
                  ? 'border-dashed'
                  : 'bg-accent/10 border-accent'
              }`}
              style={{
                ...style,
                backgroundColor: item.type === 'highlight' ? `${item.color}44` : undefined,
                borderColor: item.type === 'highlight' ? item.color : undefined,
              }}
            >
              <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-slate-900 text-white rounded text-[9px] shadow-lg pointer-events-auto">
                {item.type === 'link' && <FiLink size={9} />}
                {item.type === 'video' && <FiVideo size={9} />}
                {item.type === 'highlight' && <FiEdit size={9} />}
                {item.type === 'textbox' && <FiType size={9} />}
                
                <span className="truncate max-w-[70px] font-mono">
                  {item.type === 'highlight' ? 'Highlight' : item.value}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOverlay(pageNumber, item.id);
                  }}
                  className="hover:text-red-400"
                >
                  <FiTrash2 size={9} />
                </button>
              </div>
            </div>
          );
        }

        // View Mode
        switch (item.type) {
          case 'link':
            return (
              <a
                key={item.id}
                href={item.value.startsWith('http') ? item.value : `https://${item.value}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(item.value)}
                className="absolute bg-blue-500/5 hover:bg-blue-500/15 border border-transparent hover:border-blue-500/30 transition-colors"
                style={style}
                title={`Visit: ${item.value}`}
              />
            );
          case 'video':
            return (
              <div key={item.id} className="absolute overflow-hidden" style={style}>
                <iframe
                  src={`https://www.youtube.com/embed/${item.value}?rel=0`}
                  title="Page video"
                  className="w-full h-full border-0 pointer-events-auto"
                  allowFullScreen
                />
              </div>
            );
          case 'highlight':
            return (
              <div
                key={item.id}
                className="absolute pointer-events-none"
                style={{
                  ...style,
                  backgroundColor: `${item.color || '#eab308'}66`,
                }}
              />
            );
          case 'textbox':
            return (
              <div
                key={item.id}
                className="absolute p-1 bg-white/95 dark:bg-slate-900/95 border rounded shadow-sm text-[10px] leading-tight select-text overflow-y-auto whitespace-pre-wrap pointer-events-auto"
                style={{
                  ...style,
                  borderColor: item.color || '#6366f1',
                  color: item.color || 'inherit',
                }}
              >
                {item.value}
              </div>
            );
          default:
            return null;
        }
      })}

      {/* Temporary Drawing Box (Highlight, Textbox, Link, Video) */}
      {tempBox && (
        <div
          className={`absolute ${activeTool === 'highlight' ? 'border-dashed' : ''}`}
          style={{
            left: `${tempBox.x}px`,
            top: `${tempBox.y}px`,
            width: `${tempBox.w}px`,
            height: `${tempBox.h}px`,
            backgroundColor: activeTool === 'highlight' ? `${activeColor}44` : 'rgba(99, 102, 241, 0.15)',
            border: `2px solid ${activeTool === 'highlight' ? activeColor : '#6366f1'}`,
          }}
        />
      )}

      {/* Floating Prompt Form */}
      {formOpen && tempBox && (
        <div
          className="absolute z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xl flex flex-col gap-2.5 w-64 pointer-events-auto text-slate-950 dark:text-slate-50"
          style={{
            left: `${Math.min(tempBox.x, width - 260)}px`,
            top: `${Math.min(tempBox.y + tempBox.h + 10, height - 180)}px`,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">
            {activeTool === 'textbox' ? 'Add TextBox' : `Add ${activeTool}`}
          </span>

          {activeTool === 'textbox' ? (
            <textarea
              placeholder="Type your notes here..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:border-accent text-slate-700 dark:text-slate-350 h-20 resize-none"
              autoFocus
            />
          ) : (
            <input
              type="text"
              placeholder={activeTool === 'link' ? 'Enter website URL...' : 'Enter YouTube URL or Video ID...'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:border-accent text-slate-700 dark:text-slate-350"
              autoFocus
            />
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-2.5 py-1 text-[11px] rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 transition-colors inline-flex items-center gap-1 font-semibold"
            >
              <FiX size={10} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!value.trim()}
              className="px-2.5 py-1 text-[11px] rounded bg-accent text-white hover:bg-accent/90 transition-colors inline-flex items-center gap-1 font-semibold disabled:opacity-50"
            >
              <FiCheck size={10} /> Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
