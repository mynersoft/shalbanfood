import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/dbConnect';
import Setting from '@/models/Settings';

const DEFAULT_KEY = 'main';

// ============================================
// GET SETTINGS
// ============================================

export async function GET() {
  try {
    await connectDB();

    let settings = await Setting.findOne({
      key: DEFAULT_KEY,
    }).lean();

    if (!settings) {
      settings = await Setting.create({
        key: DEFAULT_KEY,
      });

      settings = settings.toObject();
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('GET SETTINGS ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to load settings',
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================
// UPDATE SETTINGS
// ============================================

export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();

    delete body._id;
    delete body.key;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.__v;

    const settings = await Setting.findOneAndUpdate(
      {
        key: DEFAULT_KEY,
      },
      {
        $set: body,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('UPDATE SETTINGS ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update settings',
      },
      {
        status: 500,
      }
    );
  }
}