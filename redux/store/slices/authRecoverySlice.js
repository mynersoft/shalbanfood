import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  step: 'EMAIL', // EMAIL | OTP | RESET
  emailOrPhone: '',
  verified: false,
}

const authRecoverySlice = createSlice({
  name: 'authRecovery',
  initialState,
  reducers: {
    setEmailOrPhone: (state, action) => {
      state.emailOrPhone = action.payload
    },
    goToOtp: (state) => {
      state.step = 'OTP'
    },
    otpVerified: (state) => {
      state.step = 'RESET'
      state.verified = true
    },
    resetDone: () => initialState,
  },
})

export const {
  setEmailOrPhone,
  goToOtp,
  otpVerified,
  resetDone,
} = authRecoverySlice.actions

export default authRecoverySlice.reducer