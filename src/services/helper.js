export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export function formatCreatedDate(companies) {
  let newCompanies = [...companies];
  return newCompanies.map(company => {
    if (company.createdAt) {
      let date = new Date(company.createdAt);
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let fullDate = `${month}:${day}:${year}`;
      company.createdAt = fullDate;
    }
    return company;
  });
}
