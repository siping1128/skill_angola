import axios from "axios";
import baseURL from "../utils/baseUrl";

const apiClient = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-type": "application/json"
    },
    withCredentials: true,
});

export default apiClient;