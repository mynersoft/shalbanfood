import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { IBlog } from "@/types/blog";

export const useBlogs = () =>
  useQuery<IBlog[]>({
    queryKey: ["blogs"],
    queryFn: async () => (await axios.get("/api/blog")).data,
  });

export const useBlog = (slug: string) =>
  useQuery<IBlog>({
    queryKey: ["blog", slug],
    queryFn: async () =>
      (await axios.get(`/api/blog/slug/${slug}`)).data,
  });

export const useCreateBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: IBlog) => axios.post("/api/blog", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blogs"] }),
  });
};