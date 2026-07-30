import { useEffect } from "react";

export function useChatPolling(
  fetchFn: () => Promise<void> | void,
  intervalMs: number = 4000,
  dependencies: any[] = []
) {
  useEffect(() => {
    let mounted = true;

    const execute = async () => {
      if (!mounted) return;
      await fetchFn();
    };

    execute(); // Initial fetch
    const interval = setInterval(execute, intervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
