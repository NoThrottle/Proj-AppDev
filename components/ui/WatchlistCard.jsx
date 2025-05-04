import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { normalizeTintColor } from "../../lib/utils";

export default function WatchlistCard({
  image,
  tintColor,
  title,
  href,
  placeholderIcon = "🖼️",
  children,
  imageAlt,
  onClick,
  clickable = true,
}) {
  const titleRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (titleRef.current) {
      setShouldScroll(titleRef.current.scrollWidth > titleRef.current.clientWidth);
    }
  }, [title]);

  return (
    <div
      className={
        `flex flex-col transition rounded-lg shadow-sm p-0 border border-gray-500 overflow-hidden w-full max-w-xs min-w-[16rem]` +
        (clickable ? ' cursor-pointer hover:scale-[1.025] hover:shadow-lg active:scale-[0.99] duration-150' : '')
      }
      style={{ backgroundColor: tintColor ? normalizeTintColor(tintColor) : undefined, minHeight: 340, maxHeight: 340 }}
      onClick={clickable && onClick ? onClick : undefined}
      tabIndex={clickable ? 0 : -1}
      role={clickable ? 'button' : undefined}
      onKeyDown={clickable && onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
    >
      <div className="relative w-full aspect-[16/9]" style={{ backgroundColor: tintColor ? normalizeTintColor(tintColor) : '#e5e7eb' }}>
        {image ? (
          <img
            src={image}
            alt={imageAlt || title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span className="text-4xl">{placeholderIcon}</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1 min-h-0 bg-transparent justify-between">
        <div className="relative w-full overflow-hidden" style={{height: '2.5em'}}>
          {href ? (
            <Link
              href={href}
              ref={titleRef}
              className={
                "font-semibold text-lg hover:underline block whitespace-nowrap" +
                (shouldScroll ? " animate-marquee" : " truncate")
              }
              title={title}
              style={shouldScroll ? { animationDuration: '8s' } : {}}
            >
              {title}
            </Link>
          ) : (
            <div
              ref={titleRef}
              className={
                "font-semibold text-lg block whitespace-nowrap" +
                (shouldScroll ? " animate-marquee" : " truncate")
              }
              title={title}
              style={shouldScroll ? { animationDuration: '8s' } : {}}
            >
              {title}
            </div>
          )}
        </div>
        <div className="flex-1" />
        <div className="mt-2 flex flex-col gap-2 justify-end flex-grow">{children}</div>
      </div>
    </div>
  );
}
// Add to your global CSS (e.g., app/globals.css):
// .animate-marquee { animation: marquee 8s linear infinite; }
// @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
