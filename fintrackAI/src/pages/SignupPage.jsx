import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const signup = async () => {
    await createUserWithEmailAndPassword(auth, email, pass);
    navigate("/chat");
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen bg-gray-50">
      <h1 className="text-3xl font-bold">Signup to FinTrackAI</h1>
      <input className="border p-2 w-72" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input className="border p-2 w-72" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" />
      <button onClick={signup} className="bg-green-600 text-white px-4 py-2 rounded">Create Account</button>
    </div>
  );
};

export default SignupPage;
