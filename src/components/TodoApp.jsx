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

  const saveNewData = async (e) => {
    e.preventDefault();
    if (studentData.name.trim() !== "") {
      try {
        // Save data to Firestore
        await addDoc(collection(db, "students"), {
          name: studentData.name,
          age: studentData.age,
          class: studentData.class,
          timestamp: new Date().toLocaleString(),
          timestamp2: new Date().toLocaleString(),
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
    if (
      studentData.name.trim() !== "" &&
      studentData.age.trim() !== "" &&
      studentData.class.trim() !== ""
    ) {
      // Update data in Firestore
      await updateDoc(doc(db, "students", selectedStudent), {
        name: studentData.name,
        age: studentData.age,
        class: studentData.class,
        timestamp2: new Date().toLocaleString(),
        editedBy: user.displayName,
        editedByAcc: user.email,
      });

      // Clear the form fields and reset selected student
      setStudentData(studentDataProvider);
      setSelectedStudent(null);
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

  return (
    <>
      <section id="Studenttodo">
        <div onClick={signOut} className="btn">
          Sign Out
        </div>
        <h2>{user.displayName}</h2>
        <h2>{user.email}</h2>
        <div className="container mx-auto">
          <form onSubmit={saveNewData} action="" className="my-4">
            <div className="flex flex-wrap justify-center">
              <div className="my-2 px-2 w-8/12 mx-1">
                <input
                  className="w-full border-2 px-6 py-2 border-black rounded-[16px]"
                  type="text"
                  name="name"
                  placeholder="Name"
                  onChange={(e) =>
                    setStudentData({ ...studentData, name: e.target.value })
                  }
                  value={studentData.name}
                />
              </div>
              <div className="my-2 px-2 w-4/12">
                <input
                  className="w-full border-2 px-6 py-2 border-black rounded-[16px]"
                  type="number"
                  name="Age"
                  //   min="9"
                  //   max="25"
                  placeholder="Age"
                  onChange={(e) =>
                    setStudentData({ ...studentData, age: e.target.value })
                  }
                  value={studentData.age}
                />
              </div>
              <div className="my-2 px-2 w-4/12">
                <input
                  className="w-full border-2 px-6 py-2 border-black rounded-[16px]"
                  type="number"
                  name="Studentclass"
                  //   min="5"
                  //   max="12"
                  placeholder="Class"
                  onChange={(e) =>
                    setStudentData({ ...studentData, class: e.target.value })
                  }
                  value={studentData.class}
                />
              </div>
              <div className="text-center">
                <button
                  className="px-6 py-3 bg-slate-800 text-white hover:bg-slate-200 hover:text-black transition-all duration-300 rounded-2xl mt-2"
                  type="submit">
                  Submit Data
                </button>
              </div>
              <div className="w-8/12 mt-5">
                {" "}
                <input
                  type="text"
                  className="w-full border-2 px-6 py-2 border-black rounded-[16px]"
                  value={SearchedData}
                  placeholder="Search Student By Name/Class"
                  onChange={(e) => setSearchedData(e.target.value)}
                />
              </div>
            </div>
          </form>

          {studentDataOutPut.length > 0 && (
            <table className="">
              <thead>
                <tr>
                  <th className="text-center py-3">
                    <h2 className="mb-2">Name</h2>
                  </th>
                  <th className="text-center py-3">
                    <h2 className="mb-2">Class</h2>
                  </th>
                  <th className="text-center py-3">
                    <h2 className="mb-2">Age</h2>
                  </th>
                  <th className="text-center py-3">
                    <h2 className="mb-2">Actions</h2>
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentDataOutPut.map((data, i) => (
                  <tr className="position-relative" key={data.id}>
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
                          {/* <h3 className=" text-base leading-[1] font-medium px-3 py-2 text-black whitespace-nowrap">
                            Data updated by :-
                          </h3> */}
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedStudent && (
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
          )}
        </div>
      </section>
    </>
  );
};

export default StudentTodo;
