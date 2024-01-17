import "./App.css";
import AuthComponent from "./components/AuthComponent";
import SignUpForm from "./components/SignUpForm";
import Pract from "./components/Pract";
import TodoAppV2 from "./components/TodoAppV2";
import ImageUploadForm from "./components/ImageUploadForm";
import Preloader from "./components/Preloader";
import ChatList from "./components/ChatList";
import { Route, Routes } from "react-router-dom";
import ChatRoom from "./components/ChatRoom";

function App() {
  return (
    <>
      {/* <TodoApp /> */}
      {/* <Pract /> */}
      {/* <AuthComponent /> */}
      <SignUpForm />
      {/* <ImageUploadForm /> */}
      {/* <TodoAppV2 /> */}
      {/* <ChatList /> */}
      {/* <ChatRoom />{" "} */}
      {/* <Routes>
      
        <Route path="/:" element={} />
        <Route path="/2" element={<SignUpForm />} />
      </Routes> */}
    </>
  );
}

export default App;
