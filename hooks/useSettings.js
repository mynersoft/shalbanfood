import { useDispatch, useSelector } from 'react-redux';

import {
  fetchSettings,
  updateSettings,
} from '@/redux/store/slices/settings/settingsSlice';

export function useSettings() {
  const dispatch = useDispatch();

  const {
    data,
    loading,
    saving,
    error,
    saveError,
    initialized,
  } = useSelector((state) => state.settings);

  const loadSettings = () => {
    return dispatch(fetchSettings());
  };

  const saveSettings = (settings) => {
    return dispatch(updateSettings(settings));
  };

  return {
    settings: data,
    loading,
    saving,
    error,
    saveError,
    initialized,

    loadSettings,
    saveSettings,
  };
}