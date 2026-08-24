const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', { encoding: 'utf8' });
  console.log('Created: ' + filePath);
}

// 1. Auth Controller
writeFile('server/src/controllers/authController.ts', `
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(phone ? [{ phone: phone.trim() }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return errorResponse(res, 'An account with this email already exists.', 409);
      }
      return errorResponse(res, 'An account with this phone number already exists.', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
      },
    });

    // Create empty cart for customer
    await prisma.cart.create({
      data: { userId: user.id },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      res,
      'Registration successful. Welcome to QuickStore!',
      { user, token },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    };

    return successResponse(res, 'Login successful.', { user: userProfile, token });
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.role !== 'ADMIN' || !user.isActive) {
      return errorResponse(res, 'Access denied. Invalid administrator credentials.', 403);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
    };

    return successResponse(res, 'Admin authenticated successfully.', { user: userProfile, token });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    return successResponse(res, 'Profile retrieved successfully.', user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, profileImage } = req.body;

    if (phone) {
      const existing = await prisma.user.findFirst({
        where: {
          phone: phone.trim(),
          NOT: { id: req.user!.userId },
        },
      });
      if (existing) {
        return errorResponse(res, 'Phone number is already associated with another account.', 409);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(profileImage !== undefined && { profileImage }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profileImage: true,
        updatedAt: true,
      },
    });

    return successResponse(res, 'Profile updated successfully.', updatedUser);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) return errorResponse(res, 'User not found.', 404);

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Incorrect current password.', 400);
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return successResponse(res, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};
`);

// 2. Category Controller
writeFile('server/src/controllers/categoryController.ts', `
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { slugify } from '../utils/slugify';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { includeInactive } = req.query;

    const categories = await prisma.category.findMany({
      where: includeInactive === 'true' ? {} : { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { products: { where: { isAvailable: true } } },
        },
      },
    });

    return successResponse(res, 'Categories fetched successfully.', categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!category) {
      return errorResponse(res, 'Category not found.', 404);
    }

    return successResponse(res, 'Category details fetched.', category);
  } catch (error) {
    next(error);
  }
};

// Admin handlers
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, image, displayOrder, isActive } = req.body;
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = \`\${baseSlug}-\${counter}\`;
      counter++;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        image: image || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return successResponse(res, 'Category created successfully.', category, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, image, displayOrder, isActive } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Category not found.', 404);
    }

    let slug = existing.slug;
    if (name && name.trim() !== existing.name) {
      let baseSlug = slugify(name);
      slug = baseSlug;
      let counter = 1;
      while (
        await prisma.category.findFirst({
          where: { slug, NOT: { id } },
        })
      ) {
        slug = \`\${baseSlug}-\${counter}\`;
        counter++;
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim(), slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return successResponse(res, 'Category updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return errorResponse(
        res,
        \`Cannot delete category because it contains \${productCount} products. Please reassign or delete the products first.\`,
        400
      );
    }

    await prisma.category.delete({ where: { id } });

    return successResponse(res, 'Category deleted successfully.');
  } catch (error) {
    next(error);
  }
};
`);

// 3. Product Controller
writeFile('server/src/controllers/productController.ts', `
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

    if (brand) where.brand = { contains: brand as string, mode: 'insensitive' };
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
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // Sort order mapping
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
          { name: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
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

    // Get related products from the same category
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
    // If authenticated customer, recommend based on previous orders or top essentials
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

// Admin product endpoints
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
      slug = \`\${baseSlug}-\${counter}\`;
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
        slug = \`\${baseSlug}-\${counter}\`;
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
`);

console.log('Finished writing auth, category, product controllers.');
