import { Router } from 'express';
import { getProducts, getProductsFeatured, getProductsDiscounted, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productsController.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getProductsFeatured);
router.get('/discounted', getProductsDiscounted);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;  