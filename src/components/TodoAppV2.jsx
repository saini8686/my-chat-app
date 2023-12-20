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
      <section
        id="todov2"
        className="bg-[#F6F7F9] min-h-screen max-h-screen overflow-auto pt-14 flex flex-col justify-between ">
        {/* <div onClick={signOut} className="btn">
          Sign Out
        </div>
        <h2>{user.displayName}</h2>
        <h2>{user.email}</h2> */}
        <div className="container mx-auto flex flex-col-reverse grow ">
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
                        className={`ml-5 mr-[30px] inline-flex items-end gap-x-3 ${
                          data.editedBy === user.displayName
                            ? "flex-row-reverse"
                            : ""
                        }`}>
                        <div>
                          <div className="profile "></div>
                        </div>
                        <div
                          className={` py-2 px-3 relative group ${
                            data.editedBy === user.displayName
                              ? "messagebox "
                              : "messagebox2"
                          } `}>
                          <h4 className=" absolute top-0 -translate-y-1/2 left-0 name-logo">
                            {" "}
                            {data.editedBy}
                          </h4>
                          <p>{data.name}</p>
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
                          <span className="time_stamp relative overflow-visible">
                            <span
                              onClick={() =>
                                setButtonsHandler({ toggleMessagePopup: i })
                              }
                              className={`absolute top-0 left-0  w-full flex items-center justify-center pointer-events-none opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:pointer-events-auto cursor-pointer ${
                                buttonsHandler.toggleMessagePopup === i
                                  ? " pointer-events-auto opacity-100"
                                  : ""
                              } ${
                                data.editedBy === user.displayName
                                  ? "bg-[#EBF1FF] "
                                  : "bg-white"
                              }`}>
                              <svg
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
                            {data.getHours}:
                            {data.getMinuts < 10
                              ? 0 + data.getMinuts
                              : data.getMinuts}
                          </span>
                        </div>{" "}
                      </div>
                    </div>{" "}
                  </div>

                  {/* <tr className="position-relative" key={data.id}>
                    <td className="text-center py-3 w-5/12 xl:w-6/12 ">
                      <div className="flex justify-between w-full">
                        {" "}
                        <h4 className="text-sm md:text-base xl:text-xl mb-2 text-capitalize">
                          {data.name}
                        </h4>
                        <h4 className="text-sm md:text-base xl:text-sm mb-2 text-capitalize">
                          {data.editedBy}
                        </h4>
                      </div>{" "}
                    </td>
                    <td className="justify-content-between text-center py-3 w-2/12 ">
                      <h4 className="text-sm md:text-base xl:text-xl text-center mb-2">
                        {data.class}
                      </h4>
                    </td>
                    <td className="text-center py-3 w-2/12 ">
                      <h4
                        className={`text-sm md:text-base xl:text-xl text-center mb-2 ${
                          data.editedBy === user.displayName
                            ? "!text-red-600"
                            : "!text-green-600"
                        }`}>
                        {data.age}
                      </h4>
                    </td>
                    <td className="inline-flex flex-col gap-y-2 justify-center items-center h-full end-0 relative w-full">
                      <div
                        className="inline-flex flex-col gap-y-2 justify-center items-center mt-5 cursor-pointer group"
                        onClick={() => setopenMenuBar(i)}>
                        {" "}
                        <div className="inline-block transition-all duration-300 group-hover:bg-slate-400 p-[2px] xl:p-1 rounded-full bg-white"></div>
                        <div className="inline-block transition-all duration-300 group-hover:bg-slate-400 p-[2px] xl:p-1 rounded-full bg-white"></div>
                        <div className="inline-block transition-all duration-300 group-hover:bg-slate-400 p-[2px] xl:p-1 rounded-full bg-white"></div>
                      </div>

                      <div
                        className={`fixed top-0 bg-[#3a2c1000] backdrop-blur-[1px] left-0 h-screen w-screen z-[45] ${
                          openMenuBar !== null
                            ? "block"
                            : confermationOverlay === i
                            ? "block"
                            : updatingAgent === i
                            ? "block"
                            : "hidden"
                        }`}></div>

                      <div
                        className={`scale-100 transition-all duration-300  z-50 absolute right-0 ${
                          openMenuBar === i
                            ? "scale-100 !flex"
                            : "scale-0 hidden"
                        }`}>
                        <span
                          onClick={() => setopenMenuBar(null)}
                          className=" text-[30px] font-medium text-black transition-all duration-300 hover:text-slate-400 rotate-45 absolute right-2 -top-3 cursor-pointer ">
                          +
                        </span>
                        <ul className="inline-flex flex-col gap-y-3 bg-white border-[1px] border-solid border-black rounded p-2 pt-5">
                          <li
                            onClick={() => {
                              setopenMenuBar(null);
                              handleEditClick(data);
                            }}
                            className="cursor-pointer transition-all duration-300 hover:bg-slate-400 text-sm leading-[1] font-normal px-3 py-2 text-black bg-white rounded border-[0.5px] border-slate-400 border-solid whitespace-nowrap">
                            Edit this task
                          </li>
                          <li
                            onClick={() => {
                              setopenMenuBar(null);
                              setconfermationOverlay(i);
                            }}
                            className="cursor-pointer transition-all duration-300 hover:bg-slate-400 text-sm leading-[1] font-normal px-3 py-2 text-black bg-white rounded border-[0.5px] border-slate-400 border-solid whitespace-nowrap">
                            Remove this task
                          </li>
                        </ul>
                      </div>
                      <div
                        className={`scale-100 transition-all duration-300  z-50 absolute right-0 hidden ${
                          confermationOverlay === i
                            ? "scale-100 !flex"
                            : "scale-0 hidden"
                        }`}>
                        <span
                          onClick={() => setconfermationOverlay(-1)}
                          className=" text-[30px] font-medium text-black transition-all duration-300 hover:text-slate-400 rotate-45 absolute right-3 -top-2 cursor-pointer ">
                          +
                        </span>
                        <ul className="inline-flex gap-x-3 bg-white border-[1px] border-solid border-black rounded p-10 ">
                          <li
                            onClick={() => {
                              setconfermationOverlay(-1);
                              hideStudentInfo(data.id);
                            }}
                            className="cursor-pointer transition-all duration-300 hover:bg-slate-400 text-sm leading-[1] font-normal px-3 py-2 text-black bg-white rounded border-[0.5px] border-slate-400 border-solid whitespace-nowrap">
                            Yes
                          </li>
                          <li
                            onClick={() => {
                              setconfermationOverlay(-1);
                            }}
                            className="cursor-pointer transition-all duration-300 hover:bg-slate-400 text-sm leading-[1] font-normal px-3 py-2 text-black bg-white rounded border-[0.5px] border-slate-400 border-solid whitespace-nowrap">
                            No
                          </li>
                        </ul>
                      </div>
                      <div
                        className={`scale-100 transition-all duration-300  z-50 absolute right-0 hidden ${
                          updatingAgent === i
                            ? "scale-100 !flex"
                            : "scale-0 hidden"
                        }`}>
                        <span
                          onClick={() => setupdatingAgent(null)}
                          className=" text-[30px] font-medium text-black transition-all duration-300 hover:text-slate-400 rotate-45 absolute right-3 -top-2 cursor-pointer ">
                          +
                        </span>
                        <div className="inline-flex flex-col bg-white border-[1px] border-solid border-black rounded p-2  ">
                       
                          <p className=" text-sm leading-[1] font-normal px-3 py-2 text-black whitespace-nowrap">
                            User name :{" "}
                            {data.editedBy ? data.editedBy : "!unknown!"}
                          </p>
                          <p className=" text-sm leading-[1] font-normal px-3 py-2 text-black whitespace-nowrap">
                            User id :{" "}
                            {data.editedByAcc
                              ? data.editedByAcc
                              : data.editedByAcc}
                          </p>
                          <p className=" text-sm leading-[1] font-normal px-3 py-2 text-black whitespace-nowrap">
                            Googel account : unknown
                          </p>
                          <p className=" text-sm leading-[1] font-normal px-3 py-2 text-black whitespace-nowrap">
                            last Edit time : {data.timestamp2}
                          </p>
                        </div>
                      </div>
                      <h4 className="mb-2 absolute right-0 top-0 m-1 text-[8px] md:text-[10px] font-light border-[.5px] border-white rounded-[4px] p-[1px]">
                        {data.timestamp}
                      </h4>

                      {data.timestamp !== data.timestamp2 && (
                        <h4 className="mb-2 absolute left-0 top-0 m-1 text-[8px] md:text-[10px] font-light border-[.5px] border-white rounded-[4px] py-[1px] px-1 transition-all duration-300 hover:bg-slate-400 cursor-pointer">
                          <span onClick={() => setupdatingAgent(i)}>
                            Edited
                          </span>
                        </h4>
                      )}
                    </td>
                  </tr> */}
                </>
              ))}
            </>
          )}
          {/* {selectedStudent && (
            <div className="mt-4 fixed top-0 left-0 w-screen h-screen  backdrop-blur-[10px] flex justify-center items-center">
              <form
                className=" w-1/2 flex flex-wrap"
                onSubmit={handleUpdateData}>
                <div className="my-2 px-2 w-8/12 mx-1">
                  <input
                    className="w-full border-2 px-6 py-2 border-black rounded-[16px]"
                    type="text"
                    name="name"
                    placeholder="Name"
                    onChange={(e) =>
                      setStudentData({
                        ...studentData,
                        name: e.target.value,
                      })
                    }
                    value={studentData.name}
                  />
                </div>
                <div className="my-2 px-2 w-4/12">
                  <input
                    className="w-full border-2 px-6 py-2 border-black rounded-[16px]"
                    type="number"
                    name="Age"
                    min="9"
                    max="25"
                    placeholder="Age"
                    onChange={(e) =>
                      setStudentData({
                        ...studentData,
                        age: e.target.value,
                      })
                    }
                    value={studentData.age}
                  />
                </div>
                <div className="my-2 px-2 w-4/12">
                  <input
                    className="w-full border-2 px-6 py-2 border-black rounded-[16px]"
                    type="number"
                    name="Studentclass"
                    min="5"
                    max="12"
                    placeholder="Class"
                    onChange={(e) =>
                      setStudentData({
                        ...studentData,
                        class: e.target.value,
                      })
                    }
                    value={studentData.class}
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-800 text-white hover:bg-slate-200 hover:text-black  transition-all duration-300 rounded-2xl mt-2">
                  Update Data
                </button>
              </form>
            </div>
          )} */}
        </div>
        <div className="bg-white min-h-24 max-h-24 flex justify-center items-center py-[18px] fixed bottom-0 w-full">
          <form
            onSubmit={saveNewData}
            action=""
            className={`my-4 w-full  ${
              handleUpdate === true ? "hidden" : "block"
            }  `}>
            <div className="flex flex-wrap justify-center">
              <div className="my-2 px-2 w-8/12 mx-1 relative">
                <input
                  className="w-full border-[1px] pl-4 pr-20 py-2 border-[#6297e1] rounded-[8px] outline-none"
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

              {/* <div className="w-8/12 mt-5">
                {" "}
                <input
                  type="text"
                  className="w-full border-2 px-6 py-2 border-black rounded-[16px]"
                  value={SearchedData}
                  placeholder="Search Student By Name/Class"
                  onChange={(e) => setSearchedData(e.target.value)}
                />
              </div> */}
            </div>
          </form>
          <form
            onSubmit={handleUpdateData}
            action=""
            className={`my-4 w-full  ${handleUpdate ? "block" : "hidden"} `}>
            <div className="flex flex-wrap justify-center ">
              <div className="my-2 px-2 w-8/12 mx-1 relative">
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

              {/* <div className="w-8/12 mt-5">
                {" "}
                <input
                  type="text"
                  className="w-full border-2 px-6 py-2 border-black rounded-[16px]"
                  value={SearchedData}
                  placeholder="Search Student By Name/Class"
                  onChange={(e) => setSearchedData(e.target.value)}
                />
              </div> */}
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default StudentTodo;
