import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";

const normalize = (data) => (Array.isArray(data) ? data : data?.data || []);

const useReferenceData = () => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const reload = useCallback(async () => {
        try {
            const [categoriesResponse, brandsResponse] = await Promise.all([
                axiosInstance.get("/api/categories"),
                axiosInstance.get("/api/brands"),
            ]);
            setCategories(normalize(categoriesResponse.data));
            setBrands(normalize(brandsResponse.data));
        } catch (error) {
            // Reference data is non-critical — empty arrays are an acceptable fallback.
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    return { categories, brands, reload };
};

export default useReferenceData;
