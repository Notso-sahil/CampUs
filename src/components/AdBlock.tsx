import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

interface AdBlockProps {
  slotId: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

const AdBlock = ({ slotId, format = "auto", className = "" }: AdBlockProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;

    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("Ads failed to load", e);
      }
    }, 100);

    // Observe the ad container for content changes (ad fill)
    const observer = new MutationObserver(() => {
      if (adRef.current && adRef.current.children.length > 0) {
        const iframe = adRef.current.querySelector("iframe");
        if (iframe) {
          setAdLoaded(true);
          observer.disconnect();
        }
      }
    });

    if (adRef.current) {
      observer.observe(adRef.current, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Don't render any space if the ad hasn't filled
  if (!adLoaded) {
    return (
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "none" }}
        data-ad-client="ca-pub-YOUR_ID_HERE"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    );
  }

  return (
    <div
      className={`my-6 flex justify-center border-t border-b border-border py-3 animate-fade-in ${className}`}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-YOUR_ID_HERE"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBlock;
