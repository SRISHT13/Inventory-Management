const Product = require("../models/Product");
const groq = require("../config/groq");

const generateInsights = async (req, res) => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      return res.json({
        summary: "No products found in inventory.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      const totalVal = products.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 0), 0);
      const lowStock = products.filter(p => p.quantity < 10).map(p => p.name).join(", ") || "None";
      return res.json({
        summary: `### 📦 Warehouse Health Report\n- **Total Items**: ${products.length}\n- **Estimated Inventory Value**: ₹${totalVal}\n- **Low Stock Items**: ${lowStock}\n- **Warehouse Score**: 9/10\n\n*Note: Set GROQ_API_KEY in backend/.env for full AI-generated insights.*`
      });
    }

    let inventoryText = "";

    products.forEach((product) => {
      inventoryText += `
Product ID: ${product.productId}
Name: ${product.name}
Quantity: ${product.quantity}
Price: ₹${product.price}
Shelf: ${product.shelf}

`;
    });

    const prompt = `
You are an AI Warehouse Management Expert.

Analyze the following warehouse inventory.

${inventoryText}

Generate a professional warehouse report.

Include:

1. Overall Inventory Health
2. Low Stock Products
3. Overstocked Products
4. Estimated Inventory Value
5. Products needing immediate attention
6. Warehouse optimization suggestions
7. Purchasing recommendations
8. Overall warehouse score out of 10

Use markdown formatting.
Keep the answer under 300 words.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI Warehouse Manager.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 700,
    });

    res.json({
      summary: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  generateInsights,
};