const path = require("path");
const express = require("express");
const router = express.Router();

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);
router.get("/detail-client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail-client.js"))
);
router.get("/style.css", (_, res) =>
  res.sendFile(path.join(__dirname, "../style.css"))
);
router.get("/detail", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail.html"))
);

/**
 * Student code starts here
 */
const pg = require("pg");
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "recipeguru",
  password: "lol",
  port: 5454,
});

router.get("/search", async function (req, res) {
  console.log("search recipes");

  // return recipe_id, title, and the first photo as url
  //
  // for recipes without photos, return url as default.jpg

  const { rows } = await pool.query(`
    SELECT DISTINCT ON(r.recipe_id)
      r.recipe_id, r.title, COALESCE(rp.url, 'default.jpg') AS url
    FROM
      recipes r
    LEFT JOIN
      recipes_photos rp
    ON
      r.recipe_id = rp.recipe_id;
  `);

  res.status(200).json({ rows }).end();
});

router.get("/get", async (req, res) => {
  const recipeId = req.query.id ? +req.query.id : 1;
  console.log("recipe get", recipeId);

  // return all ingredient rows as ingredients
  //    name the ingredient image `ingredient_image`
  //    name the ingredient type `ingredient_type`
  //    name the ingredient title `ingredient_title`
  //
  //
  // return all photo rows as photos
  //    return the title, body, and url (named the same)
  //
  //
  // return the title as title
  // return the body as body
  // if no row[0] has no photo, return it as default.jpg
  const { rows } = await pool.query(
    `
    SELECT
      DISTINCT ON
      (i.title) r.title, r.body,
      COALESCE(rp.url, 'default.jpg') AS url,
      i.title AS ingredient_title, i.image AS ingredient_image, i.type AS ingredient_type
    FROM
      recipe_ingredients ri
    INNER JOIN
      recipes r
    ON
      r.recipe_id = ri.recipe_id
    INNER JOIN
      ingredients i
    ON
      i.id = ri.ingredient_id
    RIGHT JOIN
      recipes_photos rp
    ON
      rp.recipe_id = r.recipe_id
    WHERE r.recipe_id = $1;
  `,
    [recipeId]
  );
  console.log(rows);
  const ingredients = rows.map((row) => ({
    ingredient_title: row.ingredient_title,
    ingredient_image: row.ingredient_image,
    ingredient_type: row.ingredient_type,
  }));
  const photos = rows.map((row, i) => row.url);
  console.log({
    title: rows[0].title,
    body: rows[0].body,
    ingredients,
    photos,
  });
  res.status(200).json({
    title: rows[0].title,
    body: rows[0].body,
    ingredients,
    photos,
  });
});
/**
 * Student code ends here
 */

module.exports = router;
