import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlYIbxd3OKOZa6PkSeCZyHwlmlNw6G1Ho",
  authDomain: "brainware-buddy.firebaseapp.com",
  projectId: "brainware-buddy",
  storageBucket: "brainware-buddy.appspot.com",
  messagingSenderId: "448530074988",
  appId: "1:448530074988:web:c980294a47cbff2f4d7749"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export async function getKnowledgeBase() {
  const querySnapshot = await getDocs(collection(db, "knowledge_base"));
  const knowledgeBase: any[] = [];
  querySnapshot.forEach((doc) => {
    knowledgeBase.push({ id: doc.id, ...doc.data() });
  });
  return knowledgeBase;
}
