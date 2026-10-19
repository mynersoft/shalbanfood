import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import ShippingSetting from "@/models/ShippingSetting";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  insideDhaka: 70,
  outsideDhaka: 120,
  freeDeliveryEnabled: false,
  freeDeliveryMinimum: 2000,
};

async function getSettings() {
  let settings = await ShippingSetting.findOne();

  if (!settings) {
    settings = await ShippingSetting.create(DEFAULTS);
  }

  return settings;
}

// Public checkout may read these settings.
export async function GET() {
  try {
    await connectDB();
    const settings = await getSettings();

    return NextResponse.json({
      success: true,
      settings: {
        insideDhaka: settings.insideDhaka,
        outsideDhaka: settings.outsideDhaka,
        freeDeliveryEnabled: settings.freeDeliveryEnabled,
        freeDeliveryMinimum: settings.freeDeliveryMinimum,
      },
    });
  } catch (error) {
    console.error("Shipping GET error:", error);

    return NextResponse.json(
      { success: false, message: "সেটিংস লোড করা যায়নি" },
      { status: 500 }
    );
  }
}

// IMPORTANT: Add your existing server-side Admin authentication here.
export async function PATCH(request) {
  try {
    // Do not deploy this update route until the Admin check is added.
    // Verify the authenticated user's role on the server.
    // Return 401/403 if the user is not an authorized Admin.

    await connectDB();

    const body = await request.json();

    const {
      insideDhaka,
      outsideDhaka,
      freeDeliveryEnabled,
      freeDeliveryMinimum,
    } = body;

    const validAmount = (value) =>
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= 1000000;

    if (
      !validAmount(insideDhaka) ||
      !validAmount(outsideDhaka) ||
      !validAmount(freeDeliveryMinimum) ||
      typeof freeDeliveryEnabled !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "সঠিক চার্জ ও সেটিংস দিন" },
        { status: 400 }
      );
    }

    const settings = await getSettings();

    settings.insideDhaka = insideDhaka;
    settings.outsideDhaka = outsideDhaka;
    settings.freeDeliveryEnabled = freeDeliveryEnabled;
    settings.freeDeliveryMinimum = freeDeliveryMinimum;

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Shipping settings আপডেট হয়েছে",
      settings,
    });
  } catch (error) {
    console.error("Shipping PATCH error:", error);

    return NextResponse.json(
      { success: false, message: "আপডেট করা যায়নি" },
      { status: 500 }
    );
  }
}