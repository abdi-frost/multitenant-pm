import { GLOBAL_PREFIX } from "@/api/constants";
import axios from "axios";

const headers = {
    "Content-Type": "application/json",
};

export const apiClient = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/${GLOBAL_PREFIX}`,
    withCredentials: true,
    headers,
});

export const coreApiClient = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_CORE_URL}/${GLOBAL_PREFIX}`,
    withCredentials: true,
    headers,
});

export const pmApiClient = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_PM_URL}/${GLOBAL_PREFIX}`,
    withCredentials: true,
    headers,
});

export default apiClient;