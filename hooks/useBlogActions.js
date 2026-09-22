import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useUpdateBlog = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => axios.put(`/api/blog/${id}`, data),
    onSuccess: () => qc.invalidateQueries(["blogs"]),
  });
};

export const useDeleteBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => axios.delete(`/api/blog/${id}`),
    onSuccess: () => qc.invalidateQueries(["blogs"]),
  });
};