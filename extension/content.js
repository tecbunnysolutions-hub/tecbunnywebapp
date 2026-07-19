(function () {
  const MAX_RAW_TEXT_LENGTH = 30000;
  const ALLOWED_HTML_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'UL', 'OL', 'LI', 'H3', 'H4', 'SPAN', 'TABLE', 'TBODY', 'TR', 'TH', 'TD']);

  function sanitizeHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html || '';

    template.content.querySelectorAll('*').forEach((element) => {
      if (!ALLOWED_HTML_TAGS.has(element.tagName)) {
        element.replaceWith(document.createTextNode(element.textContent || ''));
        return;
      }

      Array.from(element.attributes).forEach((attr) => {
        element.removeAttribute(attr.name);
      });
    });

    return template.innerHTML;
  }

  // Helper to resolve absolute URLs
  function makeAbsoluteUrl(url) {
    if (!url) return '';
    try {
      return new URL(url, window.location.href).href;
    } catch (e) {
      return url;
    }
  }

  // Priority A: JSON-LD Schema Extraction
  function findProduct(obj) {
    if (!obj || typeof obj !== 'object') return null;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const found = findProduct(item);
        if (found) return found;
      }
      return null;
    }

    const type = obj['@type'];
    if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) {
      return obj;
    }

    if (obj['@graph']) {
      const found = findProduct(obj['@graph']);
      if (found) return found;
    }

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === 'object' && obj[key] !== null) {
        const found = findProduct(obj[key]);
        if (found) return found;
      }
    }

    return null;
  }

  function getJsonLdData() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent);
        const product = findProduct(data);
        if (product) {
          // Extract fields from Product schema
          let title = product.name || product.title || '';
          
          let price = '';
          if (product.offers) {
            const offers = product.offers;
            if (Array.isArray(offers) && offers.length > 0) {
              const mainOffer = offers[0];
              price = mainOffer.price || mainOffer.lowPrice || '';
              const currency = mainOffer.priceCurrency || '';
              if (price && currency) price = `${currency} ${price}`;
            } else if (typeof offers === 'object') {
              price = offers.price || offers.lowPrice || '';
              const currency = offers.priceCurrency || '';
              if (price && currency) price = `${currency} ${price}`;
            }
          }
          
          let description = product.description || '';
          
          let imageUrl = '';
          if (product.image) {
            if (Array.isArray(product.image) && product.image.length > 0) {
              imageUrl = typeof product.image[0] === 'object' ? product.image[0].url : product.image[0];
            } else if (typeof product.image === 'object') {
              imageUrl = product.image.url || product.image.contentUrl || '';
            } else if (typeof product.image === 'string') {
              imageUrl = product.image;
            }
          }

          return {
            title: title.trim(),
            price: price.toString().trim(),
            description: description.trim().replace(/\r\n/g, '<br />').replace(/\n/g, '<br />'),
            imageUrl: makeAbsoluteUrl(imageUrl)
          };
        }
      } catch (e) {
        // Skip malformed JSON-LD
      }
    }
    return null;
  }

  // Helpers for Priority B & C (Meta tags)
  function getMetaContent(propertyOrName) {
    const element = document.querySelector(`meta[property="${propertyOrName}"], meta[name="${propertyOrName}"]`);
    return element ? element.getAttribute('content') : null;
  }

  // Fallbacks
  function getFallbackImage() {
    const images = Array.from(document.getElementsByTagName('img'));
    for (const img of images) {
      const width = img.naturalWidth || img.width || (img.getBoundingClientRect ? img.getBoundingClientRect().width : 0);
      if (width > 200) {
        const src = img.src || img.getAttribute('src');
        if (src) return makeAbsoluteUrl(src);
      }
    }
    // Final fallback: any image if no image > 200px
    if (images.length > 0) {
      const src = images[0].src || images[0].getAttribute('src');
      if (src) return makeAbsoluteUrl(src);
    }
    return '';
  }

  function getFallbackPrice() {
    // Regex matches common currency formats (e.g., $19.99, £5, 10.00 €, € 15,00, ₹999)
    const priceRegex = /([$£€¥₹]\s*\d+(?:[.,]\d{2})?)|(\d+(?:[.,]\d{2})?\s*[$£€¥₹])/g;
    
    // First: check elements with class or ID containing "price"
    const priceSelectors = ['[class*="price" i]', '[id*="price" i]', '[itemprop="price"]'];
    for (const selector of priceSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          // If it's a leaf node or has short text, check it
          if (el.children.length === 0 || el.textContent.trim().length < 25) {
            const text = el.textContent.trim();
            const match = text.match(priceRegex);
            if (match) return match[0].trim();
          }
        }
      } catch (e) {}
    }

    // Second: search through leaf elements for currency pattern
    const tags = ['span', 'strong', 'b', 'p', 'h1', 'h2', 'h3', 'div'];
    for (const tag of tags) {
      const elements = document.getElementsByTagName(tag);
      for (const el of elements) {
        if (el.children.length === 0) {
          const text = el.textContent.trim();
          if (text && text.length < 25) {
            const match = text.match(priceRegex);
            if (match) return match[0].trim();
          }
        }
      }
    }
    return '';
  }

  // Domain-Specific Selectors for Amazon, Flipkart, and JioMart
  function getDomainSpecificData() {
    const host = window.location.hostname.toLowerCase();
    
    // Amazon Extractor
    if (host.includes('amazon.')) {
      const titleEl = document.getElementById('productTitle');
      const title = titleEl ? titleEl.textContent.trim() : '';

      let price = '';
      const priceSelectors = [
        '.apexPriceToPay .a-offscreen',
        '.priceToPay .a-offscreen',
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '.a-price .a-offscreen',
        '#price_inside_buybox'
      ];
      for (const sel of priceSelectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim()) {
          price = el.textContent.trim();
          break;
        }
      }
      
      if (!price) {
        const wholeEl = document.querySelector('.a-price-whole');
        if (wholeEl) {
          price = wholeEl.textContent.trim();
          const fractionEl = document.querySelector('.a-price-fraction');
          if (fractionEl) {
            price += '.' + fractionEl.textContent.trim();
          }
          const symbolEl = document.querySelector('.a-price-symbol');
          if (symbolEl) {
            price = symbolEl.textContent.trim() + ' ' + price;
          }
        }
      }

      // MRP (Original Price) on Amazon
      let mrp = '';
      const mrpSelectors = [
        '.a-text-strike',
        '#listPrice',
        '.basisPrice .a-offscreen',
        'span[data-a-strike="true"] .a-offscreen'
      ];
      for (const sel of mrpSelectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim()) {
          mrp = el.textContent.trim();
          break;
        }
      }
      
      // Amazon fallback: search for M.R.P label
      if (!mrp) {
        const elements = document.querySelectorAll('span, div, td');
        for (const el of elements) {
          const text = el.textContent.trim();
          if (text === 'M.R.P.:' || text === 'MRP:' || text === 'M.R.P:') {
             const parent = el.parentElement;
             // Usually the price is in a sibling or a span nearby with a strike
             const strike = parent.querySelector('.a-text-strike') || 
                            parent.querySelector('span[data-a-strike="true"]') ||
                            ((el.nextElementSibling && el.nextElementSibling.textContent.match(/[\d,.]+/)) ? el.nextElementSibling : null);
                            
             if (strike && strike.textContent) {
                const match = strike.textContent.match(/[$£€¥₹]\s*[\d,]+(?:\.\d{2})?/);
                if (match) {
                  mrp = match[0].trim();
                  break;
                }
             }
          }
        }
      }

      // Category Breadcrumbs on Amazon
      let category = '';
      const crumbs = Array.from(document.querySelectorAll('#wayfinding-breadcrumbs_container ul li a, .a-breadcrumb a, #wayfinding-breadcrumbs_container a'))
        .map(a => a.textContent.trim())
        .filter(t => t.length > 0 && !t.toLowerCase().includes('back to') && !t.toLowerCase().includes('home') && !t.toLowerCase().includes('return'));
      if (crumbs.length > 0) {
        category = crumbs.join(' > ');
      }

      // Brand on Amazon
      let brand = '';
      const brandEl = document.getElementById('bylineInfo') || document.getElementById('brand') || document.querySelector('.po-brand .a-span9') || document.querySelector('.po-brand span');
      if (brandEl) {
        brand = brandEl.textContent.trim()
          .replace(/Visit the\s+/i, '')
          .replace(/\s+Store/i, '')
          .replace(/Brand:\s+/i, '');
      }

      // Feature bullets / Product description / Tech Specs
      const bulletsEl = document.getElementById('feature-bullets');
      const descEl = document.getElementById('productDescription');
      const aplusEl = document.getElementById('aplus');
      const techSpecsEl = document.getElementById('productDetails_techSpec_section_1') || document.getElementById('detailBullets_feature_div') || document.getElementById('detailBulletsWrapper_feature_div');
      
      let descParts = [];
      if (bulletsEl) {
        const clone = bulletsEl.cloneNode(true);
        // Remove the 'See more product details' link
        const seeMoreLinks = clone.querySelectorAll('a#seeMoreDetailsLink, a[href*="productDetails"]');
        seeMoreLinks.forEach(link => link.remove());
        
        let html = clone.innerHTML;
        // Strip any remaining text just in case
        html = html.replace(/›\s*See more product details/gi, '').replace(/>\s*See more product details/gi, '');
        
        if (html) descParts.push(sanitizeHtml(html.trim()));
      }
      if (descEl) {
        const html = descEl.innerHTML;
        if (html) descParts.push(sanitizeHtml(html.trim()));
      }
      if (techSpecsEl) {
        const html = techSpecsEl.innerHTML;
        if (html) descParts.push("<b>Technical Specifications:</b><br />" + sanitizeHtml(html.trim()));
      }
      if (aplusEl) {
        const html = aplusEl.innerHTML;
        if (html) descParts.push("<b>From the Manufacturer:</b><br />" + sanitizeHtml(html.trim()));
      }
      
      const description = descParts.join('<br /><br />');

      // Image
      const imgEl = document.getElementById('landingImage') || document.getElementById('imgBlkFront');
      let imageUrl = '';
      if (imgEl) {
        imageUrl = imgEl.getAttribute('data-old-hires') || imgEl.getAttribute('src') || '';
        if (!imageUrl && imgEl.getAttribute('data-a-dynamic-image')) {
          try {
            const dict = JSON.parse(imgEl.getAttribute('data-a-dynamic-image'));
            imageUrl = Object.keys(dict)[0];
          } catch (e) {}
        }
      }

      let modelNo = '';
      if (techSpecsEl) {
        const ths = techSpecsEl.querySelectorAll('th, td.a-color-base, span.a-text-bold');
        ths.forEach(th => {
          if (th.textContent.toLowerCase().includes('model number') || th.textContent.toLowerCase().includes('model name')) {
            const td = th.nextElementSibling || th.parentElement.querySelector('td') || th.parentElement.querySelector('span:not(.a-text-bold)');
            if (td) modelNo = td.textContent.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim();
          }
        });
      }

      return { title, price, mrp, category, brand, description, imageUrl, modelNo };
    }

    // Flipkart Extractor
    if (host.includes('flipkart.com')) {
      const titleEl = document.querySelector('.B_NuCI') || document.querySelector('h1 span') || document.querySelector('h1');
      const title = titleEl ? titleEl.textContent.trim() : '';

      const priceEl = document.querySelector('._30jeq3._16Jk6d') || document.querySelector('.nxrK3y') || document.querySelector('div[class*="_30jeq3"]');
      const price = priceEl ? priceEl.textContent.trim() : '';

      // MRP on Flipkart
      const mrpEl = document.querySelector('._3I9_ca') || document.querySelector('.y331Z_') || document.querySelector('div[class*="_3I9_ca"]') || document.querySelector('div[class*="strike"]');
      const mrp = mrpEl ? mrpEl.textContent.trim() : '';

      // Category Breadcrumbs on Flipkart
      let category = '';
      const crumbs = Array.from(document.querySelectorAll('a._2whKao, a[class*="_2whKao"], ._2whKao'))
        .map(a => a.textContent.trim())
        .filter(t => t.length > 0 && !t.toLowerCase().includes('home'));
      if (crumbs.length > 0) {
        category = crumbs.join(' > ');
      }

      // Brand on Flipkart
      const brandEl = document.querySelector('span[class*="brand" i]') || document.querySelector('.G6XhEE') || document.querySelector('a[class*="brand" i]');
      let brand = brandEl ? brandEl.textContent.trim() : '';
      if (!brand && title) {
        brand = title.split(' ')[0];
      }

      const highlightEl = document.querySelector('._2418kt') || document.querySelector('._2cM9lP');
      const descEl = document.querySelector('._1mX1Vo') || document.querySelector('.yN-eZm') || document.querySelector('div[class*="product-description"]');
      const specsEl = document.querySelector('._14cfVK') || document.querySelector('.X3BRgc') || document.querySelector('._3k-BhJ') || document.querySelector('._3dtsli');
      
      let descParts = [];
      if (highlightEl) {
        const html = highlightEl.innerHTML;
        if (html) descParts.push(sanitizeHtml(html.trim()));
      }
      if (descEl) {
        const html = descEl.innerHTML;
        if (html) descParts.push(sanitizeHtml(html.trim()));
      }
      if (specsEl) {
        const html = specsEl.innerHTML;
        if (html) descParts.push("<b>Specifications:</b><br />" + sanitizeHtml(html.trim()));
      }
      const description = descParts.join('<br /><br />');

      const imgEl = document.querySelector('img[class*="_396cs4"]') || document.querySelector('img.q6DClP') || document.querySelector('._396cs4');
      const imageUrl = imgEl ? imgEl.getAttribute('src') || imgEl.src : '';

      return { title, price, mrp, category, brand, description, imageUrl, modelNo: '' };
    }

    // JioMart Extractor
    if (host.includes('jiomart.com')) {
      const titleEl = document.querySelector('.pdp-name') || document.querySelector('.product-title') || document.querySelector('h1');
      const title = titleEl ? titleEl.textContent.trim() : '';

      const priceEl = document.querySelector('#prod_price') || document.querySelector('.prod-price') || document.querySelector('#lbl_pdp_selling_price') || document.querySelector('.price-box .final-price');
      const price = priceEl ? priceEl.textContent.trim() : '';

      // MRP on JioMart
      const mrpEl = document.querySelector('.mrp') || document.querySelector('.mrp-strip') || document.querySelector('span.strike') || document.querySelector('span[class*="strike"]');
      const mrp = mrpEl ? mrpEl.textContent.trim() : '';

      // Category Breadcrumbs on JioMart
      let category = '';
      const crumbs = Array.from(document.querySelectorAll('.j-breadcrumbs li a, .j-breadcrumbs li, .breadcrumbs a'))
        .map(li => li.textContent.trim())
        .filter(t => t.length > 0 && !t.toLowerCase().includes('home'));
      if (crumbs.length > 0) {
        category = crumbs.join(' > ');
      }

      // Brand on JioMart
      const brandEl = document.querySelector('.pdp-brand-name') || document.getElementById('brand_name') || document.querySelector('.brand');
      let brand = brandEl ? brandEl.textContent.trim() : '';
      if (!brand && title) {
        brand = title.split(' ')[0];
      }

      const descEl = document.querySelector('#pdp_desc') || document.querySelector('.pdp-desc-content') || document.querySelector('#product_description');
      const featuresEl = document.querySelector('.product-features') || document.querySelector('.pdp-features');
      const specsEl = document.querySelector('.product-key-features') || document.querySelector('.product-specifications') || document.querySelector('#pdp_specs');
      
      let descParts = [];
      if (featuresEl) {
        const html = featuresEl.innerHTML;
        if (html) descParts.push(sanitizeHtml(html.trim()));
      }
      if (descEl) {
        const html = descEl.innerHTML;
        if (html) descParts.push(sanitizeHtml(html.trim()));
      }
      if (specsEl) {
        const html = specsEl.innerHTML;
        if (html) descParts.push("<b>Specifications:</b><br />" + sanitizeHtml(html.trim()));
      }
      const description = descParts.join('<br /><br />');

      const imgEl = document.querySelector('#main_img') || document.querySelector('.main-image img') || document.querySelector('#pdp-main-image img');
      const imageUrl = imgEl ? imgEl.getAttribute('src') || imgEl.src : '';

      return { title, price, mrp, category, brand, description, imageUrl, modelNo: '' };
    }

    return null;
  }

  // Fallbacks for generic sites
  function getFallbackMrp() {
    const selectors = ['strike', 'del', '.strike', '.original-price', '.old-price', '[class*="strike" i]', '[class*="original" i]'];
    const priceRegex = /([$£€¥₹]\s*\d+(?:[.,]\d{2})?)/;
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          const text = el.textContent.trim();
          if (text && text.length < 20) {
            const match = text.match(priceRegex);
            if (match) return match[0].trim();
          }
        }
      } catch (e) {}
    }
    return '';
  }

  function getFallbackCategory() {
    const selectors = ['.breadcrumb', '.breadcrumbs', '[class*="breadcrumb" i]', 'nav[aria-label="Breadcrumb"]'];
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) {
          const texts = Array.from(el.querySelectorAll('a, span, li'))
            .map(e => e.textContent.trim())
            .filter(t => t.length > 0 && t !== '/' && t !== '>' && !t.toLowerCase().includes('home'));
          const unique = texts.filter((v, i, a) => !i || v !== a[i-1]);
          if (unique.length > 0) return unique.join(' > ');
        }
      } catch (e) {}
    }
    return '';
  }

  // --- Execution & Prioritization Pipeline ---
  const jsonLd = getJsonLdData() || {};
  const domainData = getDomainSpecificData() || {};

  function getFallbackBrand(jsonLdData, prodTitle) {
    if (jsonLdData && jsonLdData.brand) {
      if (typeof jsonLdData.brand === 'object') {
        return jsonLdData.brand.name || '';
      }
      return jsonLdData.brand;
    }
    const metaBrand = getMetaContent('product:brand') || getMetaContent('brand');
    if (metaBrand) return metaBrand;
    if (prodTitle) {
      const firstWord = prodTitle.trim().split(' ')[0];
      if (firstWord && firstWord.length > 1) return firstWord;
    }
    return '';
  }

  // Title: Domain-Specific -> JSON-LD -> OG Tag -> Meta Title -> Fallback Title
  const title = domainData.title ||
                jsonLd.title || 
                getMetaContent('og:title') || 
                getMetaContent('title') || 
                document.title || 
                '';

  // Sale Price: Domain-Specific -> JSON-LD -> OG Price -> Fallback Price
  const price = domainData.price ||
                jsonLd.price || 
                getMetaContent('og:price:amount') || 
                getMetaContent('product:price:amount') || 
                getFallbackPrice() || 
                '';

  // MRP: Domain-Specific -> Fallback MRP
  const mrp = domainData.mrp || 
              getFallbackMrp() || 
              '';

  // Category: Domain-Specific -> Fallback Category
  const category = domainData.category || 
                   getFallbackCategory() || 
                   '';

  // Brand: Domain-Specific -> Fallback Brand
  const brand = domainData.brand || 
                getFallbackBrand(jsonLd, title) || 
                '';

  // Description: Domain-Specific -> JSON-LD -> OG Description -> Meta Description
  const description = domainData.description ||
                      jsonLd.description || 
                      getMetaContent('og:description') || 
                      getMetaContent('description') || 
                      '';

  // Image: Domain-Specific -> JSON-LD -> OG Image -> Fallback Image
  const imageUrl = domainData.imageUrl ||
                   jsonLd.imageUrl || 
                   getMetaContent('og:image') || 
                   getFallbackImage() || 
                   '';

  const sourceUrl = window.location.href;

  const modelNo = domainData.modelNo || '';

  // Return the final scraped object
  return {
    title: title.trim(),
    price: price.trim(),
    mrp: mrp.trim(),
    category: category.trim(),
    brand: brand.trim(),
    description: description.trim(),
    imageUrl: imageUrl.trim(),
    sourceUrl: sourceUrl.trim(),
    modelNo: modelNo,
    shortDescription: '',
    warrantyPeriod: '',
    warrantyType: '',
    additional1: '',
    additional2: '',
    additional3: '',
    rawText: (document.body.innerText || '').slice(0, MAX_RAW_TEXT_LENGTH)
  };
})();
