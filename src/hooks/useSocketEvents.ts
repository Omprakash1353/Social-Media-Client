// "use client";

// import { useEffect } from "react";
// import { Socket } from "socket.io-client";

// /**
//  * Custom hook to manage socket event listeners in a React component
//  * @param socket The socket instance to listen for events on
//  * @param handlers An object containing event names as keys and corresponding event handler functions as values
//  */
// export const useSocketEvents = (
//   socket: Socket,
//   handlers: { [event: string]: (...args: any[]) => void },
// ) => {
//   useEffect(() => {
//     Object.entries(handlers).forEach(([event, handler]) => {
//       socket.on(event, handler);
//     });

//     return () => {
//       Object.entries(handlers).forEach(([event, handler]) => {
//         socket.off(event, handler);
//       });
//     };
//   }, [socket, handlers]);
// };
