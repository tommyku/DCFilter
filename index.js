maxPages = 999;
id=20
getUrl = (page) => `https://www.dcfever.com/trading/listing.php?id=${id}&type=used&page=${page}`;
getDoc = (html) => (new DOMParser()).parseFromString(html, 'text/html');
getHTML = (url) => fetch(url).then(res => res.text());
isEmpty = (doc) => doc.querySelector('.no_content') !== null;
getItems = async (getUrl, maxPages, filters) => {
  const items = [];
  let currentPage = 1;
  while (currentPage <= maxPages) {
    const doc = getDoc(await getHTML(getUrl(currentPage)));
    if (isEmpty(doc)) break;
    items.push(...Array.from(doc.querySelectorAll('ul.item_list li.clearfix a'))
      .filter(a => a.querySelector('.confirmed') === null)
      .map(a => ({
         url: a.href,
         title: a.querySelector('.trade_title').textContent,
         price: parseFloat(a.querySelector('.price').textContent.replace(/[^0-9\.]+/g, ''), 10)
      })));
    currentPage++;
  }
  return items.filter(i => filters.reduce((memo, f) => memo && f(i), true));
}
getFilters = () => {
  const filters = [];
  const minPrice = (parseFloat(prompt('Min price? (default = 0)'), 10) || 0);
  console.log(minPrice);
  filters.push((i) => i.price >= minPrice);
  const maxPrice = (parseFloat(prompt('Max price? (default = unlimited)'), 10) || null);
  console.log(maxPrice);
  filters.push((i) => maxPrice === null || i.price <= maxPrice);
  const includeTerms = (() => {
    const terms = [];
    while (terms.push(prompt('Include term? (empty to finish)')) && terms[terms.length - 1] !== "") {}
    return terms
      .filter((t, i, list) => t !== "" && list.indexOf(t) === i)
      .map(t => (i) => i.title.toLowerCase().indexOf(t.toLowerCase()) !== -1);
  })();
  console.log(includeTerms);
  filters.push(...includeTerms);
  /*
  const excludeTerms = (() => {
    const terms = [];
    while (terms.push(prompt('Exclude term? (empty to finish)')) && terms[terms.length - 1] !== "") {}
    return terms
      .filter((t, i, list) => t !== "" && list.indexOf(t) === i)
      .map(t => (i) => i.title.toLowerCase().indexOf(t.toLowerCase()) === -1);
  })();
  filters.push(...excludeTerms);
  */
  return filters;
}
