import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function LoadingBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(30);
    const t1 = setTimeout(() => setProgress(70), 150);
    const t2 = setTimeout(() => setProgress(100), 400);
    const t3 = setTimeout(() => setVisible(false), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2.5px]">
      <div
        className="h-full bg-primary shadow-[0_0_8px_hsl(224_76%_48%/0.5)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
