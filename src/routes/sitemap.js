import express from 'express'
import logger from '../lib/logger.js'
import js2xmlparser from 'js2xmlparser'
import moment from 'moment';
import airtableDataloader from '../lib/airtableDataloader.js'

const { Router } = express;

var router = Router();

// const js2xmlparser = require("js2xmlparser");
// const moment = require("moment");

/**
 * It generates a standard sitemal.xml for SEO purposes
 */
router.get("/sitemap.xml", async function(req, res, next) {
    try {
        //our records to index
        const records = await getRecordsFromDataSource(req);
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
async function getRecordsFromDataSource(req) {

    //TO DO: Iterate through each location and add here.
    
    let today = moment();
    today = today.format("YYYY-MM-DD");
    const domain = "https://www.postyourvote.org";

    let pageList = [];
    pageList.push({
      url: domain+"/about/",
      description:
          "Fighting for your values is hard. The voting process should be simple.",
      featured_image_url: domain+"/assets/img/post-your-vote-share-card.jpg",
      updated_at: today,
    });
    pageList.push({
      url: domain+"/about/",
      description:
          "Fighting for your values is hard. The voting process should be simple.",
      featured_image_url: domain+"/assets/img/post-your-vote-share-card.jpg",
      updated_at: today,
    });
    pageList.push({
      url: domain+"/data/",
      description:
          "Most of our data is sourced from the VoteAmerica Election API. The rest we maintain in an open AirTable.",
      featured_image_url: domain+"/assets/img/post-your-vote-share-card.jpg",
      updated_at: today,
    });
    pageList.push({
      url: domain+"/faq/",
      description:
          "Everything you wanted to know about voting by mail but were afraid to ask.",
      featured_image_url: domain+"/assets/img/post-your-vote-share-card.jpg",
      updated_at: today,
    });

    let cache = req.app.get('cache');
    let allStates = await cache.get('allStates', async () => {
      const airtable = req.app.get('airtable');
      return await airtableDataloader(airtable);
    });

    for (const state of allStates) {
      if (state.counties) {
        for (const county of Object.values(state.counties)) {
          pageList.push({
            url: domain+"/"+county.url,
            description:
                `Voter information for ${county.name}`,
            featured_image_url: domain+"/assets/img/post-your-vote-share-card.jpg",
            updated_at: today,
          });
        }
      }
      else {
        pageList.push({
          url: domain+"/"+state.url,
          description:
              `Voter information for ${state.name}`,
          featured_image_url: domain+"/assets/img/post-your-vote-share-card.jpg",
          updated_at: today,
        });
      }
    }

    return pageList;
}

export default router;
