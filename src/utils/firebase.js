// src/utils/firebase.js
// Configuración e integración básica con Firestore para enlaces
// Reemplaza los valores de firebaseConfig con los de tu proyecto en Firebase Console

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'TU_API_KEY',
  authDomain: 'TU_AUTH_DOMAIN',
  projectId: 'TU_PROJECT_ID',
  storageBucket: 'TU_STORAGE_BUCKET',
  messagingSenderId: 'TU_MESSAGING_SENDER_ID',
  appId: 'TU_APP_ID',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const enlacesRef = collection(db, 'enlaces');

// Crear un nuevo enlace

export async function crearEnlace(data) {
  const docRef = await addDoc(enlacesRef, data);
  return docRef.id;
}

// Obtener todos los enlaces
export async function obtenerEnlaces() {
  const snapshot = await getDocs(enlacesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Actualizar un enlace
export async function actualizarEnlace(id, data) {
  const enlaceDoc = doc(db, 'enlaces', id);
  await updateDoc(enlaceDoc, data);
}

// Borrar un enlace
export async function borrarEnlace(id) {
  const enlaceDoc = doc(db, 'enlaces', id);
  await deleteDoc(enlaceDoc);
}

// Sobrescribir un enlace (opcional, para ediciones completas)
export async function setEnlace(id, data) {
  const enlaceDoc = doc(db, 'enlaces', id);
  await setDoc(enlaceDoc, data);
}
