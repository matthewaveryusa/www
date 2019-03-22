'use strict';
const express = require('express');
const router = express.Router();



const settings = {
  'homepage':'home',
  'pages': {
   'home': {'title': 'Home', 'tags': ['Home'], 'features': ['search', 'homepage'], 'template':'index'},
   'crypto': {'title': 'Crypto',  'tags': ['Crypto'], 'features': ['search'], 'template':'crypto'},
   'homeserver': {'title': 'Homeserver', 'tags': ['Homeserver'], 'features': ['search'], 'template':'homeserver'},
   'social': {'title': 'Social', 'tags': ['Social'], 'features': ['search'], 'template':'social'},
   'contact': {'title': 'Contact', 'tags': ['Contact'], 'features': ['search'], 'template':'contact'},
   'sitemap': {'title': 'Sitemap', 'tags': ['Sitemap'], 'features': ['search'], 'template':'sitemap'},
   'projects': {'title': 'Projects', 'tags': ['Projects'], 'features': ['search'], 'template':'index'},
   'search': {'title': 'Search', 'tags': ['Search'], 'features': [], 'template':'search'},
  },
  'nav': [
    'home', 'crypto', 'homeserver', 'social', 'projects'
  ]
}

const menu = settings.nav.map((page_name) => [settings.pages[page_name].title, `/${page_name}`] );

function render_page(page_name) {
  const page = settings.pages[page_name];
  page.menu = menu;
  return (req, res) => res.render(page.template, page)
}

router.get('/', render_page(settings.homepage));

for (const page_name in settings.pages) {
  router.get(`/${page_name}`, render_page(page_name));
}

module.exports = router;
