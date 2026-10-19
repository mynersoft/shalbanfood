
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/dbConnect";
import { checkAuthRole } from "@/lib/checkAuthRole";

import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const cancelledStatuses = ["cancelled", "return"];

export async function GET() {
  try {
    const auth = await checkAuthRole();

    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, message: "অনুগ্রহ করে লগইন করুন" },
        { status: 401 }
      );
    }

    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const [
      orders,
      products,
      customerCount,
      totalOrderCount,
      todayOrders,
      monthOrders,
      lastMonthOrders,
    ] = await Promise.all([
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),

      Product.find({})
        .select("name image isActive variants")
        .lean(),

      User.countDocuments({ role: "user" }),

      Order.countDocuments({}),

      Order.find({
        createdAt: { $gte: today, $lt: tomorrow },
      }).select("total status createdAt").lean(),

      Order.find({
        createdAt: { $gte: monthStart, $lt: tomorrow },
      }).select("total status createdAt").lean(),

      Order.find({
        createdAt: {
          $gte: lastMonthStart,
          $lt: lastMonthEnd,
        },
      }).select("total status createdAt").lean(),
    ]);

    const validSale = (order) =>
      !cancelledStatuses.includes(order.status);

    const sumSales = (list) =>
      list.reduce(
        (sum, order) =>
          sum + (validSale(order) ? Number(order.total || 0) : 0),
        0
      );

    let stockQuantity = 0;
    let stockSalesValue = 0;
    let lowStockVariantCount = 0;
    let outOfStockVariantCount = 0;

    const inventory = products.map((product) => {
      const variants = (product.variants || []).map((variant) => {
        const stock = Number(variant.stock || 0);
        const price = Number(variant.sellPrice || 0);

        stockQuantity += stock;
        stockSalesValue += stock * price;

        if (stock <= 5) lowStockVariantCount++;
        if (stock <= 0) outOfStockVariantCount++;

        return {
          _id: String(variant._id),
          value: variant.value,
          unit: variant.unit,
          stock,
          sellPrice: price,
          soldCount: Number(variant.soldCount || 0),
        };
      });

      return {
        _id: String(product._id),
        name: product.name,
        image: product.image || "",
        isActive: product.isActive,
        variants,
        stock: variants.reduce((s, v) => s + v.stock, 0),
        soldCount: variants.reduce((s, v) => s + v.soldCount, 0),
        stockSalesValue: variants.reduce(
          (s, v) => s + v.stock * v.sellPrice,
          0
        ),
      };
    });

    const lowStockProducts = inventory
      .filter((p) => p.variants.some((v) => v.stock <= 5))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10);

    const bestSellingProducts = [...inventory]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 3);

    const salesByDay = [];

    for (let i = 6; i >= 0; i--) {
      const start = new Date(today);
      start.setDate(start.getDate() - i);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const amount = orders
        .filter((order) => {
          const created = new Date(order.createdAt);
          return (
            created >= start &&
            created < end &&
            validSale(order)
          );
        })
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      salesByDay.push({
        label: start.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        amount,
      });
    }

    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      return: 0,
    };

    orders.forEach((order) => {
      if (order.status in statusCounts) {
        statusCounts[order.status]++;
      }
    });

    const serializeOrder = (order) => ({
      ...order,
      _id: String(order._id),
      userId: order.userId ? String(order.userId) : null,
      createdAt: order.createdAt
        ? new Date(order.createdAt).toISOString()
        : null,
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalOrders: totalOrderCount,
        customers: customerCount,
        products: products.length,
        todaySales: sumSales(todayOrders),
        monthSales: sumSales(monthOrders),
        lastMonthSales: sumSales(lastMonthOrders),
        todayOrders: todayOrders.length,
        monthOrders: monthOrders.length,
        stockQuantity,
        stockSalesValue,
        lowStockProducts: lowStockVariantCount,
        outOfStockProducts: outOfStockVariantCount,
      },
      statusCounts,
      salesByDay,
      orders: orders.map(serializeOrder),
      products: inventory,
      lowStockProducts,
      bestSellingProducts,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Dashboard data লোড করা যায়নি",
      },
      { status: 500 }
    );
  }
}
