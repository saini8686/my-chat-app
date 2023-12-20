// import React, { useState } from "react";
// import { useFirebase } from "./FirebaseDataProv";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { getFirestore, collection, addDoc } from "firebase/firestore";
// import firebaseData from "./FirebaseData";
// const storage = getStorage(firebaseData);
// const db = getFirestore(firebaseData);

// const ImageUploadForm = () => {
//   const { user } = useFirebase();
//   const [textData, setTextData] = useState("");
//   const [imageFile, setImageFile] = useState(null);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     setImageFile(file);
//   };

//   const saveImageData = async () => {
//     try {
//       if (!imageFile) {
//         console.error("No image selected.");
//         return;
//       }

//       const storageRef = ref(
//         storage,
//         "images/" + Date.now() + "_" + imageFile.name
//       );

//       // Read the image file as an ArrayBuffer
//       const arrayBuffer = await new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.readAsArrayBuffer(imageFile);
//       });

//       // Convert the ArrayBuffer to a Uint8Array
//       const fileArray = new Uint8Array(arrayBuffer);

//       // Upload the image to Firebase Storage
//       await uploadBytes(storageRef, fileArray);

//       // Get the download URL of the uploaded image
//       const imageUrl = await getDownloadURL(storageRef);

//       // Save data to Firestore including the image URL and text data
//       await addDoc(collection(db, "students"), {
//         name: textData, // Use the provided text data
//         imageUrl: imageUrl,
//         timestamp: new Date().toISOString(),
//         createdBy: user.displayName,
//         createdByAcc: user.email,
//       });

//       // Reset the form fields after successful upload
//       setTextData("");
//       setImageFile(null);

//       console.log("Image and text data uploaded successfully!");
//     } catch (error) {
//       console.error("Error adding image data:", error);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     saveImageData();
//   };

//   return (
//     <div>
//       <h2>Upload Image</h2>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>
//             Text Data:
//             <input
//               type="text"
//               value={textData}
//               onChange={(e) => setTextData(e.target.value)}
//             />
//           </label>
//         </div>
//         <div>
//           <label>
//             Image:
//             <input type="file" onChange={handleImageChange} />
//           </label>
//         </div>
//         <div>
//           <button type="submit">Upload</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ImageUploadForm;
