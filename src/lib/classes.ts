import { collection, query, where, getDocs, addDoc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ClassRoom } from "@/types";

const classesCol = collection(db, "classes");

export async function ensureClassForTeacher(teacherId: string): Promise<ClassRoom> {
  const q = query(classesCol, where("teacherId", "==", teacherId), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as Omit<ClassRoom, "id">) };
  }
  const createdAt = Date.now();
  const docRef = await addDoc(classesCol, {
    teacherId,
    className: "우리 반",
    createdAt,
  });
  return { id: docRef.id, teacherId, className: "우리 반", createdAt };
}
