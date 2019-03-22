'use strict';
const express = require('express');
const router = express.Router();
const pug = require('pug');
const fs = require('fs');

const settings = load_settings()

function load_settings() {
  const settings = {
    'num_latest_articles':5,
    'homepage': {'title': 'Home' },
    'sitemap': {'title': 'Sitemap' },
    'contact': {'title': 'Contact'},
  
    'tags': {
      'homeserver': {'title': 'Homeserver'},
    },
    'articles': {
    },
    'nav': ['homeserver']
  }
  
  settings.homepage.url = '/'
  settings.contact.url = '/contact'
  settings.contact.sitemap = '/sitemap'
  
  
  const tag2page = {};
  const page2tag = {};
  const menu = [['Home', '/'], ...settings.nav.map((page_name) => [settings.tags[page_name].title, `/tag/${page_name}`] )]
  const sitemap = [];
  
  for(const tag in settings.tags) {
    tag2page[tag] = []
  }
  
  for (const page_name in settings.articles) {
    const page = settings.articles[page_name]
    if(!('tags' in page)) { continue; }
    page.name = page_name;
    page.url = `/page/${page_name}`
    page.tags.forEach((tag) => {
      tag2page[tag].push(page)
    })
    sitemap.push(page)
  }
  
  for(const tag in tag2page) {
    tag2page[tag].sort((lhs, rhs) => {
      if (lhs.date < rhs.date) {
        return -1;
      }
      if (lhs.date > rhs.date) {
        return 1;
      }
      return 0;
    })
  }
  
  sitemap.sort((lhs, rhs) => {
    if (lhs.date < rhs.date) {
      return -1;
    }
    if (lhs.date > rhs.date) {
      return 1;
    }
    return 0;
  })
  
  sitemap.push(settings.contact)
  
  for (const tag in settings.tags) {
    const title = settings.tags[tag].title
    sitemap.push({'title': `Latest ${title}`, 'url': `/tag/${tag}`})
    sitemap.push({'title': `${title} archive (links)`, 'url': `/tag/${tag}/archive`})
    sitemap.push({'title': `${title} archive (single page)`, 'url': `/tag/${tag}/all`})
  }
  
  settings.homepage.menu = menu
  settings.contact.menu = menu
  settings.menu = menu
  settings.sitemap = sitemap
  return settings
}

function render_article(page_name) {
  const page = settings.articles[page_name];
  page.menu = menu;
  return (req, res) => {
    fs.readFile(`views/${page_name}.pug` ,(err, template) =>{
      if(err) {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.status(err.status || 500);
        res.render('error', {title: 'Error'});
      } else {
        page.content = pug.compile(template)(page);
        res.render('article', page)
      }
    })
  }
}

function render_tag(tag_name) {
  const page = settings.tags[tag_name];
  page.menu = menu
  page.name = tag_name;
  page.articles = tag2page[tag_name]
  for(let i = 0; i < settings.num_latest_articles && i < page.articles.length; ++i) {
    const template = fs.readFileSync(`views/${page.articles[i].name}.pug`)
    page.articles[i].content = pug.compile(template)(page);
  }
  return (req, res) => res.render('latest', page)
}

function render_tag_archive(tag_name) {
  const page = settings.tags[tag_name];
  page.menu = menu;
  page.name = tag_name;
  page.articles = tag2page[tag_name]
  return (req, res) => res.render('archive', page)
}

function render_tag_all(tag_name) {
  const page = settings.tags[tag_name];
  page.menu = menu;
  page.name = tag_name;
  page.articles = tag2page[tag_name]
  return (req, res) => res.render('all', page)
}

router.get(`/tag/:tag`, render_tag(tag));
router.get(`/tag/:tag/archive`, render_tag_archive(tag));
router.get(`/tag/:tag/all`, render_tag_all(tag));
router.get(`/page/:page_name`, render_article(page_name));
router.get('/', (req, res) => res.render('home', settings.homepage))
router.get('/contact', (req, res) => res.render('contact', settings.contact))
router.get('/sitemap', (req, res) => res.render('sitemap', settings))
router.get('/sitemap.xml', (req, res) => {
    const urls = sitemap.map((elem) => {
        if (elem.date) {
          return `<url>
<loc>${elem.url}</loc>
<lastmod>${elem.date}</lastmod>
<changefreq>monthly</changefreq>
</url>`
        } else {
          return `<url>
<loc>${elem.url}</loc>
<changefreq>weekly</changefreq>
</url>`
        }
        })
    const sitemap_xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset> `
    res.set('Content-Type', 'text/xml').send(sitemap_xml)
})

module.exports = router;
