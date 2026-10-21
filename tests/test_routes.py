from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET
from bs4 import BeautifulSoup
import json
ROOT=Path(__file__).resolve().parent.parent
W=ROOT/'website'
urls=[]
for f in sorted(W.rglob('*.html')):
 s=BeautifulSoup(f.read_text(),'html.parser')
 assert len(s.select('h1'))==1, f
 assert len(s.select('link[rel=canonical]'))==1, f
 for a in s.select('a[href]'):
  href=a['href']
  if href.startswith('/') and not href.startswith('//'):
   p=W/href.lstrip('/')/'index.html' if href.endswith('/') else W/href.lstrip('/')
   assert p.exists(), (f,href)
 for x in s.select('script[type="application/ld+json"]'):json.loads(x.string)
 urls.append(s.select_one('link[rel=canonical]')['href'])
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap_urls=[x.text for x in ET.parse(W/'sitemap.xml').findall('.//s:loc',ns)]
assert set(urls)==set(sitemap_urls)
print(f'PASS: {len(urls)} valid HTML pages, internal links, canonicals, JSON-LD and sitemap URLs')
