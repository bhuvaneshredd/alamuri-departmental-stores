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
      slug = `${baseSlug}-${counter}`;
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
        slug = `${baseSlug}-${counter}`;
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
        `Cannot delete category because it contains ${productCount} products. Please reassign or delete the products first.`,
        400
      );
    }

    await prisma.category.delete({ where: { id } });

    return successResponse(res, 'Category deleted successfully.');
  } catch (error) {
    next(error);
  }
};
