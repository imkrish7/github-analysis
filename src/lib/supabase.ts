import { createClient } from "@supabase/supabase-js";

const supabaseProjectURL = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET;
// console.log("je", anonKey);
const supabase = createClient(supabaseProjectURL!, anonKey!);

// Lets keep it simple
export const supabaseUpload = async (
	file: File,
	projectId: string,
	progress: (progress: number) => void,
) => {
	const { data, error } = await supabase.storage
		.from(bucket!)
		.upload(`/${projectId}/${file.name}`, file);
	if (error) {
		throw new Error("Meeting upload failed" + error.message);
	}
	const publicUrl = await supabase.storage
		.from(bucket!)
		.getPublicUrl(data.path);
	return publicUrl.data.publicUrl;
};

// sample upload CORS ERROR;

// return await new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     const formData = new FormData();
//     formData.append("file", file);

//     xhr.upload.onprogress = (event) => {
//         if (event.lengthComputable) {
//             const percentCompleted = Math.round(
//                 (event.loaded / event.total) * 100,
//             );
//             progress(percentCompleted);
//         }
//     };

//     xhr.onload = () => {
//         if (xhr.status === 200) {
//             resolve(JSON.parse(xhr.response));
//         } else {
//             reject(new Error("Upload failed" + xhr.status));
//         }
//     };

//     xhr.onerror = () => reject(new Error("Upload error"));

//     xhr.open(
//         "POST",
//         `${supabaseProjectURL}/storge/v1/object/${bucket}/${projectId}/${file.name}`,
//     );
//     xhr.setRequestHeader("Authorization", `Bearer ${anonKey}`);
//     xhr.send(formData);
// });
