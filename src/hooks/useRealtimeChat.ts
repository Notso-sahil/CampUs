import { useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Listens to a Firestore document for changes (e.g. { updatedAt: timestamp })
 * and fires the callback to fetch actual data from the primary database (Neon).
 * 
 * @param docPath The path to the firestore document (e.g., 'chat_signals/conv123')
 * @param callback The function to execute when a change is detected
 */
export function useRealtimeChat(docPath: string | null | undefined, callback: () => void) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!docPath) return;

    // Initial fetch to load data immediately
    callbackRef.current();

    // Set up realtime listener on the signal document
    const unsub = onSnapshot(doc(db, docPath), (docSnapshot) => {
      // Whenever the document changes (timestamp update), run the callback to fetch from Neon
      // docSnapshot might not exist on the very first render if no messages have been sent yet.
      // But we still trigger the callback to load initial history (which we already did above).
      // If it exists and changes, it will trigger again.
      if (docSnapshot.exists() && docSnapshot.metadata.hasPendingWrites === false) {
        callbackRef.current();
      }
    }, (error) => {
      console.warn("Realtime signaling error:", error);
    });

    return () => unsub();
  }, [docPath]);
}
