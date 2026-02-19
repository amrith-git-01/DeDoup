import { X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { DetailsDrawerProps } from '../../types/ui';

const DRAWER_DURATION_MS = 400;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

function DetailsDrawer({ isOpen, onClose, title, count, children, footer }: DetailsDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setAnimateIn(false);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isClosing) {
      const id = requestAnimationFrame(() => setAnimateIn(true));
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen, isClosing]);

  useEffect(() => {
    const visible = isOpen || isClosing;
    if (!visible) return;

    const preventBackgroundScroll = (e: WheelEvent | TouchEvent) => {
      if (drawerRef.current && drawerRef.current.contains(e.target as Node)) return;
      e.preventDefault();
    };

    const opts = { passive: false, capture: true } as const;
    document.addEventListener('wheel', preventBackgroundScroll, opts);
    document.addEventListener('touchmove', preventBackgroundScroll, opts);

    return () => {
      document.removeEventListener('wheel', preventBackgroundScroll, opts);
      document.removeEventListener('touchmove', preventBackgroundScroll, opts);
    };
  }, [isOpen, isClosing]);

  const handleClose = () => {
    if (!isOpen) return;
    setIsClosing(true);
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== drawerRef.current || e.propertyName !== 'transform') return;
    if (isClosing) {
      setIsClosing(false);
      onClose();
    }
  };

  if (!mounted) return null;
  const show = isOpen || isClosing;
  if (!show) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90]"
      aria-hidden={!isOpen}
      style={{ pointerEvents: isClosing ? 'none' : undefined }}
    >
      <div
        className="fixed inset-0 bg-black/20 transition-opacity duration-[220ms] ease-out"
        style={{ opacity: isClosing ? 0 : 1, pointerEvents: isClosing ? 'none' : undefined }}
        onClick={handleClose}
      />
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl z-[100] flex flex-col border-l border-gray-100 rounded-tl-2xl rounded-bl-2xl overflow-hidden"
        style={{
          transform: isClosing
            ? 'translateX(100%)'
            : animateIn
              ? 'translateX(0)'
              : 'translateX(100%)',
          transition: `transform ${DRAWER_DURATION_MS}ms ${EASE}`,
          willChange: 'transform',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shadow-sm z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
            {count !== undefined && (
              <span className="flex-shrink-0 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                {count.toLocaleString()}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors flex-shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar relative">
          {children}
        </div>

        {footer && (
          <div className="flex-none px-6 py-4 border-t border-gray-100 bg-white z-10">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default DetailsDrawer;
