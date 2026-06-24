function FilterBar({
  keyword,
  category,
  city,
  experienceTag,
  categories,
  cityOptions,
  experienceTags,
  onKeywordChange,
  onCategoryChange,
  onCityChange,
  onExperienceTagChange,
}) {
  return (
    <section className="filter-bar" aria-label="搜索和筛选">
      <label className="search-box">
        <span>搜索公司</span>
        <input
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="输入公司名、城市或标签"
        />
      </label>

      <div className="filter-group">
        <span>岗位方向</span>
        <div className="category-tabs" aria-label="按岗位方向筛选">
          {categories.map((item) => (
            <button
              key={item}
              className={item === category ? "category-tab active" : "category-tab"}
              type="button"
              onClick={() => onCategoryChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span>城市</span>
        <div className="category-tabs" aria-label="按城市筛选">
          {cityOptions.map((item) => (
            <button
              key={item}
              className={item === city ? "category-tab active" : "category-tab"}
              type="button"
              onClick={() => onCityChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span>体验标签</span>
        <div className="category-tabs" aria-label="按体验标签筛选">
          {["全部", ...experienceTags].map((item) => (
            <button
              key={item}
              className={item === experienceTag ? "category-tab active" : "category-tab"}
              type="button"
              onClick={() => onExperienceTagChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FilterBar;
