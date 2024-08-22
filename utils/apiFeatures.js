class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryString = queryStr;
  }
  filter() {
    //query string also contain some special field names like for pagination,sorting,for filtering from db , we have to exclude them from query string,thats why we do deep copying
    let queryObj = { ...this.queryString };
    const excludeFields = ["limit", "page", "sort", "fields"];
    for (let i of excludeFields) {
      delete queryObj[i];
    }
    //advance filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryObj = JSON.parse(queryStr);
    this.query = this.query.find(queryObj);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort.replace(/,/g, " ");
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort("-createdAt");
    return this;
  }
  limit() {
    if (this.queryString.fields) {
      let field = this.queryString.fields.replace(/,/g, " ");
      this.query = this.query.select(field);
    } else this.query = this.query.select("-__v");
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    this.query = this.query.skip(limit * (page - 1)).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
