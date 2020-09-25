import express from 'express'
import logger from '../lib/logger.js'
import js2xmlparser from 'js2xmlparser'
import moment from 'moment';
import fs from 'fs';

const { Router } = express;

var router = Router();

// const js2xmlparser = require("js2xmlparser");
// const moment = require("moment");

/**
 * It generates a standard sitemal.xml for SEO purposes
 */
router.get("/sitemap.xml", function(req, res, next) {
    try {
        //our records to index
        const records = getRecordsFromDataSource();
        const collection = [];
        let today = moment();
        today = today.format("YYYY-MM-DD");
        //add site root url
        const rootUrl = {};
        rootUrl.loc = "https://www.postyourvote.org/";
        rootUrl.lastmod = today;
        rootUrl.changefreq = "daily";
        rootUrl.priority = "1.0";
        rootUrl["image:image"] = {
            "image:loc": "https://www.postyourvote.org/assets/img/post-your-vote-share-card.jpg",
            "image:caption":
                "Everything you need to vote by mail",
        };
        collection.push(rootUrl);

        //add recipes urls
        for (let i = 0; i < records.length; i++) {
            const url = {};
            url.loc = records[i].url;
            url.lastmod = records[i].updated_at;
            url["image:image"] = {
                "image:loc": records[i].featured_image_url,
                "image:caption": records[i].description,
            };

            collection.push(url);
        }
        const col = {
            "@": {
                xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
                "xmlns:image": "http://www.google.com/schemas/sitemap-image/1.1",
            },
            url: collection,
        };
        const xml = js2xmlparser.parse("urlset", col);
        res.set("Content-Type", "text/xml");
        res.status(200);
        res.send(xml);
    } catch (e) {
        next(e);
    }
});

/**
 * @return a collection to index (typically we'll get these records from our database)
 */
function getRecordsFromDataSource() {

    //TO DO: Iterate through each location and add here.
    
    let today = moment();
    today = today.format("YYYY-MM-DD");

    const record1 = {
      url: "https://www.postyourvote.org/about/",
      description:
          "Fighting for your values is hard. The voting process should be simple.",
      featured_image_url: "https://www.postyourvote.org/assets/img/post-your-vote-share-card.jpg",
      updated_at: today,
    };
    const record2 = {
      url: "https://www.postyourvote.org/about/",
      description:
          "Fighting for your values is hard. The voting process should be simple.",
      featured_image_url: "https://www.postyourvote.org/assets/img/post-your-vote-share-card.jpg",
      updated_at: today,
    };
    const record3 = {
      url: "https://www.postyourvote.org/data/",
      description:
          "Most of our data is sourced from the VoteAmerica Election API. The rest we maintain in an open AirTable.",
      featured_image_url: "https://www.postyourvote.org/assets/img/post-your-vote-share-card.jpg",
      updated_at: today,
    };
    const record4 = {
      url: "https://www.postyourvote.org/faq/",
      description:
          "Everything you wanted to know about voting by mail but were afraid to ask.",
      featured_image_url: "https://www.postyourvote.org/assets/img/post-your-vote-share-card.jpg",
      updated_at: today,
    };
    return [record1, record2, record3, record4];
}

export default router;
