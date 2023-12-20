import React, { useState } from "react";
import { useFirebase } from "./FirebaseDataProv";
import Swal from "sweetalert2";
import Pract from "./Pract";
import TodoAppV2 from "./TodoAppV2";

const SignUpForm = () => {
  const { signUpWithEmail, signInWithGoogle, error, user } = useFirebase();

  const [inputFilds, setInputFilds] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (
      inputFilds.name !== "" &&
      inputFilds.email !== "" &&
      inputFilds.password !== ""
    ) {
      try {
        await signUpWithEmail(
          inputFilds.name,
          inputFilds.email,
          inputFilds.password
        );
        setInputFilds({
          name: "",
          email: "",
          password: "",
        });
      } catch (error) {
        console.log("Firebase Error:", error.code);
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Fill All Filds",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  return (
    <>
      {user === null ? (
        <section
          id="login-page"
          className="bg-[#243151] min-h-screen flex justify-center items-center py-10">
          <div className="container ">
            <div className="signup-container">
              <h2>Get Started</h2>
              {/* <h2>{user.displayName}</h2>
              <h2>{user.email}</h2> */}

              <h3>
                Already have an Account ? <span>Log in</span>
              </h3>
              <form action="" onSubmit={handleSignUp}>
                <div className="lable-parent">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    name="name"
                    onChange={(e) =>
                      setInputFilds({ ...inputFilds, name: e.target.value })
                    }
                    value={inputFilds.name}
                  />
                </div>

                {/* email lable */}
                <div className="lable-parent">
                  <label htmlFor="email">Email</label>
                  <input
                    onChange={(e) =>
                      setInputFilds({ ...inputFilds, email: e.target.value })
                    }
                    type="email"
                    value={inputFilds.email}
                  />
                  {error ===
                    "Invalid email format. Please provide a valid email address." ||
                    (error ===
                      "An account with this email already exists. Please sign in." && (
                      <h4>{error} </h4>
                    ))}{" "}
                </div>

                {/* password lable */}
                <div className="lable-parent">
                  {" "}
                  <label htmlFor="password">Password</label>
                  <input
                    onChange={(e) =>
                      setInputFilds({ ...inputFilds, password: e.target.value })
                    }
                    type="password"
                    value={inputFilds.password}
                  />
                  {error ===
                    "The password is too weak. Please choose a stronger password." && (
                    <h4>{error} </h4>
                  )}
                </div>
                <div className="btn-parent">
                  {" "}
                  <button type="submit">Sign Up</button>
                </div>
              </form>
              <div className="shaprator">
                <span className=" shaprator-text">Or Sign Up with </span>
              </div>
              <div className="flex mt-[30px] gap-x-[30px] justify-center items-center">
                <svg
                  onClick={signInWithGoogle}
                  className="cursor-pointer"
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <rect width="50" height="50" rx="10" fill="white" />
                  <path
                    d="M39.7083 22.0623H38.5V22H25V28H33.4773C32.2405 31.4928 28.9172 34 25 34C20.0297 34 16 29.9702 16 25C16 20.0297 20.0297 16 25 16C27.2943 16 29.3815 16.8655 30.9708 18.2792L35.2135 14.0365C32.5345 11.5397 28.951 10 25 10C16.7162 10 10 16.7162 10 25C10 33.2838 16.7162 40 25 40C33.2838 40 40 33.2838 40 25C40 23.9943 39.8965 23.0125 39.7083 22.0623Z"
                    fill="#FFC107"
                  />
                  <path
                    d="M11.7295 18.0182L16.6577 21.6325C17.9912 18.331 21.2207 16 25 16C27.2942 16 29.3815 16.8655 30.9707 18.2792L35.2135 14.0365C32.5345 11.5397 28.951 10 25 10C19.2385 10 14.242 13.2527 11.7295 18.0182Z"
                    fill="#FF3D00"
                  />
                  <path
                    d="M25 40C28.8745 40 32.395 38.5173 35.0567 36.106L30.4142 32.1775C28.9082 33.3183 27.0362 34 25 34C21.0985 34 17.7857 31.5123 16.5377 28.0405L11.6462 31.8093C14.1287 36.667 19.1702 40 25 40Z"
                    fill="#4CAF50"
                  />
                  <path
                    d="M39.7083 22.0623H38.5V22H25V28H33.4773C32.8833 29.6778 31.804 31.1245 30.412 32.1782C30.4127 32.1775 30.4135 32.1775 30.4142 32.1768L35.0568 36.1052C34.7283 36.4037 40 32.5 40 25C40 23.9943 39.8965 23.0125 39.7083 22.0623Z"
                    fill="#1976D2"
                  />
                </svg>

                <svg
                  className="cursor-pointer"
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <rect width="50" height="50" rx="10" fill="white" />
                  <g clip-path="url(#clip0_4_2)">
                    <path
                      d="M35.0551 24.4998C35.1069 30.0543 39.9464 31.9027 40 31.9263C39.9591 32.0566 39.2267 34.5604 37.4503 37.1466C35.9147 39.3826 34.3209 41.6103 31.8102 41.6565C29.3432 41.7017 28.5499 40.1991 25.7295 40.1991C22.9098 40.1991 22.0285 41.6103 19.6932 41.7017C17.2697 41.7931 15.4243 39.2839 13.8759 37.0561C10.7119 32.4992 8.29403 24.1794 11.5407 18.5633C13.1536 15.7744 16.0359 14.0083 19.1644 13.963C21.5441 13.9178 23.7903 15.5579 25.2451 15.5579C26.699 15.5579 29.4286 13.5855 32.2982 13.8752C33.4995 13.925 36.8715 14.3586 39.0368 17.516C38.8623 17.6237 35.0132 19.856 35.0551 24.4998V24.4998ZM30.4186 10.8604C31.7053 9.30886 32.5712 7.14903 32.335 5C30.4804 5.07425 28.2378 6.23115 26.9076 7.7818C25.7154 9.15498 24.6714 11.3528 24.9531 13.4593C27.0202 13.6186 29.132 12.4129 30.4186 10.8604"
                      fill="black"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_4_2">
                      <rect
                        width="30"
                        height="36.7742"
                        fill="white"
                        transform="translate(10 5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </section>
      ) : (
        // <TodoApp />
        // <Pract />
        <TodoAppV2 />
      )}
    </>
  );
};

export default SignUpForm;
