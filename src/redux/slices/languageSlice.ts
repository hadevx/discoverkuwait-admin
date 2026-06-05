import { createSlice } from "@reduxjs/toolkit";

type Lang = "en" | "ar";

const initialState: { lang: Lang } = {
  lang: (localStorage.getItem("lang") as Lang) || "ar",
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    toggleLang: (state) => {
      state.lang = state.lang === "en" ? "ar" : "en";
      localStorage.setItem("lang", state.lang); // persist preference
    },
    setLang: (state, action) => {
      state.lang = action.payload;
      localStorage.setItem("lang", state.lang);
    },
  },
});

export const { toggleLang, setLang } = languageSlice.actions;
export default languageSlice.reducer;
