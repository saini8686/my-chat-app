import React, { useState, useEffect } from "react";
import { useFirebase } from "./FirebaseDataProv";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import firebaseData from "./FirebaseData";

const storage = getStorage(firebaseData);
const db = getFirestore(firebaseData);

const ImageUploadForm = () => {
  const { user } = useFirebase();
  const [textData, setTextData] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImageFile(file);
  };
  const saveImageData = async () => {
    try {
      if (!imageFile) {
        console.error("No image selected.");
        return;
      }

      const storageRef = ref(
        storage,
        "images/" + Date.now() + "_" + imageFile.name
      );

      const uploadTask = uploadBytesResumable(
        storageRef,
        imageFile,
        // Add an optional metadata object to the task
        { contentType: imageFile.type }
      );

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Error during upload:", error);
        },
        async () => {
          // Upload completed successfully, get the download URL
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Save data to Firestore including the image URL and text data
          await addDoc(collection(db, "students"), {
            name: textData,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString(),
            createdBy: user.displayName,
            createdByAcc: user.email,
          });

          setTextData("");
          setImageFile(null);
          setUploadProgress(0);

          console.log("Image and text data uploaded successfully!");

          // After uploading, fetch the updated list of images
          fetchUploadedImages();
        }
      );
    } catch (error) {
      console.error("Error adding image data:", error);
    }
  };
  const deleteImage = async (imageUrl) => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const docToDelete = querySnapshot.docs.find(
        (doc) => doc.data().imageUrl === imageUrl
      );

      if (docToDelete) {
        await deleteDoc(doc(db, "students", docToDelete.id));
        console.log("Image deleted successfully!");
        fetchUploadedImages(); // Fetch updated images after deletion
      } else {
        console.error("Document not found for deletion.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const fetchUploadedImages = async () => {
    try {
      const snapshot = await getDocs(collection(db, "students"));
      const images = snapshot.docs
        .filter((doc) => doc.data().imageUrl)
        .map((doc) => doc.data().imageUrl);
      setUploadedImages(images.reverse()); // Reverse the order
    } catch (error) {
      console.error("Error fetching uploaded images:", error);
    }
  };
  useEffect(() => {
    fetchUploadedImages();
  }, []); // Fetch images on component mount

  const handleSubmit = (e) => {
    e.preventDefault();
    saveImageData();
  };

  return (
    <div>
      <h2>Upload Image</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Text Data:
            <input
              type="text"
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Image:
            <input type="file" onChange={handleImageChange} />
          </label>
        </div>
        <div>
          <button type="submit">Upload</button>
        </div>
      </form>

      <h2>Upload Progress</h2>
      <div>
        <progress value={uploadProgress} max="100"></progress>
        {uploadProgress > 0 && <p>{uploadProgress.toFixed(2)}% Uploaded</p>}
      </div>

      <h2>Uploaded Images</h2>
      <div>
        {uploadedImages.map((imageUrl, index) => (
          <>
            {" "}
            <button onClick={() => deleteImage(imageUrl)}>Delete</button>
            <img
              key={index}
              src={imageUrl}
              alt={`Uploaded ${index + 1}`}
              style={{ maxWidth: "200px", maxHeight: "200px", margin: "10px" }}
            />
          </>
        ))}
      </div>
    </div>
  );
};

export default ImageUploadForm;
