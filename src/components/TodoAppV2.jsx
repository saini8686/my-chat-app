import React, { useState, useEffect, useRef } from "react";
import defaultPicture from "../assets/download.jpeg";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import firebaseData from "./FirebaseData";
import { useFirebase } from "./FirebaseDataProv";

const db = getFirestore(firebaseData);
const storage = getStorage(firebaseData);

const MyChatApp = () => {
  const { user, signOut } = useFirebase();
  const inputRef = useRef(null);

  const chatAppProvider = { name: "", class: 0, age: 0, displayPicture: null };

  const [chatAppData, setChatAppData] = useState(chatAppProvider);
  const [printChatAppData, setPrintChatAppData] = useState([]);
  const [searchedData, setSearchedData] = useState("");
  const [selectedChatApp, setSelectedChatApp] = useState(null);
  const [handleUpdate, setHandleUpdate] = useState(false);
  const [displayPictureURL, setDisplayPictureURL] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [updateProfile, setUpdateProfile] = useState(null);
  const [handleUploadInput, sethandleUploadInput] = useState(false);
  const [uploadTask, setUploadTask] = useState(null);
  const [handleTotalUers, sethandleTotalUers] = useState([]);

  useEffect(() => {
    console.log("displayPictureURL", displayPictureURL);
  }, [displayPictureURL]);

  const buttons = [
    {
      toggleMessagePopup: null,
      toggleMessagePopupSearched: null,
      currentMsgIndex: null,
      toggleSearchPage: false,
      handleUpdateInput: false,
      handleMenuOption: false,
    },
  ];

  const [buttonsHandler, setButtonsHandler] = useState(buttons);

  useEffect(() => {
    const storedURLSession = sessionStorage.getItem("displayPictureURL");
    const storedURLLocal = localStorage.getItem("displayPictureURL");
    const storedURL = storedURLSession || storedURLLocal;

    if (storedURL) {
      setDisplayPictureURL(storedURL);
    } else {
      setDisplayPictureURL(null);
    }
  }, []);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (user) {
        try {
          const storageRef = ref(storage, `avatars/${user.email}`);
          const url = await getDownloadURL(storageRef);
          setDisplayPictureURL(url);
        } catch (error) {
          console.error("Error fetching profile picture:", error);
        }
      }
    };

    fetchProfilePicture();
  }, [user]);

  const handleUploadDisplayPicture = (file) => {
    setChatAppData((prevData) => ({ ...prevData, displayPicture: file }));
    sethandleUploadInput(true);
  };

  const handleEditDisplayPicture = (file) => {
    setChatAppData((prevData) => ({ ...prevData, displayPicture: file }));
  };

  const handleRemoveDisplayPicture = async () => {
    if (chatAppData.displayPicture && chatAppData.displayPicture.name) {
      const imageName = chatAppData.displayPicture.name;
      const storageRef = ref(storage, `avatars/${imageName}`);

      try {
        await deleteObject(storageRef);
        sessionStorage.removeItem("displayPictureURL");
      } catch (error) {
        console.error("Error deleting image from Firebase Storage:", error);
      }
    }

    setChatAppData(chatAppProvider);
    setUploadProgress(0);
    setUpdateProfile(false);
    sethandleUploadInput(false);
    setChatAppData((prevData) => ({ ...prevData, displayPicture: null }));
    setDisplayPictureURL(null);
  };

  const handleUploadProfileImage = async () => {
    if (chatAppData.displayPicture && user) {
      try {
        const storageRef = ref(storage, `avatars/${user.email}`);
        const task = uploadBytesResumable(
          storageRef,
          chatAppData.displayPicture
        );

        setUploadTask(task);

        task.on("state_changed", (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        });

        await task;

        const newDisplayPictureURL = await getDownloadURL(storageRef);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            displayPictureURL: newDisplayPictureURL,
          });
        } else {
          await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            displayPictureURL: newDisplayPictureURL,
          });
        }

        sessionStorage.setItem("displayPictureURL", newDisplayPictureURL);

        setDisplayPictureURL(newDisplayPictureURL);
        setChatAppData(chatAppProvider);
        setUploadProgress(0);
        setUpdateProfile(false);
        sethandleUploadInput(false);
      } catch (error) {
        if (error.code !== "storage/canceled") {
          console.error("Error uploading profile image:", error);
        } else {
          console.log("Image upload canceled");
        }
      } finally {
        setUploadTask(null);
      }
    }
  };

  const handleCancelUpload = () => {
    setChatAppData(chatAppProvider);
    setUploadProgress(0);
    setUpdateProfile(false);
    sethandleUploadInput(false);

    if (uploadTask) {
      uploadTask.cancel();
    }
  };

  const senderCheck = user.email;
  const withoutDomain = senderCheck.replace(/@gmail\.com$/, "");

  const saveNewData = async (e) => {
    e.preventDefault();
    const inputElement = document.getElementById("inputHandler");
    if (inputElement) {
      inputElement.focus();
    }
    if (chatAppData.name.trim() !== "") {
      setTimeout(() => {
        document
          .getElementById("scrollBottom")
          .scrollIntoView({ behavior: "smooth" });
      }, 100);
      setChatAppData(chatAppProvider);

      try {
        const newMessage = {
          name: chatAppData.name,
          timestamp: new Date().toLocaleString(),
          timestamp2: new Date().toLocaleString(),
          getHours: new Date().getHours(),
          getMinutes: new Date().getMinutes(),
          editedBy: user.displayName,
          editedByAcc: user.email,
          senderCheck: withoutDomain,
          displayPictureURL: displayPictureURL || defaultPicture,
        };

        // Add the new document to Firestore
        await addDoc(collection(db, "chatData"), newMessage);

        setUploadProgress(0);
      } catch (error) {
        console.error("Error adding chat app data:", error);
      }
    }
  };

  const hideChatAppInfo = async (id) => {
    try {
      await deleteDoc(doc(db, "chatData", id));
    } catch (error) {
      console.error("Error removing chat app:", error);
    }
  };

  const handleEditClick = (chatApp) => {
    setChatAppData(chatApp);
    setSelectedChatApp(chatApp.id);
  };

  const handleUpdateData = async (e) => {
    e.preventDefault();
    if (chatAppData.name.trim() !== "") {
      setChatAppData(chatAppProvider);
      setSelectedChatApp(null);
      setHandleUpdate(false);
      try {
        await updateDoc(doc(db, "chatData", selectedChatApp), {
          name: chatAppData.name,
          timestamp2: new Date().toLocaleString(),
          editedBy: user.displayName,
          editedByAcc: user.email,
        });
      } catch (error) {
        console.error("Error updating chat app data:", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "chatData"), orderBy("timestamp", "desc")),
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setPrintChatAppData(data);
        } catch (error) {
          console.error("Error processing chat data:", error);
          setPrintChatAppData([]);
        }
      }
    );

    return () => unsubscribe();
  }, [db]);

  const chatAppDataOutput = printChatAppData
    .filter(
      (chatAppSearch) =>
        chatAppSearch.name &&
        chatAppSearch.name.toLowerCase().includes(searchedData.toLowerCase())
    )
    .sort((a, b) => {
      const timestampA = a.timestamp ? new Date(a.timestamp) : null;
      const timestampB = b.timestamp ? new Date(b.timestamp) : null;

      if (timestampA && timestampB) {
        return timestampB - timestampA;
      }

      // Handle cases where either timestamp is missing
      if (timestampA) {
        return -1; // A has timestamp, but B doesn't
      } else if (timestampB) {
        return 1; // B has timestamp, but A doesn't
      }

      return 0; // Both A and B don't have a timestamp
    });

  const blankInput = () => {
    setChatAppData(chatAppProvider);
  };
  //
  return (
    <>
      {" "}
      <div className="bg-gradient-to-r from-purple-200 via-blue-100 min-h-24 max-h-24 flex justify-between items-center py-3  md:py-[18px] sticky top-0 w-full border-b-2 backdrop-blur-[20px] z-50 px-3">
        {handleUploadInput && (
          <div
            style={{ transform: `translateY(${uploadProgress}%` }}
            className={` fixed top-0 left-0 h-full w-full bg-[#0e0e0e69] backdrop-blur-[5px] z-50 `}></div>
        )}

        <div className="container flex items-center justify-between lg:max-w-[992px] xl:max-w-[1140px] 2xl:max-w-[1320px] ">
          <div className="flex gap-2 md:gap-3 items-center relative">
            <div
              className=" profile overflow-hidden  "
              onClick={() => setUpdateProfile(true)}>
              <img
                src={displayPictureURL ? displayPictureURL : defaultPicture}
                alt="User Display"
                style={{
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </div>{" "}
            {updateProfile === true && (
              <div
                className={`message-box-popup absolute right-0 translate-y-0 -top-3 transition-all duration-300 `}>
                <ul className="option-ul">
                  {!displayPictureURL ? (
                    <>
                      <li>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="uploadFileInput"
                          onChange={(e) =>
                            handleUploadDisplayPicture(e.target.files[0])
                          }
                        />
                        <label htmlFor="uploadFileInput">Select Profile</label>
                      </li>
                      {handleUploadInput && (
                        <li onClick={handleUploadProfileImage}>
                          Upload Profile
                        </li>
                      )}
                      {handleUploadInput ? (
                        <li
                          onClick={() => {
                            handleCancelUpload();
                            setUpdateProfile(false);
                            sethandleUploadInput(false);
                          }}>
                          Cancel
                        </li>
                      ) : (
                        <li
                          onClick={() => {
                            setUpdateProfile(false);
                            sethandleUploadInput(false);
                          }}>
                          Close
                        </li>
                      )}
                    </>
                  ) : (
                    <>
                      <li onClick={() => setUpdateProfile(false)}>
                        <span> Edit</span>
                      </li>
                      <li
                        onClick={() => {
                          handleRemoveDisplayPicture();
                          setUpdateProfile(false);
                        }}>
                        Remove
                      </li>
                      <li onClick={() => setUpdateProfile(false)}>Cancel</li>
                    </>
                  )}
                </ul>
              </div>
            )}
            <div>
              <h6 className="profile_name text-sm md:text-base mb-0">
                {user.displayName}
              </h6>
              <p className="profile_active_show text-[#929FB1] text-xs">null</p>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4 items-center transition-all ease-in duration-300 relative">
            <a
              href="#"
              className="transition-all ease-in duration-200 hover:scale-[1.1]">
              <svg
                className="w-[20px] md:w-[24px]"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.5 17.5L22 22M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z"
                  stroke="#404B5A"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
            <a
              href="#"
              className="transition-all ease-in duration-200 hover:scale-[1.1]">
              <svg
                className="w-[20px] md:w-[24px]"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2996 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 20 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11ZM13 9.5C13 10.3284 12.3284 11 11.5 11C10.6716 11 10 10.3284 10 9.5C10 8.67157 10.6716 8 11.5 8C12.3284 8 13 8.67157 13 9.5Z"
                  stroke="#404B5A"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </a>
            <a
              href="#"
              className="transition-all ease-in duration-200 hover:scale-[1.1]">
              <svg
                className="w-[20px] md:w-[24px]"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.77762 11.9424C2.8296 10.2893 2.37185 8.93948 2.09584 7.57121C1.68762 5.54758 2.62181 3.57081 4.16938 2.30947C4.82345 1.77638 5.57323 1.95852 5.96 2.6524L6.83318 4.21891C7.52529 5.46057 7.87134 6.08139 7.8027 6.73959C7.73407 7.39779 7.26737 7.93386 6.33397 9.00601L3.77762 11.9424ZM3.77762 11.9424C5.69651 15.2883 8.70784 18.3013 12.0576 20.2224M12.0576 20.2224C13.7107 21.1704 15.0605 21.6282 16.4288 21.9042C18.4524 22.3124 20.4292 21.3782 21.6905 19.8306C22.2236 19.1766 22.0415 18.4268 21.3476 18.04L19.7811 17.1668C18.5394 16.4747 17.9186 16.1287 17.2604 16.1973C16.6022 16.2659 16.0661 16.7326 14.994 17.666L12.0576 20.2224Z"
                  stroke="#404B5A"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
            <a
              onClick={() =>
                setButtonsHandler({
                  handleMenuOption: true,
                })
              }
              href="#"
              className="transition-all ease-in duration-200 hover:scale-[1.1]">
              <svg
                className="w-[20px] md:w-[24px]"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 12C21 11.1716 20.3284 10.5 19.5 10.5C18.6716 10.5 18 11.1716 18 12C18 12.8284 18.6716 13.5 19.5 13.5C20.3284 13.5 21 12.8284 21 12Z"
                  stroke="#404B5A"
                  stroke-width="1.5"
                />
                <path
                  d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z"
                  stroke="#404B5A"
                  stroke-width="1.5"
                />
                <path
                  d="M6 12C6 11.1716 5.32843 10.5 4.5 10.5C3.67157 10.5 3 11.1716 3 12C3 12.8284 3.67157 13.5 4.5 13.5C5.32843 13.5 6 12.8284 6 12Z"
                  stroke="#404B5A"
                  stroke-width="1.5"
                />
              </svg>
            </a>
            <div
              className={`message-box-popup absolute right-0 translate-y-0 -top-3 transition-all duration-300 ${
                buttonsHandler.handleMenuOption ? "scale-100" : "scale-0"
              }`}>
              {" "}
              <span
                onClick={() =>
                  setButtonsHandler({
                    handleMenuOption: null,
                  })
                }
                className=" cross-icon">
                +
              </span>
              <ul className="option-ul">
                <li
                  onClick={() => {
                    setButtonsHandler({
                      handleMenuOption: null,
                    });
                    signOut();
                  }}>
                  Sign-Out
                </li>
                <li
                  onClick={() => {
                    setButtonsHandler({
                      handleMenuOption: null,
                    });
                  }}>
                  Close
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div
        id="todov2"
        className="bg-[#F6F7F9] min-h-screen max-h-screen overflow-auto pt-14 flex flex-col justify-between bg-gradient-to-t from-red-200 to-yellow-100">
        <div className="container lg:max-w-[992px] xl:max-w-[1140px] 2xl:max-w-[1320px] mx-auto flex flex-col-reverse grow  pb-16 md:pb-24 relative min-h-[100dbvh]">
          <div
            className=" absolute -bottom-[100px] pointer-events-none "
            id="scrollBottom"></div>
          {chatAppDataOutput.length > 0 ? (
            <>
              {chatAppDataOutput.map((data, i) => (
                <div key={data.i}>
                  <div className=" flex max-h-full overflow-auto flex-col pb-2 lg:pb-4 ">
                    <div
                      className={`flex items-end max-w-[526px] mt-2 sm:mt-3 w-full  ${
                        data.editedBy === user.displayName
                          ? "!justify-end ml-auto"
                          : "mr-auto"
                      }`}>
                      <div
                        className={`md:ml-5 md:mr-[30px] inline-flex md:items-end gap-2 md:gap-x-3 items-center ${
                          data.editedBy === user.displayName
                            ? "flex-row-reverse"
                            : ""
                        }`}>
                        <div>
                          <div className=" profile overflow-hidden ">
                            <img
                              src={data.displayPictureURL}
                              alt="User Display"
                              style={{
                                objectFit: "cover",
                                borderRadius: "50%",
                              }}
                            />
                          </div>
                        </div>
                        {/* user.displayName */}
                        <div
                          className={`p-2 md:py-2 md:px-3 relative group ${
                            data.editedBy === user.displayName
                              ? "messagebox "
                              : "messagebox2"
                          } `}>
                          <p className="text-sm md:text-base">{data.name}</p>

                          {data.editedBy === user.displayName && (
                            <div
                              className={`message-box-popup absolute right-0 translate-y-0 -top-3 transition-all duration-300 ${
                                buttonsHandler.toggleMessagePopup === i
                                  ? "scale-100"
                                  : "scale-0"
                              }`}>
                              {" "}
                              <span
                                onClick={() =>
                                  setButtonsHandler({
                                    toggleMessagePopup: null,
                                  })
                                }
                                className=" cross-icon">
                                +
                              </span>
                              <ul className="option-ul">
                                <li
                                  onClick={() => {
                                    handleEditClick(data);
                                    setButtonsHandler({
                                      toggleMessagePopup: null,
                                    });
                                    setHandleUpdate(true);
                                  }}>
                                  <span> Edit</span>
                                </li>
                                <li
                                  onClick={() => {
                                    hideChatAppInfo(data.id);
                                    setButtonsHandler({
                                      toggleMessagePopup: null,
                                    });
                                  }}>
                                  Remove
                                </li>
                              </ul>
                            </div>
                          )}

                          <div className="time_stamp relative overflow-visible flex justify-between w-full items-center -mb-2">
                            <span
                              className={`absolute top-0 right-0  w-full flex items-center justify-end pointer-events-none opacity-0 transition-all duration-300   ${
                                data.editedBy === user.displayName &&
                                `group-hover:opacity-100 group-hover:pointer-events-auto`
                              } h-[80%]${
                                buttonsHandler.toggleMessagePopup === i
                                  ? " pointer-events-auto opacity-100"
                                  : ""
                              } ${
                                data.editedBy === user.displayName
                                  ? "bg-[#EBF1FF] "
                                  : "bg-white"
                              }`}>
                              <svg
                                onClick={() =>
                                  setButtonsHandler({ toggleMessagePopup: i })
                                }
                                className="cursor-pointer"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                  d="M21 12C21 11.1716 20.3284 10.5 19.5 10.5C18.6716 10.5 18 11.1716 18 12C18 12.8284 18.6716 13.5 19.5 13.5C20.3284 13.5 21 12.8284 21 12Z"
                                  stroke="#404B5A"
                                  stroke-width="1.5"
                                />
                                <path
                                  d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z"
                                  stroke="#404B5A"
                                  stroke-width="1.5"
                                />
                                <path
                                  d="M6 12C6 11.1716 5.32843 10.5 4.5 10.5C3.67157 10.5 3 11.1716 3 12C3 12.8284 3.67157 13.5 4.5 13.5C5.32843 13.5 6 12.8284 6 12Z"
                                  stroke="#404B5A"
                                  stroke-width="1.5"
                                />
                              </svg>
                            </span>
                            {data.timestamp !== data.timestamp2 && (
                              <h4 className="absolute left-0 top-0 font-light duration-300 select-none">
                                <span className="text-[10px]">Edited</span>
                              </h4>
                            )}
                            <span className="inline-block select-none">
                              {data.getHours == 0
                                ? data.getHours + "0"
                                : data.getHours}
                              :
                              {data.getMinutes < 10
                                ? "0" + data.getMinutes
                                : data.getMinutes}
                            </span>
                          </div>
                        </div>{" "}
                      </div>
                    </div>{" "}
                  </div>
                </div>
              ))}
            </>
          ) : (
            ""
          )}
        </div>
        <div className="bg-gradient-to-l from-blue-200 via-purple-100 min-h-24 max-h-24 flex  items-center py-3 md:py-[18px] fixed bottom-0 w-[100%] shadow-black shadow-2xl backdrop-blur-[20px]">
          {handleUpdate === false && (
            <form
              onSubmit={saveNewData}
              action=""
              className={`md:my-3 w-[80%]  ${
                handleUpdate === true ? "!hidden" : "!block"
              }  `}>
              <div className="flex flex-wrap justify-center">
                <div className="px-2 w-full md:w-8/12 mx-1 relative">
                  <input
                    id="inputHandler"
                    className="w-full border-[1px] pl-4 pr-11 md:pr-[50px] py-2 md:py-3 border-[#6297e1] rounded-[8px] outline-none focus:border-[#4b86d8]"
                    type="text"
                    name="name"
                    placeholder="Message..."
                    onChange={(e) =>
                      setChatAppData({ ...chatAppData, name: e.target.value })
                    }
                    value={chatAppData.name}
                  />{" "}
                  <div className="text-center absolute top-1/2 -translate-y-1/2 right-[13px] flex justify-center items-center">
                    {chatAppData.name.trim() !== "" && (
                      <button
                        className="transition-all duration-300 pr-2 hover:scale-[1.1]"
                        type="submit">
                        <svg
                          width="25"
                          height="25"
                          className="w-[20px] md:w-[25px]"
                          viewBox="0 0 29 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M0.429688 24.1667V15.4167L12.0964 12.5L0.429688 9.58333V0.833328L28.138 12.5L0.429688 24.1667Z"
                            fill="black"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}

          {handleUpdate && (
            <form
              onSubmit={handleUpdateData}
              className="my-4 w-[80%] flex justify-center">
              <div className="my-2 px-2 w-full md:w-8/12 mx-1 relative">
                <input
                  ref={inputRef}
                  className="w-full border-[1px] pl-4 pr-11 md:pr-[50px] py-2 md:py-3 border-[#6297e1] rounded-[8px] outline-none"
                  type="text"
                  name="name"
                  placeholder="Message..."
                  onChange={(e) =>
                    setChatAppData({ ...chatAppData, name: e.target.value })
                  }
                  value={chatAppData.name}
                />
                <div className="text-center flex gap-4 absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center">
                  <span
                    onClick={() => {
                      setHandleUpdate(false);
                      blankInput();
                    }}
                    className=" cursor-pointer h-full group">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        className=" group-hover:fill-sky-300 transition-all duration-300 "
                        d="M15.854 12.8541L11 8.00008L15.854 3.14608C15.947 3.05193 15.9991 2.92492 15.9991 2.79258C15.9991 2.66023 15.947 2.53322 15.854 2.43908L13.561 0.146076C13.5146 0.0995436 13.4595 0.0626219 13.3988 0.0374289C13.3382 0.012236 13.2731 -0.000732422 13.2075 -0.000732422C13.1418 -0.000732422 13.0767 0.012236 13.0161 0.0374289C12.9554 0.0626219 12.9003 0.0995436 12.854 0.146076L7.99995 5.00008L3.14595 0.146076C3.05219 0.0523407 2.92504 -0.000317003 2.79245 -0.000317003C2.65987 -0.000317003 2.53272 0.0523407 2.43895 0.146076L0.145954 2.43908C0.0994215 2.48544 0.0624998 2.54053 0.0373069 2.60119C0.0121139 2.66185 -0.000854492 2.72689 -0.000854492 2.79258C-0.000854492 2.85826 0.0121139 2.9233 0.0373069 2.98396C0.0624998 3.04462 0.0994215 3.09972 0.145954 3.14608L4.99995 8.00008L0.145954 12.8541C0.0522186 12.9478 -0.000439073 13.075 -0.000439073 13.2076C-0.000439073 13.3402 0.0522186 13.4673 0.145954 13.5611L2.43895 15.8541C2.48531 15.9006 2.54041 15.9375 2.60107 15.9627C2.66173 15.9879 2.72677 16.0009 2.79245 16.0009C2.85814 16.0009 2.92318 15.9879 2.98384 15.9627C3.0445 15.9375 3.09959 15.9006 3.14595 15.8541L7.99995 11.0001L12.854 15.8541C12.9477 15.9478 13.0749 16.0005 13.2075 16.0005C13.34 16.0005 13.4672 15.9478 13.561 15.8541L15.854 13.5611C15.9005 13.5147 15.9374 13.4596 15.9626 13.399C15.9878 13.3383 16.0008 13.2733 16.0008 13.2076C16.0008 13.1419 15.9878 13.0769 15.9626 13.0162C15.9374 12.9555 15.9005 12.9004 15.854 12.8541Z"
                        fill="#6297e1"
                      />
                    </svg>
                  </span>
                  {chatAppData.name.trim() !== "" && (
                    <button className="pr-2  group" type="submit">
                      <svg
                        width="25"
                        height="25"
                        className="w-[20px] md:w-[25px]"
                        viewBox="0 0 29 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          className=" group-hover:fill-sky-300 transition-all duration-300 "
                          d="M0.429688 24.1667V15.4167L12.0964 12.5L0.429688 9.58333V0.833328L28.138 12.5L0.429688 24.1667Z"
                          fill="#6297e1"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default MyChatApp;
