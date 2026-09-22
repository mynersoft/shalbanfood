import { NextResponse } from 'next/server';
import Voucher from '@/models/Voucher';
import { connectDB } from '@/lib/db';

/**
 * Validate & apply voucher
 * @param {Object} params
 * @param {String} params.voucherCode
 * @param {Array} params.cartItems
 * @param {Number} params.subtotal
 * @returns {Object}
 */
export const validateVoucher = async ({ voucherCode, cartItems, subtotal }) => {
  try {
    await connectDB();

    


    // ❌ Validation
    if (!voucherCode || !cartItems || !subtotal) {
      return NextResponse.json(
        { message: 'Voucher code, cart items & subtotal required' },
        { status: 400 }
      );
    }

    // 🔎 Find voucher
    const voucherDoc = await Voucher.findOne({ code: voucherCode });

    if (!voucherDoc) {
      return NextResponse.json(
        { message: 'Invalid voucher code' },
        { status: 400 }
      );
    }

    // ❌ Status check
    if (voucherDoc.isActive !== 'active') {
      return NextResponse.json(
        { message: 'Voucher inactive' },
        { status: 400 }
      );
    }

    // ⏰ Date check
    const now = new Date();
    if (now < voucherDoc.startDate || now > voucherDoc.endDate) {
      return NextResponse.json(
        { message: 'Voucher expired or not started' },
        { status: 400 }
      );
    }

    // 💰 Minimum order check
    if (voucherDoc.minOrderAmount && subtotal < voucherDoc.minOrderAmount) {
      return NextResponse.json(
        { message: `Minimum order ${voucherDoc.minOrderAmount} tk required` },
        { status: 400 }
      );
    }

    let discount = 0;

    // ✅ All product voucher
    if (voucherDoc.type === 'all-product') {
      if (voucherDoc.discountType === 'percentage') {
        discount = (subtotal * voucherDoc.discountValue) / 100;
      } else {
        discount = Math.min(voucherDoc.discountValue, subtotal);
      }
    }

    // ✅ Product specific voucher
    if (voucherDoc.type === 'product-specific') {
      const applicableIds = (voucherDoc.applicableProducts || [])
        .filter(Boolean)
        .map(id => id.toString());

      const eligibleTotal = cartItems
        .filter(item => applicableIds.includes(item.productId.toString()))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (eligibleTotal === 0) {
        return NextResponse.json(
          { message: 'No eligible products for this voucher' },
          { status: 400 }
        );
      }

      if (voucherDoc.discountType === 'percentage') {
        discount = (eligibleTotal * voucherDoc.discountValue) / 100;
      } else {
        discount = Math.min(voucherDoc.discountValue, eligibleTotal);
      }
    }

    discount = Math.min(discount, subtotal);

    return NextResponse.json(
      {
        success: true,
        discount,
        finalTotal: subtotal - discount,
        code: voucherDoc.code,
        name: voucherDoc.name,
        type: voucherDoc.type,
      },
      { status: 200 }
    );
  }
  
  catch (error) {
    console.error('Voucher Apply Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Voucher apply failed',
      },
      { status: 400 }
    );
  }



  
};