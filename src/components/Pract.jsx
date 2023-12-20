import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import firebaseData from "./FirebaseData";
import { useFirebase } from "./FirebaseDataProv";

const db = getFirestore(firebaseData);

const StudentTodo = () => {
  const { user, signOut } = useFirebase();

  const studentDataProvider = { name: "", class: 0, age: 0 };
  const [studentData, setStudentData] = useState(studentDataProvider);
  const [printStudentData, setPrintStudentData] = useState([]);
  const [SearchedData, setSearchedData] = useState("");
  const [confermationOverlay, setconfermationOverlay] = useState(-1);
  const [openMenuBar, setopenMenuBar] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updatingAgent, setupdatingAgent] = useState(null);
  const [handleUpdate, setHandleUpdate] = useState(false);
  const buttons = [
    {
      toggleMessagePopup: null,
      toggleMessagePopupSearched: null,
      currentMsgIndex: null,
      toggleSearchPage: false,
      handleUpdateInput: false,
    },
  ];
  const [buttonsHandler, setButtonsHandler] = useState(buttons);

  const saveNewData = async (e) => {
    e.preventDefault();
    if (studentData.name.trim() !== "") {
      try {
        // Save data to Firestore
        await addDoc(collection(db, "students"), {
          name: studentData.name,
          timestamp: new Date().toLocaleString(),
          timestamp2: new Date().toLocaleString(),
          getHours: new Date().getHours().toLocaleString(),
          getMinuts: new Date().getMinutes().toLocaleString(),
          editedBy: user.displayName,
          editedByAcc: user.email,
        });

        // Clear the form fields
        setStudentData(studentDataProvider);
      } catch (error) {
        console.error("Error adding student data:", error);
      }
    }
  };

  const fetchStudentData = async () => {
    const snapshot = await getDocs(collection(db, "students"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort the data based on timestamp in descending order
    const sortedData = data.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    setPrintStudentData(sortedData);
  };

  const hideStudentInfo = async (id) => {
    try {
      // Remove data from Firestore
      await deleteDoc(doc(db, "students", id));
    } catch (error) {
      console.error("Error removing student:", error);
    }
  };

  const handleEditClick = (student) => {
    setStudentData(student);
    setSelectedStudent(student.id);
  };

  const handleUpdateData = async (e) => {
    e.preventDefault();
    if (studentData.name.trim() !== "") {
      try {
        // Update data in Firestore
        await updateDoc(doc(db, "students", selectedStudent), {
          name: studentData.name,
          timestamp2: new Date().toLocaleString(),
          editedBy: user.displayName,
          editedByAcc: user.email,
        });

        // Clear the form fields and reset selected student
        setStudentData(studentDataProvider);
        setSelectedStudent(null);
      } catch (error) {
        console.error("Error updating student data:", error);
      }
    }
  };

  useEffect(() => {
    // Fetch and update the student data from Firestore
    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Sort the data based on timestamp in descending order
      const sortedData = data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setPrintStudentData(sortedData);
    });

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, []);

  const studentDataOutPut = printStudentData.filter((studentSearch) =>
    studentSearch.name.toLowerCase().includes(SearchedData.toLowerCase())
  );
  const blankInput = () => {
    setStudentData(studentDataProvider);
    setHandleUpdate(false);
  };
  return (
    <>
      <div
        id="todov2"
        className="bg-[#F6F7F9] min-h-screen max-h-screen overflow-auto pt-14 flex flex-col justify-between bg-gradient-to-t from-red-200 to-yellow-100">

        {/* ---------------- chat box ui start ----------------  */}

        <div className="container lg:max-w-[992px] xl:max-w-[1140px] 2xl:max-w-[1320px] mx-auto flex flex-col-reverse grow  pb-16 md:pb-24">
          {studentDataOutPut.length > 0 && (
            <>
              {studentDataOutPut.map((data, i) => (
                <>
                  <div className=" flex max-h-full overflow-auto flex-col pb-2 lg:pb-4 ">
                    <div
                      className={`flex items-end max-w-[526px] mt-2 sm:mt-3 w-full  ${data.editedBy === user.displayName
                        ? "!justify-end ml-auto"
                        : "mr-auto"
                        }`}>
                      <div
                        className={`inline-flex md:items-end gap-2 md:gap-x-3 items-center ${data.editedBy === user.displayName
                          ? "flex-row-reverse"
                          : ""
                          }`}>
                        <div>
                          <div className="profile "></div>
                        </div>
                        <div
                          className={`p-2 md:py-2 md:px-3 relative group ${data.editedBy === user.displayName
                            ? "messagebox "
                            : "messagebox2"
                            } `}>
                          <h4 className=" absolute top-0 -translate-y-1/2 left-0 name-logo">
                            {" "}
                            {data.editedBy}
                          </h4>
                          <p className="text-sm md:text-base">{data.name}</p>
                          <div
                            className={`message-box-popup absolute right-0 translate-y-0 -top-3 transition-all duration-300 ${buttonsHandler.toggleMessagePopup === i
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
                                }}>
                                <span onClick={() => setHandleUpdate(true)}>
                                  {" "}
                                  Edit
                                </span>
                              </li>
                              <li
                                onClick={() => {
                                  hideStudentInfo(data.id);
                                  setButtonsHandler({
                                    toggleMessagePopup: null,
                                  });
                                }}>
                                Remove
                              </li>
                            </ul>
                          </div>
                          {data.editedBy === user.displayName && (
                            <div
                              className={`message-box-popup absolute right-0 translate-y-0 -top-3 transition-all duration-300 ${buttonsHandler.toggleMessagePopup === i
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
                                  }}>
                                  <span onClick={() => setHandleUpdate(true)}>
                                    {" "}
                                    Edit
                                  </span>
                                </li>
                                <li
                                  onClick={() => {
                                    hideStudentInfo(data.id);
                                    setButtonsHandler({
                                      toggleMessagePopup: null,
                                    });
                                  }}>
                                  Remove
                                </li>
                                <li
                                  onClick={() => {
                                    setButtonsHandler({
                                      toggleMessagePopup: null,
                                      toggleEditorInfo: i,
                                    });
                                  }}>
                                  {data.timestamp !== data.timestamp2 && (
                                    <span>Edited By</span>
                                  )}
                                </li>
                              </ul>
                            </div>
                          )}

                          <div className="time_stamp relative overflow-visible flex justify-between w-full items-center -mb-2">
                            <span
                              className={`absolute top-0 right-0  w-full flex items-center justify-end pointer-events-none opacity-0 transition-all duration-300   ${data.editedBy === user.displayName &&
                                `group-hover:opacity-100 group-hover:pointer-events-auto`
                                } h-[80%]${buttonsHandler.toggleMessagePopup === i
                                  ? " pointer-events-auto opacity-100"
                                  : ""
                                } ${data.editedBy === user.displayName
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
                                <span>Edited</span>
                              </h4>
                            )}
                            <span className="inline-block select-none">
                              {data.getHours}:
                              {data.getMinuts < 10
                                ? 0 + data.getMinuts
                                : data.getMinuts}
                            </span>
                          </div>
                        </div>{" "}
                      </div>
                    </div>{" "}
                  </div>


                </>
              ))}
            </>
          )}

        </div>
        {/*------------------ Navbar ui start ------------------ */}
        <div className="bg-gradient-to-r from-purple-200 via-blue-100 min-h-24 max-h-24 flex justify-between items-center py-3  md:py-[18px] fixed top-0 w-full border-b-2 backdrop-blur-[20px]">
          <div className="container flex items-center justify-between lg:max-w-[992px] xl:max-w-[1140px] 2xl:max-w-[1320px] ">
            <div className="flex gap-2 md:gap-3 items-center">
              <a href="#" className="profile "></a>
              <div >
                <h6 className="profile_name text-sm md:text-base mb-0">Name</h6>
                <p className="profile_active_show text-[#929FB1] text-xs">Online</p>
              </div>
            </div>
            <div className="flex gap-3 md:gap-4 items-center transition-all ease-in duration-300 ">
              <a href="#" className="transition-all ease-in duration-200 hover:scale-[1.1]">
                <svg className="w-[20px] md:w-[24px]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 17.5L22 22M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z" stroke="#404B5A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </a>
              <a href="#" className="transition-all ease-in duration-200 hover:scale-[1.1]">
                <svg className="w-[20px] md:w-[24px]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2996 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 20 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11ZM13 9.5C13 10.3284 12.3284 11 11.5 11C10.6716 11 10 10.3284 10 9.5C10 8.67157 10.6716 8 11.5 8C12.3284 8 13 8.67157 13 9.5Z" stroke="#404B5A" stroke-width="1.5" stroke-linecap="round" />
                </svg>

              </a>
              <a href="#" className="transition-all ease-in duration-200 hover:scale-[1.1]">
                <svg className="w-[20px] md:w-[24px]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.77762 11.9424C2.8296 10.2893 2.37185 8.93948 2.09584 7.57121C1.68762 5.54758 2.62181 3.57081 4.16938 2.30947C4.82345 1.77638 5.57323 1.95852 5.96 2.6524L6.83318 4.21891C7.52529 5.46057 7.87134 6.08139 7.8027 6.73959C7.73407 7.39779 7.26737 7.93386 6.33397 9.00601L3.77762 11.9424ZM3.77762 11.9424C5.69651 15.2883 8.70784 18.3013 12.0576 20.2224M12.0576 20.2224C13.7107 21.1704 15.0605 21.6282 16.4288 21.9042C18.4524 22.3124 20.4292 21.3782 21.6905 19.8306C22.2236 19.1766 22.0415 18.4268 21.3476 18.04L19.7811 17.1668C18.5394 16.4747 17.9186 16.1287 17.2604 16.1973C16.6022 16.2659 16.0661 16.7326 14.994 17.666L12.0576 20.2224Z" stroke="#404B5A" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
              </a>
              <a href="#" className="transition-all ease-in duration-200 hover:scale-[1.1]">
                <svg className="w-[20px] md:w-[24px]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12C21 11.1716 20.3284 10.5 19.5 10.5C18.6716 10.5 18 11.1716 18 12C18 12.8284 18.6716 13.5 19.5 13.5C20.3284 13.5 21 12.8284 21 12Z" stroke="#404B5A" stroke-width="1.5" />
                  <path d="M13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12Z" stroke="#404B5A" stroke-width="1.5" />
                  <path d="M6 12C6 11.1716 5.32843 10.5 4.5 10.5C3.67157 10.5 3 11.1716 3 12C3 12.8284 3.67157 13.5 4.5 13.5C5.32843 13.5 6 12.8284 6 12Z" stroke="#404B5A" stroke-width="1.5" />
                </svg>

              </a>
            </div>
          </div>

        </div>
        {/*------------ Send message input ui start ------------ */}
        <div className="bg-gradient-to-l from-blue-200 via-purple-100 min-h-24 max-h-24 flex justify-center items-center py-3 md:py-[18px] fixed bottom-0 w-full shadow-black shadow-2xl backdrop-blur-[20px]">
          <form
            onSubmit={saveNewData}
            action=""
            className={`md:my-3 w-full  ${handleUpdate === true ? "hidden" : "block"
              }  `}>
            <div className="flex flex-wrap justify-center">
              <div className="px-2 w-full md:w-8/12 mx-1 relative">
                <input
                  className="w-full border-[1px] pl-4 pr-11 md:pr-[50px] py-2 md:py-3 border-[#6297e1] rounded-[8px] outline-none"
                  type="text"
                  name="name"
                  placeholder="Message..."
                  onChange={(e) =>
                    setStudentData({ ...studentData, name: e.target.value })
                  }
                  value={studentData.name}
                />{" "}
                <div className="text-center absolute top-1/2 -translate-y-1/2 right-[13px] flex justify-center items-center">
                  {studentData.name.trim() !== "" && (
                    <button
                      className="transition-all duration-300 pr-2 hover:scale-[1.1]"
                      type="submit">
                      <svg width="25" height="25" className="w-[20px] md:w-[25px]" viewBox="0 0 29 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.429688 24.1667V15.4167L12.0964 12.5L0.429688 9.58333V0.833328L28.138 12.5L0.429688 24.1667Z" fill="black" />
                      </svg>

                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
          <form
            onSubmit={handleUpdateData}
            action=""
            className={`my-4 w-full  ${handleUpdate ? "block" : "hidden"} `}>
            <div className="flex flex-wrap justify-center">
              <div className="my-2 px-2 w-full md:w-8/12 mx-1 relative">
                <input
                  className="w-full border-[1px] pl-4 pr-40 py-2 border-[#6297e1] rounded-[8px] outline-none"
                  type="text"
                  name="name"
                  placeholder="Message..."
                  onChange={(e) =>
                    setStudentData({ ...studentData, name: e.target.value })
                  }
                  value={studentData.name}
                />{" "}
                <div className="text-center flex gap-2 absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center">
                  <span
                    onClick={() => {
                      blankInput();
                    }}
                    className="px-5 py-[4px] bg-slate-800 text-white hover:bg-slate-200 hover:text-black transition-all duration-300 rounded-[4px] ">
                    cancel
                  </span>
                  <button
                    onClick={() => setHandleUpdate(false)}
                    className="px-5 py-[4px] bg-slate-800 text-white hover:bg-slate-200 hover:text-black transition-all duration-300 rounded-[4px] "
                    type="submit">
                    update
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default StudentTodo;
