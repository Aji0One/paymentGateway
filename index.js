require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(
  cors({
    origin: "https://inspiring-elf-e11d98.netlify.app",
  })
);

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const paymentPack = new Map([
  [1, { priceInCents: 1000, name: "Premium Pack" }],
  [2, { priceInCents: 20000, name: "Learn Chat GPT" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const paymentP = paymentPack.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: paymentP.name,
            },
            unit_amount: paymentP.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(5000, () => {
  console.log("The  Port is Running.....");
});
