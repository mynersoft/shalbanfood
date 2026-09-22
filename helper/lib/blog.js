// lib/blog.js
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "";

export async function getBlogPost(slug) {
  try {
    const response = await axios.get(`${API_BASE}/api/blog/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

export async function getAllBlogPosts() {
  try {
    const response = await axios.get(`${API_BASE}/api/blog`);
    return response.data;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}