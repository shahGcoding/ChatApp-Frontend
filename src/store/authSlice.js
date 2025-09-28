import { createSlice } from "@reduxjs/toolkit";


const storeUser = JSON.parse(localStorage.getItem("user"));

const initialState = {
    status: storeUser ? "online" : "offline",
    userData: storeUser || null
}

const authSlice = createSlice({

  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
        const user = action.payload;
        if(!user) return;
        state.status = "online"
        state.userData = {...user}
        localStorage.setItem("user", JSON.stringify(state.userData));
    },
    logout: (state) => {
        state.status = "offline",
        state.userData = null
        localStorage.removeItem("user");
    },
  },  

});

export const {login, logout} = authSlice.actions;
export default authSlice.reducer;