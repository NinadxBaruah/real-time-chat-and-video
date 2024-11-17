// import "./App.css";
// import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
// import { HomePage } from "./components/HomePage";
// import { AuthProvider } from "./utils/AuthContext";
// import { Profile } from "./components/Profile";
// import { UserDetailsProvider } from "./utils/UserDetailsContext";
// import { AddFriends } from "./components/AddFriends";
// import { Inbox } from "./components/Inbox";
// import { MessagesContext } from "./utils/MessagesContext";
// import {SocketProvider} from "./utils/useSocket"

// const App = () => {
//   return (
//     <SocketProvider>
//     <UserDetailsProvider>
//       <MessagesContext>
//         <AuthProvider>
//           <Outlet />
//         </AuthProvider>
//       </MessagesContext>
//     </UserDetailsProvider>
//     </SocketProvider>
//   );
// };

// // Router setup
// export const appRouter = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//     children: [
//       {
//         path: "/",
//         element: <HomePage />,
//       },
//       {
//         path: "/profile",
//         element: <Profile />,
//       },
//       {
//         path: "/addFrinds",
//         element: <AddFriends />,
//       },
//       {
//         path: "/inbox",
//         element: <Inbox />,
//       },
//     ],
//   },
// ]);

// function MainApp() {
//   return <RouterProvider router={appRouter} />;
// }

// export default MainApp;

import "./App.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { HomePage } from "./components/HomePage";
import { AuthProvider } from "./utils/AuthContext";
import { Profile } from "./components/Profile";
import { UserDetailsProvider } from "./utils/UserDetailsContext";
import { AddFriends } from "./components/AddFriends";
import { Inbox } from "./components/Inbox";
import { MessagesContext } from "./utils/MessagesContext";
import { SocketProvider } from "./utils/useSocket";
import { SocketMessageContextProvier } from "./utils/SocketMessageContext";
import { RtcProvider } from "./utils/RtcProvider";

const App = () => {
  return (
    <SocketMessageContextProvier>
      <AuthProvider>
        <SocketProvider>
          <RtcProvider>
            <UserDetailsProvider>
              <MessagesContext>
                <Outlet />
              </MessagesContext>
            </UserDetailsProvider>
          </RtcProvider>
        </SocketProvider>
      </AuthProvider>
    </SocketMessageContextProvier>
  );
};

// Router setup
export const appRouter = createBrowserRouter([
  {
    path: "/projects/chat-app", // Set this as the base path for your app
    element: <App />,
    children: [
      {
        path: "", // This will resolve to /projects/chat-app/
        element: <HomePage />,
      },
      {
        path: "profile", // This will resolve to /projects/chat-app/profile
        element: <Profile />,
      },
      {
        path: "addFrinds", // This will resolve to /projects/chat-app/addFrinds
        element: <AddFriends />,
      },
      {
        path: "inbox", // This will resolve to /projects/chat-app/inbox
        element: <Inbox />,
      },
    ],
  },
]);

function MainApp() {
  return <RouterProvider router={appRouter} />;
}

export default MainApp;
