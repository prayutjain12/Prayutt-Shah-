import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

    if (!razorpayKeySecret) {
      return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 })
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", razorpayKeySecret).update(body).digest("hex")

    const isSignatureValid = expectedSignature === razorpay_signature

    if (isSignatureValid) {
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
      })
    } else {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
