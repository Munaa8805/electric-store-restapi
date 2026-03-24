import { Banner } from '../models/Banner.js';

export const getBanners = async (req, res) => {
    const banners = await Banner.find();
    res.status(200).json({
        success: true,
        data: banners,
    });
};

