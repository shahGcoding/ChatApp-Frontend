// import { useParams } from "react-router-dom";
// import { useSelector } from "react-redux";
// import Chat from "./Chat";

// // export function ChatWrapper() {
// //   const { contactId } = useParams();
// //   const {userData} = useSelector((state) => state.auth); // contains logged-in user info
// //     console.log("userDat", userData._id);
// //     console.log("Contact id:", contactId);

// //   return <Chat userId={userData?._id} contactId={contactId} />;
// // }

// export function ChatWrapper() {
//   const { contactId } = useParams();
//   const { userData } = useSelector((state) => state.auth);

//   if (!userData?._id || !contactId) {
//     return <div>Loading chat...</div>; // or spinner
//   }

//   console.log("contact and user ID:", contactId, userData);

//   return <Chat userId={userData._id} contactId={contactId} />;
// }
