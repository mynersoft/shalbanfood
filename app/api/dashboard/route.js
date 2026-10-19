import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/dbConnect";
import { checkAuthRole } from "@/lib/checkAuthRole";

import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { authenticated, isAdmin } = await checkAuthRole();

    if (!authenticated) {
      return NextResponse.json(
        { success: false, message: "অনুগ্রহ করে লগইন করুন" },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      totalProducts,
      totalUsers,
      todayOrders,
      allProducts,
      recentOrders,
      statusCounts,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: "user" }),
      Order.find({ createdAt: { $gte: startOfToday } })
        .select("total status createdAt")
        .lean(),
      Product.find()
        .select("name image variants isActive")
        .lean(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const validOrders = await Order.find({
      status: { $nin: ["cancelled", "return"] },
    })
      .select("total createdAt status")
      .lean();

    const totalSales = validOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const todaySales = todayOrders.reduce((sum, order) => {
      if (["cancelled", "return"].includes(order.status)) return sum;
      return sum + Number(order.total || 0);
    }, 0);

    const stockQuantity = allProducts.reduce(
      (sum, product) =>
        sum +
        (product.variants || []).reduce(
          (variantSum, variant) =>
            variantSum + Number(variant.stock || 0),
          0
        ),
      0
    );

    const stockSalesValue = allProducts.reduce(
      (sum, product) =>
        sum +
        (product.variants || []).reduce(
          (variantSum, variant) =>
            variantSum +
            Number(variant.stock || 0) *
              Number(variant.sellPrice || 0),
          0
        ),
      0
    );

    const lowStockProducts = allProducts
      .map((product) => ({
        ...product,
        stock: (product.variants || []).reduce(
          (sum, variant) => sum + Number(variant.stock || 0),
          0
        ),
      }))
      .filter((product) => product.stock <= 5)
      .slice(0, 10);

    const bestSellingProducts = allProducts
      .map((product) => ({
        ...product,
        soldCount: (product.variants || []).reduce(
          (sum, variant) => sum + Number(variant.soldCount || 0),
          0
        ),
      }))
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5);

    const salesByDay = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const amount = validOrders
        .filter(
          (order) =>
            new Date(order.createdAt) >= date &&
            new Date(order.createdAt) < nextDate
        )
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      salesByDay.push({
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        amount,
      });
    }

    const counts = Object.fromEntries(
      statusCounts.map(({ _id, count }) => [_id, count])
    );

    return NextResponse.json(
      {
        success: true,
        summary: {
          totalSales,
          todaySales,
          totalOrders,
          totalProducts,
          customers: totalUsers,
          stockQuantity,
          stockSalesValue,
          lowStockProducts: lowStockProducts.length,
          outOfStockProducts: lowStockProducts.filter(
            (product) => product.stock === 0
          ).length,
        },
        statusCounts: counts,
        orders: recentOrders,
        products: allProducts,
        users: [],
        lowStockProducts,
        bestSellingProducts,
        salesByDay,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Dashboard overview API error:", error);

    return NextResponse.json(
      { success: false, message: "Dashboard data load failed" },
      { status: 500 }
    );
  }
}