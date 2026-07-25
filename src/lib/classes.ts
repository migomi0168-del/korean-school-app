import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ClassRoom } from "@/types";

// Class doc ID = teacherId (1 teacher : 1 class), so this is idempotent
// under concurrent calls (e.g. React StrictMode double-invoking effects)
// instead of racing a query-then-create against itself.
export async function ensureClassForTeacher(teacherId: string): Promise<ClassRoom> {
  const ref = doc(db, "classes", teacherId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: ref.id, ...(snap.data() as Omit<ClassRoom, "id">) };
  }
  const createdAt = Date.now();
  await setDoc(ref, { teacherId, className: "우리 반", createdAt }, { merge: true });
  return { id: ref.id, teacherId, className: "우리 반", createdAt };
}
