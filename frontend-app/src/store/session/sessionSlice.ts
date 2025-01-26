import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TypeSession } from "../../../../shared/types.ts";

interface SessionState {
  session: TypeSession | null;
}
const initialState: SessionState = {
  session: null,
};
const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<TypeSession | null>) => {
      state.session = action.payload;
    },
  },
});

export const { setSession } = sessionSlice.actions;

const sessionReducer = sessionSlice.reducer;
export default sessionReducer;
