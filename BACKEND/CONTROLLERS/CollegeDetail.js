const axios = require("axios");
const cheerio = require("cheerio");
const College = require("../Models/College");

// Fetch official college details and save them in MongoDB
const fetchCollegeDetails = async (req, res) => {
  try {
    // AIIMS Delhi official website
    const website = "https://www.aiims.edu/index.php/en";

    // Fetch website HTML
    const response = await axios.get(website, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    // Load HTML using Cheerio
    const $ = cheerio.load(response.data);

    // Extract page title
    const pageTitle = $("title").text().trim();

    // Extract description using available meta tags
    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      $('meta[name="twitter:description"]').attr("content")?.trim() ||
      "";

    // Extract logo or official website image
    let logo =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      $('link[rel="icon"]').attr("href") ||
      "";

    // Convert relative image URL to absolute URL
    if (logo) {
      try {
        logo = new URL(logo, website).href;
      } catch {
        logo = "";
      }
    }

    // Extract visible website text
    const pageText = $("body").text().replace(/\s+/g, " ").trim();

    // Extract phone number from website text
    const phoneMatch = pageText.match(
      /(?:\+91[-\s]?)?(?:011[-\s]?)?2658\d{4}/
    );

    // College unique slug
    const slug = "aiims-new-delhi";

    // Save or update college details in MongoDB
    const college = await College.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: "All India Institute of Medical Sciences, New Delhi",
          slug,
          collegeType: "government",
          ownership: "Government of India",
          establishedYear: 1956,
          website,
          logo,
          description,
          location: {
            address: "Ansari Nagar, New Delhi",
            city: "New Delhi",
            state: "Delhi",
            country: "India",
            pincode: "110029",
          },
          contact: {
            phone: phoneMatch ? phoneMatch[0] : "",
          },
        },
        $setOnInsert: {
          isVerified: false,
          status: "pending",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "College details fetched and saved successfully",
      source: website,
      extracted: {
        pageTitle,
        description,
        logo,
      },
      college,
    });
  } catch (error) {
    console.error("Fetch College Details Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch or save college details",
      error: error.message,
    });
  }
};

module.exports = {
  fetchCollegeDetails,
};

