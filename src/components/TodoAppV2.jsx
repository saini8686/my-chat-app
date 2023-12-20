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
        className="bg-[#F6F7F9] min-h-screen max-h-screen overflow-auto pt-14 flex flex-col justify-between bg-gradient-to-b from-red-200 to-yellow-100">
        <div className="container lg:max-w-[992px] xl:max-w-[1140px] 2xl:max-w-[1320px] mx-auto flex flex-col-reverse grow  pb-16 md:pb-24">
          {studentDataOutPut.length > 0 && (
            <>
              {studentDataOutPut.map((data, i) => (
                <>
                  <div className=" flex max-h-full overflow-auto flex-col pb-4 ">
                    <div
                      className={`flex items-end max-w-[526px] mt-3 w-full  ${
                        data.editedBy === user.displayName
                          ? "!justify-end ml-auto"
                          : "mr-auto"
                      }`}>
                      <div
                        className={` mx-3 md:ml-5 md:mr-[30px] inline-flex md:items-end gap-2 md:gap-x-3 items-center ${
                          data.editedBy === user.displayName
                            ? "flex-row-reverse"
                            : ""
                        }`}>
                        <div>
                          <div className=" profile "></div>
                        </div>
                        <div
                          className={`p-2 md:py-2 md:px-3 relative group ${
                            data.editedBy === user.displayName
                              ? "messagebox "
                              : "messagebox2"
                          } `}>
                          <h4 className=" absolute top-0 -translate-y-1/2 left-0 name-logo">
                            {" "}
                            {data.editedBy}
                          </h4>
                          <p className="text-sm md:text-base">{data.name}</p>
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
        <div className="bg-gradient-to-r from-blue-200 via-purple-100 to-pink-200 min-h-24 max-h-24 flex justify-center items-center py-3 md:py-[18px] fixed bottom-0 w-full">
          <form
            onSubmit={saveNewData}
            action=""
            className={`md:my-3 w-full  ${
              handleUpdate === true ? "hidden" : "block"
            }  `}>
            <div className="flex flex-wrap justify-center">
              <div className="px-2 w-full md:w-8/12 mx-1 relative">
                <input
                  className="w-full border-[1px] pl-4 pr-20 py-2 md:py-3 border-[#6297e1] rounded-[8px] outline-none"
                  type="text"
                  name="name"
                  placeholder="Message..."
                  onChange={(e) =>
                    setStudentData({ ...studentData, name: e.target.value })
                  }
                  value={studentData.name}
                />{" "}
                <div className="text-center absolute top-1/2 -translate-y-1/2 right-[13px]">
                  {studentData.name.trim() !== "" && (
                    <button
                      className="px-5 py-[4px] bg-slate-800 text-white hover:bg-slate-200 hover:text-black transition-all duration-300 rounded-[4px]"
                      type="submit">
                      Send
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
            <div className="flex flex-wrap justify-center ">
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
