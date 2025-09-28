import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:7000/api/v1", withCredentials: true });

export const registerUser = async (data) => {
    const response = await API.post("/users/register", data);
    return response.data;
}

export const verifyEmail = async (data) => {
    const response = await API.post("/users/verify-email", data);
    return response.data;
}

export const loginUser = async (data) => {
    const response = await API.post("/users/login", data);
    return response.data?.data;
}

export const logoutUser = async () => {
    const response = await API.post("/users/logout");
    return response.data?.data;
}   

export const getUserById = async (id) => {
    const response = await API.get(`/users/getuserbyid/${id}`);
    return response.data?.data;
}

export const getCurrentUser = async () => {
    const response = await API.get("/users/getcurrentuser");
    return response.data?.data;
}

export const updateUserData = async (id, data) => {
    const response = await API.put(`/users/updateuserdata/${id}`, data);
    return response.data?.data;
}

export const getAllUsers = async () => {
    const response = await API.get(`/users/getallusers`);
    return response.data?.data;
}

// message api

export const sendMessage = async (data) => {
    const response = await API.post("/messages/sendMessage", data);
    return response.data?.data;
}

export const getConversation = async (userId, contactId) => {
    const response = await API.post(`/messages/getConversation/${userId}/${contactId}`);
    return response.data?.data;
}

export const markMessagesAsRead = async (data) => {
    const response = await API.put("/messages/markMessagesAsRead", data);
    return response.data?.data;
}

export const getUserChats = async (userId) => {
    const response = await API.get(`/messages/getUserChats/${userId}`);
    return response.data?.data;
}

export const deleteMessage = async (messageId) => {
    const response = await API.delete(`/messages/deleteMessage/${messageId}`);
    return response.data?.data;
}