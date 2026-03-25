import { User } from '../models/User.js';



export const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id);
    res.status(200).json({ success: true, data: user });
};

export const updateUser = async (req, res) => {
    const { name, phone, address, city, state, zip, country, } = req.body;
    if (!name || !phone || !address || !city || !state || !zip || !country) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone, address, city, state, zip, country }, { new: true });
    res.status(200).json({ success: true, data: user });
};

export const deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
};