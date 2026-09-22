import {connectDB} from "@/lib/dbConnect";
import AyBay from "@/models/AyBay";
import {getIdFromReq} from "@/lib/getIdFromReq";

// UPDATE ay-bay by ID
export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    const id = await getIdFromReq(req);
    if (!id) {
      return Response.json(
        { success: false, message: "ID প্রয়োজন" }, 
        { status: 400 }
      );
    }

    const body = await req.json();
    
    // Validate that body is not empty
    if (!body || Object.keys(body).length === 0) {
      return Response.json(
        { success: false, message: "আপডেট করার জন্য ডাটা প্রয়োজন" }, 
        { status: 400 }
      );
    }

    const updated = await AyBay.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return Response.json(
        { success: false, message: "ডাটা পাওয়া যায়নি" }, 
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: updated });

  } catch (error) {
    console.error("PUT Error:", error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return Response.json(
        { 
          success: false, 
          message: "ভ্যালিডেশন ত্রুটি", 
          errors: Object.values(error.errors).map(e => e.message)
        }, 
        { status: 400 }
      );
    }

    // Handle cast errors (invalid ID format)
    if (error.name === 'CastError') {
      return Response.json(
        { success: false, message: "অবৈধ ID ফরম্যাট" }, 
        { status: 400 }
      );
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return Response.json(
        { success: false, message: "অবৈধ JSON ডাটা" }, 
        { status: 400 }
      );
    }

    // Generic error
    return Response.json(
      { 
        success: false, 
        message: "সার্ভার ত্রুটি। দয়া করে আবার চেষ্টা করুন",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}

// DELETE by ID
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const id = await getIdFromReq(req);
    if (!id) {
      return Response.json(
        { success: false, message: "ID প্রয়োজন" }, 
        { status: 400 }
      );
    }

    const deleted = await AyBay.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json(
        { success: false, message: "ডাটা পাওয়া যায়নি" }, 
        { status: 404 }
      );
    }

    return Response.json({ 
      success: true, 
      id: deleted._id, 
      message: "ডিলিট সম্পন্ন হয়েছে" 
    });

  } catch (error) {
    console.error("DELETE Error:", error);

    // Handle cast errors (invalid ID format)
    if (error.name === 'CastError') {
      return Response.json(
        { success: false, message: "অবৈধ ID ফরম্যাট" }, 
        { status: 400 }
      );
    }

    // Generic error
    return Response.json(
      { 
        success: false, 
        message: "সার্ভার ত্রুটি। দয়া করে আবার চেষ্টা করুন",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}