import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { slugify } from '../utils/slugify';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      categoryId,
      categorySlug,
      brand,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      hasDiscount,
      search,
      sortBy = 'popularity',
      page = '1',
      limit = '20',
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {
      isAvailable: true,
    };

    if (categoryId) where.categoryId = categoryId as string;
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug as string },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    if (brand) where.brand = { contains: brand as string };
    if (isFeatured === 'true') where.isFeatured = true;
    if (inStock === 'true') where.stockQuantity = { gt: 0 };
    if (hasDiscount === 'true') where.discount = { gt: 0 };

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (search) {
      const q = (search as string).trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { brand: { contains: q } },
      ];
    }

    let orderBy: any = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (sortBy === 'discount') orderBy = { discount: 'desc' };
    else if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
    else if (sortBy === 'name') orderBy = { name: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { select: { id: true, url: true, isPrimary: true } },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return successResponse(
      res,
      'Products retrieved successfully.',
      products,
      200,
      { page: pageNumber, limit: pageSize, total, totalPages }
    );
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, limit = '8' } = req.query;
    const query = ((q as string) || '').trim();

    if (!query) {
      return successResponse(res, 'Empty search query', { suggestions: [], products: [] });
    }

    const pageSize = parseInt(limit as string, 10) || 8;

    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        OR: [
          { name: { contains: query } },
          { brand: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      take: pageSize,
      orderBy: { stockQuantity: 'desc' },
    });

    const suggestions = Array.from(
      new Set([
        ...products.map((p) => p.name),
        ...products.filter((p) => p.brand).map((p) => p.brand!),
      ])
    ).slice(0, 6);

    return successResponse(res, 'Search results', { suggestions, products });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) {
      return errorResponse(res, 'Product not found.', 404);
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isAvailable: true,
        NOT: { id: product.id },
      },
      take: 6,
      include: { category: true },
    });

    return successResponse(res, 'Product details fetched.', {
      product,
      relatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      where: { isAvailable: true, isFeatured: true, stockQuantity: { gt: 0 } },
      include: { category: true },
      take: 12,
      orderBy: { updatedAt: 'desc' },
    });
    return successResponse(res, 'Featured products fetched.', products);
  } catch (error) {
    next(error);
  }
};

export const getBestDeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      where: { isAvailable: true, discount: { gt: 0 }, stockQuantity: { gt: 0 } },
      include: { category: true },
      orderBy: { discount: 'desc' },
      take: 12,
    });
    return successResponse(res, 'Best deals fetched.', products);
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let categoryIds: string[] = [];

    if (req.user) {
      const userOrders = await prisma.order.findMany({
        where: { userId: req.user.userId },
        include: { items: { select: { productId: true } } },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      const productIds = userOrders.flatMap((o) => o.items.map((i) => i.productId)).filter(Boolean) as string[];
      if (productIds.length > 0) {
        const orderedProducts = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { categoryId: true },
        });
        categoryIds = Array.from(new Set(orderedProducts.map((p) => p.categoryId)));
      }
    }

    const where: any = { isAvailable: true, stockQuantity: { gt: 0 } };
    if (categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }

    let products = await prisma.product.findMany({
      where,
      include: { category: true },
      take: 10,
      orderBy: { stockQuantity: 'desc' },
    });

    if (products.length < 5) {
      products = await prisma.product.findMany({
        where: { isAvailable: true, stockQuantity: { gt: 0 } },
        include: { category: true },
        take: 10,
        orderBy: { isFeatured: 'desc' },
      });
    }

    return successResponse(res, 'Recommended products.', products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      brand,
      categoryId,
      price,
      mrp,
      unit,
      stockQuantity,
      lowStockThreshold,
      image,
      isAvailable,
      isFeatured,
    } = req.body;

    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        brand: brand?.trim() || null,
        categoryId,
        price: Number(price),
        mrp: Number(mrp),
        discount,
        unit: unit.trim(),
        stockQuantity: Number(stockQuantity) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 5,
        image: image || null,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        isFeatured: isFeatured !== undefined ? isFeatured : false,
      },
      include: { category: true },
    });

    return successResponse(res, 'Product created successfully.', product, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return errorResponse(res, 'Product not found.', 404);

    let slug = existing.slug;
    if (body.name && body.name.trim() !== existing.name) {
      let baseSlug = slugify(body.name);
      slug = baseSlug;
      let counter = 1;
      while (
        await prisma.product.findFirst({
          where: { slug, NOT: { id } },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const price = body.price !== undefined ? Number(body.price) : existing.price;
    const mrp = body.mrp !== undefined ? Number(body.mrp) : existing.mrp;
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name.trim(), slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.brand !== undefined && { brand: body.brand }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        price,
        mrp,
        discount,
        ...(body.unit && { unit: body.unit.trim() }),
        ...(body.stockQuantity !== undefined && { stockQuantity: Number(body.stockQuantity) }),
        ...(body.lowStockThreshold !== undefined && { lowStockThreshold: Number(body.lowStockThreshold) }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      },
      include: { category: true },
    });

    return successResponse(res, 'Product updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return successResponse(res, 'Product deleted successfully.');
  } catch (error) {
    next(error);
  }
};