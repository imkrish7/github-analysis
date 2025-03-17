// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
} from "firebase/storage";
import { error } from "console";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCnx3aqshtx5Fpw10wc-RVZrgD8wKqm234",
	authDomain: "github-analysis-a7627.firebaseapp.com",
	projectId: "github-analysis-a7627",
	storageBucket: "github-analysis-a7627.firebasestorage.app",
	messagingSenderId: "590938844623",
	appId: "1:590938844623:web:a78b7f31bf9ffe5c4f36ba",
	measurementId: "G-HLGJ3G1ZRR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);

export async function upload(
	file: File,
	setProgress?: (progress: number) => void,
) {
	return new Promise((resolve, reject) => {
		try {
			const storageRef = ref(storage, file.name);
			const uploadTask = uploadBytesResumable(storageRef, file);
			uploadTask.on(
				"state_changed",
				(snapshot) => {
					const progress = Math.round(
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100,
					);
					if (setProgress) setProgress(progress);
					switch (snapshot.state) {
						case "paused": {
							console.log("upload is paused");
							break;
						}
						case "running": {
							console.log("upload is runnig");
							break;
						}
					}
				},
				(error) => {
					reject(error);
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then(
						(downloadUrl) => {
							resolve(downloadUrl as string);
						},
					);
				},
			);
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
}
