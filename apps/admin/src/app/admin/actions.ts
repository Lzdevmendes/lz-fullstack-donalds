"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getBoolean, getDate, getFloat, getNumber, getString, getStringArray } from "@/lib/form-parsing";
import { db } from "@/lib/prisma";
import { signAdminSession } from "@/lib/session";

// ── AUTH ──────────────────────────────────────────────────────────────────────

export const adminLogin = async (
  _prev: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> => {
  const email = getString(formData, "email", { trim: true, lowercase: true });
  const password = getString(formData, "password", { trim: true });

  const expectedEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const expectedHash = process.env.ADMIN_PASSWORD_HASH ?? "";

  let valid = false;

  if (expectedHash) {
    valid =
      email === expectedEmail && (await bcrypt.compare(password, expectedHash));
  } else {
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
    maxAge: 60 * 60 * 8,
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
  const name = getString(formData, "name", { trim: true });
  const slug = getString(formData, "slug", { trim: true, lowercase: true });
  const description = getString(formData, "description", { trim: true });
  const avatarImageUrl = getString(formData, "avatarImageUrl", { trim: true });
  const coverImageUrl = getString(formData, "coverImageUrl", { trim: true });
  const primaryColor = getString(formData, "primaryColor", { trim: true }) || "42 100% 50%";
  const tableCount = getNumber(formData, "tableCount", 20);
  const kitchenPasswordRaw = getString(formData, "kitchenPassword", { trim: true });

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
  const name = getString(formData, "name", { trim: true });
  const slug = getString(formData, "slug", { trim: true, lowercase: true });
  const description = getString(formData, "description", { trim: true });
  const avatarImageUrl = getString(formData, "avatarImageUrl", { trim: true });
  const coverImageUrl = getString(formData, "coverImageUrl", { trim: true });
  const primaryColor = getString(formData, "primaryColor", { trim: true }) || "42 100% 50%";
  const tableCount = getNumber(formData, "tableCount", 20);
  const kitchenPasswordRaw = getString(formData, "kitchenPassword", { trim: true });

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
  const name = getString(formData, "name", { trim: true });
  const description = getString(formData, "description", { trim: true });
  const price = getFloat(formData, "price");
  const imageUrl = getString(formData, "imageUrl", { trim: true });
  const menuCategoryId = getString(formData, "menuCategoryId", { trim: true });
  const ingredients = getStringArray(formData, "ingredients");
  const badge = getString(formData, "badge", { trim: true }) || null;

  if (!name || !description || price === 0 || !imageUrl || !menuCategoryId) {
    return { error: "Preencha todos os campos obrigatórios" };
  }

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
  const name = getString(formData, "name", { trim: true });
  const description = getString(formData, "description", { trim: true });
  const price = getFloat(formData, "price");
  const imageUrl = getString(formData, "imageUrl", { trim: true });
  const menuCategoryId = getString(formData, "menuCategoryId", { trim: true });
  const ingredients = getStringArray(formData, "ingredients");
  const badge = getString(formData, "badge", { trim: true }) || null;

  if (!name || !description || price === 0 || !imageUrl || !menuCategoryId) {
    return { error: "Preencha todos os campos obrigatórios" };
  }

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
  await db.$executeRaw`UPDATE "Product" SET "isAvailable" = NOT "isAvailable" WHERE id = ${productId}`;
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
  const code = getString(formData, "code", { trim: true }).toUpperCase();
  const discountPercent = getNumber(formData, "discountPercent");
  const maxUses = getNumber(formData, "maxUses", 100);
  const expiresAt = getDate(formData, "expiresAt");

  if (!code || discountPercent < 1 || discountPercent > 100) {
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
      expiresAt,
    },
  });

  revalidatePath(`/admin/restaurants/${restaurantId}`);
  redirect(`/admin/restaurants/${restaurantId}`);
};

export const toggleCoupon = async (couponId: string, restaurantId: string) => {
  await db.$executeRaw`UPDATE "Coupon" SET "isActive" = NOT "isActive" WHERE id = ${couponId}`;
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
  const days = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    isClosed: getBoolean(formData, `closed_${day}`),
    openTime: getString(formData, `open_${day}`, { trim: true }) || "08:00",
    closeTime: getString(formData, `close_${day}`, { trim: true }) || "22:00",
  }));

  await db.$transaction(
    days.map(({ day, isClosed, openTime, closeTime }) =>
      db.openingHours.upsert({
        where: { restaurantId_dayOfWeek: { restaurantId, dayOfWeek: day } },
        create: { restaurantId, dayOfWeek: day, openTime, closeTime, isClosed },
        update: { openTime, closeTime, isClosed },
      }),
    ),
  );

  revalidatePath(`/admin/restaurants/${restaurantId}`);
  redirect(`/admin/restaurants/${restaurantId}`);
};
