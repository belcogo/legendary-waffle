export function getMin(pages) {
  const bbb = pages.map((page) => page?.sequencial);
  let ccc = bbb[0];
  bbb.forEach((value) => {
    if (value < ccc) ccc = value;
  })
  console.debug(ccc);
}
