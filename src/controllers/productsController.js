const gcs = require("../config/gcsConfig");
const db = require("../config/db");

exports.createProduct = async (req, res) => {
  const { name, price } = req.body;
  const image = req.file;

  if (!image) {
    return res.status(400).send("No image file uploaded");
  }

  const allowedExtensions = ["jpg", "jpeg", "png"];
  const extension = image.originalname.split(".").pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return res.status(400).send("Only image files are allowed");
  }

  const date = new Date();
  const fileName = `${date.toJSON()}_${image.originalname}`;

  try {
    // upload image to GCS
    const blob = gcs.file(fileName);
    const stream = blob.createWriteStream({
      metadata: {
        contentType: image.mimetype,
      },
    });
    stream.on("error", (err) => {
      console.error(err);
      res.status(500).send("Error uploading image");
    });
    stream.on("finish", async () => {
      try {
        // insert product to db
        const imageUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${fileName}`;
        const sql =
          "INSERT INTO products (name, price, image) VALUES (?, ?, ?)";
        const values = [name, price, imageUrl];
        const [result] = await db.execute(sql, values);

        res.status(201).json({
          id: result.insertId,
          name,
          price,
          image: imageUrl,
        });
      } catch (err) {
        console.error(err);
        res.status(500).send("Error creating product");
      }
    });
    stream.end(image.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading image");
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const sql = "SELECT * FROM products";
    const [results] = await db.execute(sql);

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving products");
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = "SELECT * FROM products WHERE id = ?";
    const [results] = await db.execute(sql, [id]);

    if (results.length === 0) {
      res.status(404).send("Product not found");
    } else {
      const { name, price, image } = results[0];
      res.status(200).json({
        id,
        name,
        price,
        image,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving product");
  }
};

exports.deleteProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = "DELETE FROM products WHERE id = ?";
    const [result] = await db.execute(sql, [id]);

    if (result.affectedRows === 0) {
      res.status(404).send("Product not found");
    } else {
      res.status(204).send();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting product");
  }
};
