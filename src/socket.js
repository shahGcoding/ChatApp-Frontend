import {io} from "socket.io-client";

const socket = io("http://localhost:7000", {withCredentials: true}, { transports: ["websocket"] });

export default socket;