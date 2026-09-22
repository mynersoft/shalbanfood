import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setNotifications } from "@/store/slices/notificationSlice";

export const useNotifications = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await axios.get("/api/notification");
      return data.notifications;
    },
    onSuccess: (data) => {
      if (data && data.length) {
        dispatch(setNotifications(data));
      }
    },
    refetchInterval: 30000, // auto refresh every 30 sec
    staleTime: 10000,       // optional
  });
};