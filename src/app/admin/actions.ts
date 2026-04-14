"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";
import { signAdminSession } from "@/lib/session";

// ── AUTH ──────────────────────────────────────────────────────────────────────

export const adminLogin = async (
  _prev: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> => {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;

  const expectedEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const expectedHash = process.env.ADMIN_PASSWORD_HASH ?? "";

  let valid = false;

  if (expectedHash) {
    valid =
      email === expectedEmail && (await bcrypt.compare(password, expectedHash));
  } else {
    // fallback para ADMIN_PASSWORD em texto plano (desenvolvimento)
    valid =
      email === expectedEmail &&
      password === (process.env.ADMIN_PASSWORD ?? "");
  }

  if (!valid) return { error: "Credenciais inválidas" };

  const token = signAdminSession(email);
  const jar = await cookies();
  jar.set("admin_session", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8h
    path: "/",
  });

  return { success: true };
};

export const adminLogout = async () => {
  const jar = await cookies();
  jar.delete("admin_session");
  redirect("/admin/login");
};

// ── RESTAURANTS ───────────────────────────────────────────────────────────────

export const createRestaurant = async (
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> => {
  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim().toLowerCase();
  const description = (formData.get("description") as string).trim();
  const avatarImageUrl = (formData.get("avatarImageUrl") as string).trim();
  const coverImageUrl = (formData.get("coverImageUrl") as string).trim();
  const primaryColor =
    (formData.get("primaryColor") as string).trim() || "42 100% 50%";
  const tableCount = parseInt(formData.get("tableCount") as string) || 20;
  const kitchenPasswordRaw = (
    formData.get("kitchenPassword") as string
  ).trim();

  if (!name || !slug || !description || !avatarImageUrl || !coverImageUrl) {
    return { error: "Preencha todos os campos obrigatórios" };
  }

  const kitchenPassword = kitchenPasswordRaw
    ? await bcrypt.hash(kitchenPasswordRaw, 10)
    : await bcrypt.hash("1234", 10);

  await db.restaurant.create({
    data: {
      name,
      slug,
      description,
      avatarImageUrl,
      coverImageUrl,
      primaryColor,
      tableCount,
      kitchenPassword,
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
};

export const updateRestaurant = async (
  id: string,
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> => {
  const name = (formData.get("name") as string).trim();
  const slug = (formData.get("slug") as string).trim().toLowerCase();
  const description = (formData.get("description") as string).trim();
  const avatarImageUrl = (formData.get("avatarImageUrl") as string).trim();
  const coverImageUrl = (formData.get("coverImageUrl") as string).trim();
  const primaryColor =
    (formData.get("primaryColor") as string).trim() || "42 100% 50%";
  const tableCount = parseInt(formData.get("tableCount") as string) || 20;
  const kitchenPasswordRaw = (
    formData.get("kitchenPassword") as string
  ).trim();

  if (!name || !slug || !description || !avatarImageUrl || !coverImageUrl) {
    return { error: "Preencha todos os campos obrigatórios" };
  }

  const dataToUpdate: Record<string, unknown> = {
    name,
    slug,
    description,
    avatarImageUrl,
    coverImageUrl,
    primaryColor,
    tableCount,
  };

  if (kitchenPasswordRaw) {
    dataToUpdate.kitchenPassword = await bcrypt.hash(kitchenPasswordRaw, 10);
  }

  await db.restaurant.update({ where: { id }, data: dataToUpdate });

  revalidatePath("/admin");
  redirect("/admin");
};

export const deleteRestaurant = async (id: string) => {
  await db.restaurant.delete({ where: { id } });
  revalidatePath("/admin");
};

// ── CATEGORIES ────────────────────────────────────────────────────────────────

export const createCategory = async (
  restaurantId: string,
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> => {
  const name = (formData.get("name") as string).trim();
  if (!name) return { error: "Nome obrigatório" };

  await db.menuCategory.create({ data: { name, restaurantId } });
  revalidatePath(`/admin/restaurants/${restaurantId}`);
  redirect(`/admin/restaurants/${restaurantId}`);
};

export const deleteCategory = async (id: string, restaurantId: string) => {
  await db.menuCategory.delete({ where: { id } });
  revalidatePath(`/admin/restaurants/${restaurantId}`);
};

export const updateCategory = async (categoryId: string, restaurantId: string, _prev: unknown, formData: FormData) => {
  const name = (formData.get("name") as string).trim();
  if (!name) return;
  await db.menuCategory.update({ where: { id: categoryId }, data: { name } });
  revalidatePath(`/admin/restaurants/${restaurantId}`);
  redirect(`/admin/restaurants/${restaurantId}`);
};

// ── PRODUCTS ──────────────────────────────────────────────────────────────────

export const createProduct = async (
  restaurantId: string,
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> => {
  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim();
  const price = parseFloat(formData.get("price") as string);
  const imageUrl = (formData.get("imageUrl") as string).trim();
  const menuCategoryId = (formData.get("menuCategoryId") as string).trim();
  const ingredientsRaw = (formData.get("ingredients") as string).trim();
  const badge = (formData.get("badge") as string).trim() || null;

  if (!name || !description || isNaN(price) || !imageUrl || !menuCategoryId) {
    return { error: "Preencha todos os campos obrigatórios" };
  }

  const ingredients = ingredientsRaw
    ? ingredientsRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  await db.product.create({
    data: {
      name,
      description,
      price,
      imageUrl,
      menuCategoryId,
      restaurantId,
      ingredients,
      badge: badge || undefined,
    },
  });

  revalidatePath(`/admin/restaurants/${restaurantId}`);
  redirect(`/admin/restaurants/${restaurantId}`);
};

export const updateProduct = async (
  productId: string,
  restaurantId: string,
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> => {
  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim();
  const price = parseFloat(formData.get("price") as string);
  const imageUrl = (formData.get("imageUrl") as string).trim();
  const menuCategoryId = (formData.get("menuCategoryId") as string).trim();
  const ingredientsRaw = (formData.get("ingredients") as string).trim();
  const badge = (formData.get("badge") as string).trim() || null;

  if (!name || !description || isNaN(price) || !imageUrl || !menuCategoryId) {
    return { error: "Preencha todos os campos obrigatórios" };
  }

  const ingredients = ingredientsRaw
    ? ingredientsRaw.split("\n").map((s) => s.trim()).filter(Boolean)
    : [];

  await db.product.update({
    where: { id: productId },
    data: { name, description, price, imageUrl, menuCategoryId, ingredients, badge: badge || null },
  });

  revalidatePath(`/admin/restaurants/${restaurantId}`);
  redirect(`/admin/restaurants/${restaurantId}`);
};

export const toggleProductAvailability = async (
  productId: string,
  restaurantId: string,
) => {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { isAvailable: true },
  });
  if (!product) return;

  await db.product.update({
    where: { id: productId },
    data: { isAvailable: !product.isAvailable },
  });

  revalidatePath(`/admin/restaurants/${restaurantId}`);
};

export const deleteProduct = async (id: string, restaurantId: string) => {
  await db.product.delete({ where: { id } });
  revalidatePath(`/admin/restaurants/${restaurantId}`);
};

// ── COUPONS ───────────────────────────────────────────────────────────────────

export const createCoupon = async (
  restaurantId: string,
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> => {
  const code = (formData.get("code") as string).trim().toUpperCase();
  const discountPercent = parseInt(formData.get("discountPercent") as string);
  const maxUses = parseInt(formData.get("maxUses") as string) || 100;
  const expiresAtRaw = formData.get("expiresAt") as string;

  if (!code || isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
    return { error: "Código e desconto (1-100%) são obrigatórios" };
  }

  const existing = await db.coupon.findFirst({ where: { code, restaurantId } });
  if (existing) return { error: "Já existe um cupom com esse código" };

  await db.coupon.create({
    data: {
      code,
      discountPercent,
      maxUses,
      restaurantId,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : undefined,
    },
  });

  revalidatePath(`/admin/restaurants/${restaurantId}`);
  redirect(`/admin/restaurants/${restaurantId}`);
};

export const toggleCoupon = async (couponId: string, restaurantId: string) => {
  const coupon = await db.coupon.findUnique({
    where: { id: couponId },
    select: { isActive: true },
  });
  if (!coupon) return;

  await db.coupon.update({
    where: { id: couponId },
    data: { isActive: !coupon.isActive },
  });

  revalidatePath(`/admin/restaurants/${restaurantId}`);
};

export const deleteCoupon = async (couponId: string, restaurantId: string) => {
  await db.coupon.delete({ where: { id: couponId } });
  revalidatePath(`/admin/restaurants/${restaurantId}`);
};

// ── OPENING HOURS ─────────────────────────────────────────────────────────────

export const upsertOpeningHours = async (
  restaurantId: string,
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> => {
  const days = [0, 1, 2, 3, 4, 5, 6];

  for (const day of days) {
    const isClosed = formData.get(`closed_${day}`) === "on";
    const openTime = (formData.get(`open_${day}`) as string) || "08:00";
    const closeTime = (formData.get(`close_${day}`) as string) || "22:00";

    await db.openingHours.upsert({
      where: { restaurantId_dayOfWeek: { restaurantId, dayOfWeek: day } },
      create: { restaurantId, dayOfWeek: day, openTime, closeTime, isClosed },
      update: { openTime, closeTime, isClosed },
    });
  }

  revalidatePath(`/admin/restaurants/${restaurantId}`);
  redirect(`/admin/restaurants/${restaurantId}`);
};
